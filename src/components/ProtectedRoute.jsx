import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadCurrentUser } from '../store/authSlice';

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, initialized, token } = useSelector((s) => s.auth);
  const didFetch = useRef(false);

  useEffect(() => {
    if (token && !initialized && !didFetch.current) {
      didFetch.current = true;
      dispatch(loadCurrentUser());
    }
  }, [token, initialized, dispatch]);

  if (token && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: 'var(--accent)', animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            Verifying session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}