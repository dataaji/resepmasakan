-- ============================================================
-- Kulinara — upgrade v3 (jalankan SEKALI di SQL Editor,
-- SETELAH setup.sql dan upgrade1.sql)
-- ============================================================

-- ---------- 1. KATEGORI BEBAS ----------
-- Hilangkan batasan 4 kategori lama supaya kategori baru + custom "Lainnya" bisa dipakai.
alter table public.recipes drop constraint if exists recipes_category_check;

-- ---------- 2. KOMENTAR BERGAMBAR ----------
alter table public.comments add column if not exists image_url text;

-- ---------- 3. SEED: 30 resep tambahan (total 50) ----------
-- Format steps tetap kompatibel: string biasa (foto langkah kosong).
-- Mapper di aplikasi mengubahnya jadi {text, photos:[]} otomatis.

insert into public.recipes (id, user_id, title, category, image_url, images, cook_time_minutes, servings, difficulty, estimated_cost, notes, ingredients, steps, is_public, created_at) values

-- ===== SARAPAN =====
('aaaaaaaa-0000-4000-8000-000000000021', '22222222-2222-4222-8222-222222222222', 'Nasi Uduk Betawi Komplit', 'Sarapan', '/recipes/nasi-uduk.jpg', '["/recipes/nasi-uduk.jpg"]', 45, 4, 'Sedang', 30000,
 'Santan dan daun salam kunci aroma. Sajikan dengan bawang goreng melimpah.',
 '[{"name":"Beras","qty":500,"unit":"gram","secukupnya":false},{"name":"Santan","qty":500,"unit":"ml","secukupnya":false},{"name":"Daun salam","qty":2,"unit":"lembar","secukupnya":false},{"name":"Serai","qty":1,"unit":"batang","secukupnya":false},{"name":"Daun jeruk","qty":3,"unit":"lembar","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true},{"name":"Bawang goreng","qty":null,"unit":null,"secukupnya":true}]',
 '["Cuci beras hingga bersih, tiriskan.","Rebus santan bersama daun salam, serai, daun jeruk, dan garam sampai mendidih.","Masukkan beras, aduk hingga santan meresap (aron).","Kukus nasi aron 25 menit hingga matang dan pulen.","Sajikan dengan telur, tempe orek, bihun, dan bawang goreng."]',
 true, now() - interval '18 days'),

('aaaaaaaa-0000-4000-8000-000000000022', '33333333-3333-4333-8333-333333333333', 'Bubur Ayam Jakarta', 'Sarapan', '/recipes/bubur-ayam.jpg', '["/recipes/bubur-ayam.jpg"]', 60, 4, 'Sedang', 25000,
 'Aduk terus saat memasak bubur supaya tidak menggumpal dan lembut.',
 '[{"name":"Beras","qty":200,"unit":"gram","secukupnya":false},{"name":"Air kaldu ayam","qty":1500,"unit":"ml","secukupnya":false},{"name":"Ayam rebus suwir","qty":200,"unit":"gram","secukupnya":false},{"name":"Cakwe","qty":2,"unit":"buah","secukupnya":false},{"name":"Daun bawang","qty":2,"unit":"batang","secukupnya":false},{"name":"Kecap manis","qty":null,"unit":null,"secukupnya":true},{"name":"Kerupuk","qty":null,"unit":null,"secukupnya":true}]',
 '["Rebus beras dengan kaldu ayam, aduk terus dengan api kecil.","Masak hingga beras hancur dan mengental jadi bubur.","Bumbui garam dan sedikit kaldu bubuk.","Tuang bubur ke mangkuk, beri ayam suwir, cakwe, dan daun bawang.","Siram kecap manis, tambahkan kerupuk dan sambal."]',
 true, now() - interval '16 days'),

('aaaaaaaa-0000-4000-8000-000000000023', '44444444-4444-4444-8444-444444444444', 'Nasi Kuning Tumpeng Mini', 'Sarapan', '/recipes/nasi-kuning.jpg', '["/recipes/nasi-kuning.jpg"]', 50, 5, 'Sedang', 35000,
 'Kunyit memberi warna dan aroma. Cocok untuk syukuran atau sarapan spesial.',
 '[{"name":"Beras","qty":500,"unit":"gram","secukupnya":false},{"name":"Santan","qty":500,"unit":"ml","secukupnya":false},{"name":"Kunyit","qty":3,"unit":"cm","secukupnya":false},{"name":"Serai","qty":1,"unit":"batang","secukupnya":false},{"name":"Daun salam","qty":2,"unit":"lembar","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]',
 '["Haluskan kunyit, campur dengan santan lalu saring.","Rebus santan kunyit bersama serai, daun salam, dan garam.","Masukkan beras, masak hingga menjadi aron.","Kukus 25-30 menit hingga matang.","Bentuk kerucut, sajikan dengan ayam, telur, dan kering tempe."]',
 true, now() - interval '15 days'),

