import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import client from "../api/client";
import type { AnswerReview, Exam, ExamAttempt, ProctoringEvent } from "../api/types";

export const AdminExamMonitor: React.FC = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [selected, setSelected] = useState<ExamAttempt | null>(null);
  const [events, setEvents] = useState<ProctoringEvent[]>([]);
  const [review, setReview] = useState<AnswerReview[]>([]);
  const [tab, setTab] = useState<"log" | "review">("log");

  useEffect(() => {
    if (!examId) return;
    client.get(`/api/exams/${examId}`).then((r) => setExam(r.data));
    client.get(`/api/attempts/exam/${examId}`).then((r) => setAttempts(r.data));
  }, [examId]);

  const viewAttempt = (attempt: ExamAttempt) => {
    setSelected(attempt);
    setTab("log");
    client.get(`/api/attempts/${attempt.id}/proctoring-events`).then((r) => setEvents(r.data));
    client.get(`/api/attempts/${attempt.id}/review`).then((r) => setReview(r.data));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.2em] text-signal/80 mb-2">MONITOR</p>
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">{exam?.title}</h1>
        <p className="text-ink-muted text-sm mb-7">Submissions and integrity overview</p>

        <div className="bg-panel border border-panel-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-faint font-mono border-b border-panel-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">STUDENT</th>
                <th className="text-left px-4 py-3 font-medium">STATUS</th>
                <th className="text-left px-4 py-3 font-medium">SCORE</th>
                <th className="text-left px-4 py-3 font-medium">FLAGS</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => viewAttempt(a)}
                  className={`border-b border-panel-border last:border-0 hover:bg-panel-raised cursor-pointer transition-colors ${
                    selected?.id === a.id ? "bg-panel-raised" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-ink">{(a as any).student?.fullName ?? `Attempt #${a.id}`}</td>
                  <td className="px-4 py-3 text-ink-muted font-mono text-xs">{a.status}</td>
                  <td className="px-4 py-3 text-ink font-mono">
                    {a.score ?? "—"}<span className="text-ink-faint">/{a.exam?.totalMarks ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {a.flagCount > 0 ? (
                      <span className="text-alert flex items-center gap-1 font-mono">
                        <ShieldAlert className="w-3.5 h-3.5" /> {a.flagCount}
                      </span>
                    ) : (
                      <span className="text-verified font-mono">0</span>
                    )}
                  </td>
                </tr>
              ))}
              {attempts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink-faint">No submissions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-panel border border-panel-border rounded-2xl p-4 h-fit">
        {!selected ? (
          <p className="text-sm text-ink-faint">Select a submission to see details.</p>
        ) : (
          <>
            <div className="flex gap-1 mb-4 bg-panel-raised rounded-lg p-1">
              <button
                onClick={() => setTab("log")}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                  tab === "log" ? "bg-signal text-void" : "text-ink-muted hover:text-ink"
                }`}
              >
                Integrity Log
              </button>
              <button
                onClick={() => setTab("review")}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                  tab === "review" ? "bg-signal text-void" : "text-ink-muted hover:text-ink"
                }`}
              >
                Answer Review
              </button>
            </div>

            {tab === "log" && (
              <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                {events.length === 0 && (
                  <p className="text-xs text-ink-faint flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-verified" /> No violations recorded.
                  </p>
                )}
                {events.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="text-xs bg-panel-raised border border-panel-border rounded-lg px-3 py-2"
                  >
                    <p className="text-alert font-medium font-mono">{ev.eventType.replaceAll("_", " ")}</p>
                    <p className="text-ink-muted mt-0.5">{ev.details}</p>
                    <p className="text-ink-faint mt-0.5 font-mono">{new Date(ev.occurredAt).toLocaleString()}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {tab === "review" && (
              <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
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
                            {isCorrect && " ✓ correct"}
                            {isSelected && !isCorrect && " ← student's answer"}
                          </div>
                        );
                      })}
                      {r.selectedOptionIndex === null && (
                        <p className="text-ink-faint italic">Not answered</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
