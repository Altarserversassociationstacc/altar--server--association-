import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; //  Correct name
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: 'localhost',
    port: 5173,
    hmr: {
      // 🔒 Forces the live connection thread to map to standard localhost strings
      host: 'localhost',
      protocol: 'ws',
      port: 5173
    }
  }
});