-- =====================================================================
-- ThriftUB — 0005: Sale prices
-- A product is on sale when original_price is set. `price` stays the price
-- the customer pays now (so price filters and sorting keep working);
-- original_price is the price before the discount, shown crossed out.
-- Run after 0001–0004. Safe to run more than once.
-- =====================================================================

alter table public.products add column if not exists original_price integer;

alter table public.products drop constraint if exists products_original_price_check;
alter table public.products add constraint products_original_price_check
  check (original_price is null or (original_price > price and original_price <= 100000000));

create index if not exists products_on_sale_idx
  on public.products (is_available, boost desc, created_at desc)
  where original_price is not null;
