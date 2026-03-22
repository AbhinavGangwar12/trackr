import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';

// ─── Desktop nav link ─────────────────────────────────────────────────────────
function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-display font-medium tracking-wide transition-all duration-200 ${
          isActive ? '' : 'hover:bg-white/5'
        }`
      }
      style={({ isActive }) =>
        isActive
          ? { color: 'var(--accent)', backgroundColor: 'var(--accent-glow)' }
          : { color: 'var(--text-muted)' }
      }
    >
      {({ isActive }) => (
        <>
          <span className="text-base">{icon}</span>
          <span>{label}</span>
          {isActive && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
              style={{ backgroundColor: 'var(--accent)' }} />
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── Theme toggle button ──────────────────────────────────────────────────────
function ThemeToggle({ compact = false }) {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.theme.mode);
  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="flex items-center justify-center rounded-lg border transition-all duration-200"
      style={{
        width: compact ? 32 : 34,
        height: compact ? 32 : 34,
        backgroundColor: 'var(--bg-surface-2)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-secondary)',
        flexShrink: 0,
      }}
      title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
    >
      {mode === 'dark' ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="7" y1="1" x2="7" y2="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="7" y1="11.5" x2="7" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="1" y1="7" x2="2.5" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="11.5" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="2.93" y1="2.93" x2="4" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="10" y1="10" x2="11.07" y2="11.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="11.07" y1="2.93" x2="10" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="4" y1="10" x2="2.93" y2="11.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M12 8.5A5.5 5.5 0 015.5 2a5.5 5.5 0 100 10A5.5 5.5 0 0012 8.5z"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

// ─── Desktop Navbar ───────────────────────────────────────────────────────────
export function DesktopNav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 hidden md:flex items-center px-4 sm:px-6 border-b backdrop-blur-xl"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mr-auto">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center border"
          style={{ backgroundColor: 'var(--accent-glow)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="var(--accent)"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.5"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.5"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.3"/>
          </svg>
        </div>
        <span className="font-display font-bold text-xl tracking-widest hidden sm:block"
          style={{ color: 'var(--text-primary)', letterSpacing: '0.2em' }}>
          TRACKR
        </span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        <NavItem to="/day-tracker"     label="Day Tracker"     icon="◈" />
        <NavItem to="/fitness-tracker" label="Fitness Tracker" icon="⬡" />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="hidden sm:flex items-center gap-1.5 mr-1">
          <div className="teal-dot" />
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>LIVE</span>
        </div>
        <ThemeToggle />
        {user && (
          <div className="flex items-center gap-2 ml-1">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                {user.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-150"
              style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              title="Sign out"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9.5 10L13 7l-3.5-3M13 7H5"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Mobile Top Bar ───────────────────────────────────────────────────────────
export function MobileTopBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex md:hidden items-center px-4 border-b backdrop-blur-xl"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center border"
          style={{ backgroundColor: 'var(--accent-glow)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="var(--accent)"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.5"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.5"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.3"/>
          </svg>
        </div>
        <span className="font-display font-bold text-base tracking-widest"
          style={{ color: 'var(--text-primary)', letterSpacing: '0.18em' }}>
          TRACKR
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle compact />
        {user && (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Mobile Bottom Tab Bar ────────────────────────────────────────────────────
export function BottomTabBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const tabs = [
    {
      to: '/day-tracker',
      label: 'Day',
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="1.5" y="1.5" width="7" height="7" rx="2"
            fill={active ? 'var(--accent)' : 'none'}
            stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.5"/>
          <rect x="11.5" y="1.5" width="7" height="7" rx="2"
            fill={active ? 'var(--accent)' : 'none'} fillOpacity={active ? 0.5 : 0}
            stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.5" strokeOpacity={active ? 1 : 0.5}/>
          <rect x="1.5" y="11.5" width="7" height="7" rx="2"
            fill={active ? 'var(--accent)' : 'none'} fillOpacity={active ? 0.5 : 0}
            stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.5" strokeOpacity={active ? 1 : 0.5}/>
          <rect x="11.5" y="11.5" width="7" height="7" rx="2"
            fill={active ? 'var(--accent)' : 'none'} fillOpacity={active ? 0.3 : 0}
            stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.5" strokeOpacity={active ? 0.7 : 0.3}/>
        </svg>
      ),
    },
    {
      to: '/fitness-tracker',
      label: 'Fitness',
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 10h2.5M14.5 10H17M5.5 7v6M14.5 7v6M7.5 10h5"
            stroke={active ? 'var(--accent)' : 'var(--text-muted)'}
            strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      to: null,
      label: 'Chat',
      isChat: true,
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2C6.13 2 3 4.9 3 8.5c0 1.52.54 2.93 1.44 4.08L3.5 16l2.96-.96A7.52 7.52 0 0010 16c3.87 0 7-2.9 7-6.5S13.87 2 10 2z"
            stroke={active ? 'var(--accent)' : 'var(--text-muted)'}
            fill={active ? 'var(--accent-glow)' : 'none'} strokeWidth="1.5"/>
          <circle cx="7" cy="8.5" r="1" fill={active ? 'var(--accent)' : 'var(--text-muted)'}/>
          <circle cx="10" cy="8.5" r="1" fill={active ? 'var(--accent)' : 'var(--text-muted)'}/>
          <circle cx="13" cy="8.5" r="1" fill={active ? 'var(--accent)' : 'var(--text-muted)'}/>
        </svg>
      ),
    },
    {
      to: null,
      label: 'Me',
      isProfile: true,
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3.5"
            stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.5"/>
          <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"
            stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t backdrop-blur-xl"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)',
        borderColor: 'var(--border-color)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.label}
          to={tab.isChat || tab.isProfile ? '#' : tab.to}
          onClick={(e) => {
            if (tab.isChat) {
              e.preventDefault();
              // dispatch openChat if chat tab tapped
              import('../store/chatSlice').then(({ openChat }) => {
                import('../store/index').then(({ store }) => store.dispatch(openChat()));
              });
            }
            if (tab.isProfile) {
              e.preventDefault();
              navigate('/day-tracker');
            }
          }}
          className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-150"
          style={({ isActive }) => ({
            color: isActive && tab.to ? 'var(--accent)' : 'var(--text-muted)',
          })}
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                {tab.icon(isActive && !!tab.to)}
              </div>
              <span className="font-mono text-[10px] leading-none"
                style={{ color: isActive && tab.to ? 'var(--accent)' : 'var(--text-muted)' }}>
                {tab.label}
              </span>
              {isActive && tab.to && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }} />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

// ─── Default export (used in App.jsx) ────────────────────────────────────────
export default function Navbar() {
  return (
    <>
      <DesktopNav />
      <MobileTopBar />
    </>
  );
}
