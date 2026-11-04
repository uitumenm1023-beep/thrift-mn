# Thrift.mn

A marketplace for second-hand and vintage shops in Ulaanbaatar. Shops register and list their clothes; customers browse and contact a shop directly on Instagram, Facebook or by phone. **There are no payments or deliveries on the site.**

Built with Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS v4, Supabase (Postgres, Auth, Storage) and Lucide icons. Everything runs on free tiers (Supabase Free + Vercel Hobby).

---

## What's in the app

| Area | Routes | Notes |
| --- | --- | --- |
| Public | `/`, `/products`, `/products/[id]`, `/shops`, `/shops/[id]`, `/categories` | Search, filters (category, price, size, condition, shop), sorting, pagination. Only available products from **approved** shops are shown. |
| Auth | `/login`, `/register-shop`, `/auth/callback` | Shop registration creates the account **and** a shop with status `pending`. |
| Shop owner | `/dashboard`, `/dashboard/products`, `/dashboard/products/new`, `/dashboard/products/[id]/edit`, `/dashboard/profile` | Stats, product CRUD with up to 6 photos each, mark as sold or available, edit the shop profile, logo and cover. |
| Admin | `/admin`, `/admin/shops`, `/admin/products`, `/admin/categories` | Approve, reject or suspend shops; delete products; manage categories. |

### Demo mode

If the Supabase environment variables are missing, the public pages show built-in **demo data** (5 shops and 25 products, labelled "Демо") with a banner at the top. Login, registration and the dashboards then show setup instructions instead of pretending to work. Nothing is saved in demo mode.

---

## 1. Run locally

Requirements: Node.js 20.9+.

```bash
npm install
cp .env.example .env.local   # then fill it in (see step 2)
npm run dev
```

Open http://localhost:3000. Without `.env.local` the site runs in demo mode.

## 2. Create the Supabase project

1. Create a free project at https://supabase.com/dashboard.
2. Go to **SQL Editor**. Run these files **in this order**, pasting each file's full contents:
   1. `supabase/migrations/0001_schema.sql`: tables, enums, triggers and helper functions
   2. `supabase/migrations/0002_rls.sql`: Row Level Security policies
   3. `supabase/migrations/0003_storage.sql`: storage buckets and their policies
   4. `supabase/seed.sql` (optional): the 8 categories plus the demo shops and products

   You need the categories for the product form. If you skip the seed, add categories in `/admin/categories` or insert them yourself.

   The scripts are safe to run again.

   **Shortcut:** `supabase/setup.sql` combines all four files. Paste it once and run it.
3. Go to **Project Settings → API**. Copy the **Project URL** and the **anon / publishable** key into `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # or NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... on older projects
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   > ⚠️ Never use the `service_role` / secret key in this project. The app does not need it, because every permission is enforced by RLS.
4. Go to **Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:3000` (change it to your production URL later)
   - **Redirect URLs:** add `http://localhost:3000/auth/callback` and `https://YOUR-DOMAIN/auth/callback`
5. Restart `npm run dev`.

### Email confirmation

By default Supabase asks new users to confirm their email address. After registering, a shop owner sees "check your email". The link signs them in through `/auth/callback`, and they can then upload a logo from the dashboard.

To test faster, turn off **Authentication → Sign In / Providers → Email → Confirm email**. Registration then signs the user in immediately and uploads the logo straight away.

