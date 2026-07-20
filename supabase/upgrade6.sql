-- ============================================================
-- Kulinara — upgrade v7 (batch 1: resep akurat dari sumber internet)
-- Jalankan SEKALI di SQL Editor. Memperbarui isi resep populer
-- menjadi resep yang lebih otentik dan lengkap.
-- Sumber dirangkum dari Cookpad, Kompas Food, IDN Times, detikFood, dll.
-- ============================================================

update public.recipes set
  notes = 'Aduk perlahan dengan api kecil dan sabar (3-5 jam) supaya santan tidak pecah, bumbu meresap, dan daging empuk berwarna coklat gelap.',
  servings = 8,
  cook_time_minutes = 300,
  ingredients = '[{"name":"Daging sapi","qty":1,"unit":"kg","secukupnya":false},{"name":"Santan kental","qty":1500,"unit":"ml","secukupnya":false},{"name":"Cabai merah keriting","qty":100,"unit":"gram","secukupnya":false},{"name":"Bawang merah","qty":12,"unit":"siung","secukupnya":false},{"name":"Bawang putih","qty":6,"unit":"siung","secukupnya":false},{"name":"Jahe","qty":3,"unit":"cm","secukupnya":false},{"name":"Lengkuas","qty":5,"unit":"cm","secukupnya":false},{"name":"Serai","qty":3,"unit":"batang","secukupnya":false},{"name":"Daun jeruk","qty":4,"unit":"lembar","secukupnya":false},{"name":"Daun kunyit","qty":1,"unit":"lembar","secukupnya":false},{"name":"Kelapa parut sangrai","qty":100,"unit":"gram","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]'::jsonb,
  steps = '["Haluskan cabai merah, bawang merah, bawang putih, jahe, dan lengkuas.","Sangrai kelapa parut hingga kecoklatan lalu tumbuk hingga menjadi kerisik berminyak.","Rebus santan bersama bumbu halus, serai, daun jeruk, dan daun kunyit sambil terus diaduk agar santan tidak pecah.","Setelah mendidih dan berminyak, masukkan potongan daging, masak dengan api sedang.","Masukkan kerisik, kecilkan api, masak sambil sesekali diaduk 3-5 jam hingga kuah menyusut, kering, dan coklat gelap."]'::jsonb
where id = 'aaaaaaaa-0000-4000-8000-000000000002';

update public.recipes set
  notes = 'Pakai terasi bakar dan sedikit kemiri pada bumbu supaya aroma dan rasa gurih khas kampungnya keluar.',
  servings = 2,
  cook_time_minutes = 25,
  ingredients = '[{"name":"Nasi putih","qty":2,"unit":"porsi","secukupnya":false},{"name":"Telur","qty":2,"unit":"butir","secukupnya":false},{"name":"Cabai merah keriting","qty":3,"unit":"buah","secukupnya":false},{"name":"Cabai rawit","qty":5,"unit":"buah","secukupnya":false},{"name":"Bawang merah","qty":4,"unit":"siung","secukupnya":false},{"name":"Bawang putih","qty":2,"unit":"siung","secukupnya":false},{"name":"Terasi","qty":1,"unit":"sdt","secukupnya":false},{"name":"Kol","qty":50,"unit":"gram","secukupnya":false},{"name":"Daun bawang","qty":1,"unit":"batang","secukupnya":false},{"name":"Kecap manis","qty":2,"unit":"sdm","secukupnya":false},{"name":"Garam","qty":null,"unit":null,"secukupnya":true}]'::jsonb,
  steps = '["Haluskan cabai merah, cabai rawit, bawang merah, bawang putih, dan terasi bakar.","Panaskan minyak, tumis bumbu halus hingga harum.","Sisihkan bumbu ke pinggir wajan, masukkan telur dan orak-arik.","Masukkan nasi, kol, dan daun bawang, aduk rata dengan api besar.","Beri kecap manis, garam, dan kaldu bubuk, aduk hingga meresap, sajikan dengan bawang goreng."]'::jsonb
where id = 'aaaaaaaa-0000-4000-8000-000000000001';

