import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    svgr(),
  ],

  base: '/static/build/',

  server: {
    host: true,
    proxy: mode === 'development' ? {
      '^/(?!static/build/).*': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/(?!static\/build\/)/, '/'),
        ws: true,
      },
    } : undefined,
  },

  build: {
    sourcemap: true,
    manifest: 'manifest.json',
    outDir: resolve(__dirname, './static/build'),
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main: resolve(__dirname, './frontend/src/main.tsx'),
      },
    }
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './frontend/src'),
    },
  },
}));
