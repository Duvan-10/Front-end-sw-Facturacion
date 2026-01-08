// vite.config.js - Configuración raíz que apunta a Front-End

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'Front-End',
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: true,
    cors: true,
  },
  build: {
    outDir: '../dist',
  },
  preview: {
    port: 5173,
    host: true,
  }
});