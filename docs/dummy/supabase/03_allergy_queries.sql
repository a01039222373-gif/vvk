-- 알레르기 관련 조회 (실습 전용)
-- 01_schema.sql, 02_seed.sql 실행 후 사용. 필요한 쿼리만 골라 실행한다
-- 알레르기 행의 조건: '함유' = 원재료에 들어 있음, '교차오염' = 생산 라인 공유 등으로 섞일 수 있음
-- 내용이 '없음'(문서에 없다고 적힘) 또는 '미확인'(확인되지 않음)인 행은 성분 정보가 아니므로 제외한다
-- 내용 비교는 '—' 앞부분만, 앞뒤 공백을 없애고 한다 (예: '미확인 — 제조사 회신 대기'도 제외됨)


-- 1. 알레르기 주의 상품 목록 (함유 또는 교차오염이 있는 상품)
-- 예상 결과 3건: P-0113 대구사과칩, P-0402 서문시장 납작만두, P-0421 경산 대추칩
select
  p.product_code                                                                 as "상품코드",
  p.name                                                                         as "상품명",
  string_agg(split_part(i.content, ' — ', 1), ', ') filter (where i.condition = '함유')     as "함유",
  string_agg(split_part(i.content, ' — ', 1), ', ') filter (where i.condition = '교차오염') as "교차오염 주의"
from public.products p
join public.product_infos i on i.product_code = p.product_code
where i.info_type = '알레르기'
  and btrim(split_part(i.content, ' — ', 1)) not in ('없음', '미확인')
group by p.product_code, p.name
order by p.product_code;


-- 2. 특정 성분으로 검색 (예: 견과류). '견과류' 부분을 밀, 대두, 계란 등으로 바꿔 사용
-- 예상 결과 2건: P-0113 대구사과칩, P-0421 경산 대추칩 (둘 다 교차오염)
select
  p.product_code as "상품코드",
  p.name         as "상품명",
  i.condition    as "구분",
  i.content      as "내용"
from public.products p
join public.product_infos i on i.product_code = p.product_code
where i.info_type = '알레르기'
  and btrim(split_part(i.content, ' — ', 1)) not in ('없음', '미확인')
  and i.content like '%견과류%'
order by p.product_code;


-- 3. 알레르기 함유 정보가 확인되지 않은 상품 ('없음'으로 단정하면 안 되는 상품)
-- 함유 행이 아예 없거나, 함유 행이 '미확인'뿐인 상품
-- 예상 결과 2건: P-0113 대구사과칩, P-0421 경산 대추칩
select
  p.product_code as "상품코드",
  p.name         as "상품명"
from public.products p
where not exists (
  select 1
  from public.product_infos i
  where i.product_code = p.product_code
    and i.info_type = '알레르기'
    and i.condition = '함유'
    and btrim(split_part(i.content, ' — ', 1)) <> '미확인'
)
order by p.product_code;
