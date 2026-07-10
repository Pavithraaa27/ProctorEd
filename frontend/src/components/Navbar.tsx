import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const studentLinks = [
    { to: "/", label: "Exams" },
    { to: "/results", label: "My Results" },
  ];
  const adminLinks = [
    { to: "/admin", label: "Console" },
    { to: "/admin/create", label: "New Exam" },
  ];
  const links = user?.role === "ADMIN" ? adminLinks : studentLinks;

  return (
    <header className="border-b border-panel-border glass sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center transition-colors group-hover:border-signal/60">
              <ShieldCheck className="w-4 h-4 text-signal" />
            </div>
            <span className="font-display font-semibold text-ink tracking-tight">ProctorEd</span>
          </Link>

          {user && (
            <nav className="hidden sm:flex items-center gap-1">
              {links.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      active ? "text-signal bg-signal/10" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-ink-muted hidden md:inline">
              {user.fullName} <span className="text-ink-faint">·</span>{" "}
              <span className="text-signal font-mono text-xs">{user.role}</span>
            </span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex items-center gap-1.5 text-ink-muted hover:text-alert transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
