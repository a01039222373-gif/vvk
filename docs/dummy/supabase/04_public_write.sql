-- 웹사이트에서 로그인 없이 추가·삭제 허용 (실습 전용)
-- 01_schema.sql 실행 후 실행
-- 주의: publishable(anon) 키는 웹사이트 코드에 그대로 드러나므로,
--       이 정책을 켜면 사이트 주소나 키를 아는 누구나 상품과 상품안내를 추가·삭제할 수 있다
--       가상 데이터 실습용으로만 쓰고, 실제 데이터에는 쓰지 않는다

-- 상품: 추가·삭제 허용
drop policy if exists "공개 추가" on public.products;
drop policy if exists "공개 삭제" on public.products;
create policy "공개 추가" on public.products for insert to anon, authenticated with check (true);
create policy "공개 삭제" on public.products for delete to anon, authenticated using (true);

-- 상품안내: 추가·삭제 허용
drop policy if exists "공개 추가" on public.product_infos;
drop policy if exists "공개 삭제" on public.product_infos;
create policy "공개 추가" on public.product_infos for insert to anon, authenticated with check (true);
create policy "공개 삭제" on public.product_infos for delete to anon, authenticated using (true);

-- 배송정책은 웹사이트에서 바꾸지 않으므로 읽기만 허용 (01_schema.sql 그대로)

-- 되돌리기: 아래 4줄을 실행하면 다시 읽기 전용이 된다
-- drop policy "공개 추가" on public.products;
-- drop policy "공개 삭제" on public.products;
-- drop policy "공개 추가" on public.product_infos;
-- drop policy "공개 삭제" on public.product_infos;
