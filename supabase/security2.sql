-- ============================================================
-- Kulinara — anti-spam / anti-abuse (jalankan SEKALI di SQL Editor).
-- Aman dijalankan berulang.
--
-- 1. Batas panjang teks (cegah payload raksasa / storage abuse).
-- 2. Rate-limit komentar (maks 5 komentar / menit / pengguna).
-- ============================================================

-- ---------- 1. Batas panjang teks ----------
alter table public.comments   drop constraint if exists chk_comment_len;
alter table public.comments   add  constraint chk_comment_len   check (char_length(text) <= 2000);

alter table public.recipes    drop constraint if exists chk_recipe_title_len;
alter table public.recipes    add  constraint chk_recipe_title_len check (char_length(title) <= 150);

alter table public.recipes    drop constraint if exists chk_recipe_notes_len;
alter table public.recipes    add  constraint chk_recipe_notes_len check (notes is null or char_length(notes) <= 3000);

alter table public.categories drop constraint if exists chk_category_len;
alter table public.categories add  constraint chk_category_len   check (char_length(name) <= 50);

alter table public.popular_searches drop constraint if exists chk_popular_len;
alter table public.popular_searches add  constraint chk_popular_len check (char_length(label) <= 50);

alter table public.banners    drop constraint if exists chk_banner_len;
alter table public.banners    add  constraint chk_banner_len
  check (char_length(title) <= 120 and char_length(subtitle) <= 200 and char_length(label) <= 60);

-- ---------- 2. Rate-limit komentar ----------
create or replace function public.check_comment_rate()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  recent int;
begin
  select count(*) into recent
    from public.comments
    where user_id = new.user_id
      and created_at > now() - interval '1 minute';
  if recent >= 5 then
    raise exception 'Terlalu banyak komentar dalam waktu singkat. Coba lagi sebentar.';
  end if;
  return new;
end;
$$;

drop trigger if exists on_comment_rate on public.comments;
create trigger on_comment_rate
  before insert on public.comments
  for each row execute function public.check_comment_rate();

-- ============================================================
-- Selesai. Komentar dibatasi 5/menit/pengguna dan panjang teks dibatasi.
-- ============================================================
