import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 서버·API 키 없이 브라우저에서만 동작하는 정적 사이트
export default defineConfig({
  plugins: [react()],
  server: { host: 'localhost', port: 5174 },
})
