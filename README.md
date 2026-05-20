# HireMe — Job Portal + AI Mock Interview (MERN)

HireMe is a full‑stack job portal where **students** can browse/apply to jobs and **recruiters** can post and manage openings. It also includes an **AI-powered mock interview** experience (HR / Aptitude / Coding rounds) with **feedback + scoring** and a **downloadable PDF report**.

## Key Features

### Student
- Sign up / login (cookie-based auth)
- Browse & search jobs
- Apply to jobs
- Save jobs for later
- Profile management (bio, skills, resume upload)
- AI Mock Interview (voice + text) and interview analysis

### Recruiter (Admin)
- Recruiter dashboard
- Company management
- Post and manage jobs
- View applicants and update application status

### AI Mock Interview
- Choose target role, difficulty, and round (HR / Aptitude / Coding)
- Receive per-answer feedback and score (0–10)
- Session analysis endpoint
- Download a **PDF interview report**

## Tech Stack

**Frontend:** React + Vite, Redux Toolkit, Tailwind, Radix UI components, Axios

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT (HTTP-only cookies), Multer + Cloudinary for uploads, PDFKit for reports

**AI:** Hugging Face chat completions (HF Router)

## Repository Structure

```
HireMe/
  backend/   # Express API + MongoDB
  frontend/  # React (Vite) UI
```

## Setup (Local)

### 1) Prerequisites
- Node.js (LTS recommended)
- MongoDB connection string (MongoDB Atlas is fine)
- (Optional) Cloudinary account for image/resume uploads
- (Optional) Hugging Face token + model for AI interview

### 2) Backend environment variables
Create `backend/.env` (do **not** commit it):

```bash
# Server
PORT=8000
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

# Auth
SECRET_KEY=your_long_random_secret

# Cloudinary (optional but recommended for uploads)
CLOUD_NAME=xxxx
API_KEY=xxxx
API_SECRET=xxxx

# Hugging Face (required for AI interview features)
HF_TOKEN=hf_xxx
HF_MODEL=meta-llama/Meta-Llama-3-8B-Instruct
```

Notes:
- `CLIENT_URL` can be a comma-separated list if you run multiple frontends.
- AI interview routes require `HF_TOKEN` + `HF_MODEL`.

### 3) Frontend environment variables
Create `frontend/.env`:

```bash
# Point the frontend to your backend API
VITE_API_BASE_URL=http://localhost:8000
```

### 4) Install dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd ../frontend
npm install
```

### 5) Run the app

Run backend (Terminal 1):
```bash
cd backend
npm run dev
```

Run frontend (Terminal 2):
```bash
cd frontend
npm run dev
```

- Frontend: typically `http://localhost:5173`
- Backend API: `http://localhost:8000`

## Useful Scripts

### Backend
- `npm run dev` — start API with nodemon
- `npm run seed` — seed initial data (requires `backend/.env` with `MONGO_URI`)

### Frontend
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview built frontend

## API Overview (high-level)

Base path: `/api/v1`
- `user` — auth, profile, saved jobs
- `company` — recruiter company management
- `job` — create/browse jobs
- `application` — apply & applicant status updates
- `interview` — AI mock interview sessions, analysis, PDF export

## Security / GitHub Notes
- Never commit `.env` files or credentials.
- This repo includes a root `.gitignore` configured to ignore `**/.env*`, `node_modules/`, build outputs, and logs.

## Demo Flow (for interviewers)
1. Create a student account and browse jobs
2. Apply or save jobs
3. Start a mock interview session (choose round + difficulty)
4. Complete the session and download the PDF report
5. Login as recruiter to post jobs and manage applicants

---

If you’d like, I can also add screenshots/gifs placeholders and a simple architecture diagram section (without changing your code).