('aaaaaaaa-0000-4000-8000-000000000024', '22222222-2222-4222-8222-222222222222', 'Nasi Pecel Sayur', 'Sarapan', '/recipes/nasi-pecel.jpg', '["/recipes/nasi-pecel.jpg"]', 40, 3, 'Mudah', 18000,
 'Sambal pecel bisa dibuat banyak lalu disimpan, tinggal seduh air panas.',
 '[{"name":"Nasi putih","qty":3,"unit":"porsi","secukupnya":false},{"name":"Kacang panjang","qty":100,"unit":"gram","secukupnya":false},{"name":"Bayam","qty":1,"unit":"ikat","secukupnya":false},{"name":"Tauge","qty":100,"unit":"gram","secukupnya":false},{"name":"Kacang tanah goreng","qty":200,"unit":"gram","secukupnya":false},{"name":"Cabai merah","qty":4,"unit":"buah","secukupnya":false},{"name":"Gula merah","qty":50,"unit":"gram","secukupnya":false},{"name":"Kencur","qty":2,"unit":"cm","secukupnya":false}]',
 '["Haluskan kacang goreng, cabai, kencur, gula merah, dan garam.","Seduh sambal dengan air panas hingga kekentalan pas.","Rebus semua sayuran hingga matang, tiriskan.","Tata nasi dan sayuran di piring.","Siram sambal pecel, sajikan dengan kerupuk dan rempeyek."]',
 true, now() - interval '13 days'),

-- ===== PEDAS =====
('aaaaaaaa-0000-4000-8000-000000000025', '33333333-3333-4333-8333-333333333333', 'Ayam Geprek Sambal Bawang', 'Pedas', '/recipes/ayam-geprek.jpg', '["/recipes/ayam-geprek.jpg"]', 40, 2, 'Sedang', 25000,
 'Geprek ayam selagi panas bersama sambal supaya bumbu meresap.',
 '[{"name":"Dada ayam fillet","qty":2,"unit":"potong","secukupnya":false},{"name":"Tepung bumbu","qty":150,"unit":"gram","secukupnya":false},{"name":"Cabai rawit","qty":15,"unit":"buah","secukupnya":false},{"name":"Bawang putih","qty":5,"unit":"siung","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true},{"name":"Minyak panas","qty":3,"unit":"sdm","secukupnya":false}]',
 '["Balur ayam dengan tepung bumbu basah lalu kering, goreng hingga garing.","Ulek kasar cabai rawit, bawang putih, dan garam.","Siram sambal dengan minyak panas, aduk rata.","Letakkan ayam goreng di atas sambal.","Geprek ayam hingga pipih dan bercampur sambal, sajikan dengan nasi hangat."]',
 true, now() - interval '12 days'),

('aaaaaaaa-0000-4000-8000-000000000026', '44444444-4444-4444-8444-444444444444', 'Seblak Ceker Pedas', 'Pedas', '/recipes/seblak.jpg', '["/recipes/seblak.jpg"]', 35, 3, 'Mudah', 20000,
 'Kencur adalah ciri khas seblak. Jangan dilewatkan.',
 '[{"name":"Kerupuk basah","qty":150,"unit":"gram","secukupnya":false},{"name":"Ceker ayam","qty":10,"unit":"buah","secukupnya":false},{"name":"Telur","qty":2,"unit":"butir","secukupnya":false},{"name":"Cabai rawit","qty":12,"unit":"buah","secukupnya":false},{"name":"Bawang putih","qty":4,"unit":"siung","secukupnya":false},{"name":"Kencur","qty":2,"unit":"cm","secukupnya":false},{"name":"Sawi","qty":1,"unit":"ikat","secukupnya":false}]',
 '["Rendam kerupuk hingga kenyal, rebus ceker hingga empuk.","Haluskan cabai, bawang putih, dan kencur.","Tumis bumbu halus hingga harum, masukkan ceker.","Tuang sedikit air, masukkan kerupuk dan telur, orak-arik.","Tambahkan sawi, bumbui garam dan kaldu, masak hingga matang."]',
 true, now() - interval '11 days'),

('aaaaaaaa-0000-4000-8000-000000000027', '22222222-2222-4222-8222-222222222222', 'Udang Balado Padang', 'Pedas', '/recipes/udang-balado.jpg', '["/recipes/udang-balado.jpg"]', 30, 3, 'Sedang', 40000,
 'Jangan terlalu lama memasak udang supaya tetap kenyal.',
 '[{"name":"Udang","qty":400,"unit":"gram","secukupnya":false},{"name":"Cabai merah keriting","qty":10,"unit":"buah","secukupnya":false},{"name":"Bawang merah","qty":6,"unit":"siung","secukupnya":false},{"name":"Bawang putih","qty":3,"unit":"siung","secukupnya":false},{"name":"Tomat","qty":1,"unit":"buah","secukupnya":false},{"name":"Jeruk nipis","qty":1,"unit":"buah","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]',
 '["Bersihkan udang, lumuri jeruk nipis dan garam.","Goreng udang sebentar, sisihkan.","Haluskan cabai, bawang, dan tomat, lalu tumis hingga matang berminyak.","Masukkan udang, aduk rata dengan sambal balado.","Masak 3 menit, koreksi rasa, sajikan."]',
 true, now() - interval '10 days'),

