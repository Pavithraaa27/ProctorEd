# 📝 ProctorEd — Online Examination & Proctoring System

A secure full-stack web application for conducting online examinations with real-time browser-based proctoring.

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

- Email Notifications
- Subjective Question Support
- AI-assisted Proctoring
- Examiner Role
- Analytics Dashboard

---

## 📸 Screenshots

<img width="1913" height="977" alt="Screenshot 2026-07-09 232050" src="https://github.com/user-attachments/assets/a3139851-f040-470e-9914-b3edd8c648a0" />
<img width="1917" height="977" alt="Screenshot 2026-07-09 232211" src="https://github.com/user-attachments/assets/56c54f8f-196c-4cca-8390-27747bbd5bdc" />
<img width="1352" height="960" alt="Screenshot 2026-07-09 232854" src="https://github.com/user-attachments/assets/6fe099ba-6283-4a20-980b-897c9731bb10" />
<img width="1140" height="597" alt="Screenshot 2026-07-09 233212" src="https://github.com/user-attachments/assets/d944aa4f-5a1b-4ae8-ac74-97453b2a2aa8" />



```
screenshots/
├── login.png
├── dashboard.png
├── exam.png
├── generateexam.png
└── violations.png
```

---

## 📄 License
MIT © Pavithra Nair

Java • Spring Boot • React • Full Stack Development
