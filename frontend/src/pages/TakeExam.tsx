import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Camera, CheckCircle2, ShieldAlert, Timer } from "lucide-react";
import client from "../api/client";
import type { Exam, ExamAttempt, Question } from "../api/types";
import { useProctoring } from "../hooks/useProctoring";

export const TakeExam: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [terminated, setTerminated] = useState(false);

  useEffect(() => {
    if (!examId) return;
    client.get(`/api/exams/${examId}`).then((r) => setExam(r.data));
    client.get(`/api/exams/${examId}/questions`).then((r) => setQuestions(r.data));
  }, [examId]);

  const submitExam = useCallback(
    async (auto = false) => {
      if (!attempt || submitting) return;
      setSubmitting(true);
      try {
        const res = await client.post(`/api/attempts/${attempt.id}/submit`);
        navigate(`/result/${res.data.id}`, { state: { auto } });
      } finally {
        setSubmitting(false);
      }
    },
    [attempt, submitting, navigate]
  );

  const handleTerminate = useCallback(() => {
    setTerminated(true);
    submitExam(true);
  }, [submitExam]);

  const { videoRef, cameraReady, cameraError, log, flagCount, enterFullscreen } = useProctoring({
    attemptId: attempt?.id ?? null,
    enabled: started && !!exam?.proctoringEnabled,
    onTerminate: handleTerminate,
  });

  const beginExam = async () => {
    if (!examId || !exam) return;
    const res = await client.post(`/api/attempts/start/${examId}`);
    setAttempt(res.data);
    setRemainingSeconds(exam.durationMinutes * 60);
    setStarted(true);
    if (exam.proctoringEnabled) enterFullscreen();
  };

  useEffect(() => {
    if (!started || terminated) return;
    const interval = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          submitExam(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, terminated, submitExam]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [remainingSeconds]);

  const lowTime = remainingSeconds > 0 && remainingSeconds <= 60;

  const selectAnswer = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    if (attempt) {
      client.post(`/api/attempts/${attempt.id}/answer`, { questionId, selectedOptionIndex: optionIndex });
    }
  };

  if (!exam) return null;

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-alert-soft border border-alert/30 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-7 h-7 text-alert" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">{exam.title}</h1>
          <p className="text-ink-muted text-sm mb-7">{exam.description}</p>
          <div className="glass border border-panel-border rounded-2xl p-6 text-left text-sm space-y-2.5 mb-7 text-ink-muted">
            <p>• Duration: <span className="text-ink font-mono">{exam.durationMinutes} min</span>, {exam.totalMarks} marks total.</p>
            {exam.proctoringEnabled && (
              <>
                <p>• This exam is proctored: camera access and fullscreen mode are required.</p>
                <p>• Switching tabs, exiting fullscreen, or copy/paste will be flagged.</p>
                <p>• Repeated violations will auto-submit your exam.</p>
              </>
            )}
          </div>
          <button
            onClick={beginExam}
            className="bg-signal hover:bg-signal/90 text-void transition-colors duration-200 rounded-xl px-7 py-3 text-sm font-semibold shadow-glow"
          >
            Begin Exam
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[current];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-lg font-semibold text-ink">{exam.title}</h1>
          <div className={`flex items-center gap-2 border rounded-xl px-3.5 py-2 text-sm font-mono transition-colors ${
            lowTime ? "bg-alert-soft border-alert/40 text-alert animate-pulseGlow" : "bg-panel border-panel-border text-signal"
          }`}>
            <Timer className="w-4 h-4" /> {formattedTime}
          </div>
        </div>

        {cameraError && (
          <div className="bg-alert-soft border border-alert/30 text-alert text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {cameraError}
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-panel border border-panel-border rounded-2xl p-6 shadow-card"
            >
              <p className="text-xs text-ink-faint font-mono mb-2">
                QUESTION {current + 1} / {questions.length} · {currentQuestion.marks} MARK{currentQuestion.marks > 1 ? "S" : ""}
              </p>
              <p className="text-base text-ink mb-5">{currentQuestion.questionText}</p>
              <div className="space-y-2">
                {currentQuestion.options.map((opt, idx) => {
                  const selected = answers[currentQuestion.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => selectAnswer(currentQuestion.id, idx)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                        selected
                          ? "border-signal bg-signal/10 text-ink shadow-glow"
                          : "border-panel-border bg-panel-raised text-ink-muted hover:border-ink-faint hover:text-ink"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6">
          <button
            disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
            className="text-sm text-ink-muted disabled:opacity-30 hover:text-ink transition-colors"
          >
            ← Previous
          </button>

          <div className="flex gap-1.5">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrent(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono flex items-center justify-center border transition-colors ${
                  idx === current
                    ? "border-signal bg-signal/15 text-signal"
                    : answers[q.id] !== undefined
                    ? "border-verified/40 bg-verified-soft text-verified"
                    : "border-panel-border text-ink-faint"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {current === questions.length - 1 ? (
            <button
              onClick={() => submitExam(false)}
              disabled={submitting}
              className="bg-verified hover:bg-verified/90 text-void transition-colors duration-200 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Exam"}
            </button>
          ) : (
            <button onClick={() => setCurrent((c) => c + 1)} className="text-sm text-signal hover:text-signal/80 transition-colors">
              Next →
            </button>
          )}
        </div>
      </div>

      {exam.proctoringEnabled && (
        <div className="space-y-4">
          <div className="bg-panel border border-panel-border rounded-2xl p-3 relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-2 relative z-10">
              <Camera className="w-3.5 h-3.5" />
              {cameraReady ? (
                <span className="flex items-center gap-1.5 text-verified">
                  <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulseGlow" /> Camera live
                </span>
              ) : (
                "Connecting camera…"
              )}
            </div>
            <div className="relative rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay muted playsInline className="w-full bg-void aspect-video object-cover" />
              {cameraReady && (
                <div className="absolute inset-x-0 h-px bg-signal/70 shadow-glow animate-scanline pointer-events-none" />
              )}
            </div>
          </div>

          <div className="bg-panel border border-panel-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-ink-muted font-mono tracking-wide">INTEGRITY FLAGS</span>
              <span className={`text-sm font-mono font-semibold ${flagCount > 0 ? "text-alert" : "text-verified"}`}>
                {flagCount}
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {log.length === 0 && (
                <p className="text-xs text-ink-faint flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-verified" /> No violations detected
                </p>
              )}
              <AnimatePresence initial={false}>
                {log.map((entry, i) => (
                  <motion.div
                    key={entry.time + entry.type + i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs bg-alert-soft border border-alert/25 rounded-lg px-2.5 py-1.5"
                  >
                    <p className="text-alert font-medium font-mono text-[10.5px]">{entry.type.replaceAll("_", " ")}</p>
                    <p className="text-ink-faint">{entry.time}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
