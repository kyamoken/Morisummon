import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),  // 追加
  ],

  base: '/static/',

  server: {
    host: true,
  },

  build: {
    sourcemap: true,
    manifest: 'manifest.json',
    outDir: resolve(__dirname, './static'),
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
})
