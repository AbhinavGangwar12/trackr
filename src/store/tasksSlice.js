import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { toast } from '../components/Toast';

// ─── Analytics derivation ────────────────────────────────────────────────────

// Convert any date (local or UTC string) to LOCAL date string YYYY-MM-DD
function toLocalDateStr(d) {
  const date = d instanceof Date ? d : new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function deriveAnalytics(completions) {
  const today = new Date();
  const todayStr = toLocalDateStr(today);

  // Build count map using LOCAL dates — critical for IST users
  const countMap = {};
  completions.forEach((c) => {
    if (!c.completed_at) return;
    const date = toLocalDateStr(new Date(c.completed_at)); // convert UTC → local
    countMap[date] = (countMap[date] || 0) + 1;
  });

  // Heatmap — last 90 days using LOCAL dates
  const activityHeatmap = {};
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toLocalDateStr(d);
    activityHeatmap[key] = countMap[key] || 0;
  }

  // Weekly bar — current Mon–Sun using LOCAL dates
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => {
    const dayIdx = dayNames.indexOf(day);
    const diff = dayIdx - today.getDay();
    const d = new Date(today);
    d.setDate(d.getDate() + diff);
    const key = toLocalDateStr(d);
    const completed = countMap[key] || 0;
    const score = Math.min(Math.round(completed * 12.5), 100);
    return { day, completed, total: Math.max(completed, 1), score };
  });

  // Productivity trend — last 8 days using LOCAL dates
  const productivityTrend = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toLocalDateStr(d);
    const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const count = countMap[key] || 0;
    productivityTrend.push({ date: label, score: Math.min(Math.round(count * 12.5), 100) });
  }

  return { activityHeatmap, weeklyData, productivityTrend };
}

// ─── Priority helpers (localStorage) ─────────────────────────────────────────

function getPriorityMap() {
  try { return JSON.parse(localStorage.getItem('trackr_task_priorities') || '{}'); }
  catch { return {}; }
}
function savePriorityMap(map) {
  localStorage.setItem('trackr_task_priorities', JSON.stringify(map));
}

