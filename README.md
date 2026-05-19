# AI-Interview — AI-Powered Technical Interview Simulator

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb" />
  <img src="https://img.shields.io/badge/Groq-AI-6F38C5?style=flat" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat&logo=tailwindcss" />
</p>

> Practice technical interviews with **Alex**, a strict AI senior engineer — powered by Groq.

---

## Overview

AI-Interview is a full-stack application that lets users practice technical interviews with an AI interviewer. It includes a React frontend, an Express backend, MongoDB persistent storage, and AI prompt orchestration through Groq.

---

## Features

- 8 interview categories: `dsa`, `system-design`, `oops`, `computer-network`, `dbms`, `operating-system`, `behavioral`, `mixed`
- AI interviewer persona with follow-up questions and feedback
- Real-time chat interview experience
- Interview history and performance stats per user
- Final interview evaluation with score breakdown and hire recommendation
- JWT authentication and protected routes
- Responsive UI built with React, Vite, and Tailwind CSS

---

## Tech Stack

| Layer       | Tech                              |
|-------------|-----------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS    |
| Backend     | Node.js + Express.js              |
| Database    | MongoDB + Mongoose                |
| AI          | Groq Chat Completions             |
| Auth        | JWT + bcryptjs                    |
| HTTP Client | Axios                             |
| State       | React Context API                 |

---

## Project Structure

```
ai-interview/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── interviewController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Interview.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── interviewRoutes.js
│   ├── services/
│   │   └── groqService.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── app.js
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally or via Atlas
- A valid Groq API key

---

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/ai-interview.git
cd ai-interview
```

---

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/ai-interview
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The backend will run at `http://localhost:5001` by default.

---

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001
```

Start the frontend:

```bash
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## API Reference

### Auth Endpoints

| Method | Endpoint             | Description         | Auth |
|--------|----------------------|---------------------|------|
| POST   | /api/auth/register   | Register a new user | No   |
| POST   | /api/auth/login      | Login user          | No   |
| GET    | /api/auth/me         | Get current user    | Yes  |

### Interview Endpoints

| Method | Endpoint                        | Description                      | Auth |
|--------|---------------------------------|----------------------------------|------|
| POST   | /api/interview/start            | Start a new interview            | Yes  |
| POST   | /api/interview/message          | Send an answer / continue        | Yes  |
| GET    | /api/interview/history          | Get interview history            | Yes  |
| GET    | /api/interview/:id              | Get interview transcript         | Yes  |
| PUT    | /api/interview/:id/abandon      | Abandon an active interview      | Yes  |

---

## Interview Flow

1. User selects an interview category.
2. Frontend calls `POST /api/interview/start`.
3. AI generates the opening question.
4. User answers and sends the reply to `POST /api/interview/message`.
5. AI provides feedback and continues the interview.
6. After several exchanges or when the user ends the flow, the backend generates a final evaluation and verdict.

---

## Environment Variables

### Backend

- `PORT` — server port
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret used to sign JWTs
- `GROQ_API_KEY` — Groq API key for AI requests
- `GROQ_MODEL` — Groq model to use for completions
- `NODE_ENV` — environment mode
- `FRONTEND_URL` — allowed frontend origin for CORS

### Frontend

- `VITE_API_URL` — backend API base URL

---

## Notes

- The backend requires an `Authorization: Bearer <token>` header for protected routes.
- Interview transcripts, scores, verdicts, and feedback are stored in MongoDB.
- The `groqService.js` module handles AI prompt generation and final evaluation logic.

---

## License

This project is provided as-is.
