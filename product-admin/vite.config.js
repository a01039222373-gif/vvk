import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 정적 사이트로 빌드되어 Vercel에 배포된다. Supabase에는 브라우저가 직접 요청한다
export default defineConfig({
  plugins: [react()],
})
