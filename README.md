# 📝 ProctorEd — Online Examination & Proctoring System

A secure full-stack web application for conducting online examinations with real-time browser-based proctoring.

A full-stack web application for running timed, proctored online exams. Students take MCQ exams in a browser; the app watches for tab-switching, fullscreen exits, copy/paste, and webcam feed loss in real time, flags each violation instantly, and auto-submits after repeated violations. Admins get a full timestamped integrity log and an answer-by-answer review for every submission.
Students can take timed MCQ exams while the system monitors tab switching, fullscreen exits, clipboard activity, and webcam availability. Administrators can create exams, monitor submissions, review integrity violations, and analyze answer-by-answer results.

---

## ✨ Features

### Student
- Secure JWT Authentication
- Register & Login
- Take timed MCQ exams
- Live webcam preview
- Real-time countdown timer
- Question navigator
- Automatic submission on timeout
- View detailed exam results

### Proctoring
- Tab-switch detection
- Fullscreen exit detection
- Copy/Paste blocking
- Webcam availability monitoring
- Real-time warning system
- Auto-submit after multiple violations

### Admin
- Create and manage exams
- Add MCQ questions
- Monitor student submissions
- View integrity logs
- Review student answers
- Dashboard for all exam attempts

---

## 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| Backend | Java 17, Spring Boot 3.3, Spring Security, JWT, Spring Data JPA |
| Database | MySQL 8, H2 (Development) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| APIs | Axios, React Router |
| 3D UI | Three.js, Framer Motion |
| Proctoring | Page Visibility API, Fullscreen API, Clipboard API, getUserMedia |
| Containerization | Docker, Docker Compose |

---

## 🏗 Architecture

```
React + TypeScript
        │
 REST API + JWT
        │
Spring Boot Backend
        │
Spring Data JPA
        │
      MySQL
```

Browser APIs continuously monitor:

- Page Visibility
- Fullscreen
- Clipboard
- Webcam

Every violation is immediately stored and displayed to administrators.

---

## 📂 Project Structure

```
oeps/

├── backend/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   ├── dto/
│   ├── security/
│   └── config/
│
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── context/
│   └── api/
│
└── docker-compose.yml
```

---

## 🚀 Running Locally

### Using Docker

```bash
docker compose up --build
```

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:8080
```

---

### Backend

```bash
cd backend
mvn spring-boot:run
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Demo Credentials

### Admin

```
Email:
admin@oeps.edu

Password:
Admin@123
```

Students can register directly from the application.

---

## 📖 API Highlights

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/exams` | Available Exams |
| POST | `/api/exams` | Create Exam |
| POST | `/api/attempts/{id}/submit` | Submit Exam |
| POST | `/api/attempts/{id}/proctoring-event` | Record Violation |
| GET | `/api/results` | Student Results |

---

## 🔒 Proctoring Events

The system detects:

- Tab switching
- Fullscreen exit
- Clipboard usage
- Webcam disconnect
- Developer tools (heuristic)

After three violations the exam is automatically submitted.

---

## 📈 Future Improvements

- Face Recognition
- Liveness Detection
- Email Notifications
- Subjective Question Support
- AI-assisted Proctoring
- Examiner Role
- Analytics Dashboard

---

## 📸 Screenshots

> Add screenshots here.

```
screenshots/
├── login.png
├── dashboard.png
├── exam.png
├── monitor.png
└── results.png
```

---

## 👨‍💻 Author

**Pavithra Nair**

Java • Spring Boot • React • Full Stack Development
