import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main:      resolve(process.cwd(), 'index.html'),
        login:     resolve(process.cwd(), 'login.html'),
        dashboard: resolve(process.cwd(), 'dashboard.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
