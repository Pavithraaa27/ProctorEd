import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Navbar } from "./components/Navbar";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { StudentDashboard } from "./pages/StudentDashboard";
import { TakeExam } from "./pages/TakeExam";
import { ExamResult } from "./pages/ExamResult";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminCreateExam } from "./pages/AdminCreateExam";
import { AdminExamMonitor } from "./pages/AdminExamMonitor";
import { StudentResults } from "./pages/StudentResults";

const Home: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "ADMIN" ? <Navigate to="/admin" replace /> : <StudentDashboard />;
};

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen">
    <Navbar />
    {children}
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Shell>
                  <Home />
                </Shell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/exam/:examId"
            element={
              <ProtectedRoute role="STUDENT">
                <TakeExam />
              </ProtectedRoute>
            }
          />

          <Route
            path="/result/:attemptId"
            element={
              <ProtectedRoute role="STUDENT">
                <ExamResult />
              </ProtectedRoute>
            }
          />

          <Route
            path="/results"
            element={
              <ProtectedRoute role="STUDENT">
                <Shell>
                  <StudentResults />
                </Shell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <Shell>
                  <AdminDashboard />
                </Shell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create"
            element={
              <ProtectedRoute role="ADMIN">
                <Shell>
                  <AdminCreateExam />
                </Shell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/monitor/:examId"
            element={
              <ProtectedRoute role="ADMIN">
                <Shell>
                  <AdminExamMonitor />
                </Shell>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
