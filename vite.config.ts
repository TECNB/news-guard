import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
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

  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',	//实际请求地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      '/ask_fake_news': {
        target: 'http://127.0.0.1:8000/ask_fake_news',	//实际请求地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ask_fake_news/, ""),
      },
      '/generate_chart': {
        target: 'http://127.0.0.1:8000/generate_chart',	//实际请求地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/generate_chart/, ""),
      }
      
    }
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer]
    }
  }

})