The built-in email sender on the free plan is rate-limited to a few emails per hour. For production, set up custom SMTP (for example Resend's free tier) under **Authentication → Emails → SMTP Settings**.

## 3. Storage

`0003_storage.sql` creates two **public** buckets:

| Bucket | Used for | Path |
| --- | --- | --- |
| `product-images` | product photos | `<user_id>/<uuid>.webp` |
| `shop-images` | shop logos and covers | `<user_id>/<uuid>.webp` |

- Each file is limited to 5 MB, and only JPG, PNG, WEBP and AVIF are accepted.
- The browser shrinks photos to at most 1600px WebP before uploading, so the free 1 GB of storage lasts.
- Storage policies only let a user write inside their own `<user_id>/` folder. Server actions also check that every saved image URL is in the caller's folder.
- Files are deleted from storage when a product or photo is removed.

## 4. Create an admin

Users can never make themselves admin: the sign-up trigger never assigns the role, and a database trigger blocks role changes through the API. Promote an admin by hand:

1. Create the account: **Authentication → Users → Add user** (or register on the site).
2. In the **SQL Editor**, run:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

   This works in the SQL editor because there `auth.uid()` is null, so the guard trigger lets the change through.
3. Sign in at `/login`. You will be sent to `/admin`.

## 5. Deploy to Vercel

1. Push the project to GitHub, GitLab or Bitbucket.
2. On https://vercel.com/new, import the repository. Vercel detects Next.js automatically.
3. Add the environment variables (Production and Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `NEXT_PUBLIC_SITE_URL`: for example `https://thrift.mn` or `https://your-app.vercel.app`
4. Deploy.
5. In Supabase **Authentication → URL Configuration**, set the Site URL to the production URL and add `https://YOUR-DOMAIN/auth/callback` to Redirect URLs.

> Free-tier note: Supabase pauses free projects after 7 days without activity. Open the dashboard to resume one.

---

### Server region

`vercel.json` runs the server functions in Hong Kong (`hkg1`), the closest Vercel region to Mongolia and to Asian Supabase regions. If your Supabase project is in another part of the world, pick the Vercel region closest to it.

## Security model

- **RLS on every table:**
  - Anonymous visitors can read only approved shops and their products and images.
  - Owners can read and write only their own shop and products.
  - Admins (`public.is_admin()`) can moderate.
- **Guard triggers** (`0001_schema.sql`):
  - `guard_profile_update`: users cannot change their own `role`.
  - `guard_shop_write`: a new shop is always created with `pending` status, only an admin can change `status`, and owners cannot change `owner_id` or `is_demo`.
  - `guard_product_write`: owners cannot move a product to another shop or mark it as demo.
- **Server Actions** re-check the role and ownership before every write. The database then enforces the same rules again.
- **Session refresh:** `src/proxy.ts` refreshes the Supabase session cookie and sends logged-out visitors away from `/dashboard` and `/admin`. Layouts check the role again.
- **Only the anon key is used.** No service-role key exists anywhere in the code.

## Project structure

```
src/
  app/
    (public)/            public site: home, products, shops, categories, login, register-shop
    dashboard/           shop owner dashboard + actions.ts
    admin/               admin dashboard + actions.ts
    auth/                sign-in/up actions, email callback route
    sitemap.ts, robots.ts
  components/            UI primitives, layout, product, shop, forms, dashboard
  lib/
    data/catalog.ts      cached public reads ("use cache", tag "catalog")
    data/owner.ts        owner dashboard reads (uncached, RLS-scoped)
    data/admin.ts        admin reads
    supabase/            browser, server and proxy clients
    demo-data.ts         demo shops and products (also the source of seed.sql)
    validation.ts        shared form validation (Mongolian messages)
  proxy.ts               session refresh + route protection
supabase/
  migrations/            schema, RLS, storage SQL
  seed.sql               generated from src/lib/demo-data.ts
scripts/generate-seed.ts
```

### Caching

Public pages read through `src/lib/data/catalog.ts`. Those functions use `"use cache"` with `cacheLife("minutes")` and the tag `catalog`. Every mutation calls `updateTag("catalog")`, so visitors see changes right away. Dashboards always read fresh data.

### Regenerating the seed

`supabase/seed.sql` is generated from `src/lib/demo-data.ts`:

```bash
npm run seed:generate
```

### Removing the demo data later

```sql
delete from public.shops where is_demo = true;   -- products and images cascade
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm run lint` | ESLint |
| `npm run seed:generate` | Rebuild `supabase/seed.sql` from the demo data |

## Placeholders to replace

- **Footer contacts** (`src/components/layout/site-footer.tsx`): hello@thrift.mn, the phone number and the social links are placeholders, marked `TODO`.
- **Demo images:** clean product illustrations in `public/demo` (sources in `marketing/reels/source`). Delete the demo shops before launch (see above).
