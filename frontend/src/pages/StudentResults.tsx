import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import client from "../api/client";
import type { AnswerReview, ExamAttempt } from "../api/types";

export const StudentResults: React.FC = () => {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [selected, setSelected] = useState<ExamAttempt | null>(null);
  const [review, setReview] = useState<AnswerReview[]>([]);

  useEffect(() => {
    client.get("/api/attempts/my").then((r) => {
      const finished = (r.data as ExamAttempt[]).filter(
        (a) => a.status === "SUBMITTED" || a.status === "AUTO_SUBMITTED"
      );
      setAttempts(finished);
    });
  }, []);

  const viewReview = (attempt: ExamAttempt) => {
    setSelected(attempt);
    client.get(`/api/attempts/${attempt.id}/review`).then((r) => setReview(r.data));
  };

  const avgScore = attempts.length
    ? Math.round(
        (attempts.reduce((sum, a) => sum + (a.score ?? 0) / (a.exam?.totalMarks || 1), 0) / attempts.length) * 100
      )
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.2em] text-signal/80 mb-2">HISTORY</p>
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">My Results</h1>
        <p className="text-ink-muted text-sm mb-6">Everything you've completed so far.</p>

        <div className="grid grid-cols-3 gap-3 mb-7">
          <div className="bg-panel border border-panel-border rounded-xl p-4">
            <p className="text-xs text-ink-faint font-mono mb-1">COMPLETED</p>
            <p className="font-display text-2xl font-semibold text-ink">{attempts.length}</p>
          </div>
          <div className="bg-panel border border-panel-border rounded-xl p-4">
            <p className="text-xs text-ink-faint font-mono mb-1">AVG SCORE</p>
            <p className="font-display text-2xl font-semibold text-signal">{avgScore ?? "—"}{avgScore !== null && "%"}</p>
          </div>
          <div className="bg-panel border border-panel-border rounded-xl p-4">
            <p className="text-xs text-ink-faint font-mono mb-1">TOTAL FLAGS</p>
            <p className="font-display text-2xl font-semibold text-alert">
              {attempts.reduce((sum, a) => sum + a.flagCount, 0)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {attempts.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => viewReview(a)}
              className={`bg-panel border rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-colors ${
                selected?.id === a.id ? "border-signal/50" : "border-panel-border hover:border-signal/30"
              }`}
            >
              <div>
                <h2 className="font-display font-medium text-ink">{a.exam?.title ?? "Untitled exam"}</h2>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-faint font-mono">
                  <span>{a.status === "AUTO_SUBMITTED" ? "Auto-submitted" : "Submitted"}</span>
                  {a.flagCount > 0 && (
                    <span className="text-alert flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {a.flagCount} flags</span>
                  )}
                </div>
              </div>
              <span className="font-mono text-lg text-ink">
                {a.score}<span className="text-ink-faint text-sm">/{a.exam?.totalMarks ?? "—"}</span>
              </span>
            </motion.div>
          ))}
          {attempts.length === 0 && (
            <div className="text-center py-16 border border-dashed border-panel-border rounded-2xl">
              <p className="text-ink-faint text-sm">No completed exams yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-panel border border-panel-border rounded-2xl p-4 h-fit">
        {!selected ? (
          <p className="text-sm text-ink-faint">Select a result to review your answers.</p>
        ) : (
          <>
            <h2 className="text-sm font-medium text-ink mb-3">{selected.exam?.title ?? "Untitled exam"}</h2>
            <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
              {review.map((r, i) => (
                <div key={r.questionId} className="text-xs bg-panel-raised border border-panel-border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-ink font-medium">{i + 1}. {r.questionText}</p>
                    {r.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-verified flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-alert flex-shrink-0" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {(r.options ?? []).map((opt, idx) => {
                      const isCorrect = idx === r.correctOptionIndex;
                      const isSelected = idx === r.selectedOptionIndex;
                      return (
                        <div
                          key={idx}
                          className={`px-2 py-1 rounded border text-[11px] ${
                            isCorrect
                              ? "border-verified/40 bg-verified-soft text-verified"
                              : isSelected
                              ? "border-alert/40 bg-alert-soft text-alert"
                              : "border-panel-border text-ink-faint"
                          }`}
                        >
                          {opt}
                          {isCorrect && " ✓ correct answer"}
                          {isSelected && !isCorrect && " ← your answer"}
                        </div>
                      );
                    })}
                    {r.selectedOptionIndex === null && <p className="text-ink-faint italic">Not answered</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