-- ===== CAMILAN =====
('aaaaaaaa-0000-4000-8000-000000000028', '33333333-3333-4333-8333-333333333333', 'Cireng Bumbu Rujak', 'Camilan', '/recipes/cireng.jpg', '["/recipes/cireng.jpg"]', 30, 4, 'Mudah', 12000,
 'Sajikan hangat dengan sambal rujak pedas manis.',
 '[{"name":"Tepung tapioka","qty":250,"unit":"gram","secukupnya":false},{"name":"Bawang putih","qty":3,"unit":"siung","secukupnya":false},{"name":"Daun bawang","qty":2,"unit":"batang","secukupnya":false},{"name":"Air panas","qty":200,"unit":"ml","secukupnya":false},{"name":"Cabai rawit","qty":8,"unit":"buah","secukupnya":false},{"name":"Gula merah","qty":30,"unit":"gram","secukupnya":false},{"name":"Asam jawa","qty":1,"unit":"sdt","secukupnya":false}]',
 '["Campur tapioka, bawang putih halus, daun bawang, dan garam.","Tuang air panas sedikit demi sedikit, uleni hingga kalis.","Bentuk pipih, goreng hingga renyah di luar.","Ulek cabai, gula merah, dan asam jawa untuk bumbu rujak.","Sajikan cireng hangat dengan cocolan bumbu rujak."]',
 true, now() - interval '9 days'),

('aaaaaaaa-0000-4000-8000-000000000029', '44444444-4444-4444-8444-444444444444', 'Lumpia Semarang', 'Camilan', '/recipes/lumpia.jpg', '["/recipes/lumpia.jpg"]', 60, 6, 'Sulit', 35000,
 'Isian rebung yang gurih adalah ciri khas lumpia Semarang.',
 '[{"name":"Kulit lumpia","qty":15,"unit":"lembar","secukupnya":false},{"name":"Rebung","qty":300,"unit":"gram","secukupnya":false},{"name":"Ayam cincang","qty":150,"unit":"gram","secukupnya":false},{"name":"Udang cincang","qty":100,"unit":"gram","secukupnya":false},{"name":"Telur","qty":2,"unit":"butir","secukupnya":false},{"name":"Bawang putih","qty":4,"unit":"siung","secukupnya":false},{"name":"Kecap manis","qty":2,"unit":"sdm","secukupnya":false}]',
 '["Iris rebung tipis, rebus untuk mengurangi bau.","Tumis bawang putih, masukkan ayam dan udang hingga matang.","Masukkan rebung, telur, kecap, dan bumbu, masak hingga kering.","Isi kulit lumpia dengan tumisan, gulung rapat.","Goreng hingga keemasan, sajikan dengan saus tauco dan cabai."]',
 true, now() - interval '8 days'),

('aaaaaaaa-0000-4000-8000-000000000030', '22222222-2222-4222-8222-222222222222', 'Bakwan Sayur Renyah', 'Camilan', '/recipes/bakwan.jpg', '["/recipes/bakwan.jpg"]', 25, 5, 'Mudah', 10000,
 'Gunakan air es pada adonan supaya bakwan lebih renyah.',
 '[{"name":"Tepung terigu","qty":150,"unit":"gram","secukupnya":false},{"name":"Wortel","qty":1,"unit":"buah","secukupnya":false},{"name":"Kol","qty":100,"unit":"gram","secukupnya":false},{"name":"Tauge","qty":50,"unit":"gram","secukupnya":false},{"name":"Daun bawang","qty":2,"unit":"batang","secukupnya":false},{"name":"Bawang putih","qty":3,"unit":"siung","secukupnya":false},{"name":"Air es","qty":150,"unit":"ml","secukupnya":false}]',
 '["Iris halus wortel, kol, dan daun bawang.","Campur tepung, bawang putih halus, garam, dan air es.","Masukkan sayuran, aduk rata.","Ambil satu sendok adonan, goreng dalam minyak panas.","Goreng hingga kuning keemasan dan renyah, tiriskan."]',
 true, now() - interval '7 days'),

('aaaaaaaa-0000-4000-8000-000000000031', '33333333-3333-4333-8333-333333333333', 'Tahu Isi Pedas', 'Camilan', '/recipes/tahu-isi.jpg', '["/recipes/tahu-isi.jpg"]', 30, 4, 'Mudah', 12000,
 'Nikmati dengan cabai rawit utuh, khas gorengan pinggir jalan.',
 '[{"name":"Tahu pong","qty":8,"unit":"buah","secukupnya":false},{"name":"Wortel","qty":1,"unit":"buah","secukupnya":false},{"name":"Kol","qty":80,"unit":"gram","secukupnya":false},{"name":"Tauge","qty":50,"unit":"gram","secukupnya":false},{"name":"Tepung terigu","qty":100,"unit":"gram","secukupnya":false},{"name":"Bawang putih","qty":3,"unit":"siung","secukupnya":false},{"name":"Cabai rawit","qty":null,"unit":null,"secukupnya":true}]',
 '["Tumis sayuran dengan bawang putih dan garam hingga layu.","Belah tahu, keluarkan sedikit isinya, masukkan tumisan.","Buat adonan tepung cair berbumbu.","Celup tahu isi ke adonan tepung.","Goreng hingga keemasan, sajikan dengan cabai rawit."]',
 true, now() - interval '6 days'),

-- ===== MAKANAN =====
('aaaaaaaa-0000-4000-8000-000000000032', '44444444-4444-4444-8444-444444444444', 'Pecel Lele Sambal Terasi', 'Makanan', '/recipes/pecel-lele.jpg', '["/recipes/pecel-lele.jpg"]', 30, 2, 'Mudah', 18000,
 'Lele digoreng kering, disajikan dengan sambal terasi dan lalapan.',
 '[{"name":"Ikan lele","qty":2,"unit":"ekor","secukupnya":false},{"name":"Kunyit","qty":2,"unit":"cm","secukupnya":false},{"name":"Bawang putih","qty":3,"unit":"siung","secukupnya":false},{"name":"Cabai rawit","qty":10,"unit":"buah","secukupnya":false},{"name":"Terasi","qty":1,"unit":"sdt","secukupnya":false},{"name":"Tomat","qty":1,"unit":"buah","secukupnya":false},{"name":"Lalapan","qty":null,"unit":null,"secukupnya":true}]',
 '["Lumuri lele dengan kunyit, bawang putih halus, dan garam.","Goreng lele hingga kering dan garing.","Bakar terasi, ulek dengan cabai, tomat, dan garam.","Siram sedikit minyak panas ke sambal.","Sajikan lele dengan sambal, lalapan, dan nasi hangat."]',
 true, now() - interval '20 days'),

