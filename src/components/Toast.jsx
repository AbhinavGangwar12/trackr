import { useState, useEffect, useCallback } from 'react';

// ─── Toast store (singleton outside React) ────────────────────────────────────
let _listeners = [];
let _id = 0;

export const toast = {
  success: (msg) => _emit({ type: 'success', msg }),
  error:   (msg) => _emit({ type: 'error',   msg }),
  info:    (msg) => _emit({ type: 'info',     msg }),
};

function _emit(t) {
  const item = { ...t, id: ++_id };
  _listeners.forEach((fn) => fn(item));
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const icons = {
  success: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="#4ade80" strokeWidth="1.5"/>
      <path d="M4 7l2 2 4-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="#f87171" strokeWidth="1.5"/>
      <path d="M5 5l4 4M9 5l-4 4" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="var(--accent)" strokeWidth="1.5"/>
      <path d="M7 6.5v3M7 4.5v.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

const colors = {
  success: { border: 'rgba(74,222,128,0.25)', text: '#4ade80' },
  error:   { border: 'rgba(248,113,113,0.25)', text: '#f87171' },
  info:    { border: 'color-mix(in srgb, var(--accent) 30%, transparent)', text: 'var(--accent)' },
};

// ─── Individual toast item ────────────────────────────────────────────────────
function ToastItem({ item, onRemove }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 3s
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(item.id), 300);
    }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [item.id, onRemove]);

  const c = colors[item.type] || colors.info;

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid ${c.border}`,
        borderRadius: 10,
        boxShadow: 'var(--shadow-card)',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        color: 'var(--text-primary)',
        minWidth: 220, maxWidth: 340,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s ease, opacity 0.25s ease',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => {
        setVisible(false);
        setTimeout(() => onRemove(item.id), 300);
      }}
    >
      <span style={{ flexShrink: 0 }}>{icons[item.type]}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{item.msg}</span>
    </div>
  );
}

// ─── Toast container ──────────────────────────────────────────────────────────
export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (item) => setToasts((prev) => [...prev, item]);
    _listeners.push(handler);
    return () => { _listeners = _listeners.filter((fn) => fn !== handler); };
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 88, // above tab bar on mobile
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((item) => (
        <div key={item.id} style={{ pointerEvents: 'all' }}>
          <ToastItem item={item} onRemove={remove} />
        </div>
      ))}
    </div>
  );
}
