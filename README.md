# TRACKR — Daily & Fitness Tracker

A full-stack personal productivity and fitness tracking web app. Track daily tasks, log workouts, monitor body stats, and write daily notes — all in one place.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, Redux Toolkit, Recharts |
| Backend  | FastAPI, SQLAlchemy, PostgreSQL, Alembic, JWT auth |
| Auth     | OAuth2 + JWT (python-jose, passlib/bcrypt) |

---

## Features

- **Auth** — Register + login with JWT, session restore on reload, auto-logout on token expiry
- **Day Tracker** — Task CRUD with priority levels, completion tracking, weekly bar graph, productivity trend chart, 90-day activity heatmap, daily notes
- **Fitness Tracker** — Exercise library, personal exercise list, set/rep/weight logging with sets multiplier, progress charts, workout heatmap, body stats tracking, weekly split planner with session suggestions
- **Theme** — Inkwell dark mode + Aged Paper light mode, synced to backend, persists across devices
- **Responsive** — Desktop 3-column layout + mobile bottom tab bar, all components adapt to screen size
- **AI Chat** — UI built, backend integration pending

---

## Project Structure

```
trackr/                          ← Frontend (React + Vite)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── daytracker/          ← TodoList, WeekBarGraph, ActivityLineChart, CalendarHeatmap, DailyNotes
│   │   ├── fitnesstracker/      ← ExerciseList, ExerciseProgressChart, WorkoutHeatmap, BodyStats, NextSession
│   │   ├── ChatBot.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Navbar.jsx           ← Desktop nav + MobileTopBar + BottomTabBar
│   │   ├── ProtectedRoute.jsx
│   │   ├── SkeletonLoader.jsx
│   │   └── Toast.jsx
│   ├── pages/
│   │   ├── DayTracker.jsx
│   │   ├── FitnessTracker.jsx
│   │   └── LoginPage.jsx
│   ├── services/
│   │   └── api.js               ← All backend calls, 401 interceptor
│   └── store/
│       ├── authSlice.js
│       ├── chatSlice.js
│       ├── settingsSlice.js
│       ├── tasksSlice.js
│       ├── themeSlice.js
│       └── workoutsSlice.js

backend/                         ← FastAPI backend
├── app/
│   ├── api/v1/                  ← auth, tasks, exercises, logs, body_stats, notes, settings
│   ├── models/                  ← User, Task, TaskCompletion, Exercise, UserExercise, ExerciseLog, BodyStat, Note, UserSetting
│   ├── schemas/                 ← Pydantic models for all resources
│   ├── crud/                    ← Database operations
│   └── core/                    ← JWT, security, settings
├── alembic/                     ← Database migrations
└── requirements.txt
```

---

## Setup

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables — create .env file:
DATABASE_URL=postgresql://user:password@localhost:5432/trackr
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:5173"]

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend

```bash
cd trackr

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login (OAuth2 form), returns JWT |
| GET  | `/api/v1/auth/me` | Get current user |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET    | `/api/v1/tasks/` | Get all tasks |
| POST   | `/api/v1/tasks/` | Create task (title, description, priority) |
| PUT    | `/api/v1/tasks/{id}` | Update task |
| DELETE | `/api/v1/tasks/{id}` | Delete task |
| POST   | `/api/v1/tasks/completions` | Mark task completed |
| GET    | `/api/v1/tasks/completions/me` | Get all completions (used for analytics) |

### Exercises
| Method | Endpoint | Description |
|---|---|---|
| GET    | `/api/v1/exercises/` | Browse global exercise library |
| POST   | `/api/v1/exercises/` | Add exercise to global library |
| GET    | `/api/v1/exercises/my-exercises` | Get user's personal exercise list |
| POST   | `/api/v1/exercises/my-exercises` | Add exercise to personal list |
| DELETE | `/api/v1/exercises/my-exercises/{id}` | Remove from personal list |

### Logs
| Method | Endpoint | Description |
|---|---|---|
| GET    | `/api/v1/logs/me` | All logs across all user exercises |
| GET    | `/api/v1/logs/user-exercise/{id}` | Logs for one exercise |
| POST   | `/api/v1/logs/` | Create log entry (sets, reps, weight) |
| PUT    | `/api/v1/logs/{id}` | Update log entry |
| DELETE | `/api/v1/logs/{id}` | Delete log entry |

### Other
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/v1/body-stats/` | Body weight + fat tracking |
| GET/POST | `/api/v1/notes/` | Daily notes (upsert by date) |
| GET/PUT  | `/api/v1/settings/` | User settings (theme, split config) |

---

## Database Migrations

All migrations are in `alembic/versions/`. To apply:

```bash
alembic upgrade head
```

To create a new migration after changing a model:

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

---

## Data flow

```
User action
  → React component dispatches Redux thunk
  → Thunk calls api.js function
  → api.js fetches backend endpoint with JWT header
  → On 401: fires trackr:unauthorized event → auto-logout
  → On success: Redux store updates → components re-render + toast notification
```

**What's stored in the backend DB:**
Tasks, completions, exercises, exercise logs, body stats, daily notes, user settings (theme + split config)

**What's stored in localStorage only:**
Task priority labels, today's completion toggle state (resets at midnight), JWT token

---

## Deployment checklist

- [ ] Update `BACKEND_CORS_ORIGINS` in `.env` to your production domain
- [ ] Set a strong `SECRET_KEY` (generate with `openssl rand -hex 32`)
- [ ] Run `alembic upgrade head` on your production DB
- [ ] Build frontend: `npm run build` — serves from `dist/`
- [ ] Wire up AI chat backend (currently returns dummy responses)
