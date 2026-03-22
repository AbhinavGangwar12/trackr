import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './tasksSlice';
import workoutsReducer from './workoutsSlice';
import chatReducer from './chatSlice';
import authReducer from './authSlice';
import themeReducer from './themeSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    settings: settingsReducer,
    tasks: tasksReducer,
    workouts: workoutsReducer,
    chat: chatReducer,
  },
});

export default store;
