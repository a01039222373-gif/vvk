# vvk

가상 상품 10건으로 RAG 적용 전후를 비교하고, 상품 정보를 Supabase로 관리하는 실습 프로젝트.
상품명 · 가격 · 정책은 모두 가상 데이터다.

## 폴더

| 경로 | 내용 |
|---|---|
| `CLAUDE.md` | 작업 규칙 |
| `docs/dummy/products/` | 가상 상품 문서 10건 |
| `docs/dummy/products_db.xlsx` | 상품 DB 엑셀 (상품 · 상품안내 · 배송정책 · 안내 시트) |
| `docs/dummy/supabase/` | Supabase SQL — `01_schema.sql`(테이블), `02_seed.sql`(데이터), `03_allergy_queries.sql`(알레르기 조회) |
| `research/qa_dummy_questions.md` | RAG 적용 전후 비교용 질문 10개 |
| `product-admin/` | 상품 조회 · 검색 · 추가 · 삭제 화면 (React + Vite, 로컬 전용) |

## 시작하기

1. Supabase SQL Editor에서 `docs/dummy/supabase/01_schema.sql`, `02_seed.sql`을 차례로 실행
2. `product-admin/.env.example`을 `product-admin/.env.local`로 복사하고 Supabase URL과 service_role 키 입력
3. `product-admin` 폴더에서 `npm install` 후 `npm run dev`, http://localhost:5173 접속

자세한 내용은 [product-admin/README.md](product-admin/README.md) 참고.
