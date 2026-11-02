# 상품 관리 (로컬 전용)

Supabase의 `products`, `product_infos`, `shipping_policies` 테이블을 조회·검색·추가·삭제하는 React(Vite) 화면.
테이블은 `docs/dummy/supabase/01_schema.sql`로 만든다.

## 처음 한 번

1. `.env.example`을 `.env.local`로 복사하고 값을 채운다
   - `SUPABASE_URL`: Project Settings > API > Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Project Settings > API Keys 의 `service_role` 키 (또는 `sb_secret_...`)
2. 패키지 설치: `npm install`

## 실행

```
npm run dev
```

브라우저에서 http://localhost:5173 을 연다.

## 키를 다루는 방식

- 브라우저는 `/supabase`로만 요청하고, 개발 서버(vite.config.js)가 Supabase로 넘기면서 키를 붙인다.
  그래서 키가 브라우저 코드에 들어가지 않는다.
- 이 방식은 `npm run dev`(또는 `npm run preview`)로 띄운 개발 서버에서만 동작한다. 빌드 결과물을 다른 곳에 배포하면 안 된다.
- service_role 키는 RLS를 무시하고 모든 데이터를 바꿀 수 있다. `.env.local`은 절대 공유하거나 커밋하지 않는다.
- 개발 서버는 localhost에만 열려 있어 같은 네트워크의 다른 기기에서는 접속할 수 없다.

## 기능

- 검색: 상품코드·상품명·원산지·원재료·설명과 상품안내 내용까지 검색 (예: `견과류`, `냉장`)
- 분류 필터
- 상품 추가 (상품코드 `P-0000` 형식, 중복 시 안내)
- 상품 삭제 (상품안내도 함께 삭제됨)
- 상품안내 추가·삭제
- 수정 기능은 없음 (Supabase 대시보드 Table Editor에서 수정)
