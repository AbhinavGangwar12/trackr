import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { loadSettings, saveSplitToBackend } from './settingsSlice';
import { toast } from '../components/Toast';

// ─── Analytics derivation ────────────────────────────────────────────────────

function deriveWorkoutAnalytics(allLogs) {
  const today = new Date();

  // Heatmap — last 90 days: count log entries per date
  const workoutHeatmap = {};
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    workoutHeatmap[d.toISOString().split('T')[0]] = 0;
  }
  allLogs.forEach((log) => {
    const date = (log.logged_at || '').split('T')[0];
    if (workoutHeatmap[date] !== undefined) workoutHeatmap[date]++;
  });

  // Volume trend — last 8 days: sum (reps * weight) per day
  const volumeByDate = {};
  allLogs.forEach((log) => {
    const date = (log.logged_at || '').split('T')[0];
    const vol = (log.reps || 0) * (log.weight || 0);
    volumeByDate[date] = (volumeByDate[date] || 0) + vol;
  });
  const volumeTrend = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    volumeTrend.push({ date: label, volume: Math.round(volumeByDate[key] || 0) });
  }

  return { workoutHeatmap, volumeTrend };
}

// ─── Split helpers ────────────────────────────────────────────────────────────

function defaultSplit() {
  return [
    { day: 'Sun', label: 'Rest',      active: false },
    { day: 'Mon', label: 'Push',      active: true  },
    { day: 'Tue', label: 'Pull',      active: true  },
    { day: 'Wed', label: 'Rest',      active: false },
    { day: 'Thu', label: 'Legs',      active: true  },
    { day: 'Fri', label: 'Push',      active: true  },
    { day: 'Sat', label: 'Full Body', active: true  },
  ];
}

