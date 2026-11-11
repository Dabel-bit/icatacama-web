import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import staticPages from './generator/static-pages.js';
import { SECURITY_HEADERS } from './src/lib/security-headers.js';

// BASE_PATH: ruta pública del sitio ("/" en icatacama.com, "/<repo>/" en GitHub Pages de un proyecto)
const base = ('/' + (process.env.BASE_PATH || '/') + '/').replace(/\/{2,}/g, '/');
// SITE_ENV=preview marca la copia de revisión: noindex, robots.txt cerrado y sin sitemap
const env = process.env.SITE_ENV === 'preview' ? 'preview' : 'production';

export default defineConfig({
  base,
  appType: 'mpa', // sin fallback a index.html: las rutas inexistentes responden 404, como en producción
  plugins: [
    react(),
    staticPages({ dataDir: fileURLToPath(new URL('./src/data', import.meta.url)), env }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false, // no exponer el código fuente en producción
  },
  // `npm run preview` envía las mismas cabeceras que CloudFront para probar la CSP en local
  preview: { headers: SECURITY_HEADERS },
  server: { headers: { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' } },
});
