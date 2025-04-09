import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // 下面的命令是防止npm run dev时一并把electron:win启动了
    ...(!process.env.ELECTRON_DISABLE ? [
      electron({
        entry: 'electron/main.ts',
      }),
      renderer(),
    ] : []),
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'cjs',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]',
        entryFileNames: '[name].js',
        inlineDynamicImports: true
      }
    },
    target: 'esnext',
    minify: true,
    sourcemap: true
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      '/ask_fake_news': {
        target: 'http://localhost:8000/ask_fake_news',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ask_fake_news/, ""),
      },
      '/predict': {
        target: 'http://10.248.68.50:8000/predict',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/predict/, ""),
      },
      '/search': {
        target: 'http://localhost:8001/chat_stream',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/search/, ""),
      },
      '/chat': {
        target: 'http://localhost:8001/chat',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chat/, ""),
      },
      '/tasks': {
        target: 'http://localhost:8001/tasks',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tasks/, ""),
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['electron']
  }
})
