// Front-end-sw-Facturacion/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'Front-End', // Raíz del proyecto React
  server: {
    host: true, // Permite que el servidor sea accesible desde la red (IP)
    port: 5173, // Puerto del frontend
    strictPort: false, // Intenta otros puertos si el 5173 está en uso
    open: true, // Abre el navegador automáticamente
    cors: true, // Habilita CORS
  },
  build: {
    outDir: '../dist', // Salida relativa a Front-End
  },
  preview: {
    port: 5173,
    host: true,
  }
});