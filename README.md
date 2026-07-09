# ProctorEd — Online Examination & Proctoring System

A full-stack web application that lets an institution run timed online exams
while automatically flagging integrity violations (tab switching, exiting
fullscreen, copy/paste, right-click, devtools, and webcam feed loss) as the
student attempts the exam.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.3, Spring Security + JWT, Spring Data JPA |
| Database | MySQL 8 (H2 in-memory for local dev without Docker) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, Axios |
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
review a full timeline per student afterwards. After a configurable number
of flags (default 6), the exam auto-submits.

## Project Structure

```
oeps/
├── backend/     Spring Boot REST API
├── frontend/    React + TypeScript SPA
└── docker-compose.yml
```

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

By default it uses an in-memory H2 database, so no MySQL setup is required
for a quick demo. To use MySQL instead, set:

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

## Deploying (Railway)

1. Push this repo to GitHub.
2. On Railway, create a MySQL plugin, then two services from the repo:
   `backend` (root: `/backend`) and `frontend` (root: `/frontend`).
3. Set the backend's env vars (`DB_URL`, `DB_USER`, `DB_PASSWORD`, `DB_DRIVER`,
   `JWT_SECRET`) from the MySQL plugin's connection details.
4. Set the frontend's `VITE_API_URL` build arg to the backend's public URL.

## Known Limitations / Future Scope

- Face-count / identity verification uses a lightweight liveness heuristic
  (webcam track health), not true face-recognition — a natural next step
  would be a client-side model (e.g. face-api.js) or a server-side CV service.
- No email/SMS notifications for exam scheduling yet.
- Question bank supports MCQ/True-False only; short-answer grading would
  need manual review tooling.
- Single admin role today; a dedicated "Examiner" role with narrower
  permissions would suit larger teams.
