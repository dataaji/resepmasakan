-- ============================================================
-- Kulinara — pengetatan keamanan (jalankan SEKALI di SQL Editor,
-- SETELAH setup.sql + semua upgrade). Aman dijalankan berulang.
--
-- Memperbaiki:
-- 1. Pengguna bisa mengubah `status` profil sendiri (mem-batalkan
--    suspend/ban). Sekarang hanya admin yang boleh ubah status,
--    dan hanya super admin yang boleh ubah role.
-- 2. Menambah WITH CHECK pada policy update agar baris tidak bisa
--    "dipindahkan" ke pemilik lain.
-- ============================================================

-- ---------- 1. Guard perubahan role & status ----------
create or replace function public.guard_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_super_admin() then
    raise exception 'Hanya super admin yang dapat mengubah role';
  end if;
  if new.status is distinct from old.status and not public.is_admin() then
    raise exception 'Hanya admin yang dapat mengubah status pengguna';
  end if;
  return new;
end;
$$;

-- pastikan trigger-nya terpasang (idempotent)
drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
  before update on public.profiles
  for each row execute function public.guard_role_change();

-- ---------- 2. WITH CHECK pada policy update ----------

-- profil: hanya boleh update baris sendiri (atau admin); tidak bisa memindah id
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- resep: pemilik tidak bisa mengalihkan resep ke user lain
drop policy if exists "recipes_update" on public.recipes;
create policy "recipes_update" on public.recipes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- rating: sama, tidak bisa dialihkan
drop policy if exists "ratings_update" on public.ratings;
create policy "ratings_update" on public.ratings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Selesai. Verifikasi cepat (opsional):
--   - Coba (sebagai user biasa) update profiles.status milik sendiri
--     -> harus DITOLAK.
--   - Admin suspend/ban user -> tetap berhasil.
-- ============================================================
