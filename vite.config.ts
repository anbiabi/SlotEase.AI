import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'recharts'],
          utils: ['date-fns', 'crypto-js', 'axios']
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  // Ensure translation files are served correctly
  publicDir: 'public',
  server: {
    fs: {
      allow: ['..']
    }
  },
  define: {
    global: 'globalThis',
  }
});