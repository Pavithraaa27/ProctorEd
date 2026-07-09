import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ScanOrb } from "../components/ScanOrb";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid email or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Left — visual */}
      <div className="relative hidden lg:flex items-center justify-center border-r border-panel-border bg-void-soft overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-[size:42px_42px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
        <ScanOrb className="absolute inset-0" />

        <div className="relative z-10 max-w-md px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-[11px] tracking-[0.25em] text-signal/80 mb-3">
              SESSION INTEGRITY · LIVE
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink leading-snug">
              Every attempt, verified.
            </h2>
            <p className="text-ink-muted text-sm mt-3 leading-relaxed">
              Tab focus, fullscreen state, and camera presence are checked
              continuously the moment an exam begins.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-16 relative">
        <div className="absolute inset-0 lg:hidden">
          <ScanOrb className="absolute inset-0 opacity-40" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-signal" />
            </div>
            <div>
              <p className="font-display font-semibold text-ink leading-none">ProctorEd</p>
              <p className="text-[11px] text-ink-muted mt-0.5">Examination &amp; Proctoring System</p>
            </div>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink mb-1">Sign in</h1>
          <p className="text-ink-muted text-sm mb-8">Enter your credentials to continue.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-ink-muted font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full bg-panel border border-panel-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-signal focus:shadow-glow transition-all duration-200"
                placeholder="you@college.edu"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full bg-panel border border-panel-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-signal focus:shadow-glow transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-alert text-sm bg-alert-soft border border-alert/30 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              disabled={busy}
              className="group w-full bg-signal hover:bg-signal/90 text-void font-semibold transition-all duration-200 rounded-xl py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-glow"
            >
              {busy ? "Signing in…" : "Sign in"}
              {!busy && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            New here?{" "}
            <Link to="/register" className="text-signal hover:underline">
              Create an account
            </Link>
          </p>
          <p className="text-center font-mono text-[11px] text-ink-faint mt-8">
            demo admin — admin@oeps.edu / Admin@123
          </p>
        </motion.div>
      </div>
    </div>
  );
};
