import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_API_URL is not needed locally — the proxy below handles it.
// For production (Vercel), set VITE_API_URL=https://your-backend.onrender.com
// in Vercel's environment variable settings.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
