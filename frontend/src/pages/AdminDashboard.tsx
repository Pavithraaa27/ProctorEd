import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ShieldAlert, Users } from "lucide-react";
import client from "../api/client";
import type { Exam } from "../api/types";

export const AdminDashboard: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    client.get("/api/exams").then((r) => setExams(r.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-9">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-signal/80 mb-2">ADMIN</p>
          <h1 className="font-display text-2xl font-semibold text-ink">Exam Console</h1>
          <p className="text-ink-muted text-sm mt-1">Create exams and review proctoring reports.</p>
        </div>
        <Link
          to="/admin/create"
          className="flex items-center gap-1.5 bg-signal hover:bg-signal/90 text-void transition-colors duration-200 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-glow"
        >
          <Plus className="w-4 h-4" /> New Exam
        </Link>
      </div>

      <div className="space-y-3">
        {exams.map((exam, i) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="bg-panel border border-panel-border hover:border-signal/40 rounded-2xl p-5 shadow-card transition-colors duration-200 flex items-center justify-between"
          >
            <div>
              <h2 className="font-display font-medium text-ink">{exam.title}</h2>
              <p className="text-ink-faint text-xs mt-1 font-mono">
                {exam.durationMinutes} min · {exam.totalMarks} marks
                {exam.proctoringEnabled && (
                  <span className="text-alert inline-flex items-center gap-1 ml-2">
                    <ShieldAlert className="w-3 h-3" /> Proctored
                  </span>
                )}
              </p>
            </div>
            <Link
              to={`/admin/monitor/${exam.id}`}
              className="flex items-center gap-1.5 text-sm text-signal hover:text-signal/80 transition-colors"
            >
              <Users className="w-4 h-4" /> View submissions
            </Link>
          </motion.div>
        ))}
        {exams.length === 0 && (
          <div className="text-center py-16 border border-dashed border-panel-border rounded-2xl">
            <p className="text-ink-faint text-sm">No exams created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
