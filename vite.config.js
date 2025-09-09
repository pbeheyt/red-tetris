import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
    proxy: {
      '/socket.io': {
        target: 'http://127.0.0.1:3004',
        ws: true,
      },
    },
  },
})
