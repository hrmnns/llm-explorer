import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Generiert eine Build-Nummer im Format: YYYYMMDD-HHMM
const now = new Date();
const buildNumber = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

export default defineConfig({
  plugins: [react()],
  base: '/llm-simulator/',
  define: {
    // Hier werden die Variablen für die App verfügbar gemacht
    __APP_VERSION__: JSON.stringify(buildNumber),
    __BUILD_DATE__: JSON.stringify(now.toLocaleDateString('de-DE')),
  },
});