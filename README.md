# vvk

가상 상품 10건으로 RAG 적용 전후를 비교하고, 상품 정보를 Supabase로 관리하는 실습 프로젝트.
상품명 · 가격 · 정책은 모두 가상 데이터다.

## 폴더

| 경로 | 내용 |
|---|---|
| `CLAUDE.md` | 작업 규칙 |
| `docs/dummy/products/` | 가상 상품 문서 10건 |
| `docs/dummy/products_db.xlsx` | 상품 DB 엑셀 (상품 · 상품안내 · 배송정책 · 안내 시트) |
| `docs/dummy/supabase/` | Supabase SQL — `01_schema.sql`(테이블), `02_seed.sql`(데이터), `03_allergy_queries.sql`(알레르기 조회), `04_public_write.sql`(로그인 없이 추가·삭제 허용) |
| `research/qa_dummy_questions.md` | RAG 적용 전후 비교용 질문 10개 |
| `product-admin/` | 상품 조회 · 검색 · 추가 · 삭제 화면 (React + Vite, Vercel 배포, 로그인 없음) |
| `축제 기획/` | 컨셉과 조건을 적으면 축제 기획안 초안을 만드는 화면 (React + Vite, API 키 없음, Vercel 배포) — [README](축제%20기획/README.md) |

## 시작하기

1. Supabase SQL Editor에서 `docs/dummy/supabase/01_schema.sql`, `02_seed.sql`, `04_public_write.sql`을 차례로 실행
2. Vercel에서 이 저장소를 Import, Root Directory는 `product-admin`, 환경변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 입력 후 배포

단계별 안내는 [product-admin/README.md](product-admin/README.md) 참고.