('aaaaaaaa-0000-4000-8000-000000000033', '22222222-2222-4222-8222-222222222222', 'Opor Ayam Kuning', 'Makanan', '/recipes/opor-ayam.jpg', '["/recipes/opor-ayam.jpg"]', 60, 5, 'Sedang', 45000,
 'Cocok untuk Lebaran, sajikan dengan ketupat dan sambal goreng.',
 '[{"name":"Ayam","qty":1,"unit":"ekor","secukupnya":false},{"name":"Santan","qty":700,"unit":"ml","secukupnya":false},{"name":"Kemiri","qty":5,"unit":"butir","secukupnya":false},{"name":"Kunyit","qty":3,"unit":"cm","secukupnya":false},{"name":"Bawang merah","qty":8,"unit":"siung","secukupnya":false},{"name":"Bawang putih","qty":4,"unit":"siung","secukupnya":false},{"name":"Serai","qty":2,"unit":"batang","secukupnya":false},{"name":"Daun salam","qty":3,"unit":"lembar","secukupnya":false}]',
 '["Haluskan bawang, kemiri, kunyit, dan ketumbar.","Tumis bumbu halus dengan serai dan daun salam hingga harum.","Masukkan potongan ayam, aduk hingga berubah warna.","Tuang santan, masak dengan api kecil sambil diaduk.","Masak hingga ayam empuk dan kuah mengental, koreksi rasa."]',
 true, now() - interval '19 days'),

('aaaaaaaa-0000-4000-8000-000000000034', '33333333-3333-4333-8333-333333333333', 'Gudeg Jogja Manis', 'Makanan', '/recipes/gudeg.jpg', '["/recipes/gudeg.jpg"]', 180, 6, 'Sulit', 50000,
 'Butuh kesabaran, masak lama supaya nangka empuk dan bumbu meresap.',
 '[{"name":"Nangka muda","qty":700,"unit":"gram","secukupnya":false},{"name":"Santan","qty":1000,"unit":"ml","secukupnya":false},{"name":"Gula merah","qty":150,"unit":"gram","secukupnya":false},{"name":"Telur rebus","qty":6,"unit":"butir","secukupnya":false},{"name":"Daun salam","qty":4,"unit":"lembar","secukupnya":false},{"name":"Lengkuas","qty":3,"unit":"cm","secukupnya":false},{"name":"Bawang merah","qty":8,"unit":"siung","secukupnya":false},{"name":"Bawang putih","qty":5,"unit":"siung","secukupnya":false}]',
 '["Rebus nangka muda hingga setengah empuk, tiriskan.","Haluskan bawang, kemiri, dan ketumbar.","Tata nangka, telur, bumbu, gula merah, dan daun di panci.","Tuang santan, masak dengan api sangat kecil 2-3 jam.","Aduk sesekali hingga kuah menyusut dan berwarna coklat, sajikan."]',
 true, now() - interval '17 days'),

('aaaaaaaa-0000-4000-8000-000000000035', '44444444-4444-4444-8444-444444444444', 'Rawon Daging Surabaya', 'Makanan', '/recipes/rawon.jpg', '["/recipes/rawon.jpg"]', 120, 6, 'Sulit', 60000,
 'Kluwek memberi warna hitam dan rasa khas. Pastikan kluwek tidak pahit.',
 '[{"name":"Daging sandung lamur","qty":600,"unit":"gram","secukupnya":false},{"name":"Kluwek","qty":4,"unit":"buah","secukupnya":false},{"name":"Bawang merah","qty":8,"unit":"siung","secukupnya":false},{"name":"Bawang putih","qty":5,"unit":"siung","secukupnya":false},{"name":"Kemiri","qty":4,"unit":"butir","secukupnya":false},{"name":"Serai","qty":2,"unit":"batang","secukupnya":false},{"name":"Tauge pendek","qty":100,"unit":"gram","secukupnya":false},{"name":"Daun jeruk","qty":3,"unit":"lembar","secukupnya":false}]',
 '["Rebus daging hingga empuk, potong dadu, simpan kaldunya.","Haluskan kluwek, bawang, kemiri, dan kunyit.","Tumis bumbu halus dengan serai dan daun jeruk hingga harum.","Masukkan tumisan ke kaldu, tambahkan daging.","Masak hingga bumbu meresap, sajikan dengan tauge, telur asin, dan sambal."]',
 true, now() - interval '16 days'),

