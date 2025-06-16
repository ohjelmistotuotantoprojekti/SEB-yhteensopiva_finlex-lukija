import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://backend-dev:3001',
        changeOrigin: true
      },
      '/media': {
        target: 'http://backend-dev:3001',
        changeOrigin: true
      },
      '/favicon.ico': {
        target: 'http://backend-dev:3001',
        changeOrigin: true
      }
    }
  },
  test: { 
     environment: 'jsdom',
     globals: true,
     setupFiles: './testSetup.ts',
  },
  
})
