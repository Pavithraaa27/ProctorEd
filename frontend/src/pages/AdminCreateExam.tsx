import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import client from "../api/client";

interface DraftQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
}

export const AdminCreateExam: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0, marks: 1 },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "mt-1 w-full bg-panel-raised border border-panel-border rounded-lg px-3 py-2 text-sm outline-none focus:border-signal transition-colors";

  const updateQuestion = (idx: number, patch: Partial<DraftQuestion>) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };
  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qIdx ? { ...q, options: q.options.map((o, j) => (j === optIdx ? value : o)) } : q))
    );
  };
  const addQuestion = () =>
    setQuestions((qs) => [...qs, { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0, marks: 1 }]);
  const removeQuestion = (idx: number) => setQuestions((qs) => qs.filter((_, i) => i !== idx));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const examRes = await client.post("/api/exams", {
        title, description, durationMinutes: duration, startTime, endTime, proctoringEnabled,
      });
      const examId = examRes.data.id;
      for (const q of questions) {
        if (!q.questionText.trim()) continue;
        await client.post(`/api/exams/${examId}/questions`, {
          questionText: q.questionText,
          type: "MCQ",
          options: q.options.filter((o) => o.trim() !== ""),
          correctOptionIndex: q.correctOptionIndex,
          marks: q.marks,
        });
      }
      navigate("/admin");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create exam");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <p className="font-mono text-[11px] tracking-[0.2em] text-signal/80 mb-2">ADMIN</p>
      <h1 className="font-display text-2xl font-semibold text-ink mb-7">Create Exam</h1>

      <form onSubmit={submit} className="space-y-5">
        <div className="bg-panel border border-panel-border rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs text-ink-muted font-medium">Title</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-ink-muted font-medium">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-muted font-medium">Duration (minutes)</label>
              <input type="number" min={1} required value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputCls} />
            </div>
            <div className="flex items-end gap-2 pb-2.5">
              <input id="proctoring" type="checkbox" checked={proctoringEnabled} onChange={(e) => setProctoringEnabled(e.target.checked)}
                className="accent-signal w-4 h-4" />
              <label htmlFor="proctoring" className="text-xs text-ink-muted">Enable proctoring</label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-muted font-medium">Start time</label>
              <input type="datetime-local" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">End time</label>
              <input type="datetime-local" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {questions.map((q, qIdx) => (
          <motion.div
            key={qIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-panel border border-panel-border rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs text-ink-muted font-mono">QUESTION {qIdx + 1}</label>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qIdx)} className="text-alert hover:text-alert/80 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input value={q.questionText} onChange={(e) => updateQuestion(qIdx, { questionText: e.target.value })}
              placeholder="Question text" className={inputCls} />

            {q.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <input type="radio" checked={q.correctOptionIndex === optIdx}
                  onChange={() => updateQuestion(qIdx, { correctOptionIndex: optIdx })} className="accent-signal" />
                <input value={opt} onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                  placeholder={`Option ${optIdx + 1}`}
                  className="flex-1 bg-panel-raised border border-panel-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-signal transition-colors" />
              </div>
            ))}

            <div>
              <label className="text-xs text-ink-muted font-medium">Marks</label>
              <input type="number" min={1} value={q.marks} onChange={(e) => updateQuestion(qIdx, { marks: Number(e.target.value) })}
                className="mt-1 w-24 bg-panel-raised border border-panel-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-signal transition-colors" />
            </div>
          </motion.div>
        ))}

        <button type="button" onClick={addQuestion} className="flex items-center gap-1.5 text-sm text-signal hover:text-signal/80 transition-colors">
          <Plus className="w-4 h-4" /> Add question
        </button>

        {error && <p className="text-alert text-sm bg-alert-soft border border-alert/30 rounded-lg px-3 py-2">{error}</p>}

        <button disabled={busy}
          className="w-full bg-signal hover:bg-signal/90 text-void font-semibold transition-colors duration-200 rounded-xl py-2.5 text-sm disabled:opacity-50 shadow-glow">
          {busy ? "Creating…" : "Publish Exam"}
        </button>
      </form>
    </div>
  );
};
