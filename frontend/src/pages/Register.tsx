import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../api/types";
import { ScanOrb } from "../components/ScanOrb";

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(fullName, email, password, registerNumber, role);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "mt-1.5 w-full bg-panel border border-panel-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-signal focus:shadow-glow transition-all duration-200";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <ScanOrb className="absolute inset-0 opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-signal" />
          </div>
          <p className="font-display font-semibold text-ink">ProctorEd</p>
        </div>

        <div className="glass border border-panel-border rounded-2xl p-6 shadow-card">
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Create account</h1>
          <p className="text-ink-muted text-sm mb-6">Join as a student or administrator.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-ink-muted font-medium">Full name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Register / roll number</label>
              <input required value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputCls}>
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin / Examiner</option>
              </select>
            </div>

            {error && (
              <p className="text-alert text-sm bg-alert-soft border border-alert/30 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              disabled={busy}
              className="group w-full bg-signal hover:bg-signal/90 text-void font-semibold transition-all duration-200 rounded-xl py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-glow"
            >
              {busy ? "Creating…" : "Create account"}
              {!busy && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-signal hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};
