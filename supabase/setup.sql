-- ============================================================
-- Kulinara — skema database Supabase (jalankan SEKALI di SQL Editor)
-- ============================================================

-- ---------- TABEL ----------

create table public.profiles (
  id uuid primary key,
  name text not null default 'Pengguna',
  avatar_url text,
  role text not null default 'user' check (role in ('user','admin')),
  status text not null default 'active' check (status in ('active','suspended','banned')),
  created_at timestamptz not null default now()
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null check (category in ('Makanan','Camilan','Minuman','Kue & Dessert')),
  image_url text,
  cook_time_minutes int not null default 0,
  servings int not null default 1,
  difficulty text not null default 'Mudah' check (difficulty in ('Mudah','Sedang','Sulit')),
  estimated_cost int,
  notes text not null default '',
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  is_public boolean not null default false,
  forked_from_id uuid references public.recipes(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  photo_url text,
  created_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table public.recipe_reports (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null default '',
  status text not null default 'pending' check (status in ('pending','resolved')),
  created_at timestamptz not null default now()
);

create table public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null default '',
  status text not null default 'pending' check (status in ('pending','resolved')),
  created_at timestamptz not null default now()
);

create index idx_recipes_public on public.recipes (is_public, created_at desc);
create index idx_recipes_user on public.recipes (user_id);
create index idx_ratings_recipe on public.ratings (recipe_id);
create index idx_likes_recipe on public.likes (recipe_id);
create index idx_comments_recipe on public.comments (recipe_id, created_at);

-- ---------- TRIGGER: auto-buat profil saat user Google pertama kali login ----------

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
    case when new.email = 'dataaji04@gmail.com' then 'admin' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- HELPER ----------

create or replace function public.is_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- ROW LEVEL SECURITY ----------

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.ratings enable row level security;
alter table public.comments enable row level security;
alter table public.recipe_reports enable row level security;
alter table public.comment_reports enable row level security;

-- profiles: semua bisa lihat (nama penulis tampil publik); edit hanya diri sendiri / admin
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- recipes
create policy "recipes_select" on public.recipes for select
  using (is_public or auth.uid() = user_id or public.is_admin());
create policy "recipes_insert" on public.recipes for insert
  with check (auth.uid() = user_id);
create policy "recipes_update" on public.recipes for update
  using (auth.uid() = user_id);
create policy "recipes_delete" on public.recipes for delete
  using (auth.uid() = user_id or public.is_admin());

-- likes / bookmarks
create policy "likes_select" on public.likes for select using (true);
create policy "likes_insert" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on public.likes for delete using (auth.uid() = user_id);

create policy "bookmarks_select" on public.bookmarks for select using (auth.uid() = user_id);
create policy "bookmarks_insert" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "bookmarks_delete" on public.bookmarks for delete using (auth.uid() = user_id);

-- ratings
create policy "ratings_select" on public.ratings for select using (true);
create policy "ratings_insert" on public.ratings for insert with check (auth.uid() = user_id);
create policy "ratings_update" on public.ratings for update using (auth.uid() = user_id);
create policy "ratings_delete" on public.ratings for delete using (auth.uid() = user_id);

-- comments
create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_delete" on public.comments for delete
  using (auth.uid() = user_id or public.is_admin());

-- reports: kirim oleh user login; lihat/kelola hanya admin
create policy "recipe_reports_insert" on public.recipe_reports for insert
  with check (auth.uid() = reporter_id);
create policy "recipe_reports_select" on public.recipe_reports for select using (public.is_admin());
create policy "recipe_reports_update" on public.recipe_reports for update using (public.is_admin());

create policy "comment_reports_insert" on public.comment_reports for insert
  with check (auth.uid() = reporter_id);
create policy "comment_reports_select" on public.comment_reports for select using (public.is_admin());
create policy "comment_reports_update" on public.comment_reports for update using (public.is_admin());

-- ---------- STORAGE: bucket foto resep ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recipe-photos', 'recipe-photos', true, 2097152, array['image/jpeg','image/png','image/webp']);

create policy "photos_public_read" on storage.objects for select
  using (bucket_id = 'recipe-photos');
create policy "photos_auth_upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'recipe-photos');

-- ---------- SEED: profil demo + 10 resep contoh ----------

insert into public.profiles (id, name, role) values
  ('11111111-1111-4111-8111-111111111111', 'Kulinara', 'user'),
  ('22222222-2222-4222-8222-222222222222', 'Sari Amelia', 'user'),
  ('33333333-3333-4333-8333-333333333333', 'Budi Santoso', 'user'),
  ('44444444-4444-4444-8444-444444444444', 'Rina Wulandari', 'user');

insert into public.recipes (id, user_id, title, category, image_url, cook_time_minutes, servings, difficulty, estimated_cost, notes, ingredients, steps, is_public, created_at) values
('aaaaaaaa-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Nasi Goreng Kampung', 'Makanan', '/recipes/nasi-goreng.jpg', 20, 2, 'Mudah', 18000,
 'Pakai nasi yang sudah dingin (nasi kemarin) supaya hasilnya lebih pera dan tidak lembek.',
 '[{"name":"Nasi putih","qty":2,"unit":"gelas","secukupnya":false},{"name":"Telur","qty":2,"unit":"butir","secukupnya":false},{"name":"Bawang merah","qty":5,"unit":"siung","secukupnya":false},{"name":"Bawang putih","qty":3,"unit":"siung","secukupnya":false},{"name":"Cabai rawit","qty":5,"unit":"buah","secukupnya":false},{"name":"Kecap manis","qty":3,"unit":"sdm","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]',
 '["Tumis bawang merah, bawang putih, dan cabai rawit yang sudah diiris hingga harum.","Masukkan telur, orak-arik hingga matang.","Masukkan nasi putih, aduk rata dengan bumbu.","Tambahkan kecap manis dan garam secukupnya, masak sambil diaduk selama 5 menit.","Sajikan selagi hangat dengan pelengkap sesuai selera."]',
 true, now() - interval '40 days'),
('aaaaaaaa-0000-4000-8000-000000000002', '33333333-3333-4333-8333-333333333333', 'Rendang Daging Sapi', 'Makanan', '/recipes/rendang.jpg', 180, 6, 'Sulit', 120000,
 'Aduk terus di 30 menit terakhir supaya santan tidak pecah dan bumbu meresap sempurna.',
 '[{"name":"Daging sapi","qty":1,"unit":"kg","secukupnya":false},{"name":"Santan kental","qty":1.5,"unit":"liter","secukupnya":false},{"name":"Cabai merah keriting","qty":15,"unit":"buah","secukupnya":false},{"name":"Bawang merah","qty":10,"unit":"siung","secukupnya":false},{"name":"Bawang putih","qty":6,"unit":"siung","secukupnya":false},{"name":"Lengkuas","qty":1,"unit":"potong","secukupnya":false},{"name":"Daun jeruk","qty":5,"unit":"lembar","secukupnya":false},{"name":"Serai","qty":2,"unit":"potong","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]',
 '["Haluskan cabai, bawang merah, dan bawang putih.","Tumis bumbu halus bersama lengkuas, serai, dan daun jeruk hingga harum.","Masukkan daging sapi, aduk hingga berubah warna.","Tuang santan, masak dengan api kecil sambil sesekali diaduk selama 2-3 jam.","Masak hingga kuah mengental dan berminyak, koreksi rasa dengan garam."]',
 true, now() - interval '90 days'),
('aaaaaaaa-0000-4000-8000-000000000003', '44444444-4444-4444-8444-444444444444', 'Sup Ayam Jamur', 'Makanan', '/recipes/sup-ayam.jpg', 35, 4, 'Mudah', 30000,
 'Bisa diganti dengan jamur kancing kalau jamur kuping tidak tersedia.',
 '[{"name":"Ayam","qty":500,"unit":"gram","secukupnya":false},{"name":"Jamur kuping","qty":100,"unit":"gram","secukupnya":false},{"name":"Wortel","qty":2,"unit":"buah","secukupnya":false},{"name":"Daun bawang","qty":2,"unit":"lembar","secukupnya":false},{"name":"Bawang putih","qty":3,"unit":"siung","secukupnya":false},{"name":"Merica","qty":null,"unit":null,"secukupnya":true},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]',
 '["Rebus ayam hingga empuk, sisihkan kaldunya.","Tumis bawang putih hingga harum, masukkan ke kaldu ayam.","Masukkan wortel dan jamur kuping, masak hingga wortel empuk.","Bumbui dengan merica dan garam secukupnya.","Taburi daun bawang sebelum disajikan."]',
 true, now() - interval '25 days'),
('aaaaaaaa-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', 'Risoles Mayo', 'Camilan', '/recipes/risoles.jpg', 60, 15, 'Sedang', 35000,
 'Gulung kulit rapat-rapat supaya isian tidak keluar saat digoreng.',
 '[{"name":"Tepung terigu","qty":250,"unit":"gram","secukupnya":false},{"name":"Telur","qty":2,"unit":"butir","secukupnya":false},{"name":"Susu cair","qty":500,"unit":"ml","secukupnya":false},{"name":"Sosis","qty":8,"unit":"buah","secukupnya":false},{"name":"Mayones","qty":5,"unit":"sdm","secukupnya":false},{"name":"Tepung roti","qty":200,"unit":"gram","secukupnya":false}]',
 '["Campur tepung terigu, telur, dan susu cair, aduk hingga tidak bergerindil.","Buat kulit dadar tipis di atas teflon.","Isi kulit dengan sosis dan mayones, lipat menjadi amplop.","Celupkan ke telur kocok lalu balut tepung roti.","Goreng hingga keemasan dengan api sedang."]',
 true, now() - interval '55 days'),
('aaaaaaaa-0000-4000-8000-000000000005', '33333333-3333-4333-8333-333333333333', 'Pisang Goreng Crispy', 'Camilan', '/recipes/pisang-goreng.jpg', 25, 4, 'Mudah', 15000,
 'Gunakan pisang kepok yang sudah matang supaya rasanya manis alami.',
 '[{"name":"Pisang kepok","qty":6,"unit":"buah","secukupnya":false},{"name":"Tepung beras","qty":100,"unit":"gram","secukupnya":false},{"name":"Tepung terigu","qty":50,"unit":"gram","secukupnya":false},{"name":"Air es","qty":150,"unit":"ml","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true},{"name":"Minyak goreng","qty":null,"unit":null,"secukupnya":true}]',
 '["Campur tepung beras, tepung terigu, garam, dan air es hingga jadi adonan encer.","Belah pisang menjadi dua atau tiga bagian memanjang.","Celupkan pisang ke dalam adonan tepung.","Goreng dalam minyak panas hingga keemasan dan renyah.","Tiriskan dan sajikan hangat."]',
 true, now() - interval '15 days'),
('aaaaaaaa-0000-4000-8000-000000000006', '22222222-2222-4222-8222-222222222222', 'Klepon Pandan', 'Camilan', '/recipes/klepon.jpg', 45, 20, 'Sedang', 22000,
 'Rebus klepon hingga mengapung penuh supaya matang merata sampai ke tengah.',
 '[{"name":"Tepung ketan","qty":250,"unit":"gram","secukupnya":false},{"name":"Air daun suji","qty":180,"unit":"ml","secukupnya":false},{"name":"Gula merah","qty":150,"unit":"gram","secukupnya":false},{"name":"Kelapa parut","qty":1,"unit":"buah","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]',
 '["Campur tepung ketan dengan air daun suji hingga adonan bisa dipulung.","Kukus kelapa parut dengan sedikit garam, sisihkan.","Ambil adonan, pipihkan, isi dengan gula merah sisir, bulatkan.","Rebus bulatan dalam air mendidih hingga mengapung.","Gulingkan klepon matang di atas kelapa parut kukus."]',
 true, now() - interval '10 days'),
('aaaaaaaa-0000-4000-8000-000000000007', '44444444-4444-4444-8444-444444444444', 'Es Teh Manis Segar', 'Minuman', '/recipes/es-teh.jpg', 10, 2, 'Mudah', 5000,
 'Seduh teh dengan air panas dulu baru diberi es, supaya rasa tehnya keluar maksimal.',
 '[{"name":"Teh celup","qty":2,"unit":"buah","secukupnya":false},{"name":"Air panas","qty":300,"unit":"ml","secukupnya":false},{"name":"Gula pasir","qty":4,"unit":"sdm","secukupnya":false},{"name":"Es batu","qty":null,"unit":null,"secukupnya":true}]',
 '["Seduh teh celup dengan air panas selama 5 menit.","Larutkan gula pasir ke dalam air teh panas, aduk rata.","Tuang ke gelas berisi es batu."]',
 true, now() - interval '30 days'),
('aaaaaaaa-0000-4000-8000-000000000008', '22222222-2222-4222-8222-222222222222', 'Es Cendol Durian', 'Minuman', '/recipes/es-cendol.jpg', 40, 4, 'Sedang', 28000,
 'Bisa diganti durian beku kalau tidak musim, hasilnya tetap creamy.',
 '[{"name":"Cendol","qty":200,"unit":"gram","secukupnya":false},{"name":"Santan kental","qty":400,"unit":"ml","secukupnya":false},{"name":"Gula merah cair","qty":150,"unit":"ml","secukupnya":false},{"name":"Daging durian","qty":100,"unit":"gram","secukupnya":false},{"name":"Es serut","qty":null,"unit":null,"secukupnya":true}]',
 '["Siapkan gelas saji, masukkan cendol di dasar gelas.","Tambahkan gula merah cair secukupnya.","Tuang santan kental di atasnya.","Tambahkan daging durian dan es serut.","Sajikan segera selagi dingin."]',
 true, now() - interval '20 days'),
('aaaaaaaa-0000-4000-8000-000000000009', '33333333-3333-4333-8333-333333333333', 'Puding Coklat Lumer', 'Kue & Dessert', '/recipes/puding-coklat.jpg', 50, 6, 'Sedang', 32000,
 'Dinginkan minimal 2 jam di kulkas supaya teksturnya set sempurna sebelum disajikan.',
 '[{"name":"Bubuk agar-agar coklat","qty":2,"unit":"sdm","secukupnya":false},{"name":"Susu cair","qty":500,"unit":"ml","secukupnya":false},{"name":"Coklat batang","qty":100,"unit":"gram","secukupnya":false},{"name":"Gula pasir","qty":80,"unit":"gram","secukupnya":false},{"name":"Telur","qty":2,"unit":"butir","secukupnya":false}]',
 '["Lelehkan coklat batang dengan sedikit susu cair.","Campur bubuk agar-agar, sisa susu cair, dan gula pasir, masak sambil diaduk.","Masukkan coklat leleh, aduk rata hingga mendidih.","Tuang ke cetakan, biarkan dingin di suhu ruang.","Simpan di kulkas minimal 2 jam sebelum disajikan."]',
 true, now() - interval '12 days'),
('aaaaaaaa-0000-4000-8000-000000000010', '44444444-4444-4444-8444-444444444444', 'Kue Lapis Legit', 'Kue & Dessert', '/recipes/lapis-legit.jpg', 150, 20, 'Sulit', 95000,
 'Panggang tiap lapisan dengan api atas saja supaya motif lapisannya rapi.',
 '[{"name":"Mentega","qty":500,"unit":"gram","secukupnya":false},{"name":"Gula halus","qty":300,"unit":"gram","secukupnya":false},{"name":"Kuning telur","qty":20,"unit":"butir","secukupnya":false},{"name":"Tepung terigu","qty":100,"unit":"gram","secukupnya":false},{"name":"Bumbu spekuk","qty":1,"unit":"sdm","secukupnya":false},{"name":"Susu kental manis","qty":3,"unit":"sdm","secukupnya":false}]',
 '["Kocok mentega dan gula halus hingga pucat dan lembut.","Masukkan kuning telur satu per satu sambil terus dikocok.","Masukkan tepung terigu dan bumbu spekuk, aduk perlahan.","Tuang adonan tipis per lapis ke loyang, panggang tiap lapisan hingga matang.","Ulangi hingga adonan habis, dinginkan sebelum dipotong."]',
 true, now() - interval '70 days');

insert into public.likes (user_id, recipe_id, created_at) values
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000001', now() - interval '5 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000001', now() - interval '4 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000002', now() - interval '20 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000002', now() - interval '18 days'),
('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0000-4000-8000-000000000002', now() - interval '15 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000008', now() - interval '10 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000008', now() - interval '9 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000009', now() - interval '6 days');

insert into public.ratings (user_id, recipe_id, stars, created_at) values
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000001', 5, now() - interval '5 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000001', 4, now() - interval '4 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000002', 5, now() - interval '20 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000002', 5, now() - interval '18 days'),
('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0000-4000-8000-000000000002', 4, now() - interval '15 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000008', 5, now() - interval '10 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000008', 4, now() - interval '9 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000009', 5, now() - interval '6 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000003', 4, now() - interval '8 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000010', 5, now() - interval '40 days');

insert into public.comments (recipe_id, user_id, text, created_at) values
('aaaaaaaa-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'Enak banget, anak-anak suka! Aku tambah sosis juga.', now() - interval '5 days'),
('aaaaaaaa-0000-4000-8000-000000000002', '44444444-4444-4444-8444-444444444444', 'Resep rendang paling autentik yang pernah aku coba, bumbunya pas.', now() - interval '18 days'),
('aaaaaaaa-0000-4000-8000-000000000008', '33333333-3333-4333-8333-333333333333', 'Seger banget buat siang-siang panas gini.', now() - interval '9 days'),
('aaaaaaaa-0000-4000-8000-000000000009', '22222222-2222-4222-8222-222222222222', 'Teksturnya lumer di mulut, coklatnya berasa banget.', now() - interval '6 days');
