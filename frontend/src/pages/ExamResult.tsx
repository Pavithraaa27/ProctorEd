import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import client from "../api/client";
import type { ExamAttempt } from "../api/types";

export const ExamResult: React.FC = () => {
  const { attemptId } = useParams();
  const location = useLocation();
  const auto = (location.state as any)?.auto;
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);

  useEffect(() => {
    client.get("/api/attempts/my").then((r) => {
      const found = (r.data as ExamAttempt[]).find((a) => String(a.id) === attemptId);
      setAttempt(found ?? null);
    });
  }, [attemptId]);

  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md text-center"
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border ${
          auto ? "bg-alert-soft border-alert/30" : "bg-verified-soft border-verified/30"
        }`}>
          {auto ? <ShieldAlert className="w-8 h-8 text-alert" /> : <CheckCircle2 className="w-8 h-8 text-verified" />}
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">
          {auto ? "Exam auto-submitted" : "Exam submitted"}
        </h1>
        <p className="text-ink-muted text-sm mb-7">
          {auto
            ? "Your exam was automatically submitted due to repeated proctoring violations or time expiry."
            : "Your responses have been recorded."}
        </p>
        {attempt && (
          <div className="glass border border-panel-border rounded-2xl p-7 mb-7">
            <p className="font-display text-4xl font-semibold text-ink">
              {attempt.score ?? "—"}<span className="text-ink-faint text-xl"> / {attempt.exam?.totalMarks ?? "—"}</span>
            </p>
            <p className="text-xs text-ink-muted font-mono mt-2">{attempt.flagCount} integrity flag(s) recorded</p>
          </div>
        )}
        <Link to="/" className="text-signal text-sm hover:underline">Back to dashboard</Link>
      </motion.div>
    </div>
  );
};