('aaaaaaaa-0000-4000-8000-000000000036', '22222222-2222-4222-8222-222222222222', 'Nasi Padang Rendang', 'Makanan', '/recipes/nasi-padang.jpg', '["/recipes/nasi-padang.jpg"]', 40, 3, 'Sedang', 40000,
 'Sajikan nasi dengan rendang, sayur nangka, dan sambal ijo.',
 '[{"name":"Nasi putih","qty":3,"unit":"porsi","secukupnya":false},{"name":"Rendang daging","qty":300,"unit":"gram","secukupnya":false},{"name":"Sayur nangka","qty":150,"unit":"gram","secukupnya":false},{"name":"Cabai hijau","qty":10,"unit":"buah","secukupnya":false},{"name":"Bawang merah","qty":4,"unit":"siung","secukupnya":false},{"name":"Daun singkong rebus","qty":100,"unit":"gram","secukupnya":false}]',
 '["Ulek kasar cabai hijau dan bawang, tumis jadi sambal ijo.","Panaskan rendang dan sayur nangka.","Rebus daun singkong hingga empuk.","Tata nasi di piring bersama semua lauk.","Siram kuah gulai, sajikan dengan kerupuk jangek."]',
 true, now() - interval '14 days'),

-- ===== KUE & DESSERT =====
('aaaaaaaa-0000-4000-8000-000000000037', '33333333-3333-4333-8333-333333333333', 'Kue Cubit Coklat', 'Kue & Dessert', '/recipes/kue-cubit.jpg', '["/recipes/kue-cubit.jpg"]', 30, 20, 'Mudah', 15000,
 'Angkat saat setengah matang untuk tekstur lembut lumer.',
 '[{"name":"Tepung terigu","qty":150,"unit":"gram","secukupnya":false},{"name":"Gula pasir","qty":100,"unit":"gram","secukupnya":false},{"name":"Telur","qty":2,"unit":"butir","secukupnya":false},{"name":"Susu cair","qty":100,"unit":"ml","secukupnya":false},{"name":"Baking powder","qty":1,"unit":"sdt","secukupnya":false},{"name":"Meses coklat","qty":50,"unit":"gram","secukupnya":false},{"name":"Mentega leleh","qty":50,"unit":"gram","secukupnya":false}]',
 '["Kocok telur dan gula hingga mengembang.","Masukkan tepung, susu, dan baking powder, aduk rata.","Tambahkan mentega leleh, diamkan 15 menit.","Tuang adonan ke cetakan panas, taburi meses.","Masak hingga pinggir matang tapi tengah masih lembut, angkat."]',
 true, now() - interval '12 days'),

('aaaaaaaa-0000-4000-8000-000000000038', '44444444-4444-4444-8444-444444444444', 'Salad Buah Segar Yogurt', 'Kue & Dessert', '/recipes/salad-buah.jpg', '["/recipes/salad-buah.jpg"]', 15, 4, 'Mudah', 30000,
 'Gunakan buah segar dingin dan yogurt supaya lebih menyegarkan.',
 '[{"name":"Apel","qty":1,"unit":"buah","secukupnya":false},{"name":"Melon","qty":200,"unit":"gram","secukupnya":false},{"name":"Anggur","qty":100,"unit":"gram","secukupnya":false},{"name":"Naga merah","qty":1,"unit":"buah","secukupnya":false},{"name":"Yogurt plain","qty":150,"unit":"ml","secukupnya":false},{"name":"Mayones","qty":3,"unit":"sdm","secukupnya":false},{"name":"Susu kental manis","qty":3,"unit":"sdm","secukupnya":false},{"name":"Keju parut","qty":null,"unit":null,"secukupnya":true}]',
 '["Potong dadu semua buah, dinginkan di kulkas.","Campur yogurt, mayones, dan susu kental manis untuk saus.","Masukkan buah ke mangkuk saji.","Tuang saus, aduk perlahan.","Taburi keju parut, sajikan dingin."]',
 true, now() - interval '10 days'),

-- ===== MINUMAN =====
('aaaaaaaa-0000-4000-8000-000000000039', '22222222-2222-4222-8222-222222222222', 'Es Jeruk Peras Segar', 'Minuman', '/recipes/es-jeruk.jpg', '["/recipes/es-jeruk.jpg"]', 10, 2, 'Mudah', 10000,
 'Pilih jeruk peras yang matang supaya manis alami.',
 '[{"name":"Jeruk peras","qty":6,"unit":"buah","secukupnya":false},{"name":"Gula pasir","qty":2,"unit":"sdm","secukupnya":false},{"name":"Air matang","qty":300,"unit":"ml","secukupnya":false},{"name":"Es batu","qty":null,"unit":null,"secukupnya":true}]',
 '["Belah dan peras jeruk, saring bijinya.","Larutkan gula dengan sedikit air hangat.","Campur air jeruk, air gula, dan air matang.","Aduk rata, koreksi rasa manis.","Tuang ke gelas berisi es batu, sajikan segera."]',
 true, now() - interval '5 days'),

('aaaaaaaa-0000-4000-8000-000000000040', '33333333-3333-4333-8333-333333333333', 'Wedang Jahe Hangat', 'Minuman', '/recipes/wedang-jahe.jpg', '["/recipes/wedang-jahe.jpg"]', 20, 3, 'Mudah', 8000,
 'Bakar jahe sebentar sebelum digeprek untuk aroma lebih kuat.',
 '[{"name":"Jahe","qty":100,"unit":"gram","secukupnya":false},{"name":"Gula merah","qty":80,"unit":"gram","secukupnya":false},{"name":"Serai","qty":1,"unit":"batang","secukupnya":false},{"name":"Daun pandan","qty":1,"unit":"lembar","secukupnya":false},{"name":"Air","qty":700,"unit":"ml","secukupnya":false}]',
 '["Bakar jahe, kupas, lalu geprek.","Rebus air bersama jahe, serai, dan pandan.","Masukkan gula merah, aduk hingga larut.","Masak 10 menit supaya aroma keluar.","Saring, sajikan hangat."]',
 true, now() - interval '4 days'),

