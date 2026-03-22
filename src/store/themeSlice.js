import { createSlice } from '@reduxjs/toolkit';
import { loadSettings, saveThemeToBackend } from './settingsSlice';

const stored = localStorage.getItem('trackr_theme');
const initial = stored === 'light' ? 'light' : 'dark';

function applyTheme(mode) {
  if (mode === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
  localStorage.setItem('trackr_theme', mode);
}
applyTheme(initial);

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: initial },
  reducers: {
    toggleThemeDirect: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      applyTheme(state.mode);
    },
    setThemeMode: (state, action) => {
      state.mode = action.payload;
      applyTheme(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (state, action) => {
      if (action.payload?.theme) {
        state.mode = action.payload.theme;
        applyTheme(action.payload.theme);
      }
    });
  },
});

export const toggleTheme = () => (dispatch, getState) => {
  dispatch(themeSlice.actions.toggleThemeDirect());
  const newMode = getState().theme.mode;
  dispatch(saveThemeToBackend(newMode));
};

export const { setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
