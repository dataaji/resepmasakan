-- ============================================================
-- Kulinara — upgrade v5 (jalankan SEKALI di SQL Editor,
-- SETELAH setup.sql, upgrade1.sql, upgrade2.sql, upgrade3.sql)
--
-- Pencatatan kunjungan (untuk statistik pengunjung di panel admin).
-- ============================================================

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create index if not exists idx_visits_created on public.visits (created_at desc);

alter table public.visits enable row level security;

-- Siapa pun (termasuk pengunjung anonim) boleh mencatat kunjungan,
-- tapi hanya admin yang boleh membaca datanya.
drop policy if exists "visits_insert" on public.visits;
create policy "visits_insert" on public.visits for insert with check (true);

drop policy if exists "visits_select" on public.visits;
create policy "visits_select" on public.visits for select using (public.is_admin());

-- ============================================================
-- Selesai. Statistik pengunjung akan mulai terisi setelah ini
-- dijalankan dan aplikasi ter-deploy (per sesi kunjungan baru).
-- ============================================================
