import { useCallback, useEffect, useRef, useState } from "react";
import client from "../api/client";

export interface ProctoringLogEntry {
  type: string;
  message: string;
  time: string;
}

interface UseProctoringOptions {
  attemptId: number | null;
  enabled: boolean;
  onTerminate?: () => void;
  maxFlags?: number;
}

/**
 * Client-side exam proctoring:
 *  - webcam preview + periodic liveness snapshot
 *  - tab switch / window blur detection (Page Visibility API)
 *  - fullscreen enforcement
 *  - copy / paste / right-click blocking
 *  - basic devtools-open heuristic
 *
 * Each violation is logged locally (for the on-screen warning banner) AND
 * posted to the backend so the admin can review it against the attempt.
 */
export function useProctoring({ attemptId, enabled, onTerminate, maxFlags = 6 }: UseProctoringOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [log, setLog] = useState<ProctoringLogEntry[]>([]);
  const [flagCount, setFlagCount] = useState(0);
  const terminatedRef = useRef(false);

  const report = useCallback(
    (eventType: string, details: string) => {
      setLog((prev) => [{ type: eventType, message: details, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 30));
      setFlagCount((c) => c + 1);

      if (attemptId) {
        client
          .post(`/api/attempts/${attemptId}/proctoring-event`, { eventType, details })
          .catch(() => {
            /* best-effort: exam continues even if the network hiccups */
          });
      }
    },
    [attemptId]
  );

  // Webcam setup
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: { width: 320, height: 240 }, audio: false })
      .then((stream) => {
        if (cancelled) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraReady(true);
      })
      .catch(() => {
        setCameraError("Camera access denied. Proctoring requires webcam permission.");
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled]);

  // Tab switch / visibility
  useEffect(() => {
    if (!enabled) return;
    const onVisibility = () => {
      if (document.hidden) {
        report("TAB_SWITCH", "Candidate switched away from the exam tab");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled, report]);

  // Window blur (e.g., alt-tab)
  useEffect(() => {
    if (!enabled) return;
    const onBlur = () => report("WINDOW_BLUR", "Exam window lost focus");
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [enabled, report]);

  // Fullscreen enforcement
  useEffect(() => {
    if (!enabled) return;
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        report("FULLSCREEN_EXIT", "Candidate exited fullscreen mode");
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [enabled, report]);

  // Copy / paste / cut / right-click blocking
  useEffect(() => {
    if (!enabled) return;
    const block = (e: Event) => e.preventDefault();
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      report("COPY_PASTE_ATTEMPT", "Copy attempt blocked");
    };
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      report("COPY_PASTE_ATTEMPT", "Paste attempt blocked");
    };
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      report("RIGHT_CLICK_ATTEMPT", "Right-click menu blocked");
    };

    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", block);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContextMenu);

    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", block);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, [enabled, report]);

  // Basic devtools-open heuristic (window outer/inner size delta)
  useEffect(() => {
    if (!enabled) return;
    const threshold = 160;
    let wasOpen = false;
    const interval = setInterval(() => {
      const widthDelta = window.outerWidth - window.innerWidth;
      const heightDelta = window.outerHeight - window.innerHeight;
      const isOpen = widthDelta > threshold || heightDelta > threshold;
      if (isOpen && !wasOpen) {
        report("DEVTOOLS_OPENED", "Developer tools may have been opened");
      }
      wasOpen = isOpen;
    }, 2000);
    return () => clearInterval(interval);
  }, [enabled, report]);

  // Periodic webcam liveness check (feed must be active + producing frames)
  useEffect(() => {
    if (!enabled || !cameraReady) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      const track = streamRef.current?.getVideoTracks()?.[0];
      if (!video || !track || track.readyState !== "live" || video.readyState < 2) {
        report("NO_FACE_DETECTED", "Webcam feed unavailable during periodic check");
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [enabled, cameraReady, report]);

  // Auto-terminate on excessive flags
  useEffect(() => {
    if (flagCount >= maxFlags && !terminatedRef.current) {
      terminatedRef.current = true;
      onTerminate?.();
    }
  }, [flagCount, maxFlags, onTerminate]);

  const enterFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => {
      /* user gesture required in some browsers; ignore */
    });
  }, []);

  return { videoRef, cameraReady, cameraError, log, flagCount, enterFullscreen, report };
}