// ─── Completed set (today only — for optimistic UI toggle) ───────────────────

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
function getCompletedSet() {
  try {
    const parsed = JSON.parse(localStorage.getItem('trackr_completed_today') || '{}');
    if (parsed.date !== today()) return new Set();
    return new Set(parsed.ids || []);
  } catch { return new Set(); }
}
function saveCompletedSet(set) {
  localStorage.setItem('trackr_completed_today', JSON.stringify({ date: today(), ids: [...set] }));
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (_, { rejectWithValue }) => {
  try { return await api.getTasks(); }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchCompletions = createAsyncThunk('tasks/fetchCompletions', async (_, { rejectWithValue }) => {
  try { return await api.getMyCompletions(); }
  catch (err) { return rejectWithValue(err.message); }
});

export const createTask = createAsyncThunk('tasks/create', async ({ title, description, priority }, { rejectWithValue }) => {
  try {
    const task = await api.createTask(title, description || '', priority || 'medium');
    toast.success('Task added.');
    return task;
  } catch (err) { toast.error(err.message); return rejectWithValue(err.message); }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ taskId, title, description, priority }, { rejectWithValue }) => {
  try {
    const task = await api.updateTask(taskId, { title, description, priority });
    toast.success('Task updated.');
    return task;
  } catch (err) { toast.error(err.message); return rejectWithValue(err.message); }
});

export const removeTask = createAsyncThunk('tasks/delete', async (taskId, { rejectWithValue }) => {
  try {
    await api.deleteTask(taskId);
    toast.success('Task deleted.');
    return taskId;
  } catch (err) { toast.error(err.message); return rejectWithValue(err.message); }
});

export const markTaskComplete = createAsyncThunk('tasks/complete', async (taskId) => {
  try { await api.completeTask(taskId); } catch { /* non-blocking */ }
  return taskId;
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  tasks: [],
  loading: false,
  analyticsLoading: false,
  error: null,
  completedIds: [...getCompletedSet()],
  priorityMap: getPriorityMap(),
  // Analytics — populated from real completions data
  weeklyData: [
    { day: 'Mon', completed: 0, total: 1, score: 0 },
    { day: 'Tue', completed: 0, total: 1, score: 0 },
    { day: 'Wed', completed: 0, total: 1, score: 0 },
    { day: 'Thu', completed: 0, total: 1, score: 0 },
    { day: 'Fri', completed: 0, total: 1, score: 0 },
    { day: 'Sat', completed: 0, total: 1, score: 0 },
    { day: 'Sun', completed: 0, total: 1, score: 0 },
  ],
  productivityTrend: [],
  activityHeatmap: {},
  notes: {},
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    toggleTask: (state, action) => {
      const id = action.payload;
      const set = new Set(state.completedIds);
      if (set.has(id)) set.delete(id); else set.add(id);
      state.completedIds = [...set];
      saveCompletedSet(set);
    },
    setPriority: (state, action) => {
      const { taskId, priority } = action.payload;
      state.priorityMap[taskId] = priority;
      savePriorityMap(state.priorityMap);
    },
    saveNote: (state, action) => {
      const { date, text } = action.payload;
      state.notes[date] = text;
    },
    setNotes: (state, action) => {
      // Called after loading notes from backend
      state.notes = action.payload;
    },
    clearTaskError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        // Sync priorities: tasks now have priority from DB
        action.payload.forEach((t) => {
          // DB priority takes precedence; fall back to localStorage
          state.priorityMap[t.task_id] = t.priority || state.priorityMap[t.task_id] || 'medium';
        });
        savePriorityMap(state.priorityMap);
      })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Fetch completions → derive analytics
    builder
      .addCase(fetchCompletions.pending, (state) => { state.analyticsLoading = true; })
      .addCase(fetchCompletions.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        const { activityHeatmap, weeklyData, productivityTrend } = deriveAnalytics(action.payload);
        state.activityHeatmap = activityHeatmap;
        state.weeklyData = weeklyData;
        state.productivityTrend = productivityTrend;

        // Rebuild completedIds for today — compare using LOCAL dates
        const todayStr = toLocalDateStr(new Date());
        const todayCompletionTaskIds = action.payload
          .filter((c) => c.completed_at && toLocalDateStr(new Date(c.completed_at)) === todayStr)
          .map((c) => c.task_id);
        // Merge with localStorage set (user may have toggled since load)
        const merged = new Set([...state.completedIds, ...todayCompletionTaskIds]);
        state.completedIds = [...merged];
        saveCompletedSet(merged);
      })
      .addCase(fetchCompletions.rejected, (state) => { state.analyticsLoading = false; });

    // Create task
    builder
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
        state.priorityMap[action.payload.task_id] = action.payload.priority || 'medium';
        savePriorityMap(state.priorityMap);
      })
      .addCase(createTask.rejected, (state, action) => { state.error = action.payload; });

    // Update task
    builder
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t.task_id === action.payload.task_id);
        if (idx !== -1) {
          state.tasks[idx] = action.payload;
          state.priorityMap[action.payload.task_id] = action.payload.priority || 'medium';
          savePriorityMap(state.priorityMap);
        }
      })
      .addCase(updateTask.rejected, (state, action) => { state.error = action.payload; });

    // Remove task
    builder
      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.task_id !== action.payload);
        delete state.priorityMap[action.payload];
        savePriorityMap(state.priorityMap);
        const set = new Set(state.completedIds);
        set.delete(action.payload);
        state.completedIds = [...set];
        saveCompletedSet(set);
      })
      .addCase(removeTask.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { toggleTask, setPriority, saveNote, setNotes, clearTaskError } = tasksSlice.actions;
export default tasksSlice.reducer;