function getStoredSplit() {
  try { return JSON.parse(localStorage.getItem('trackr_split') || 'null') || defaultSplit(); }
  catch { return defaultSplit(); }
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAllExercises = createAsyncThunk('workouts/fetchAllExercises', async (_, { rejectWithValue }) => {
  try { return await api.getAllExercises(); }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchMyExercises = createAsyncThunk('workouts/fetchMyExercises', async (_, { rejectWithValue }) => {
  try { return await api.getMyExercises(); }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchAllMyLogs = createAsyncThunk('workouts/fetchAllMyLogs', async (_, { rejectWithValue }) => {
  try { return await api.getAllMyLogs(); }
  catch (err) { return rejectWithValue(err.message); }
});

export const addGlobalExercise = createAsyncThunk('workouts/addGlobal', async ({ name, category, muscleGroup }, { rejectWithValue }) => {
  try { return await api.createExercise(name, category, muscleGroup); }
  catch (err) { toast.error(err.message); return rejectWithValue(err.message); }
});

export const addMyExercise = createAsyncThunk('workouts/addMine', async (exerciseId, { rejectWithValue }) => {
  try {
    const result = await api.addMyExercise(exerciseId);
    toast.success('Exercise added to your list.');
    return result;
  } catch (err) { toast.error(err.message); return rejectWithValue(err.message); }
});

export const removeMyExercise = createAsyncThunk('workouts/removeMine', async (userExerciseId, { rejectWithValue }) => {
  try {
    await api.removeMyExercise(userExerciseId);
    toast.success('Exercise removed.');
    return userExerciseId;
  } catch (err) { toast.error(err.message); return rejectWithValue(err.message); }
});

export const fetchLogsForExercise = createAsyncThunk('workouts/fetchLogs', async (userExerciseId, { rejectWithValue }) => {
  try { return { userExerciseId, logs: await api.getLogsForExercise(userExerciseId) }; }
  catch (err) { return rejectWithValue(err.message); }
});

export const createLog = createAsyncThunk('workouts/createLog', async ({ userExerciseId, logData }, { rejectWithValue }) => {
  try {
    const log = await api.createLog(userExerciseId, logData);
    toast.success('Set logged.');
    return { userExerciseId, log };
  } catch (err) { toast.error(err.message); return rejectWithValue(err.message); }
});

export const editLog = createAsyncThunk('workouts/editLog', async ({ logId, data, userExerciseId }, { rejectWithValue }) => {
  try {
    const log = await api.updateLog(logId, data);
    toast.success('Log updated.');
    return { userExerciseId, log };
  } catch (err) { toast.error(err.message); return rejectWithValue(err.message); }
});

export const deleteLog = createAsyncThunk('workouts/deleteLog', async ({ logId, userExerciseId }, { rejectWithValue }) => {
  try {
    await api.deleteLog(logId);
    toast.success('Log deleted.');
    return { logId, userExerciseId };
  } catch (err) { toast.error(err.message); return rejectWithValue(err.message); }
});

export const fetchBodyStats = createAsyncThunk('workouts/fetchBodyStats', async (_, { rejectWithValue }) => {
  try { return await api.getBodyStats(); }
  catch (err) { return rejectWithValue(err.message); }
});

export const saveBodyStat = createAsyncThunk('workouts/saveBodyStat', async ({ date, weight, height }, { rejectWithValue }) => {
  try {
    const result = await api.upsertBodyStat(date, weight, height);
    toast.success('Body stats saved.');
    return result;
  } catch (err) { toast.error(err.message); return rejectWithValue(err.message); }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  allExercises: [],
  myExercises: [],
  logsMap: {},
  selectedUserExerciseId: null,
  loading: false,
  logsLoading: false,
  error: null,
  workoutHeatmap: {},
  volumeTrend: [],
  bodyStats: [],
  split: getStoredSplit(),
};

const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    selectExercise: (state, action) => {
      state.selectedUserExerciseId = action.payload;
    },
    updateSplitDay: (state, action) => {
      const { dayIndex, label, active } = action.payload;
      if (state.split[dayIndex]) {
        if (label !== undefined) state.split[dayIndex].label = label;
        if (active !== undefined) state.split[dayIndex].active = active;
      }
      localStorage.setItem('trackr_split', JSON.stringify(state.split));
    },
    clearWorkoutError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    // All exercises
    builder
      .addCase(fetchAllExercises.pending, (state) => { state.loading = true; })
      .addCase(fetchAllExercises.fulfilled, (state, action) => { state.loading = false; state.allExercises = action.payload; })
      .addCase(fetchAllExercises.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // My exercises
    builder
      .addCase(fetchMyExercises.pending, (state) => { state.loading = true; })
      .addCase(fetchMyExercises.fulfilled, (state, action) => {
        state.loading = false;
        state.myExercises = action.payload;
        if (!state.selectedUserExerciseId && action.payload.length > 0)
          state.selectedUserExerciseId = action.payload[0].user_exercise_id;
      })
      .addCase(fetchMyExercises.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // All my logs → derive analytics
    builder
      .addCase(fetchAllMyLogs.fulfilled, (state, action) => {
        const { workoutHeatmap, volumeTrend } = deriveWorkoutAnalytics(action.payload);
        state.workoutHeatmap = workoutHeatmap;
        state.volumeTrend = volumeTrend;
        // Also populate logsMap per exercise
        const grouped = {};
        action.payload.forEach((log) => {
          if (!grouped[log.user_exercise_id]) grouped[log.user_exercise_id] = [];
          grouped[log.user_exercise_id].push(log);
        });
        state.logsMap = grouped;
      });

    // Add global exercise
    builder
      .addCase(addGlobalExercise.fulfilled, (state, action) => { state.allExercises.push(action.payload); })
      .addCase(addGlobalExercise.rejected, (state, action) => { state.error = action.payload; });

    // Add to my list
    builder
      .addCase(addMyExercise.fulfilled, (state, action) => {
        state.myExercises.push(action.payload);
        if (!state.selectedUserExerciseId) state.selectedUserExerciseId = action.payload.user_exercise_id;
      })
      .addCase(addMyExercise.rejected, (state, action) => { state.error = action.payload; });

    // Remove from my list
    builder
      .addCase(removeMyExercise.fulfilled, (state, action) => {
        state.myExercises = state.myExercises.filter((e) => e.user_exercise_id !== action.payload);
        if (state.selectedUserExerciseId === action.payload)
          state.selectedUserExerciseId = state.myExercises[0]?.user_exercise_id || null;
        delete state.logsMap[action.payload];
      })
      .addCase(removeMyExercise.rejected, (state, action) => { state.error = action.payload; });

    // Fetch logs per exercise
    builder
      .addCase(fetchLogsForExercise.pending, (state) => { state.logsLoading = true; })
      .addCase(fetchLogsForExercise.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.logsMap[action.payload.userExerciseId] = action.payload.logs;
      })
      .addCase(fetchLogsForExercise.rejected, (state) => { state.logsLoading = false; });

    // Create log
    builder
      .addCase(createLog.fulfilled, (state, action) => {
        const { userExerciseId, log } = action.payload;
        if (!state.logsMap[userExerciseId]) state.logsMap[userExerciseId] = [];
        state.logsMap[userExerciseId].unshift(log);
      })
      .addCase(createLog.rejected, (state, action) => { state.error = action.payload; });

    // Edit log
    builder
      .addCase(editLog.fulfilled, (state, action) => {
        const { userExerciseId, log } = action.payload;
        const logs = state.logsMap[userExerciseId] || [];
        const idx = logs.findIndex((l) => l.log_id === log.log_id);
        if (idx !== -1) state.logsMap[userExerciseId][idx] = log;
      })
      .addCase(editLog.rejected, (state, action) => { state.error = action.payload; });

    // Delete log
    builder
      .addCase(deleteLog.fulfilled, (state, action) => {
        const { logId, userExerciseId } = action.payload;
        if (state.logsMap[userExerciseId])
          state.logsMap[userExerciseId] = state.logsMap[userExerciseId].filter((l) => l.log_id !== logId);
      })
      .addCase(deleteLog.rejected, (state, action) => { state.error = action.payload; });

    // Body stats
    builder
      .addCase(fetchBodyStats.fulfilled, (state, action) => { state.bodyStats = action.payload; })
      .addCase(saveBodyStat.fulfilled, (state, action) => {
        const idx = state.bodyStats.findIndex((s) => s.date === action.payload.date);
        if (idx !== -1) state.bodyStats[idx] = action.payload;
        else {
          state.bodyStats.push(action.payload);
          state.bodyStats.sort((a, b) => a.date.localeCompare(b.date));
        }
      })
      .addCase(saveBodyStat.rejected, (state, action) => { state.error = action.payload; });

    // Load settings → restore split from backend
    builder.addCase(loadSettings.fulfilled, (state, action) => {
      if (action.payload?.split_config) {
        try {
          const parsed = JSON.parse(action.payload.split_config);
          if (Array.isArray(parsed) && parsed.length === 7) {
            state.split = parsed;
            localStorage.setItem('trackr_split', action.payload.split_config);
          }
        } catch { /* keep current split */ }
      }
    });
  },
});

// Thunk: update split day locally + sync to backend
export const updateSplitDay = (payload) => (dispatch, getState) => {
  dispatch(workoutsSlice.actions.updateSplitDay(payload));
  const split = getState().workouts.split;
  dispatch(saveSplitToBackend(split));
};

export const { selectExercise, clearWorkoutError } = workoutsSlice.actions;
export default workoutsSlice.reducer;
