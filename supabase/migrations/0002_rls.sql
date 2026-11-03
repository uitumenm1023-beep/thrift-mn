-- =====================================================================
-- Thrift.mn — 0002: Row Level Security
-- Every table has RLS enabled. Anything not explicitly allowed is denied.
-- =====================================================================

alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.shops          enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());
-- Role changes are blocked by the guard_profile_update trigger for non-admins.
-- Profiles are created only by the handle_new_user trigger (no insert policy).

-- ---------- categories ----------
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read" on public.categories
  for select to anon, authenticated
  using (true);

drop policy if exists "categories: admin insert" on public.categories;
create policy "categories: admin insert" on public.categories
  for insert to authenticated with check (public.is_admin());

drop policy if exists "categories: admin update" on public.categories;
create policy "categories: admin update" on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories: admin delete" on public.categories;
create policy "categories: admin delete" on public.categories
  for delete to authenticated using (public.is_admin());

-- ---------- shops ----------
drop policy if exists "shops: read approved, own or admin" on public.shops;
create policy "shops: read approved, own or admin" on public.shops
  for select to anon, authenticated
  using (
    status = 'approved'
    or owner_id = (select auth.uid())
    or public.is_admin()
  );

-- Fallback if a shop owner has no shop yet (normally created at sign-up).
drop policy if exists "shops: owner insert" on public.shops;
create policy "shops: owner insert" on public.shops
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'shop_owner'
    )
  );

drop policy if exists "shops: owner or admin update" on public.shops;
create policy "shops: owner or admin update" on public.shops
  for update to authenticated
  using (owner_id = (select auth.uid()) or public.is_admin())
  with check (owner_id = (select auth.uid()) or public.is_admin());
-- Status changes by owners are blocked by the guard_shop_write trigger.

drop policy if exists "shops: admin delete" on public.shops;
create policy "shops: admin delete" on public.shops
  for delete to authenticated using (public.is_admin());

-- ---------- products ----------
drop policy if exists "products: read public, own or admin" on public.products;
create policy "products: read public, own or admin" on public.products
  for select to anon, authenticated
  using (
    public.is_shop_public(shop_id)
    or public.owns_shop(shop_id)
    or public.is_admin()
  );

drop policy if exists "products: owner insert" on public.products;
create policy "products: owner insert" on public.products
  for insert to authenticated
  with check (public.owns_shop(shop_id));

drop policy if exists "products: owner update" on public.products;
create policy "products: owner update" on public.products
  for update to authenticated
  using (public.owns_shop(shop_id))
  with check (public.owns_shop(shop_id));

drop policy if exists "products: owner or admin delete" on public.products;
create policy "products: owner or admin delete" on public.products
  for delete to authenticated
  using (public.owns_shop(shop_id) or public.is_admin());

-- ---------- product_images ----------
-- The sub-select runs with the caller's permissions, so an image is only
-- visible when its product is visible.
drop policy if exists "product_images: read when product visible" on public.product_images;
create policy "product_images: read when product visible" on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));

drop policy if exists "product_images: owner insert" on public.product_images;
create policy "product_images: owner insert" on public.product_images
  for insert to authenticated
  with check (exists (
    select 1 from public.products p
    where p.id = product_id and public.owns_shop(p.shop_id)
  ));

drop policy if exists "product_images: owner update" on public.product_images;
create policy "product_images: owner update" on public.product_images
  for update to authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_id and public.owns_shop(p.shop_id)
  ));

drop policy if exists "product_images: owner or admin delete" on public.product_images;
create policy "product_images: owner or admin delete" on public.product_images
  for delete to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = product_id and public.owns_shop(p.shop_id)
    )
  );
