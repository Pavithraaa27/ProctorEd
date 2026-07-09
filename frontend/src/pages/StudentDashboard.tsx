import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, FileText, ShieldAlert, ArrowRight } from "lucide-react";
import client from "../api/client";
import type { Exam, ExamAttempt } from "../api/types";

export const StudentDashboard: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [myAttempts, setMyAttempts] = useState<ExamAttempt[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    client.get("/api/exams").then((r) => setExams(r.data));
    client.get("/api/attempts/my").then((r) => setMyAttempts(r.data));
  }, []);

  const attemptFor = (examId: number) => myAttempts.find((a) => a.exam.id === examId);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <p className="font-mono text-[11px] tracking-[0.2em] text-signal/80 mb-2">DASHBOARD</p>
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Available Exams</h1>
      <p className="text-ink-muted text-sm mb-9">
        Proctoring activates automatically the moment you start a monitored exam.
      </p>

      <div className="space-y-3">
        {exams.map((exam, i) => {
          const attempt = attemptFor(exam.id);
          const done = attempt?.status === "SUBMITTED" || attempt?.status === "AUTO_SUBMITTED";
          return (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group bg-panel border border-panel-border hover:border-signal/40 rounded-2xl p-5 shadow-card transition-colors duration-200 flex items-center justify-between gap-4"
            >
              <div>
                <h2 className="font-display font-semibold text-ink">{exam.title}</h2>
                <p className="text-ink-muted text-sm mt-1 line-clamp-2">{exam.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-ink-faint">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exam.durationMinutes} min</span>
                  <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {exam.totalMarks} marks</span>
                  {exam.proctoringEnabled && (
                    <span className="flex items-center gap-1.5 text-alert"><ShieldAlert className="w-3.5 h-3.5" /> Proctored</span>
                  )}
                </div>
              </div>

              {done ? (
                <span className="text-verified text-sm font-mono font-medium whitespace-nowrap bg-verified-soft border border-verified/30 rounded-lg px-3 py-1.5">
                  {attempt.score}/{exam.totalMarks}
                </span>
              ) : (
                <button
                  onClick={() => navigate(`/exam/${exam.id}`)}
                  className="group/btn flex items-center gap-1.5 bg-signal hover:bg-signal/90 text-void transition-colors duration-200 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap shadow-glow"
                >
                  {attempt ? "Resume" : "Start Exam"}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              )}
            </motion.div>
          );
        })}
        {exams.length === 0 && (
          <div className="text-center py-16 border border-dashed border-panel-border rounded-2xl">
            <p className="text-ink-faint text-sm">No exams have been published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
