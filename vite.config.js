// Front-end-sw-Facturacion/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 👈 CRÍTICO: Indica a Vite que la raíz del proyecto web está aquí
  root: 'Front-end', 
})