('aaaaaaaa-0000-4000-8000-000000000041', '44444444-4444-4444-8444-444444444444', 'Es Kelapa Muda', 'Minuman', '/recipes/es-kelapa.jpg', '["/recipes/es-kelapa.jpg"]', 10, 2, 'Mudah', 15000,
 'Sajikan langsung dari kelapa muda segar untuk rasa terbaik.',
 '[{"name":"Kelapa muda","qty":2,"unit":"buah","secukupnya":false},{"name":"Sirup coco pandan","qty":4,"unit":"sdm","secukupnya":false},{"name":"Susu kental manis","qty":2,"unit":"sdm","secukupnya":false},{"name":"Es batu","qty":null,"unit":null,"secukupnya":true}]',
 '["Keruk daging kelapa muda, tampung airnya.","Tuang air kelapa ke gelas.","Masukkan daging kelapa muda.","Tambahkan sirup, susu kental manis, dan es batu.","Aduk rata, sajikan dingin."]',
 true, now() - interval '3 days'),

-- ===== SEAFOOD =====
('aaaaaaaa-0000-4000-8000-000000000042', '22222222-2222-4222-8222-222222222222', 'Cumi Goreng Tepung', 'Seafood', '/recipes/cumi-goreng.jpg', '["/recipes/cumi-goreng.jpg"]', 30, 3, 'Sedang', 45000,
 'Jangan menggoreng cumi terlalu lama agar tidak alot.',
 '[{"name":"Cumi","qty":400,"unit":"gram","secukupnya":false},{"name":"Tepung terigu","qty":150,"unit":"gram","secukupnya":false},{"name":"Tepung maizena","qty":50,"unit":"gram","secukupnya":false},{"name":"Bawang putih bubuk","qty":1,"unit":"sdt","secukupnya":false},{"name":"Jeruk nipis","qty":1,"unit":"buah","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]',
 '["Bersihkan cumi, potong cincin, lumuri jeruk nipis dan garam.","Campur terigu, maizena, bawang putih bubuk, dan garam.","Gulingkan cumi ke tepung hingga rata.","Goreng dalam minyak panas hingga renyah.","Tiriskan, sajikan dengan saus sambal atau mayones."]',
 true, now() - interval '9 days'),

('aaaaaaaa-0000-4000-8000-000000000043', '33333333-3333-4333-8333-333333333333', 'Ikan Bakar Kecap', 'Seafood', '/recipes/ikan-bakar.jpg', '["/recipes/ikan-bakar.jpg"]', 45, 3, 'Sedang', 50000,
 'Olesi bumbu berulang saat membakar supaya meresap dan tidak kering.',
 '[{"name":"Ikan gurame","qty":1,"unit":"ekor","secukupnya":false},{"name":"Kecap manis","qty":5,"unit":"sdm","secukupnya":false},{"name":"Bawang merah","qty":5,"unit":"siung","secukupnya":false},{"name":"Bawang putih","qty":3,"unit":"siung","secukupnya":false},{"name":"Kunyit","qty":2,"unit":"cm","secukupnya":false},{"name":"Jeruk nipis","qty":1,"unit":"buah","secukupnya":false},{"name":"Margarin","qty":2,"unit":"sdm","secukupnya":false}]',
 '["Bersihkan ikan, kerat badannya, lumuri jeruk nipis dan garam.","Haluskan bawang dan kunyit, campur kecap dan margarin.","Lumuri ikan dengan bumbu, diamkan 20 menit.","Bakar ikan di atas bara sambil diolesi bumbu.","Bakar hingga matang dan harum, sajikan dengan sambal kecap."]',
 true, now() - interval '8 days'),

('aaaaaaaa-0000-4000-8000-000000000044', '44444444-4444-4444-8444-444444444444', 'Gurame Asam Manis', 'Seafood', '/recipes/gurame-asam-manis.jpg', '["/recipes/gurame-asam-manis.jpg"]', 40, 4, 'Sedang', 55000,
 'Goreng gurame hingga kering supaya tetap renyah saat disiram saus.',
 '[{"name":"Ikan gurame","qty":1,"unit":"ekor","secukupnya":false},{"name":"Saus tomat","qty":4,"unit":"sdm","secukupnya":false},{"name":"Saus sambal","qty":2,"unit":"sdm","secukupnya":false},{"name":"Nanas","qty":100,"unit":"gram","secukupnya":false},{"name":"Bawang bombay","qty":1,"unit":"buah","secukupnya":false},{"name":"Paprika","qty":1,"unit":"buah","secukupnya":false},{"name":"Maizena","qty":1,"unit":"sdm","secukupnya":false}]',
 '["Bersihkan dan kerat gurame, goreng hingga kering, tata di piring.","Tumis bawang bombay hingga harum.","Masukkan saus tomat, saus sambal, nanas, dan paprika.","Tambahkan air, bumbui, kentalkan dengan larutan maizena.","Siram saus asam manis ke atas gurame goreng, sajikan."]',
 true, now() - interval '7 days'),

