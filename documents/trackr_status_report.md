# TRACKR — Project Status Report
**Date:** March 2026 | **Stack:** React + Vite + Redux Toolkit + FastAPI + SQLite

---

## Section 1 — Backend Integration Status

### ✅ Fully Connected (Real API)

| Feature | Endpoint | Redux Action | Notes |
|---|---|---|---|
| Register | POST /api/v1/auth/register | registerUser thunk | Auto-logins after register |
| Login | POST /api/v1/auth/login | loginUser thunk | OAuth2 form, stores JWT |
| Session restore | GET /api/v1/auth/me | loadCurrentUser thunk | Fires once on app mount |
| Logout | — | logout action | Clears JWT from localStorage |
| Fetch tasks | GET /api/v1/tasks/ | fetchTasks thunk | Loads on DayTracker mount |
| Create task | POST /api/v1/tasks/ | createTask thunk | title + description |
| Update task | PUT /api/v1/tasks/{id} | updateTask thunk | title + description only |
| Delete task | DELETE /api/v1/tasks/{id} | removeTask thunk | Removes from store too |
| Complete task | POST /api/v1/tasks/completions | markTaskComplete thunk | One-way log entry |
| Fetch all exercises | GET /api/v1/exercises/ | fetchAllExercises thunk | Global library |
| Create exercise | POST /api/v1/exercises/ | addGlobalExercise thunk | name, category, muscle_group |
| Add to my list | POST /api/v1/exercises/my-exercises | addMyExercise thunk | Links exercise to user |
| Fetch my exercises | GET /api/v1/exercises/my-exercises | fetchMyExercises thunk | Loads on FitnessTracker mount |
| Remove my exercise | DELETE /api/v1/exercises/my-exercises/{id} | removeMyExercise thunk | — |
| Fetch logs | GET /api/v1/logs/user-exercise/{id} | fetchLogsForExercise thunk | Per exercise on select |
| Create log | POST /api/v1/logs/ | createLog thunk | reps, weight, duration, distance |
| Edit log | PUT /api/v1/logs/{id} | editLog thunk | Full field edit |
| Delete log | DELETE /api/v1/logs/{id} | deleteLog thunk | — |

---

### ⚠️ Partially Connected (Frontend state only, not persisted to DB)

| Feature | Where stored | Why not in backend | Impact |
|---|---|---|---|
| Task priority (High/Med/Low) | localStorage | No `priority` field in Task schema | Lost if user clears browser data |
| Task completed toggle | localStorage (resets daily) | Completions are log entries, not a boolean flag | Correct on refresh within same day, resets next day |
| Theme preference (dark/light) | localStorage | No user settings endpoint | Lost on new device/browser |
| Workout split config | localStorage | No split endpoint | Lost on new device |

---

### ❌ Fully Static (Mock / Seeded data, never touches backend)

| Feature | File | Data source | Reason |
|---|---|---|---|
| Week bar graph (Mon–Sun) | WeekBarGraph.jsx | Hardcoded array in tasksSlice | No /analytics endpoint |
| Productivity trend line chart | ActivityLineChart.jsx | Hardcoded 7-day array in tasksSlice | No /analytics endpoint |
| Task activity heatmap | CalendarHeatmap.jsx | Procedurally generated on load | No aggregated history endpoint |
| Weekly volume trend chart | ExerciseProgressChart.jsx | Hardcoded 8-day array in workoutsSlice | No volume aggregation endpoint |
| Workout frequency heatmap | WorkoutHeatmap.jsx | Procedurally generated on load | No log aggregation endpoint |
| Body stats (weight/body fat) | BodyStats.jsx | localStorage only | No /body-stats endpoint |
| Daily notes | DailyNotes.jsx | localStorage only | No /notes endpoint |
| AI chat responses | ChatBot.jsx | Rotating dummy strings | Backend connection pending |

---

## Section 2 — Known Issues

| Issue | Severity | Status |
|---|---|---|
| GET /auth/me called multiple times on load | Low | Fixed (useRef guard in ProtectedRoute) |
| DailyNotes crash (`date` undefined) | High | Fixed |
| React Router v7 future flag warnings | Info | Non-breaking, can be suppressed |
| Progress chart empty until logs exist | Medium | Expected behaviour, shows message |
| No error boundary — crash kills whole page | Medium | Not implemented yet |

---

## Section 3 — Completion Roadmap

### Option A — Frontend-only completion (no backend changes)
Derive all static charts from data already being fetched. Zero backend work required.

