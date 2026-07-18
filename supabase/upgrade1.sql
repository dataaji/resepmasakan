-- ============================================================
-- Kulinara — upgrade v2 (jalankan SEKALI di SQL Editor,
-- SETELAH setup.sql yang pertama)
-- ============================================================

-- ---------- 1. ROLE: super_admin ----------

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('user','admin','super_admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    case
      when new.email = 'admin@kulinara.id' then 'super_admin'
      when new.email = 'dataaji04@gmail.com' then 'admin'
      else 'user'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin'));
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin');
$$;

-- Hanya super admin yang boleh mengubah role siapa pun
create or replace function public.guard_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_super_admin() then
    raise exception 'Hanya super admin yang dapat mengubah role';
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
  before update on public.profiles
  for each row execute function public.guard_role_change();

-- ---------- 2. MULTI-FOTO RESEP ----------

alter table public.recipes add column if not exists images jsonb not null default '[]'::jsonb;
update public.recipes
  set images = jsonb_build_array(image_url)
  where image_url is not null and images = '[]'::jsonb;

-- ---------- 3. NOTIFIKASI ----------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('like','comment','rating','fork')),
  recipe_id uuid references public.recipes(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications (user_id, read, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select" on public.notifications for select
  using (auth.uid() = user_id);
create policy "notifications_update" on public.notifications for update
  using (auth.uid() = user_id);
create policy "notifications_insert" on public.notifications for insert
  with check (auth.uid() = actor_id and user_id <> actor_id);

-- ---------- 4. SEED: 10 resep tambahan (total 20) ----------

insert into public.recipes (id, user_id, title, category, image_url, images, cook_time_minutes, servings, difficulty, estimated_cost, notes, ingredients, steps, is_public, created_at) values
('aaaaaaaa-0000-4000-8000-000000000011', '44444444-4444-4444-8444-444444444444', 'Soto Ayam Lamongan', 'Makanan', '/recipes/soto-ayam.jpg', '["/recipes/soto-ayam.jpg"]', 60, 4, 'Sedang', 40000,
 'Koya (kerupuk udang + bawang putih goreng dihaluskan) adalah kunci rasa khas Lamongan.',
 '[{"name":"Ayam","qty":500,"unit":"gram","secukupnya":false},{"name":"Kunyit","qty":3,"unit":"potong","secukupnya":false},{"name":"Bawang merah","qty":6,"unit":"siung","secukupnya":false},{"name":"Bawang putih","qty":4,"unit":"siung","secukupnya":false},{"name":"Serai","qty":2,"unit":"potong","secukupnya":false},{"name":"Kol","qty":100,"unit":"gram","secukupnya":false},{"name":"Soun","qty":50,"unit":"gram","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]',
 '["Rebus ayam hingga empuk, angkat lalu suwir-suwir.","Haluskan bumbu (bawang, kunyit), tumis dengan serai hingga harum.","Masukkan tumisan ke kaldu, didihkan 15 menit.","Tata soun, kol, dan ayam suwir di mangkuk, siram kuah panas.","Sajikan dengan koya, jeruk nipis, dan sambal."]',
 true, now() - interval '8 days'),
('aaaaaaaa-0000-4000-8000-000000000012', '22222222-2222-4222-8222-222222222222', 'Gado-Gado Siram', 'Makanan', '/recipes/gado-gado.jpg', '["/recipes/gado-gado.jpg"]', 40, 3, 'Sedang', 25000,
 'Bumbu kacang lebih sedap kalau kacangnya digoreng sendiri, bukan kacang instan.',
 '[{"name":"Kacang tanah","qty":200,"unit":"gram","secukupnya":false},{"name":"Tahu","qty":2,"unit":"potong","secukupnya":false},{"name":"Tempe","qty":150,"unit":"gram","secukupnya":false},{"name":"Kangkung","qty":1,"unit":"ikat","secukupnya":false},{"name":"Tauge","qty":100,"unit":"gram","secukupnya":false},{"name":"Telur","qty":2,"unit":"butir","secukupnya":false},{"name":"Cabai merah","qty":3,"unit":"buah","secukupnya":false},{"name":"Gula merah","qty":50,"unit":"gram","secukupnya":false}]',
 '["Goreng kacang tanah, haluskan dengan cabai, gula merah, dan garam.","Tambahkan air hangat sedikit demi sedikit sampai bumbu kental.","Rebus sayuran dan telur, goreng tahu tempe.","Tata semua bahan di piring, siram bumbu kacang.","Sajikan dengan kerupuk dan bawang goreng."]',
 true, now() - interval '6 days'),
('aaaaaaaa-0000-4000-8000-000000000013', '33333333-3333-4333-8333-333333333333', 'Bakso Sapi Kuah', 'Makanan', '/recipes/bakso.jpg', '["/recipes/bakso.jpg"]', 90, 6, 'Sulit', 60000,
 'Uleni adonan dengan es batu supaya bakso kenyal dan tidak pecah saat direbus.',
 '[{"name":"Daging sapi giling","qty":500,"unit":"gram","secukupnya":false},{"name":"Tepung tapioka","qty":100,"unit":"gram","secukupnya":false},{"name":"Es batu","qty":100,"unit":"gram","secukupnya":false},{"name":"Bawang putih","qty":5,"unit":"siung","secukupnya":false},{"name":"Mie kuning","qty":200,"unit":"gram","secukupnya":false},{"name":"Daun bawang","qty":2,"unit":"lembar","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true},{"name":"Merica","qty":null,"unit":null,"secukupnya":true}]',
 '["Haluskan daging dengan es batu, bawang putih, garam, dan merica.","Campur tepung tapioka, uleni hingga kalis.","Bentuk bulatan dengan tangan, rebus di air panas (jangan mendidih) hingga mengapung.","Buat kuah dari kaldu sapi, bumbui garam dan merica.","Sajikan bakso dengan mie, kuah panas, dan taburan daun bawang."]',
 true, now() - interval '14 days'),
('aaaaaaaa-0000-4000-8000-000000000014', '44444444-4444-4444-8444-444444444444', 'Sate Ayam Madura', 'Makanan', '/recipes/sate-ayam.jpg', '["/recipes/sate-ayam.jpg"]', 50, 4, 'Sedang', 35000,
 'Rendam tusuk sate di air dulu supaya tidak gosong saat dibakar.',
 '[{"name":"Daging ayam","qty":500,"unit":"gram","secukupnya":false},{"name":"Kacang tanah","qty":150,"unit":"gram","secukupnya":false},{"name":"Kecap manis","qty":5,"unit":"sdm","secukupnya":false},{"name":"Bawang merah","qty":4,"unit":"siung","secukupnya":false},{"name":"Cabai rawit","qty":3,"unit":"buah","secukupnya":false},{"name":"Tusuk sate","qty":20,"unit":"buah","secukupnya":false},{"name":"Jeruk nipis","qty":1,"unit":"buah","secukupnya":false}]',
 '["Potong dadu daging ayam, tusuk 4-5 potong per tusukan.","Goreng dan haluskan kacang dengan cabai, campur kecap manis.","Lumuri sate dengan sebagian bumbu kacang.","Bakar sate sambil dibolak-balik dan diolesi bumbu, sekitar 10 menit.","Sajikan dengan sisa bumbu kacang, kecap, irisan bawang, dan jeruk nipis."]',
 true, now() - interval '4 days'),
('aaaaaaaa-0000-4000-8000-000000000015', '22222222-2222-4222-8222-222222222222', 'Mie Goreng Jawa', 'Makanan', '/recipes/mie-goreng.jpg', '["/recipes/mie-goreng.jpg"]', 25, 2, 'Mudah', 15000,
 'Pakai api besar saat menumis supaya mie tidak berair dan aroma wok keluar.',
 '[{"name":"Mie telur","qty":200,"unit":"gram","secukupnya":false},{"name":"Telur","qty":2,"unit":"butir","secukupnya":false},{"name":"Kol","qty":100,"unit":"gram","secukupnya":false},{"name":"Bawang merah","qty":4,"unit":"siung","secukupnya":false},{"name":"Bawang putih","qty":3,"unit":"siung","secukupnya":false},{"name":"Kecap manis","qty":3,"unit":"sdm","secukupnya":false},{"name":"Sawi hijau","qty":1,"unit":"ikat","secukupnya":false}]',
 '["Rebus mie hingga setengah matang, tiriskan.","Tumis bawang hingga harum, masukkan telur, orak-arik.","Masukkan sayuran, aduk hingga layu.","Masukkan mie dan kecap manis, aduk rata dengan api besar selama 3 menit.","Sajikan dengan taburan bawang goreng dan acar."]',
 true, now() - interval '2 days'),
('aaaaaaaa-0000-4000-8000-000000000016', '33333333-3333-4333-8333-333333333333', 'Martabak Manis Coklat Keju', 'Camilan', '/recipes/martabak.jpg', '["/recipes/martabak.jpg"]', 45, 8, 'Sedang', 40000,
 'Diamkan adonan minimal 1 jam supaya sarangnya banyak dan teksturnya lembut.',
 '[{"name":"Tepung terigu","qty":250,"unit":"gram","secukupnya":false},{"name":"Gula pasir","qty":80,"unit":"gram","secukupnya":false},{"name":"Telur","qty":2,"unit":"butir","secukupnya":false},{"name":"Ragi instan","qty":1,"unit":"sdt","secukupnya":false},{"name":"Meses coklat","qty":100,"unit":"gram","secukupnya":false},{"name":"Keju parut","qty":100,"unit":"gram","secukupnya":false},{"name":"Susu kental manis","qty":5,"unit":"sdm","secukupnya":false},{"name":"Mentega","qty":50,"unit":"gram","secukupnya":false}]',
 '["Campur terigu, gula, telur, ragi, dan air; aduk rata lalu diamkan 1 jam.","Panaskan cetakan martabak, tuang adonan, biarkan hingga berpori.","Taburi gula pasir, tutup hingga matang.","Angkat, olesi mentega, taburi meses, keju, dan kental manis.","Lipat, potong-potong, sajikan hangat."]',
 true, now() - interval '9 days'),
('aaaaaaaa-0000-4000-8000-000000000017', '44444444-4444-4444-8444-444444444444', 'Donat Gula Empuk', 'Camilan', '/recipes/donat.jpg', '["/recipes/donat.jpg"]', 90, 12, 'Sedang', 30000,
 'Goreng dengan api kecil-sedang dan sekali balik saja supaya tidak menyerap banyak minyak.',
 '[{"name":"Tepung terigu protein tinggi","qty":500,"unit":"gram","secukupnya":false},{"name":"Kentang kukus","qty":200,"unit":"gram","secukupnya":false},{"name":"Ragi instan","qty":11,"unit":"gram","secukupnya":false},{"name":"Gula pasir","qty":100,"unit":"gram","secukupnya":false},{"name":"Telur","qty":2,"unit":"butir","secukupnya":false},{"name":"Mentega","qty":75,"unit":"gram","secukupnya":false},{"name":"Gula halus","qty":100,"unit":"gram","secukupnya":false}]',
 '["Campur terigu, kentang halus, ragi, gula, dan telur; uleni hingga setengah kalis.","Masukkan mentega dan garam, uleni sampai kalis elastis.","Diamkan 45 menit hingga mengembang dua kali lipat.","Bentuk donat, diamkan lagi 20 menit, goreng hingga keemasan.","Gulingkan di gula halus selagi hangat."]',
 true, now() - interval '5 days'),
('aaaaaaaa-0000-4000-8000-000000000018', '22222222-2222-4222-8222-222222222222', 'Es Campur Segar', 'Minuman', '/recipes/es-campur.jpg', '["/recipes/es-campur.jpg"]', 30, 4, 'Mudah', 25000,
 'Semua bahan bisa disesuaikan selera — kuncinya sirup merah dan santan yang seimbang.',
 '[{"name":"Cincau hitam","qty":100,"unit":"gram","secukupnya":false},{"name":"Kolang-kaling","qty":100,"unit":"gram","secukupnya":false},{"name":"Alpukat","qty":1,"unit":"buah","secukupnya":false},{"name":"Nangka","qty":100,"unit":"gram","secukupnya":false},{"name":"Sirup merah","qty":100,"unit":"ml","secukupnya":false},{"name":"Santan","qty":200,"unit":"ml","secukupnya":false},{"name":"Es serut","qty":null,"unit":null,"secukupnya":true},{"name":"Susu kental manis","qty":4,"unit":"sdm","secukupnya":false}]',
 '["Potong-potong semua bahan isian.","Tata isian di mangkuk saji.","Tambahkan es serut hingga penuh.","Siram sirup merah, santan, dan susu kental manis.","Sajikan segera."]',
 true, now() - interval '3 days'),
('aaaaaaaa-0000-4000-8000-000000000019', '33333333-3333-4333-8333-333333333333', 'Kolak Pisang Ubi', 'Minuman', '/recipes/kolak.jpg', '["/recipes/kolak.jpg"]', 35, 5, 'Mudah', 20000,
 'Masukkan pisang paling akhir supaya tidak hancur.',
 '[{"name":"Pisang kepok","qty":5,"unit":"buah","secukupnya":false},{"name":"Ubi jalar","qty":300,"unit":"gram","secukupnya":false},{"name":"Santan","qty":500,"unit":"ml","secukupnya":false},{"name":"Gula merah","qty":150,"unit":"gram","secukupnya":false},{"name":"Daun pandan","qty":2,"unit":"lembar","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]',
 '["Rebus ubi dengan air, gula merah, dan daun pandan hingga empuk.","Tuang santan, aduk perlahan, jangan sampai pecah.","Masukkan pisang, masak 5 menit.","Tambahkan sejumput garam, koreksi rasa.","Sajikan hangat atau dingin dengan es."]',
 true, now() - interval '7 days'),
('aaaaaaaa-0000-4000-8000-000000000020', '44444444-4444-4444-8444-444444444444', 'Brownies Coklat Kukus', 'Kue & Dessert', '/recipes/brownies.jpg', '["/recipes/brownies.jpg"]', 60, 12, 'Sedang', 45000,
 'Jangan buka tutup kukusan selama 30 menit pertama supaya brownies tidak bantat.',
 '[{"name":"Coklat batang","qty":200,"unit":"gram","secukupnya":false},{"name":"Mentega","qty":150,"unit":"gram","secukupnya":false},{"name":"Telur","qty":4,"unit":"butir","secukupnya":false},{"name":"Gula pasir","qty":150,"unit":"gram","secukupnya":false},{"name":"Tepung terigu","qty":120,"unit":"gram","secukupnya":false},{"name":"Coklat bubuk","qty":30,"unit":"gram","secukupnya":false}]',
 '["Lelehkan coklat batang dan mentega, sisihkan.","Kocok telur dan gula hingga mengembang pucat.","Masukkan coklat leleh, aduk balik.","Ayak terigu dan coklat bubuk, aduk rata perlahan.","Tuang ke loyang, kukus 35 menit dengan tutup dilapisi serbet."]',
 true, now() - interval '11 days');

insert into public.ratings (user_id, recipe_id, stars, created_at) values
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000011', 5, now() - interval '5 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000011', 4, now() - interval '3 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000012', 4, now() - interval '4 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000014', 5, now() - interval '2 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000014', 5, now() - interval '1 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000015', 4, now() - interval '1 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000016', 5, now() - interval '6 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000020', 5, now() - interval '8 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000020', 4, now() - interval '7 days');

insert into public.likes (user_id, recipe_id, created_at) values
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000011', now() - interval '5 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000014', now() - interval '2 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000014', now() - interval '1 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000016', now() - interval '6 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000018', now() - interval '2 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000020', now() - interval '7 days');

insert into public.comments (recipe_id, user_id, text, created_at) values
('aaaaaaaa-0000-4000-8000-000000000011', '22222222-2222-4222-8222-222222222222', 'Kuahnya bening tapi rasanya dalam banget, mirip yang di Lamongan asli.', now() - interval '5 days'),
('aaaaaaaa-0000-4000-8000-000000000014', '33333333-3333-4333-8333-333333333333', 'Bumbu kacangnya juara, anakku sampai nambah dua kali.', now() - interval '2 days'),
('aaaaaaaa-0000-4000-8000-000000000016', '44444444-4444-4444-8444-444444444444', 'Sarangnya banyak, benar-benar mirip martabak bangka!', now() - interval '6 days'),
('aaaaaaaa-0000-4000-8000-000000000020', '22222222-2222-4222-8222-222222222222', 'Lembut dan nyoklat, resep andalan buat arisan.', now() - interval '7 days');
