import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const loadSettings = createAsyncThunk(
  'settings/load',
  async (_, { rejectWithValue }) => {
    try { return await api.getSettings(); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

export const saveThemeToBackend = createAsyncThunk(
  'settings/saveTheme',
  async (theme, { rejectWithValue }) => {
    try { return await api.updateSettings({ theme }); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

export const saveSplitToBackend = createAsyncThunk(
  'settings/saveSplit',
  async (split, { rejectWithValue }) => {
    try { return await api.updateSettings({ split_config: JSON.stringify(split) }); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const settingsSlice = createSlice({
  name: 'settings',
  initialState: { loaded: false, syncing: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (state) => { state.loaded = true; });
    builder.addCase(saveThemeToBackend.pending, (state) => { state.syncing = true; });
    builder.addCase(saveThemeToBackend.fulfilled, (state) => { state.syncing = false; });
    builder.addCase(saveThemeToBackend.rejected, (state) => { state.syncing = false; });
    builder.addCase(saveSplitToBackend.pending, (state) => { state.syncing = true; });
    builder.addCase(saveSplitToBackend.fulfilled, (state) => { state.syncing = false; });
    builder.addCase(saveSplitToBackend.rejected, (state) => { state.syncing = false; });
  },
});

export default settingsSlice.reducer;