**Steps:**

1. Compute task heatmap from completions
   - After fetchTasks resolves, call GET /api/v1/tasks/completions/me
   - Group completions by date → build heatmap object in tasksSlice
   - Replace seeded heatmap with real data

2. Compute weekly bar graph from completions
   - Same completions data, group by day of week
   - Calculate completed/total ratio per day
   - Replace hardcoded weeklyData array

3. Compute productivity trend from completions
   - Last 7 days: count completions per day, normalise to 0–100 score
   - Replace hardcoded productivityTrend array

4. Compute workout heatmap from logs
   - After fetchMyExercises, fetch logs for all user exercises in parallel
   - Group log entries by date → build workoutHeatmap object
   - Replace seeded heatmap with real data

5. Compute weekly volume trend from logs
   - Same logs data, sum (reps × weight) per day for last 8 days
   - Replace hardcoded volumeTrend array

Effort: ~1 day of frontend work. No backend changes.

---

### Option B — Add backend endpoints (clean, production-ready)

Add these endpoints to your FastAPI backend:

**1. Analytics endpoint for tasks**
```
GET /api/v1/tasks/analytics?days=90
Response: {
  heatmap: { "2026-03-18": 5, ... },
  weekly: [{ day: "Mon", completed: 6, total: 8, score: 75 }, ...],
  trend: [{ date: "Mar 13", score: 62 }, ...]
}
```
Implementation: query TaskCompletion table, group by date using SQLAlchemy.

**2. Analytics endpoint for workouts**
```
GET /api/v1/logs/analytics?days=90
Response: {
  heatmap: { "2026-03-18": 3, ... },
  volume_trend: [{ date: "Mar 13", volume: 9600 }, ...]
}
```
Implementation: query ExerciseLog table, group by date, sum reps×weight.

**3. Body stats endpoint**
```
POST /api/v1/users/body-stats   { date, weight, body_fat }
GET  /api/v1/users/body-stats
```
Requires: new BodyStat model + migration.

**4. Daily notes endpoint**
```
POST /api/v1/users/notes   { date, content }
GET  /api/v1/users/notes
PUT  /api/v1/users/notes/{date}
```
Requires: new Note model + migration.

**5. User settings endpoint**
```
PUT /api/v1/users/settings   { theme, split_config }
GET /api/v1/users/settings
```
Requires: settings JSON column on User model or separate Settings table.

Effort: ~2–3 days of backend work + corresponding frontend thunk updates.

---

### Option C — Wire up real AI chat (when ready)

Replace the dummy receiveMessage logic in chatSlice.js with a real API call:

```javascript
// In ChatBot.jsx, replace the setTimeout block with:
const response = await fetch('/api/v1/chat', {
  method: 'POST',
  headers: authHeaders(),
  body: JSON.stringify({ message: text, context: { tasks, workouts } })
});
const data = await response.json();
dispatch(receiveMessage(data.reply));
```

Options for the chat backend:
- FastAPI route that calls OpenAI/Anthropic API with user context injected
- FastAPI route that calls a local Ollama model (free, runs on your machine)
- FastAPI route that uses LangChain with your task/workout data as context

---

## Section 4 — Recommended Priority Order

| Priority | Task | Effort | Impact |
|---|---|---|---|
| 1 | Implement Option A (derive charts from real data) | 1 day | Charts show real data, no backend work |
| 2 | Add error boundaries to prevent full-page crashes | 2 hours | Stability |
| 3 | Add body-stats and notes endpoints (Option B, items 3+4) | 1 day | localStorage data becomes persistent |
| 4 | Add analytics endpoints (Option B, items 1+2) | 1 day | Can remove all seeded data |
| 5 | Add user settings endpoint (Option B, item 5) | 4 hours | Theme and split sync across devices |
| 6 | Wire up real AI chat backend (Option C) | 1–2 days | Full feature completion |

---

## Section 5 — Backend Schema Gaps Summary

Your current backend Task model is missing `priority` and `is_completed`. If you want these in the DB:

```python
# Add to app/models/task.py
priority: str = Column(String, default="medium")  # high | medium | low
```

```python
# New Alembic migration
alembic revision --autogenerate -m "add priority to tasks"
alembic upgrade head
```

Then update TaskCreate and TaskUpdate schemas to include `priority`, and update the frontend createTask/updateTask calls to send it.

The `is_completed` field is intentionally not recommended — your current architecture (completions as a log) is actually the more correct design for tracking history. The frontend-local toggle is a reasonable workaround.
