/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        serif:   ['Libre Baskerville', 'Georgia', 'serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: 'var(--bg-base)',
          100:     'var(--bg-surface)',
          200:     'var(--bg-surface-2)',
          300:     'var(--bg-surface-3)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          dark:    'var(--accent-dark)',
          glow:    'var(--accent-glow)',
        },
      },
      borderRadius: {
        paper: '4px',
      },
      animation: {
        'slide-up':   'slideUp 0.3s ease-out',
        'fade-in':    'fadeIn 0.4s ease-out',
        'pulse-dot':  'pulseDot 2s infinite',
        'chat-pop':   'chatPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        slideUp:  { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pulseDot: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
        chatPop:  { '0%': { transform: 'scale(0.85) translateY(20px)', opacity: '0' }, '100%': { transform: 'scale(1) translateY(0)', opacity: '1' } },
        float:    { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
}
