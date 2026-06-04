import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  server: {
    // 🌐 Standardized for both laptop and local network testing
    host: '0.0.0.0', 
    port: 5173,
    strictPort: true,
    hmr: {
      // 🔒 Ensures Hot Module Replacement works smoothly with local DNS
      host: 'localhost',
      protocol: 'ws',
      port: 5173
    }
  },
  // ⚡ Optimization for faster local feature building
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});