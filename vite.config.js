import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy voor de Asset Gallerij (editor uploads)
      '/public-uploads': { 
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // --- START CORRECTIE ---
      // Proxy (teruggezet) voor het logo en andere uploads
      '/uploads': { 
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // --- EINDE CORRECTIE ---
    },
    headers: {
      'Content-Security-Policy': [
        "default-src 'self' data: blob:;",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.tiny.cloud;",
        "style-src 'self' 'unsafe-inline' https://cdn.tiny.cloud;",
        "img-src 'self' data: blob: https://cdn.jsdelivr.net/ http://localhost:3001;",
        "connect-src 'self' http://localhost:3001 ws://localhost:3001 ws://localhost:5173 https://cdn.tiny.cloud;",
      ].join(' ')
    }
  },
  preview: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self';",
        "script-src 'self' https://cdn.tiny.cloud;",
        "style-src 'self' 'unsafe-inline' https://cdn.tiny.cloud;",
        "img-src 'self' data: https://cdn.jsdelivr.net/ http://localhost:3001;",
        "connect-src 'self' http://localhost:3001 ws://localhost:3001 https://cdn.tiny.cloud;",
      ].join(' ')
    }
  }
})