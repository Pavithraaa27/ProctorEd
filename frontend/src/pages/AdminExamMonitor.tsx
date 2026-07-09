import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import client from "../api/client";
import type { Exam, ExamAttempt, ProctoringEvent } from "../api/types";

export const AdminExamMonitor: React.FC = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [selected, setSelected] = useState<ExamAttempt | null>(null);
  const [events, setEvents] = useState<ProctoringEvent[]>([]);

  useEffect(() => {
    if (!examId) return;
    client.get(`/api/exams/${examId}`).then((r) => setExam(r.data));
    client.get(`/api/attempts/exam/${examId}`).then((r) => setAttempts(r.data));
  }, [examId]);

  const viewEvents = (attempt: ExamAttempt) => {
    setSelected(attempt);
    client.get(`/api/attempts/${attempt.id}/proctoring-events`).then((r) => setEvents(r.data));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
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
                  onClick={() => viewEvents(a)}
                  className={`border-b border-panel-border last:border-0 hover:bg-panel-raised cursor-pointer transition-colors ${
                    selected?.id === a.id ? "bg-panel-raised" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-ink">{(a as any).student?.fullName ?? `Attempt #${a.id}`}</td>
                  <td className="px-4 py-3 text-ink-muted font-mono text-xs">{a.status}</td>
                  <td className="px-4 py-3 text-ink font-mono">{a.score ?? "—"}</td>
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
        <h2 className="text-sm font-medium text-ink mb-3">
          {selected ? `Log — Attempt #${selected.id}` : "Select a submission"}
        </h2>
        <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
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
          {selected && events.length === 0 && (
            <p className="text-xs text-ink-faint">No violations recorded for this attempt.</p>
          )}
        </div>
      </div>
    </div>
  );
};
