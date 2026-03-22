// In local dev: Vite proxy forwards /api → http://127.0.0.1:8000
// In production: VITE_API_URL must be set to your Render backend URL
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

function getToken() { return localStorage.getItem('trackr_token'); }

function authHeaders(extra = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  if (res.status === 204) return null;

  if (res.status === 401) {
    localStorage.removeItem('trackr_token');
    window.dispatchEvent(new CustomEvent('trackr:unauthorized'));
    throw new Error('Session expired. Please sign in again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data?.detail === 'string' ? data.detail :
      Array.isArray(data?.detail)      ? data.detail[0]?.msg :
      `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

const api = {
  // ─── AUTH ────────────────────────────────────────────────────────────
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password }).toString(),
    });
    return handleResponse(res);
  },
  async register(email, username, password) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    return handleResponse(res);
  },
  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() });
    return handleResponse(res);
  },

  // ─── TASKS ───────────────────────────────────────────────────────────
  async getTasks() {
    const res = await fetch(`${BASE_URL}/tasks/`, { headers: authHeaders() });
    return handleResponse(res);
  },
  async createTask(title, description = '', priority = 'medium') {
    const res = await fetch(`${BASE_URL}/tasks/`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ title, description, priority }),
    });
    return handleResponse(res);
  },
  async updateTask(taskId, data) {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async deleteTask(taskId) {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, { method: 'DELETE', headers: authHeaders() });
    return handleResponse(res);
  },
  async completeTask(taskId) {
    const res = await fetch(`${BASE_URL}/tasks/completions`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ task_id: taskId }),
    });
    return handleResponse(res);
  },
  async getMyCompletions() {
    const res = await fetch(`${BASE_URL}/tasks/completions/me`, { headers: authHeaders() });
    return handleResponse(res);
  },

  // ─── EXERCISES ───────────────────────────────────────────────────────
  async getAllExercises() {
    const res = await fetch(`${BASE_URL}/exercises/`, { headers: authHeaders() });
    return handleResponse(res);
  },
  async createExercise(name, category = '', muscleGroup = '') {
    const res = await fetch(`${BASE_URL}/exercises/`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ name, category, muscle_group: muscleGroup }),
    });
    return handleResponse(res);
  },
  async getMyExercises() {
    const res = await fetch(`${BASE_URL}/exercises/my-exercises`, { headers: authHeaders() });
    return handleResponse(res);
  },
  async addMyExercise(exerciseId) {
    const res = await fetch(`${BASE_URL}/exercises/my-exercises`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ exercise_id: exerciseId }),
    });
    return handleResponse(res);
  },
  async removeMyExercise(userExerciseId) {
    const res = await fetch(`${BASE_URL}/exercises/my-exercises/${userExerciseId}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ─── LOGS ────────────────────────────────────────────────────────────
  async getAllMyLogs() {
    const res = await fetch(`${BASE_URL}/logs/me`, { headers: authHeaders() });
    return handleResponse(res);
  },
  async getLogsForExercise(userExerciseId) {
    const res = await fetch(`${BASE_URL}/logs/user-exercise/${userExerciseId}`, { headers: authHeaders() });
    return handleResponse(res);
  },
  async createLog(userExerciseId, { sets, reps, weight, duration, distance } = {}) {
    const res = await fetch(`${BASE_URL}/logs/`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({
        user_exercise_id: userExerciseId,
        sets: sets || null, reps: reps || null,
        weight: weight || null, duration: duration || null,
        distance: distance || null,
      }),
    });
    return handleResponse(res);
  },
  async updateLog(logId, data) {
    const res = await fetch(`${BASE_URL}/logs/${logId}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async deleteLog(logId) {
    const res = await fetch(`${BASE_URL}/logs/${logId}`, { method: 'DELETE', headers: authHeaders() });
    return handleResponse(res);
  },

  // ─── BODY STATS ──────────────────────────────────────────────────────
  async getBodyStats() {
    const res = await fetch(`${BASE_URL}/body-stats/`, { headers: authHeaders() });
    return handleResponse(res);
  },
  async upsertBodyStat(date, weight, height = null) {
    const res = await fetch(`${BASE_URL}/body-stats/`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ date, weight, height }),
    });
    return handleResponse(res);
  },

  // ─── NOTES ───────────────────────────────────────────────────────────
  async getNotes() {
    const res = await fetch(`${BASE_URL}/notes/`, { headers: authHeaders() });
    return handleResponse(res);
  },
  async upsertNote(date, content) {
    const res = await fetch(`${BASE_URL}/notes/`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ date, content }),
    });
    return handleResponse(res);
  },

  // ─── SETTINGS ────────────────────────────────────────────────────────
  async getSettings() {
    const res = await fetch(`${BASE_URL}/settings/`, { headers: authHeaders() });
    return handleResponse(res);
  },
  async updateSettings(data) {
    const res = await fetch(`${BASE_URL}/settings/`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

export default api;
