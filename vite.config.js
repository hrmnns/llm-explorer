import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Füge das hinzu!

export default defineConfig({
  base: '/llm-simulator/',
  plugins: [
    react(),
    tailwindcss(), // Und das hier!
  ],
})