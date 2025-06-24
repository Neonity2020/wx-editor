import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 将 React 相关库分离到 vendor chunk
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            // 将 TipTap 相关库分离到 editor chunk
            if (id.includes('@tiptap')) {
              return 'editor';
            }
            // 将 UI 库分离到 ui chunk
            if (id.includes('@headlessui') || id.includes('@heroicons') || id.includes('lucide-react')) {
              return 'ui';
            }
            // 其他第三方库
            return 'deps';
          }
        }
      }
    }
  }
})
