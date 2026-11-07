import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Разрешает доступ по локальной сети
    proxy: {
      // Если фронтенд делает запрос на /api, Vite перенаправит его на бэкенд
      '/api': {
        target: 'http://localhost:8000', // Сюда Vite будет стучаться
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
