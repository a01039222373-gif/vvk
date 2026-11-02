# 상품 관리

Supabase의 `products`, `product_infos`, `shipping_policies` 테이블을 조회·검색·추가·삭제하는 React(Vite) 화면.
Vercel에 정적 사이트로 배포하며, 로그인 없이 바로 쓴다.

## 구조와 주의점

- 브라우저가 Supabase에 직접 요청한다. 브라우저에 들어가는 키는 공개용 publishable(anon) 키뿐이다
- 누가 무엇을 할 수 있는지는 Supabase RLS 정책이 정한다
  - 읽기: 누구나 (`01_schema.sql`)
  - 상품·상품안내 추가·삭제: 누구나 (`04_public_write.sql`)
- **로그인이 없으므로 사이트 주소를 아는 사람은 누구나 상품을 추가·삭제할 수 있다.**
  publishable 키도 사이트 코드에 드러나므로 사이트를 거치지 않고 직접 바꾸는 것도 가능하다.
  가상 데이터 실습용으로만 쓰고, 주소는 공유하지 않는다
- service_role 키·secret 키는 이 앱 어디에도 쓰지 않는다

## 1. Supabase 준비 (한 번만)

1. SQL Editor에서 `docs/dummy/supabase/01_schema.sql`, `02_seed.sql` 실행 (이미 했다면 생략)
2. 같은 곳에서 `docs/dummy/supabase/04_public_write.sql` 실행 (추가·삭제 허용)
3. Project Settings → API (API Keys) 에서 두 값 복사
   - Project URL
   - publishable 키(`sb_publishable_...`) 또는 anon 키

## 2. Vercel 배포

1. https://vercel.com 에서 **Add New → Project** → GitHub 저장소 `vvk` 선택(Import)
2. **Root Directory** 를 `product-admin` 으로 지정 (Framework Preset은 Vite로 자동 인식)
3. **Environment Variables** 에 추가

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | Project URL |
   | `VITE_SUPABASE_ANON_KEY` | anon 키 (또는 publishable 키) |

4. **Deploy**. 배포 후 받은 주소로 접속

환경변수를 나중에 넣거나 바꿨다면 Deployments → 최신 배포 → **Redeploy** 해야 반영된다.
(`VITE_` 값은 빌드할 때 코드에 들어가기 때문)

## 내 PC에서 실행 (선택)

1. `.env.local` 에 URL과 anon 키를 넣고 저장 (service_role 키 칸은 보관용, 웹사이트는 사용하지 않음)
2. `npm install` 후 `npm run dev`, http://localhost:5173 접속

## 기능

- 검색: 상품코드·상품명·원산지·원재료·설명과 상품안내 내용까지 검색 (예: `견과류`, `냉장`)
- 분류 필터
- 상품 추가 (상품코드 `P-0000` 형식, 중복 시 안내)
- 상품 삭제 (상품안내도 함께 삭제됨)
- 상품안내 추가·삭제
- `04_public_write.sql`을 실행하지 않았으면 추가·삭제 시 권한 안내가 표시된다
- 수정 기능은 없음 (Supabase 대시보드 Table Editor에서 수정)
