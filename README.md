#📝ProctorEd — Online Examination & Proctoring System

A full-stack web application for running timed, proctored online exams.
Students take MCQ exams in a browser; the app watches for tab-switching,
fullscreen exits, copy/paste, and webcam feed loss in real time, flags
each violation instantly, and auto-submits after repeated violations.
Admins get a full timestamped integrity log and an answer-by-answer
review for every submission.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.3, Spring Security + JWT, Spring Data JPA |
| Database | MySQL 8 (H2 in-memory for local dev without Docker) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, Axios, Three.js, Framer Motion |
| Proctoring | Browser APIs — Page Visibility, Fullscreen, Clipboard, `getUserMedia` |
| Containerization | Docker + Docker Compose |

## Architecture

```
┌─────────────┐        REST + JWT        ┌──────────────────┐        JPA        ┌─────────┐
│   React SPA │ ───────────────────────► │  Spring Boot API │ ────────────────► │  MySQL  │
│ (Vite + TS) │ ◄─────────────────────── │  (Stateless)     │ ◄──────────────── │         │
└─────────────┘                          └──────────────────┘                    └─────────┘
      │
      ├─ Page Visibility API   → tab-switch detection
      ├─ Fullscreen API        → exit detection
      ├─ Clipboard events      → copy/paste block
      ├─ getUserMedia          → webcam liveness check
      └─ window size heuristic → devtools-open detection
```

Every violation is (a) shown instantly to the student as a warning, and
(b) POSTed to `/api/attempts/{id}/proctoring-event` so the examiner can
review a full timeline per student afterwards. After **3 flags**, the
exam auto-submits.

## Project Structure

```
oeps/
├── backend/                Spring Boot REST API
│   └── src/main/java/com/oeps/
│       ├── entity/         JPA models (User, Exam, Question, ExamAttempt, Answer, ProctoringEvent)
│       ├── repository/     Spring Data repositories
│       ├── service/        Business logic (auth, exams, attempts)
│       ├── controller/     REST endpoints
│       ├── security/       JWT filter, Spring Security config
│       ├── dto/            Request/response objects (hides the answer key from students)
│       └── config/         Security, Jackson, and seed-data config
├── frontend/                React + TypeScript SPA
│   └── src/
│       ├── pages/           Login, Register, StudentDashboard, TakeExam, StudentResults,
│       │                    ExamResult, AdminDashboard, AdminCreateExam, AdminExamMonitor
│       ├── hooks/            useProctoring.ts — the core proctoring logic
│       ├── components/       Navbar, ProtectedRoute, ScanOrb (3D login visual)
│       ├── context/          AuthContext
│       └── api/              axios client + TypeScript types
└── docker-compose.yml
```

## Pages / Features

**Student side**
- **Login / Register** — JWT-based auth, role selection at signup
- **Available Exams** (`/`) — stats (total / completed / pending) + exam list
- **Take Exam** (`/exam/:id`) — live camera preview, countdown timer, question navigator, real-time integrity flag panel
- **My Results** (`/results`) — history of completed exams with score, flag count, and a full answer-by-answer review (which options were right/wrong)

**Admin side**
- **Exam Console** (`/admin`) — list of created exams
- **Create Exam** (`/admin/create`) — add MCQ questions; the correct option is marked with a clearly highlighted green selector (not a plain radio button) so there's no ambiguity about what counts as correct
- **Exam Monitor** (`/admin/monitor/:examId`) — table of all submissions; click a row to see either the **Integrity Log** (every flag, timestamped) or the **Answer Review** (each question, the correct answer, and what the student picked)

## Running Locally

### Option A — Docker Compose (recommended)

```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

### Option B — Run services individually

**Backend** (needs JDK 17 + Maven):

```bash
cd backend
mvn spring-boot:run
```

By default it uses an **in-memory H2 database**, so no MySQL setup is
required for a quick demo — but this also means **all data (accounts,
exams, attempts) is wiped every time you stop and restart the backend.**
See the Troubleshooting section below for what this means in practice.

To use MySQL instead (persists across restarts):

```bash
export DB_URL=jdbc:mysql://localhost:3306/oeps
export DB_USER=oeps
export DB_PASSWORD=oepspass
export DB_DRIVER=com.mysql.cj.jdbc.Driver
```

**Frontend** (needs Node 18+):

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` in a `.env` file inside `frontend/` if your backend isn't
on `http://localhost:8080`.

### Demo login

An admin account is seeded automatically on first boot:

- Email: `admin@oeps.edu`
- Password: `Admin@123`

Students can self-register from the app's Register page.

## Troubleshooting

**"403 Forbidden" on API calls, or nothing happens when creating/submitting an exam**

This is almost always one of two things:

1. **You restarted the backend.** The default database is in-memory H2 —
   every restart wipes all accounts and data, but your browser still has
   an old login token saved. That token now points to a user that no
   longer exists, so the server rejects it. **Fix:** log out and log back
   in. (As of this version, the app also auto-detects this and redirects
   you to the login page automatically.)
2. **Your token expired.** Tokens last 24 hours. Log out and back in.

**Backend won't start / `mvn` not found**

Maven isn't installed or isn't on your PATH. See the Windows setup notes
below.

**Frontend shows a blank page or console errors about fonts/WebGL**

The login page's animated visual uses Three.js and loads Google Fonts.
Both need normal internet access and a real GPU-capable browser — this
is a non-issue on a normal laptop, but will look different (fallback
fonts, software rendering) in sandboxed/headless environments.

**Windows-specific setup**

If `mvn -version` says "not recognized": download the Maven binary zip
from https://maven.apache.org/download.cgi, extract it (e.g. to
`C:\Program Files\apache-maven-3.9.16`), then add
`C:\Program Files\apache-maven-3.9.16\bin` to your System PATH via
Environment Variables, and open a **new** terminal window.

## Deploying

We're deploying this next — likely **Vercel** (frontend) + **Railway**
(backend + MySQL). Recommended flow when we get there:

1. Push this repo to GitHub.
2. **Railway**: create a MySQL plugin, then a service from `/backend`.
   Set its env vars (`DB_URL`, `DB_USER`, `DB_PASSWORD`, `DB_DRIVER`,
   `JWT_SECRET`) from the MySQL plugin's connection details.
3. **Vercel**: import the repo, set the root directory to `/frontend`,
   framework preset "Vite", and set `VITE_API_URL` to the Railway
   backend's public URL.
4. Update the backend's CORS config (`SecurityConfig.java`) to allow the
   Vercel domain instead of `*` once both are live.

(Detailed step-by-step deployment guide to follow once we start this part.)

## Known Limitations / Future Scope

- Face-count / identity verification uses a lightweight liveness heuristic
  (webcam track health), not true face-recognition — a natural next step
  would be a client-side model (e.g. face-api.js) or a server-side CV service.
- No email/SMS notifications for exam scheduling yet.
- Question bank supports MCQ/True-False only; short-answer grading would
  need manual review tooling.
- Single admin role today; a dedicated "Examiner" role with narrower
  permissions would suit larger teams.
- In-memory H2 by default means local dev data doesn't persist across
  backend restarts — switch to MySQL (see above) if you need it to.