update public.recipes set
  notes = 'Koya dari kerupuk udang dan bawang putih goreng yang dihaluskan adalah kunci rasa gurih khas Lamongan.',
  servings = 4,
  cook_time_minutes = 60,
  ingredients = '[{"name":"Ayam","qty":500,"unit":"gram","secukupnya":false},{"name":"Bawang merah","qty":6,"unit":"siung","secukupnya":false},{"name":"Bawang putih","qty":4,"unit":"siung","secukupnya":false},{"name":"Kemiri","qty":3,"unit":"butir","secukupnya":false},{"name":"Kunyit","qty":3,"unit":"cm","secukupnya":false},{"name":"Jahe","qty":2,"unit":"cm","secukupnya":false},{"name":"Serai","qty":2,"unit":"batang","secukupnya":false},{"name":"Daun jeruk","qty":3,"unit":"lembar","secukupnya":false},{"name":"Soun","qty":50,"unit":"gram","secukupnya":false},{"name":"Kol","qty":100,"unit":"gram","secukupnya":false},{"name":"Telur rebus","qty":2,"unit":"butir","secukupnya":false},{"name":"Kerupuk udang","qty":5,"unit":"buah","secukupnya":false}]'::jsonb,
  steps = '["Rebus ayam hingga matang, angkat lalu suwir; simpan kaldunya.","Haluskan bawang merah, bawang putih, kemiri, kunyit, dan jahe.","Tumis bumbu halus dengan serai dan daun jeruk hingga harum, tuang ke kaldu dan didihkan.","Buat koya: haluskan kerupuk udang bersama bawang putih goreng.","Tata soun, kol, dan ayam suwir di mangkuk, siram kuah, taburi koya, telur, dan bawang goreng."]'::jsonb
where id = 'aaaaaaaa-0000-4000-8000-000000000011';

update public.recipes set
  notes = 'Masak bumbu kacang hingga meletup dan berminyak supaya wangi, kental, dan tidak cepat basi.',
  servings = 3,
  cook_time_minutes = 40,
  ingredients = '[{"name":"Kacang tanah goreng","qty":200,"unit":"gram","secukupnya":false},{"name":"Kentang","qty":2,"unit":"buah","secukupnya":false},{"name":"Tahu","qty":2,"unit":"potong","secukupnya":false},{"name":"Tempe","qty":100,"unit":"gram","secukupnya":false},{"name":"Kangkung","qty":1,"unit":"ikat","secukupnya":false},{"name":"Tauge","qty":100,"unit":"gram","secukupnya":false},{"name":"Telur rebus","qty":2,"unit":"butir","secukupnya":false},{"name":"Kol","qty":100,"unit":"gram","secukupnya":false},{"name":"Cabai merah","qty":4,"unit":"buah","secukupnya":false},{"name":"Gula merah","qty":40,"unit":"gram","secukupnya":false},{"name":"Air asam jawa","qty":2,"unit":"sdm","secukupnya":false}]'::jsonb,
  steps = '["Rebus kentang, tauge, kangkung, dan kol hingga matang; goreng tahu dan tempe.","Haluskan kacang tanah goreng, cabai, bawang putih, gula merah, dan garam.","Masak bumbu kacang dengan air dan air asam hingga mengental dan meletup.","Tata sayuran, tahu, tempe, dan telur di piring.","Siram bumbu kacang, taburi bawang goreng dan kerupuk."]'::jsonb
where id = 'aaaaaaaa-0000-4000-8000-000000000012';

update public.recipes set
  notes = 'Rendam tusuk sate di air lebih dulu dan olesi kecap saat membakar supaya tidak gosong.',
  servings = 4,
  cook_time_minutes = 50,
  ingredients = '[{"name":"Daging ayam fillet","qty":500,"unit":"gram","secukupnya":false},{"name":"Kacang tanah goreng","qty":150,"unit":"gram","secukupnya":false},{"name":"Kecap manis","qty":5,"unit":"sdm","secukupnya":false},{"name":"Bawang putih","qty":3,"unit":"siung","secukupnya":false},{"name":"Cabai merah","qty":4,"unit":"buah","secukupnya":false},{"name":"Gula merah","qty":30,"unit":"gram","secukupnya":false},{"name":"Air asam jawa","qty":1,"unit":"sdm","secukupnya":false},{"name":"Tusuk sate","qty":20,"unit":"buah","secukupnya":false},{"name":"Jeruk limau","qty":1,"unit":"buah","secukupnya":false}]'::jsonb,
  steps = '["Potong dadu ayam, marinasi dengan sebagian kecap dan bawang putih halus 30 menit.","Tusuk 4-5 potong ayam per tusukan.","Bumbu kacang: haluskan kacang goreng, cabai, dan bawang putih, lalu masak dengan gula merah, air asam, dan air hingga kental, beri kecap.","Bakar sate sambil diolesi kecap manis hingga matang kecoklatan.","Sajikan dengan bumbu kacang, kecap, bawang goreng, jeruk limau, dan lontong."]'::jsonb
where id = 'aaaaaaaa-0000-4000-8000-000000000014';

-- Selesai batch 1 (5 resep). Batch berikutnya menyusul.
