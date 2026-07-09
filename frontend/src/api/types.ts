export type Role = "ADMIN" | "STUDENT";

export interface AuthUser {
  fullName: string;
  email: string;
  role: Role;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  totalMarks: number;
  proctoringEnabled: boolean;
}

export interface Question {
  id: number;
  questionText: string;
  type: "MCQ" | "TRUE_FALSE";
  options: string[];
  correctOptionIndex: number;
  marks: number;
}

export interface ExamAttempt {
  id: number;
  status: "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED" | "TERMINATED";
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  flagCount: number;
  exam: Exam;
}

export interface ProctoringEvent {
  id: number;
  eventType: string;
  details: string;
  occurredAt: string;
}
