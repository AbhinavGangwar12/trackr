import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, clearAuthError } from '../store/authSlice';

/* ─── Chubby Ghost ───────────────────────────────────────────────────────── */
function ChubblyGhost() {
  const headRef  = useRef(null);
  const il       = useRef(null);
  const ir       = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      const stage = stageRef.current;
      if (!stage) return;
      const r  = stage.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      const px = dx * 5, py = dy * 5;
      const move = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
      if (il.current) il.current.style.transform = move;
      if (ir.current) ir.current.style.transform = move;
      if (headRef.current) {
        headRef.current.style.transform =
          `translateX(-50%) rotate(${dx * 8}deg) translateY(${dy * 4}px)`;
      }
    };
    const onLeave = () => {
      const reset = 'translate(-50%, -50%)';
      if (il.current) il.current.style.transform = reset;
      if (ir.current) ir.current.style.transform = reset;
      if (headRef.current) headRef.current.style.transform = 'translateX(-50%)';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const g  = '#8fbc5a';  // sage green body
  const g2 = '#7aaa48';  // slightly darker for cheeks
  const dk = '#110d08';  // dark bg color for eyes
  const card2 = 'var(--bg-surface-2)';

  return (
    <div
      ref={stageRef}
      className="animate-float"
      style={{ width: 160, height: 180, position: 'relative', userSelect: 'none' }}
    >
      {/* Body */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 110, height: 96, background: g,
        borderRadius: '55px 55px 0 0',
      }} />

      {/* Skirt bumps */}
      {[-38, -2, 34].map((x, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: -8, left: `calc(50% + ${x}px)`,
          width: 38, height: 22, background: g,
          borderRadius: '0 0 50% 50%',
        }} />
      ))}

      {/* Belly shimmer */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        width: 70, height: 68, background: 'rgba(17,13,8,0.12)',
        borderRadius: '50%',
      }} />

      {/* Head */}
      <div
        ref={headRef}
        style={{
          position: 'absolute', top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: 114, height: 110, background: g,
          borderRadius: '50%',
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Side cheeks */}
        {[-8, null].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', top: 10,
            [i === 0 ? 'left' : 'right']: -8,
            width: 18, height: 42, background: g2,
            borderRadius: '50%',
            transform: `rotate(${i === 0 ? -10 : 10}deg)`,
            opacity: 0.6,
          }} />
        ))}

        {/* Eye sockets */}
        {[18, null].map((left, i) => (
          <div key={i} style={{
            position: 'absolute', top: 30,
            [i === 0 ? 'left' : 'right']: 18,
            width: 28, height: 28, background: dk,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Iris */}
            <div
              ref={i === 0 ? il : ir}
              style={{
                position: 'absolute',
                width: 18, height: 18, background: '#1c2808',
                borderRadius: '50%',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                transition: 'transform 0.08s ease-out',
              }}
            >
              {/* Pupil */}
              <div style={{
                position: 'absolute', width: 10, height: 10,
                background: dk, borderRadius: '50%',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }} />
              {/* Shine */}
              <div style={{
                position: 'absolute', width: 5, height: 5,
                background: 'rgba(245,240,232,0.7)', borderRadius: '50%',
                top: 3, left: 4,
              }} />
            </div>
          </div>
        ))}

        {/* Smile */}
        <div style={{
          position: 'absolute', bottom: 22, left: '50%',
          transform: 'translateX(-50%)',
          width: 44, height: 22,
          borderRadius: '0 0 22px 22px',
          borderBottom: '3px solid rgba(17,13,8,0.4)',
        }} />

        {/* Blush */}
        {[12, null].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', top: 58,
            [i === 0 ? 'left' : 'right']: 12,
            width: 20, height: 12, background: 'rgba(180,220,100,0.4)',
            borderRadius: '50%',
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Input field ─────────────────────────────────────────────────────────── */
function Field({ label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <div>
      <label style={{
        display: 'block', fontFamily: "'DM Mono', monospace",
        fontSize: '11px', marginBottom: '6px', color: 'var(--text-muted)',
        letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete}
        className="input-field"
        style={{ fontSize: '14px', padding: '10px 14px' }}
      />
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);

  const [mode, setMode]    = useState('login');
  const [email, setEmail]  = useState('');
  const [uname, setUname]  = useState('');
  const [pass, setPass]    = useState('');
  const [pass2, setPass2]  = useState('');
  const [localErr, setLocalErr] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/day-tracker', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearAuthError());
    setLocalErr('');
  }, [mode, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalErr('');
    if (mode === 'register') {
      if (!uname.trim())      { setLocalErr('Username is required.'); return; }
      if (pass.length < 6)    { setLocalErr('Password must be at least 6 characters.'); return; }
      if (pass !== pass2)     { setLocalErr('Passwords do not match.'); return; }
      dispatch(registerUser({ email, username: uname, password: pass }));
    } else {
      dispatch(loginUser({ email, password: pass }));
    }
  };

  const displayErr = localErr || error;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      backgroundColor: 'var(--bg-base)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Subtle grid texture */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--accent-glow) 1px, transparent 1px), linear-gradient(90deg, var(--accent-glow) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Left panel — ghost */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px', position: 'relative', zIndex: 1,
      }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--accent-glow)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="var(--accent)" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.5" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.5" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.3" />
            </svg>
          </div>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 22, letterSpacing: '0.18em', color: 'var(--text-primary)',
          }}>
            TRACKR
          </span>
        </div>

        {/* Ghost */}
        <ChubblyGhost />

        {/* Taglines */}
        <div style={{ marginTop: 40, textAlign: 'center', maxWidth: 280 }}>
          <p style={{
            fontFamily: "'Libre Baskerville', serif", fontWeight: 700,
            fontSize: 22, color: 'var(--text-primary)', marginBottom: 10,
            lineHeight: 1.3,
          }}>
            Your daily companion.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Track tasks, fitness, and progress — all in one place.
            Built for people who take their days seriously.
          </p>
        </div>

        {/* Features pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Task tracking', 'Fitness logs', 'Body stats', 'Daily notes'].map((f) => (
            <span key={f} style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10,
              padding: '4px 10px', borderRadius: 20,
              background: 'var(--accent-glow)',
              border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
              color: 'var(--accent)',
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block" style={{
        width: 1, background: 'var(--border-color)',
        margin: '40px 0', flexShrink: 0,
      }} />

      {/* Right panel — form */}
      <div style={{
        width: '100%', maxWidth: 460,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px', position: 'relative', zIndex: 1,
        flexShrink: 0,
      }}>
        {/* Mobile logo (hidden on md+) */}
        <div className="flex md:hidden items-center gap-3 mb-8">
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'var(--accent-glow)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="var(--accent)" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.5" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.5" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.3" />
            </svg>
          </div>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 18, letterSpacing: '0.18em', color: 'var(--text-primary)',
          }}>TRACKR</span>
        </div>

        {/* Heading */}
        <div style={{ width: '100%', marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif", fontWeight: 700,
            fontSize: 26, color: 'var(--text-primary)', marginBottom: 6,
          }}>
            {mode === 'login' ? 'Welcome back.' : 'Create account.'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {mode === 'login'
              ? 'Sign in to continue to your workspace.'
              : 'Set up your TRACKR account in seconds.'}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex', width: '100%', gap: 4,
          padding: 4, borderRadius: 10, marginBottom: 28,
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-color)',
        }}>
          {['login', 'register'].map((m) => (
            <button key={m} onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8,
                fontFamily: "'Libre Baskerville', serif",
                fontWeight: 700, fontSize: 13,
                border: 'none', cursor: 'pointer',
                transition: 'all 0.2s',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? 'var(--accent-fg)' : 'var(--text-muted)',
              }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email" />

          {mode === 'register' && (
            <Field label="Username" value={uname} onChange={e => setUname(e.target.value)}
              placeholder="abhi_dev" autoComplete="username" />
          )}

          <Field label="Password" type="password" value={pass} onChange={e => setPass(e.target.value)}
            placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />

          {mode === 'register' && (
            <Field label="Confirm password" type="password" value={pass2} onChange={e => setPass2(e.target.value)}
              placeholder="••••••••" autoComplete="new-password" />
          )}

          {/* Error */}
          {displayErr && (
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(200,80,60,0.1)',
              border: '1px solid rgba(200,80,60,0.3)',
              color: '#c85040', fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {displayErr}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px 0',
              borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'var(--bg-surface-3)' : 'var(--accent)',
              color: loading ? 'var(--text-muted)' : 'var(--accent-fg)',
              fontFamily: "'Libre Baskerville', serif",
              fontWeight: 700, fontSize: 15,
              transition: 'all 0.15s',
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                </svg>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        {/* Switch mode */}
        <p style={{
          marginTop: 24, fontSize: 13,
          fontFamily: "'DM Mono', monospace", color: 'var(--text-muted)',
        }}>
          {mode === 'login' ? "No account? " : "Already have one? "}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', textDecoration: 'underline',
              fontFamily: "'DM Mono', monospace", fontSize: 13,
            }}>
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>

        {/* Version */}
        <p style={{
          position: 'absolute', bottom: 20,
          fontFamily: "'DM Mono', monospace",
          fontSize: 10, color: 'var(--text-muted)', opacity: 0.5,
        }}>
          v0.2 · FastAPI + React
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