-- ===== VEGETARIAN =====
('aaaaaaaa-0000-4000-8000-000000000045', '22222222-2222-4222-8222-222222222222', 'Ketoprak Jakarta', 'Vegetarian', '/recipes/ketoprak.jpg', '["/recipes/ketoprak.jpg"]', 30, 2, 'Mudah', 15000,
 'Bumbu kacang yang pas kunci ketoprak enak. Tambah bawang putih mentah sedikit.',
 '[{"name":"Lontong","qty":2,"unit":"buah","secukupnya":false},{"name":"Bihun","qty":50,"unit":"gram","secukupnya":false},{"name":"Tahu goreng","qty":4,"unit":"potong","secukupnya":false},{"name":"Tauge","qty":100,"unit":"gram","secukupnya":false},{"name":"Kacang tanah goreng","qty":150,"unit":"gram","secukupnya":false},{"name":"Bawang putih","qty":2,"unit":"siung","secukupnya":false},{"name":"Cabai rawit","qty":5,"unit":"buah","secukupnya":false},{"name":"Kecap manis","qty":null,"unit":null,"secukupnya":true}]',
 '["Haluskan kacang goreng, bawang putih, cabai, dan garam.","Beri air matang sedikit demi sedikit hingga jadi saus kental.","Rebus bihun dan tauge sebentar.","Tata lontong, bihun, tahu, dan tauge di piring.","Siram bumbu kacang dan kecap, taburi bawang goreng dan kerupuk."]',
 true, now() - interval '11 days'),

('aaaaaaaa-0000-4000-8000-000000000046', '33333333-3333-4333-8333-333333333333', 'Tumis Kangkung Bawang Putih', 'Vegetarian', '/recipes/tumis-kangkung.jpg', '["/recipes/tumis-kangkung.jpg"]', 15, 3, 'Mudah', 10000,
 'Masak dengan api besar dan cepat supaya kangkung tetap hijau dan renyah.',
 '[{"name":"Kangkung","qty":2,"unit":"ikat","secukupnya":false},{"name":"Bawang putih","qty":5,"unit":"siung","secukupnya":false},{"name":"Cabai merah","qty":3,"unit":"buah","secukupnya":false},{"name":"Saus tiram vegetarian","qty":2,"unit":"sdm","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true},{"name":"Air","qty":50,"unit":"ml","secukupnya":false}]',
 '["Petik dan cuci kangkung, tiriskan.","Iris bawang putih dan cabai.","Tumis bawang putih dan cabai hingga harum.","Masukkan kangkung, aduk cepat dengan api besar.","Beri saus tiram, garam, dan sedikit air, masak sebentar, angkat."]',
 true, now() - interval '6 days'),

('aaaaaaaa-0000-4000-8000-000000000047', '44444444-4444-4444-8444-444444444444', 'Tempe Mendoan', 'Vegetarian', '/recipes/tempe-mendoan.jpg', '["/recipes/tempe-mendoan.jpg"]', 20, 4, 'Mudah', 10000,
 'Goreng setengah matang supaya lembut, khas mendoan Banyumas.',
 '[{"name":"Tempe","qty":250,"unit":"gram","secukupnya":false},{"name":"Tepung terigu","qty":100,"unit":"gram","secukupnya":false},{"name":"Daun bawang","qty":2,"unit":"batang","secukupnya":false},{"name":"Ketumbar","qty":1,"unit":"sdt","secukupnya":false},{"name":"Bawang putih","qty":3,"unit":"siung","secukupnya":false},{"name":"Kunyit","qty":1,"unit":"cm","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]',
 '["Iris tempe tipis lebar.","Haluskan bawang putih, ketumbar, dan kunyit.","Campur tepung, bumbu halus, daun bawang, dan air jadi adonan.","Celup tempe ke adonan.","Goreng setengah matang (mendoan), sajikan hangat dengan cabai rawit."]',
 true, now() - interval '5 days'),

-- ===== MAKANAN SEHAT =====
('aaaaaaaa-0000-4000-8000-000000000048', '22222222-2222-4222-8222-222222222222', 'Capcay Sayuran Kuah', 'Makanan Sehat', '/recipes/capcay.jpg', '["/recipes/capcay.jpg"]', 25, 4, 'Mudah', 25000,
 'Masukkan sayuran sesuai tingkat kematangan, wortel dulu baru sawi.',
 '[{"name":"Wortel","qty":1,"unit":"buah","secukupnya":false},{"name":"Brokoli","qty":100,"unit":"gram","secukupnya":false},{"name":"Kembang kol","qty":100,"unit":"gram","secukupnya":false},{"name":"Sawi","qty":1,"unit":"ikat","secukupnya":false},{"name":"Bakso","qty":6,"unit":"buah","secukupnya":false},{"name":"Bawang putih","qty":4,"unit":"siung","secukupnya":false},{"name":"Saus tiram","qty":2,"unit":"sdm","secukupnya":false},{"name":"Maizena","qty":1,"unit":"sdm","secukupnya":false}]',
 '["Tumis bawang putih hingga harum.","Masukkan wortel dan kembang kol, tambah sedikit air.","Masukkan brokoli, bakso, dan sawi.","Bumbui saus tiram, garam, dan merica.","Kentalkan dengan larutan maizena, aduk rata, sajikan."]',
 true, now() - interval '9 days'),

