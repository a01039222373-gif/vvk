import { createClient } from '@supabase/supabase-js'

// vite.config.js 에서 .env.local 값이 있는지 알려준다
export const isConfigured = __SUPABASE_CONFIGURED__

// 실제 키는 개발 서버 프록시가 붙이므로 여기 키는 아무 값이나 된다
export const supabase = isConfigured
  ? createClient(`${window.location.origin}/supabase`, 'local-proxy', {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null

// DB의 check 제약과 같은 값 (01_schema.sql)
export const CATEGORIES = ['신선과일', '채소', '가공식품', '냉동식품']
export const INFO_TYPES = ['보관', '금지', '섭취', '조리', '알레르기', '기타']

// Postgres 오류 코드를 읽기 쉬운 문장으로 바꾼다
export function errorMessage(error) {
  if (!error) return ''
  switch (error.code) {
    case '23505':
      return '이미 같은 상품코드가 있습니다.'
    case '23514':
      return `입력값이 DB 규칙에 맞지 않습니다. (${error.message})`
    case '23503':
      return '연결된 데이터가 없습니다. 배송정책코드나 상품코드를 확인하세요.'
    default:
      return error.message || '알 수 없는 오류가 발생했습니다.'
  }
}
