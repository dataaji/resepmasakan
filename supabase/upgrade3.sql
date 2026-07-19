-- ============================================================
-- Kulinara — upgrade v4 (jalankan SEKALI di SQL Editor,
-- SETELAH setup.sql, upgrade1.sql, dan upgrade2.sql)
--
-- Membuat konten situs bisa dikelola dari panel admin:
-- banner, pencarian populer, dan kategori.
-- ============================================================

-- ---------- 1. BANNER ----------
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  label text not null default '',
  title text not null,
  subtitle text not null default '',
  cta_label text not null default 'Lihat Resep',
  gradient text not null default 'linear-gradient(120deg,#D94A24,#FF5A36)',
  image_url text,
  href text not null default '/',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- 2. PENCARIAN POPULER ----------
create table if not exists public.popular_searches (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- 3. KATEGORI ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  dot text not null default '#FF5A36',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- RLS: semua orang boleh baca, hanya admin boleh ubah ----------
alter table public.banners enable row level security;
alter table public.popular_searches enable row level security;
alter table public.categories enable row level security;

drop policy if exists "banners_select" on public.banners;
create policy "banners_select" on public.banners for select using (true);
drop policy if exists "banners_write" on public.banners;
create policy "banners_write" on public.banners for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "popular_select" on public.popular_searches;
create policy "popular_select" on public.popular_searches for select using (true);
drop policy if exists "popular_write" on public.popular_searches;
create policy "popular_write" on public.popular_searches for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories for select using (true);
drop policy if exists "categories_write" on public.categories;
create policy "categories_write" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- SEED: isi dengan nilai yang sekarang dipakai ----------
insert into public.banners (label, title, subtitle, cta_label, gradient, image_url, href, sort_order) values
('Rekomendasi Minggu Ini', 'Rendang Daging Sapi favorit komunitas', 'Resep autentik dengan rating tertinggi di Kulinara', 'Lihat Resep', 'linear-gradient(120deg,#D94A24,#FF5A36)', '/recipes/rendang.jpg', '/resep?id=aaaaaaaa-0000-4000-8000-000000000002', 0),
('Buat Cepat', 'Masakan siap dalam 15 menit', 'Ide masak praktis untuk hari yang sibuk', 'Jelajah Resep Kilat', 'linear-gradient(120deg,#1D7A8C,#5DCAA5)', '/recipes/mie-goreng.jpg', '/?time=15', 1),
('Sedang Musim', 'Es Cendol Durian segar', 'Cocok dinikmati di cuaca yang panas', 'Lihat Resep', 'linear-gradient(120deg,#7F77DD,#D94A8C)', '/recipes/es-cendol.jpg', '/resep?id=aaaaaaaa-0000-4000-8000-000000000008', 2)
on conflict do nothing;

insert into public.popular_searches (label, image_url, sort_order) values
('Nasi goreng', '/recipes/nasi-goreng.jpg', 0),
('Ayam geprek', '/recipes/ayam-geprek.jpg', 1),
('Rendang', '/recipes/rendang.jpg', 2),
('Sate ayam', '/recipes/sate-ayam.jpg', 3),
('Soto ayam', '/recipes/soto-ayam.jpg', 4),
('Bakso', '/recipes/bakso.jpg', 5),
('Es cendol', '/recipes/es-cendol.jpg', 6),
('Mie goreng', '/recipes/mie-goreng.jpg', 7)
on conflict do nothing;

insert into public.categories (name, dot, sort_order) values
('Makanan', '#FF5A36', 0),
('Camilan', '#FFC93C', 1),
('Minuman', '#1D7A8C', 2),
('Kue & Dessert', '#D94A8C', 3),
('Sarapan', '#EF9F27', 4),
('Makanan Sehat', '#639922', 5),
('Pedas', '#E24B4A', 6),
('Vegetarian', '#1D9E75', 7),
('Seafood', '#378ADD', 8)
on conflict (name) do nothing;

-- ============================================================
-- Selesai. Sekarang admin bisa mengelola banner, pencarian
-- populer, dan kategori dari panel admin.
-- ============================================================
