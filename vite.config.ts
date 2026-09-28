import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'https://skillcompass-api.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },

  preview: {
    allowedHosts: ['skillcompass-frontend.onrender.com'],

    proxy: {
      '/api': {
        target: 'https://skillcompass-api.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});