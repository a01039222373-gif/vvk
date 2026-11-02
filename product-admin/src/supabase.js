import { createClient } from '@supabase/supabase-js'

// VITE_ 로 시작하는 값은 빌드할 때 브라우저 코드에 들어간다. 그래서 공개해도 되는 키만 쓴다
const url = import.meta.env.VITE_SUPABASE_URL
// anon 키 이름을 기본으로 쓰고, 예전 이름(PUBLISHABLE)도 받아준다
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// 비밀 키(service_role, sb_secret_)가 잘못 들어오면 쓰지 않고 경고한다
function findKeyProblem(k) {
  if (!k) return ''
  if (k.startsWith('sb_secret_')) return 'secret 키가 들어 있습니다. publishable 키(sb_publishable_...) 또는 anon 키로 바꾸세요.'
  if (k.startsWith('eyJ')) {
    try {
      const payload = JSON.parse(atob(k.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload.role === 'service_role') return 'service_role 키가 들어 있습니다. anon 키로 바꾸세요.'
    } catch {
      // 형식을 읽을 수 없으면 그대로 사용
    }
  }
  return ''
}

export const keyProblem = findKeyProblem(key)
export const isConfigured = Boolean(url && key) && !keyProblem
// 로그인을 쓰지 않으므로 세션 저장·갱신을 끈다
export const supabase = isConfigured
  ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  : null

// 쓰기가 RLS에 막혔을 때 안내 문구
export const NO_WRITE_PERMISSION = '쓰기 권한이 없습니다. Supabase에서 04_public_write.sql을 실행했는지 확인하세요.'

// DB의 check 제약과 같은 값 (01_schema.sql)
export const CATEGORIES = ['신선과일', '채소', '가공식품', '냉동식품']
export const INFO_TYPES = ['보관', '금지', '섭취', '조리', '알레르기', '기타']

// Postgres·Supabase 오류를 읽기 쉬운 문장으로 바꾼다
export function errorMessage(error) {
  if (!error) return ''
  switch (error.code) {
    case '23505':
      return '이미 같은 상품코드가 있습니다.'
    case '23514':
      return `입력값이 DB 규칙에 맞지 않습니다. (${error.message})`
    case '23503':
      return '연결된 데이터가 없습니다. 배송정책코드나 상품코드를 확인하세요.'
    case '42501':
      return NO_WRITE_PERMISSION
    default:
      return error.message || '알 수 없는 오류가 발생했습니다.'
  }
}
