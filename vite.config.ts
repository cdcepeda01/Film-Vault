import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Film-Vault/', // 👈 EXACTO el nombre del repo
});
