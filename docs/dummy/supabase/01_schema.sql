-- 가상 상품 DB 테이블 생성 (실습 전용)
-- Supabase SQL Editor에서 실행. 02_seed.sql보다 먼저 실행한다

-- 배송정책: 공통 배송 규칙
create table if not exists public.shipping_policies (
  policy_code     text primary key,
  free_threshold  integer not null check (free_threshold >= 0),
  shipping_fee    integer not null check (shipping_fee >= 0),
  same_day_areas  text[]  not null default '{}',
  same_day_cutoff time,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table  public.shipping_policies is '배송정책';
comment on column public.shipping_policies.policy_code     is '정책코드';
comment on column public.shipping_policies.free_threshold  is '무료배송 기준금액(원). 이 금액 이상이면 무료';
comment on column public.shipping_policies.shipping_fee    is '기본 배송비(원). 기준금액 미만일 때';
comment on column public.shipping_policies.same_day_areas  is '당일배송 지역';
comment on column public.shipping_policies.same_day_cutoff is '당일배송 주문마감 시각';

-- 상품: 모든 상품에 있는 기본 정보 (1상품 1행)
create table if not exists public.products (
  product_code    text primary key check (product_code ~ '^P-[0-9]{4}$'),
  name            text not null,
  category        text not null check (category in ('신선과일', '채소', '가공식품', '냉동식품')),
  origin          text,
  ingredients     text,
  net_amount      text,
  pack_info       text,
  price           integer not null check (price >= 0),
  sale_period     text not null default '상시',
  description     text,
  shipping_policy text references public.shipping_policies (policy_code) on update cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table  public.products is '상품';
comment on column public.products.product_code    is '상품코드 (P-0000)';
comment on column public.products.name            is '상품명';
comment on column public.products.category        is '분류: 신선과일 / 채소 / 가공식품 / 냉동식품';
comment on column public.products.origin          is '원산지. 문서에 없으면 미기재';
comment on column public.products.ingredients     is '원재료';
comment on column public.products.net_amount      is '용량 (단위 포함)';
comment on column public.products.pack_info       is '구성 (개수·포 수 등)';
comment on column public.products.price           is '판매가(원)';
comment on column public.products.sale_period     is '판매기간';
comment on column public.products.description     is '상품설명';
comment on column public.products.shipping_policy is '배송정책코드';

-- 상품안내: 상품마다 다른 상세 안내 (안내 1건 1행, 정보가 있을 때만 추가)
create table if not exists public.product_infos (
  id           bigint generated always as identity primary key,
  product_code text not null references public.products (product_code) on update cascade on delete cascade,
  info_type    text not null check (info_type in ('보관', '금지', '섭취', '조리', '알레르기', '기타')),
  condition    text,
  content      text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists product_infos_product_code_idx on public.product_infos (product_code);
create index if not exists product_infos_info_type_idx    on public.product_infos (info_type);

comment on table  public.product_infos is '상품안내. 알레르기 함유 행이 없으면 문서에 정보가 없는 것, 내용이 없음이면 문서에 없음이라고 적힌 것';
comment on column public.product_infos.product_code is '상품코드';
comment on column public.product_infos.info_type    is '안내유형: 보관 / 금지 / 섭취 / 조리 / 알레르기 / 기타';
comment on column public.product_infos.condition    is '조건 (개봉 전, 개봉 후, 냉장, 함유, 교차오염 등)';
comment on column public.product_infos.content      is '내용. 금지는 "무엇 금지 — 이유" 형식';

-- 수정 시각 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shipping_policies_set_updated_at on public.shipping_policies;
create trigger shipping_policies_set_updated_at
  before update on public.shipping_policies
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists product_infos_set_updated_at on public.product_infos;
create trigger product_infos_set_updated_at
  before update on public.product_infos
  for each row execute function public.set_updated_at();

-- 행 수준 보안(RLS): 누구나 읽기만 가능, 쓰기는 대시보드 또는 service_role 키로만
alter table public.shipping_policies enable row level security;
alter table public.products          enable row level security;
alter table public.product_infos     enable row level security;

drop policy if exists "공개 읽기" on public.shipping_policies;
create policy "공개 읽기" on public.shipping_policies for select to anon, authenticated using (true);

drop policy if exists "공개 읽기" on public.products;
create policy "공개 읽기" on public.products for select to anon, authenticated using (true);

drop policy if exists "공개 읽기" on public.product_infos;
create policy "공개 읽기" on public.product_infos for select to anon, authenticated using (true);
