import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'

const packageJson = JSON.parse(readFileSync('./package.json'))

export default defineConfig({
  base: '/llm-explorer/',
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_DATE__: JSON.stringify(new Date().toLocaleString('de-DE')),
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})