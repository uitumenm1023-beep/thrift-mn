-- =====================================================================
-- ThriftUB — 0004: Packages (plans), product limits and boosted ordering
-- Run after 0001–0003. Safe to run more than once.
--
--   trial    first month after approval, up to 200 available products
--   pro      59,000₮ / month, up to 500
--   premium  89,000₮ / month, up to 1000 (shown before pro)
--   max     139,000₮ / month, unlimited (shown first)
--
-- Payment happens outside the site (shops DM the ThriftUB Instagram).
-- Only an admin can change a shop's plan or expiry date.
-- =====================================================================

do $$ begin
  create type public.shop_plan as enum ('trial', 'pro', 'premium', 'max');
exception when duplicate_object then null; end $$;

alter table public.shops add column if not exists plan public.shop_plan not null default 'trial';
alter table public.shops add column if not exists plan_expires_at timestamptz;
-- Copied from the shop's plan so the catalog can sort by it: 3 max, 2 premium, 1 pro, 0 otherwise.
alter table public.products add column if not exists boost smallint not null default 0;

create index if not exists products_boost_created_idx
  on public.products (is_available, boost desc, created_at desc);

-- ---------- Plan rules ----------

/** Max available products for a plan. 0 when expired, NULL = unlimited. */
create or replace function public.plan_product_limit(p public.shop_plan, expires timestamptz)
returns integer
language sql
stable
set search_path = ''
as $$
  select case
    when expires is not null and expires < now() then 0
    when p = 'trial' then 200
    when p = 'pro' then 500
    when p = 'premium' then 1000
    else null
  end;
$$;

create or replace function public.plan_boost(p public.shop_plan, expires timestamptz)
returns smallint
language sql
stable
set search_path = ''
as $$
  select (case
    when expires is not null and expires < now() then 0
    when p = 'max' then 3
    when p = 'premium' then 2
    when p = 'pro' then 1
    else 0
  end)::smallint;
$$;

-- ---------- Shops: owners can't touch plan fields; trial starts on approval ----------

create or replace function public.guard_shop_write()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending';
      new.is_demo := false;
      new.owner_id := auth.uid();
      new.plan := 'trial';
      new.plan_expires_at := null;
    else
      if new.status is distinct from old.status then
        raise exception 'Дэлгүүрийн төлөвийг зөвхөн админ өөрчилнө.';
      end if;
      new.owner_id := old.owner_id;
      new.is_demo := old.is_demo;
      new.plan := old.plan;
      new.plan_expires_at := old.plan_expires_at;
    end if;
  end if;

  -- The free month starts the first time the shop is approved.
  if new.status = 'approved' and new.plan = 'trial' and new.plan_expires_at is null and not new.is_demo then
    new.plan_expires_at := now() + interval '1 month';
  end if;
  return new;
end;
$$;

create or replace function public.sync_product_boost()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.plan is distinct from old.plan or new.plan_expires_at is distinct from old.plan_expires_at then
    update public.products
      set boost = public.plan_boost(new.plan, new.plan_expires_at)
      where shop_id = new.id;
  end if;
  return null;
end;
$$;

drop trigger if exists shops_sync_product_boost on public.shops;
create trigger shops_sync_product_boost after update on public.shops
  for each row execute function public.sync_product_boost();

-- ---------- Products: copy boost, enforce the plan's limit ----------

create or replace function public.product_plan_rules()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  s record;
  lim integer;
  used integer;
begin
  select plan, plan_expires_at into s from public.shops where id = new.shop_id;
  new.boost := coalesce(public.plan_boost(s.plan, s.plan_expires_at), 0);

  -- Limit applies when a product becomes available (new, or re-listed),
  -- for shop owners only. Admins and demo rows are not limited.
  if new.is_available
     and (tg_op = 'INSERT' or not old.is_available)
     and auth.uid() is not null
     and not public.is_admin()
     and not new.is_demo then
    lim := public.plan_product_limit(s.plan, s.plan_expires_at);
    if lim = 0 then
      raise exception 'PLAN_EXPIRED';
    end if;
    if lim is not null then
      select count(*) into used from public.products
        where shop_id = new.shop_id and is_available and id <> new.id;
      if used >= lim then
        raise exception 'PLAN_LIMIT:%', lim;
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists products_plan_rules on public.products;
create trigger products_plan_rules before insert or update on public.products
  for each row execute function public.product_plan_rules();

-- Drops the boost of shops whose paid plan ran out. Called by the catalog
-- before it reads, so ordering stays correct without a cron job.
create or replace function public.expire_plans()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.products p
    set boost = 0
    from public.shops s
    where p.shop_id = s.id and p.boost > 0
      and s.plan_expires_at is not null and s.plan_expires_at < now();
$$;

grant execute on function public.expire_plans() to anon, authenticated;

-- ---------- Existing data ----------

-- Shops that are already approved get their free month from today.
update public.shops
  set plan_expires_at = now() + interval '1 month'
  where status = 'approved' and plan = 'trial' and plan_expires_at is null and not is_demo;
