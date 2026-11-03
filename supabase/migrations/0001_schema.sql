-- =====================================================================
-- Thrift.mn — 0001: Tables, types, indexes, triggers
-- Run this first in the Supabase SQL Editor (or via `supabase db push`).
-- =====================================================================

create extension if not exists pg_trgm;

-- ---------- Enum types ----------
do $$ begin
  create type public.user_role as enum ('customer', 'shop_owner', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.shop_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  -- new = Шинэ, excellent = Маш сайн, good = Сайн, used = Хэрэглэсэн
  create type public.product_condition as enum ('new', 'excellent', 'good', 'used');
exception when duplicate_object then null; end $$;

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- ---------- categories ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- shops ----------
create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  -- One shop per owner. Nullable so demo shops can exist without a real account.
  owner_id uuid unique references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '' check (char_length(description) <= 2000),
  logo_url text,
  cover_url text,
  phone text not null default '' check (char_length(phone) <= 30),
  instagram_url text check (instagram_url is null or char_length(instagram_url) <= 300),
  facebook_url text check (facebook_url is null or char_length(facebook_url) <= 300),
  address text not null default '' check (char_length(address) <= 300),
  district text check (district is null or char_length(district) <= 60),
  status public.shop_status not null default 'pending',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shops_status_idx on public.shops (status);
create index if not exists shops_district_idx on public.shops (district);
create index if not exists shops_name_trgm_idx on public.shops using gin (name gin_trgm_ops);

-- ---------- products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  description text not null default '' check (char_length(description) <= 3000),
  price integer not null check (price >= 0 and price <= 100000000),
  size text not null default '' check (char_length(size) <= 20),
  condition public.product_condition not null default 'good',
  is_available boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_shop_idx on public.products (shop_id);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_available_created_idx on public.products (is_available, created_at desc);
create index if not exists products_price_idx on public.products (price);
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);

-- ---------- product_images ----------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null check (char_length(image_url) <= 1000),
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images (product_id, display_order);

-- =====================================================================
-- Helper functions (SECURITY DEFINER so RLS policies can call them
-- without recursive policy checks).
-- =====================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.owns_shop(target_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.shops
    where id = target_shop_id and owner_id = auth.uid()
  );
$$;

create or replace function public.is_shop_public(target_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.shops
    where id = target_shop_id and status = 'approved'
  );
$$;

-- ---------- updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shops_set_updated_at on public.shops;
create trigger shops_set_updated_at before update on public.shops
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Guards: stop users from escalating privileges through the API.
-- auth.uid() is NULL when you run SQL from the dashboard, so admins can
-- still be promoted manually there.
-- =====================================================================

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Та өөрийн эрхийг өөрчлөх боломжгүй.';
    end if;
  end if;
  new.id := old.id;
  return new;
end;
$$;

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update before update on public.profiles
  for each row execute function public.guard_profile_update();

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
    else
      if new.status is distinct from old.status then
        raise exception 'Дэлгүүрийн төлөвийг зөвхөн админ өөрчилнө.';
      end if;
      new.owner_id := old.owner_id;
      new.is_demo := old.is_demo;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists shops_guard_write on public.shops;
create trigger shops_guard_write before insert or update on public.shops
  for each row execute function public.guard_shop_write();

create or replace function public.guard_product_write()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.is_demo := false;
    else
      new.is_demo := old.is_demo;
      new.shop_id := old.shop_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists products_guard_write on public.products;
create trigger products_guard_write before insert or update on public.products
  for each row execute function public.guard_product_write();

-- =====================================================================
-- New user → profile (+ pending shop for shop owners).
-- Shop details are passed as user metadata from the registration form.
-- The 'admin' role can NEVER be assigned here.
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  new_role public.user_role;
begin
  new_role := case
    when meta ->> 'account_type' = 'shop_owner' then 'shop_owner'::public.user_role
    else 'customer'::public.user_role
  end;

  insert into public.profiles (id, full_name, role)
  values (new.id, left(coalesce(meta ->> 'full_name', ''), 120), new_role);

  if new_role = 'shop_owner' and coalesce(meta ->> 'shop_name', '') <> '' then
    insert into public.shops (
      owner_id, name, description, phone, instagram_url, facebook_url, address, district, status
    ) values (
      new.id,
      left(meta ->> 'shop_name', 80),
      left(coalesce(meta ->> 'shop_description', ''), 2000),
      left(coalesce(meta ->> 'phone', ''), 30),
      nullif(left(coalesce(meta ->> 'instagram_url', ''), 300), ''),
      nullif(left(coalesce(meta ->> 'facebook_url', ''), 300), ''),
      left(coalesce(meta ->> 'address', ''), 300),
      nullif(left(coalesce(meta ->> 'district', ''), 60), ''),
      'pending'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
