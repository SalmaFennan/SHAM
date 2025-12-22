import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/employes': {
        target: 'http://localhost:3000', // Backend pour les employés
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/employes/, '/employes') // Garde le chemin intact
      },
      '/finances': {
        target: 'http://localhost:3000', // Backend pour les finances
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/finances/, '') // Supprime le préfixe /finances
      }
    }
  }
});