import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/member': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/alumni': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/projects': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