('aaaaaaaa-0000-4000-8000-000000000049', '33333333-3333-4333-8333-333333333333', 'Sayur Asem Segar', 'Makanan Sehat', '/recipes/sayur-asem.jpg', '["/recipes/sayur-asem.jpg"]', 40, 5, 'Mudah', 20000,
 'Rasa asam segar dari asam jawa cocok dinikmati saat siang hari.',
 '[{"name":"Kacang panjang","qty":100,"unit":"gram","secukupnya":false},{"name":"Labu siam","qty":1,"unit":"buah","secukupnya":false},{"name":"Jagung manis","qty":1,"unit":"buah","secukupnya":false},{"name":"Melinjo","qty":50,"unit":"gram","secukupnya":false},{"name":"Asam jawa","qty":2,"unit":"sdm","secukupnya":false},{"name":"Cabai merah","qty":3,"unit":"buah","secukupnya":false},{"name":"Bawang merah","qty":5,"unit":"siung","secukupnya":false},{"name":"Gula merah","qty":30,"unit":"gram","secukupnya":false}]',
 '["Rebus air bersama jagung dan melinjo hingga setengah empuk.","Haluskan bawang, cabai, dan terasi, masukkan ke rebusan.","Tambahkan labu siam dan kacang panjang.","Beri asam jawa, gula merah, dan garam.","Masak hingga sayuran matang, koreksi rasa asam manis, sajikan."]',
 true, now() - interval '4 days'),

('aaaaaaaa-0000-4000-8000-000000000050', '44444444-4444-4444-8444-444444444444', 'Sup Jagung Ayam', 'Makanan Sehat', '/recipes/sup-jagung.jpg', '["/recipes/sup-jagung.jpg"]', 30, 4, 'Mudah', 22000,
 'Serut sebagian jagung supaya kuah lebih kental dan manis alami.',
 '[{"name":"Jagung manis","qty":2,"unit":"buah","secukupnya":false},{"name":"Dada ayam","qty":150,"unit":"gram","secukupnya":false},{"name":"Wortel","qty":1,"unit":"buah","secukupnya":false},{"name":"Telur","qty":1,"unit":"butir","secukupnya":false},{"name":"Bawang putih","qty":3,"unit":"siung","secukupnya":false},{"name":"Daun bawang","qty":1,"unit":"batang","secukupnya":false},{"name":"Maizena","qty":1,"unit":"sdm","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]',
 '["Rebus ayam hingga matang, suwir, simpan kaldunya.","Serut jagung, sebagian dihaluskan.","Tumis bawang putih, masukkan ke kaldu bersama jagung dan wortel.","Masukkan ayam suwir, bumbui garam dan merica.","Kentalkan dengan maizena, tuang telur kocok sambil diaduk, taburi daun bawang."]',
 true, now() - interval '3 days');

-- ---------- 4. RATING, LIKE, KOMENTAR untuk variasi ----------

insert into public.ratings (user_id, recipe_id, stars, created_at) values
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000021', 5, now() - interval '10 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000021', 4, now() - interval '8 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000025', 5, now() - interval '9 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000025', 5, now() - interval '7 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000032', 5, now() - interval '15 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000033', 4, now() - interval '12 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000034', 5, now() - interval '11 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000035', 5, now() - interval '10 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000037', 4, now() - interval '8 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000038', 5, now() - interval '6 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000040', 5, now() - interval '3 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000044', 4, now() - interval '5 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000046', 5, now() - interval '5 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000048', 4, now() - interval '7 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000049', 5, now() - interval '3 days');

insert into public.likes (user_id, recipe_id, created_at) values
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000021', now() - interval '10 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000025', now() - interval '9 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000025', now() - interval '7 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000032', now() - interval '15 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000034', now() - interval '11 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000035', now() - interval '10 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000038', now() - interval '6 days'),
('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-0000-4000-8000-000000000040', now() - interval '3 days'),
('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-0000-4000-8000-000000000046', now() - interval '5 days'),
('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000048', now() - interval '7 days');

insert into public.comments (recipe_id, user_id, text, created_at) values
('aaaaaaaa-0000-4000-8000-000000000021', '33333333-3333-4333-8333-333333333333', 'Nasi uduknya wangi banget, keluarga suka. Tempe orek jadi pelengkap wajib.', now() - interval '9 days'),
('aaaaaaaa-0000-4000-8000-000000000025', '22222222-2222-4222-8222-222222222222', 'Sambal bawangnya nendang! Ayamnya renyah tahan lama.', now() - interval '8 days'),
('aaaaaaaa-0000-4000-8000-000000000032', '44444444-4444-4444-8444-444444444444', 'Lele goreng garing plus sambal terasi, nasi langsung nambah.', now() - interval '14 days'),
('aaaaaaaa-0000-4000-8000-000000000034', '22222222-2222-4222-8222-222222222222', 'Gudegnya manis pas, sabar masak lama terbayar.', now() - interval '10 days'),
('aaaaaaaa-0000-4000-8000-000000000038', '33333333-3333-4333-8333-333333333333', 'Salad buahnya seger, sausnya pas tidak terlalu manis.', now() - interval '6 days'),
('aaaaaaaa-0000-4000-8000-000000000040', '22222222-2222-4222-8222-222222222222', 'Wedang jahe pas untuk malam dingin, badan langsung hangat.', now() - interval '3 days'),
('aaaaaaaa-0000-4000-8000-000000000046', '44444444-4444-4444-8444-444444444444', 'Simpel tapi enak, kangkungnya tetap hijau renyah.', now() - interval '5 days');

-- ============================================================
-- Selesai. Total resep sekarang 50, kolom comments.image_url siap,
-- kategori sudah bebas (mendukung 9 kategori + custom "Lainnya").
-- ============================================================
