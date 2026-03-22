import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar, { BottomTabBar } from './components/Navbar';
import DayTracker from './pages/DayTracker';
import FitnessTracker from './pages/FitnessTracker';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import ChatBot from './components/ChatBot';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/Toast';
import { loadSettings } from './store/settingsSlice';
import { fetchTasks, fetchCompletions, setNotes } from './store/tasksSlice';
import { fetchMyExercises, fetchAllExercises, fetchAllMyLogs, fetchBodyStats } from './store/workoutsSlice';
import { logout } from './store/authSlice';
import api from './services/api';

// Listens for 401 events fired by api.js and forces logout
function UnauthorizedHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handle = () => {
      dispatch(logout());
      navigate('/login', { replace: true });
    };
    window.addEventListener('trackr:unauthorized', handle);
    return () => window.removeEventListener('trackr:unauthorized', handle);
  }, [dispatch, navigate]);

  return null;
}

// Loads all user data exactly once after auth confirms.
// hasFetched ref prevents re-firing on re-renders or hot reload.
function DataLoader() {
  const dispatch  = useDispatch();
  const { isAuthenticated, initialized } = useSelector((s) => s.auth);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !initialized) return;
    if (hasFetched.current) return;
    hasFetched.current = true;

    dispatch(loadSettings());
    dispatch(fetchTasks());
    dispatch(fetchCompletions());
    api.getNotes().then((notes) => {
      if (!notes) return;
      const map = {};
      notes.forEach((n) => { map[n.date] = n.content; });
      dispatch(setNotes(map));
    }).catch(() => {});
    dispatch(fetchAllExercises());
    dispatch(fetchMyExercises());
    dispatch(fetchAllMyLogs());
    dispatch(fetchBodyStats());
  }, [isAuthenticated, initialized, dispatch]);

  return null;
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(var(--accent-glow) 1px, transparent 1px), linear-gradient(90deg, var(--accent-glow) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      <div className="relative z-10">
        <Navbar />
        <main className="pt-14 md:pt-16 pb-20 md:pb-0">{children}</main>
        <div className="bottom-20 md:bottom-6 fixed right-6 z-50">
          <ChatBot floating />
        </div>
        <BottomTabBar />
        <ToastContainer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <UnauthorizedHandler />
      <DataLoader />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/day-tracker" element={
          <ProtectedRoute>
            <AppLayout><DayTracker /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/fitness-tracker" element={
          <ProtectedRoute>
            <AppLayout><FitnessTracker /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/"  element={<Navigate to="/day-tracker"   replace />} />
        <Route path="*"  element={<Navigate to="/day-tracker"   replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
