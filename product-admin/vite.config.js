import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Supabase 요청은 개발 서버가 대신 보낸다.
// 브라우저는 /supabase 로만 요청하고, 키는 여기서 붙이므로 브라우저 코드에 키가 들어가지 않는다.
export default defineConfig(({ mode }) => {
  // VITE_ 접두사가 없는 값은 브라우저 번들에 포함되지 않는다
  const env = loadEnv(mode, process.cwd(), '')
  const url = env.SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  const configured = Boolean(url && key)

  const proxy = configured
    ? {
        '/supabase': {
          target: url,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/supabase/, ''),
          configure: (p) => {
            p.on('proxyReq', (req) => {
              req.setHeader('apikey', key)
              // 기존 service_role 키(JWT)만 Authorization 헤더에 넣는다. 새 sb_secret_ 키는 apikey 헤더만 쓴다
              if (key.startsWith('eyJ')) req.setHeader('Authorization', `Bearer ${key}`)
              else req.removeHeader('Authorization')
              // 브라우저에서 온 요청으로 보이지 않게 브라우저 헤더를 지운다
              req.removeHeader('origin')
              req.removeHeader('referer')
              req.setHeader('user-agent', 'product-admin-local-proxy')
            })
          },
        },
      }
    : undefined

  return {
    plugins: [react()],
    define: { __SUPABASE_CONFIGURED__: JSON.stringify(configured) },
    // 이 PC에서만 접속 가능하도록 localhost에만 연다
    server: { host: 'localhost', port: 5173, proxy },
    preview: { host: 'localhost', port: 4173, proxy },
  }
})
