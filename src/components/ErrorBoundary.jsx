import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('TRACKR ErrorBoundary caught:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-base)',
          padding: '32px',
          fontFamily: "'DM Sans', sans-serif",
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          backgroundColor: 'var(--accent-glow)',
          border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="var(--accent)" />
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.5" />
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.5" />
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="var(--accent)" fillOpacity="0.3" />
          </svg>
        </div>

        <h1 style={{
          fontFamily: "'Libre Baskerville', serif",
          fontWeight: 700, fontSize: 22,
          color: 'var(--text-primary)', marginBottom: 10,
        }}>
          Something went wrong.
        </h1>

        <p style={{
          fontSize: 14, color: 'var(--text-muted)',
          maxWidth: 360, lineHeight: 1.7, marginBottom: 28,
        }}>
          An unexpected error occurred. Your data is safe — this is just a display issue.
        </p>

        {/* Error detail (collapsed) */}
        <details style={{ marginBottom: 28, maxWidth: 420, width: '100%', textAlign: 'left' }}>
          <summary style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 8,
          }}>
            Error details
          </summary>
          <pre style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: '#f87171', backgroundColor: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 8, padding: '10px 14px',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            lineHeight: 1.6,
          }}>
            {this.state.error?.toString()}
          </pre>
        </details>

        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 28px', borderRadius: 8, border: 'none',
            cursor: 'pointer', fontFamily: "'Libre Baskerville', serif",
            fontWeight: 700, fontSize: 14,
            backgroundColor: 'var(--accent)', color: 'var(--accent-fg)',
            transition: 'all 0.15s',
          }}
        >
          Reload page →
        </button>
      </div>
    );
  }
}
