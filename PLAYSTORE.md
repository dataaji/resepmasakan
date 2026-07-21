# Tutorial Lengkap: Kulinara ke Google Play Store

> Ditulis untuk pemula. Ikuti urut dari atas. Jangan lompat-lompat.

---

## Gambaran besar (baca dulu 1 menit)

Kulinara itu **aplikasi web**. Kita **tidak** menulis ulang aplikasi Android dari
nol (itu bisa berbulan-bulan). Kita membungkusnya jadi aplikasi Android asli
memakai cara resmi Google bernama **TWA** (*Trusted Web Activity*), dengan alat
resmi bernama **Bubblewrap**.

Hasilnya: aplikasi Android beneran, ada ikonnya di HP, **tanpa address bar**,
bisa diunggah ke Play Store.

**Untungnya:** setiap kali kamu update web di Vercel, aplikasi di HP pengguna
**ikut ter-update otomatis**. Tidak perlu upload ulang ke Play Store.

**Yang perlu disiapkan:**

| Hal | Biaya | Catatan |
|---|---|---|
| Akun Google Play Console | **$25** (sekali seumur hidup) | Bayar pakai kartu kredit/debit internasional |
| JDK 17 | Gratis | Program untuk build aplikasi Android |
| Bubblewrap | Gratis | Alat dari Google |
| Waktu | ± 2–4 jam | Belum termasuk waktu review Google (1–7 hari) |

---

## ⚠️ Dua hal yang WAJIB ada sebelum submit

Google akan **menolak** aplikasimu kalau belum ada:

1. **Halaman Kebijakan Privasi** (Privacy Policy) — karena aplikasimu punya
   login dan upload foto.
2. **Fitur hapus akun** — pengguna harus bisa menghapus akunnya sendiri.

Keduanya **belum ada** di Kulinara. Minta dibuatkan dulu sebelum lanjut ke
Bagian F, atau siapkan sendiri.

---

# BAGIAN A — Install alat yang dibutuhkan

## A1. Cek Node.js (kemungkinan sudah ada)

Buka **Command Prompt** (tekan `Windows`, ketik `cmd`, Enter), lalu ketik:

```
node -v
```

Kalau muncul angka seperti `v20.11.0` → **aman, lanjut**.
Kalau muncul error → install dulu dari https://nodejs.org (pilih **LTS**).

## A2. Install JDK 17

Ini dibutuhkan untuk membuat aplikasi Android.

1. Buka https://adoptium.net
2. Pilih **Temurin 17 (LTS)** → **Windows** → **x64** → **.msi**
3. Download & install (klik Next terus sampai selesai)
4. **Penting:** saat instalasi, centang opsi **"Set JAVA_HOME variable"**
5. **Tutup semua Command Prompt**, lalu buka Command Prompt **baru**
6. Cek berhasil:

```
java -version
```

Harus muncul `openjdk version "17...`. Kalau masih error, restart komputer.

## A3. Install Bubblewrap

Di Command Prompt:

```
npm install -g @bubblewrap/cli
```

Tunggu sampai selesai (bisa 1–3 menit). Lalu cek:

```
bubblewrap --version
```

Kalau muncul nomor versi → berhasil.

> **Kalau muncul error "bubblewrap is not recognized":** tutup Command Prompt,
> buka baru, coba lagi. Kalau masih, restart komputer.

---

# BAGIAN B — Siapkan alamat web kamu

Kamu butuh alamat aplikasi Kulinara yang sudah online di Vercel.

1. Buka https://vercel.com → login → klik proyek Kulinara
2. Lihat bagian **Domains**, salin alamatnya
   (contoh: `kulinara.vercel.app` — **tanpa** `https://`)

Di tutorial ini aku tulis sebagai **`DOMAIN-KAMU`**. Setiap kali kamu lihat
tulisan itu, ganti dengan alamat aslimu.

**Cek dulu PWA-nya sudah benar** — buka di browser:

```
https://DOMAIN-KAMU/manifest.webmanifest
```

Kalau muncul tulisan berisi `"name": "Kulinara — Resep Masakan Indonesia"` →
**bagus, sudah siap.** Kalau error 404, tunggu Vercel selesai deploy dulu.

---

# BAGIAN C — Buat proyek Android

## C1. Buat folder baru

**Jangan** di dalam folder proyek web. Buat folder terpisah, misal di `D:\`:

```
cd /d D:\
mkdir kulinara-android
cd kulinara-android
```

## C2. Jalankan Bubblewrap

```
bubblewrap init --manifest https://DOMAIN-KAMU/manifest.webmanifest
```

Pertama kali jalan, Bubblewrap akan bertanya:

> *"Do you want Bubblewrap to install the Android SDK?"* → ketik **Y** lalu Enter
> (biarkan dia download sendiri, bisa 5–15 menit tergantung internet)

Setelah itu dia akan tanya banyak hal. **Kebanyakan sudah terisi otomatis dari
manifest — tinggal tekan Enter.** Yang perlu diperhatikan:

| Pertanyaan | Isi dengan |
|---|---|
| Domain | `DOMAIN-KAMU` |
| URL path | `/` (Enter saja) |
| Application name | `Kulinara` |
| Short name | `Kulinara` |
| Application ID | `id.kulinara.app` |
| Display mode | `standalone` (Enter) |
| Status bar color | `#FF5A36` (Enter) |
| Icon URL | biarkan (sudah otomatis) |
| Include support for Play Billing? | **N** |
| Request geolocation permission? | **N** |

Lalu dia tanya soal **signing key** (kunci tanda tangan):

> *"Key store location"* → Enter (pakai default `./android.keystore`)
> *"Do you want to create one now?"* → **Y**

Kemudian isi:

| Pertanyaan | Isi |
|---|---|
| Key store password | **Buat password, CATAT!** |
| Key password | **Buat password, CATAT!** |
| First and Last names | Nama kamu |
| Organizational Unit | boleh dikosongkan (Enter) |
| Organization | `Kulinara` |
| Country (2 letter) | `ID` |

## 🔴 C3. SANGAT PENTING — Simpan keystore!

Setelah selesai, di folder itu ada file **`android.keystore`**.

**File ini + 2 password tadi WAJIB kamu simpan selamanya.**

- Kalau hilang → kamu **TIDAK BISA** meng-update aplikasimu di Play Store
  **selamanya**. Harus bikin aplikasi baru dari nol dengan nama paket berbeda.
- **Backup** ke Google Drive / flashdisk / email ke diri sendiri.
- **JANGAN** taruh di folder proyek web dan **jangan** di-upload ke GitHub.

Tulis di catatan:
```
File     : android.keystore  (backup di ______)
Password keystore : ______
Password key      : ______
Alias    : android (default)
```

---

# BAGIAN D — Hubungkan aplikasi dengan website (assetlinks)

Ini supaya aplikasi terbuka **tanpa address bar**. Kalau dilewati, aplikasi
tetap jalan tapi ada bar alamat browser di atas (jelek).

## D1. Ambil sidik jari (fingerprint)

Di folder `kulinara-android`, jalankan:

```
bubblewrap fingerprint list
```

Akan muncul semacam:

```
SHA-256: A1:B2:C3:D4:...:9F
```

**Salin seluruh baris SHA-256** itu (yang panjang, pakai titik dua).

## D2. Tempel ke proyek web

1. Buka folder proyek web Kulinara
2. Buka file: `public/.well-known/assetlinks.json`
3. Ganti tulisan `GANTI_DENGAN_SHA256_FINGERPRINT_KEYSTORE_KAMU`
   dengan fingerprint tadi

Hasilnya kira-kira:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "id.kulinara.app",
      "sha256_cert_fingerprints": [
        "A1:B2:C3:D4:E5:F6:...:9F"
      ]
    }
  }
]
```

4. Simpan, lalu upload ke GitHub (commit & push). Vercel akan deploy otomatis.
5. Cek sudah tayang — buka di browser:
   `https://DOMAIN-KAMU/.well-known/assetlinks.json`
   Harus muncul isi file tadi (bukan 404).

---

# BAGIAN E — Build aplikasinya

Di folder `kulinara-android`:

```
bubblewrap build
```

Dia akan minta password keystore yang tadi kamu buat. Tunggu proses build
(2–10 menit pertama kali).

Kalau berhasil, muncul 2 file:

| File | Gunanya |
|---|---|
| **`app-release-bundle.aab`** | **Ini yang diupload ke Play Store** |
| `app-release-signed.apk` | Untuk uji coba langsung di HP |

## E1. Uji dulu di HP (sangat disarankan)

Cara paling gampang tanpa kabel:
1. Kirim file **`app-release-signed.apk`** ke HP kamu (WhatsApp ke diri
   sendiri / Google Drive / email)
2. Buka file itu di HP → izinkan **"Install dari sumber tidak dikenal"**
3. Install & buka

**Yang harus dicek:**
- Aplikasi terbuka dan menampilkan Kulinara ✅
- **Tidak ada address bar** di atas ✅ (kalau ada → assetlinks belum benar,
  ulangi Bagian D, tunggu beberapa menit, install ulang)
- Login Google jalan ✅
- Upload foto resep jalan ✅

---

# BAGIAN F — Daftar akun Play Console

1. Buka https://play.google.com/console
2. Login dengan akun Google kamu
3. Pilih **"Create a developer account"** → tipe **Personal** (kalau pribadi)
4. Isi nama, alamat, nomor HP
5. **Bayar $25** pakai kartu kredit/debit yang bisa transaksi internasional
6. Google akan **verifikasi identitas** (upload KTP/paspor) — bisa makan waktu
   **1–3 hari**. Tunggu sampai disetujui.

---

# BAGIAN G — Buat aplikasi di Play Console

1. Di Play Console → klik **Create app**
2. Isi:
   - **App name**: `Kulinara`
   - **Default language**: `Indonesian (Indonesia)`
   - **App or game**: `App`
   - **Free or paid**: `Free`
   - Centang semua pernyataan
3. Klik **Create app**

## G1. Upload file aplikasi

1. Menu kiri → **Test and release** → **Production**
2. Klik **Create new release**
3. Bagian **App bundles** → **Upload** → pilih file
   **`app-release-bundle.aab`**
4. **Release name**: `1 (1.0.0)`
5. **Release notes**: tulis misalnya `Rilis pertama Kulinara.`
6. Klik **Next** → **Save**

> Kalau muncul tawaran **"Play App Signing"** → **terima/aktifkan**. Ini justru
> bagus: Google ikut menyimpan kunci kamu sebagai cadangan.

## G2. Isi halaman toko (Store listing)

Menu kiri → **Grow** → **Store presence** → **Main store listing**

| Kolom | Isi |
|---|---|
| **App name** | `Kulinara` |
| **Short description** (maks 80 huruf) | `Simpan, temukan, dan bagikan resep masakan Indonesia.` |
| **Full description** | Tulis 3–5 paragraf: apa itu Kulinara, fitur (100+ resep, mode masak, kalkulator porsi, simpan koleksi, komunitas), untuk siapa |
| **App icon** | Upload **512×512** → pakai file `public/icon-512.png` dari proyek web |
| **Feature graphic** | **1024×500** — WAJIB, harus kamu buat sendiri (bisa pakai Canva) |
| **Phone screenshots** | **Minimal 2**, maks 8. Screenshot aplikasi di HP kamu |

> **Cara ambil screenshot:** buka aplikasi Kulinara di HP → screenshot halaman
> beranda, detail resep, mode masak, dll. Kirim ke komputer, lalu upload.

## G3. Isi bagian wajib lainnya

Menu kiri → **Policy** → **App content**. Isi satu per satu:

1. **Privacy policy** → masukkan URL kebijakan privasi
   (contoh: `https://DOMAIN-KAMU/privasi`) — **wajib ada halamannya**
2. **Ads** → pilih **No** (kalau belum ada iklan)
3. **App access** → kalau perlu login, beri **akun demo** untuk reviewer Google
   (buat 1 akun email+password khusus, tulis di sini)
4. **Content rating** → isi kuesioner (jujur saja: aplikasi resep, tanpa
   konten dewasa) → dapat rating otomatis
5. **Target audience** → pilih umur, biasanya **18+** atau **13+**
6. **Data safety** → ini agak panjang. Isi jujur:
   - Mengumpulkan **Email, Nama, Foto** ✅
   - Untuk **fungsi aplikasi** dan **akun**
   - Data **dienkripsi saat dikirim** ✅
   - Pengguna **bisa minta hapus data** ✅
7. **Government apps** → No
8. **Financial features** → None

---

# BAGIAN H — Kirim untuk review

1. Pastikan semua bagian sudah bercentang hijau
2. Kembali ke **Production** → **Edit release** → **Review release**
3. Klik **Start rollout to Production** → **Rollout**

Google akan review: biasanya **1–7 hari**. Kamu dapat email hasilnya.

Kalau **ditolak**, email-nya menjelaskan alasannya — perbaiki lalu kirim ulang.
Alasan penolakan paling umum untuk aplikasi seperti ini:
- Privacy policy tidak ada/tidak bisa dibuka
- Tidak ada cara hapus akun
- Store listing kurang jelas / screenshot tidak sesuai

---

# Kalau ada masalah (Troubleshooting)

| Masalah | Solusi |
|---|---|
| `bubblewrap: command not found` | Tutup CMD, buka baru. Kalau perlu restart komputer. |
| `JAVA_HOME is not set` | JDK 17 belum terinstall benar. Ulangi Bagian A2, centang "Set JAVA_HOME". |
| Muncul **address bar** di aplikasi | assetlinks.json salah/belum tayang. Cek fingerprint benar-benar sama, tunggu 5–10 menit, install ulang APK. |
| `Failed to download manifest` | Salah ketik alamat, atau Vercel belum selesai deploy. Cek `https://DOMAIN-KAMU/manifest.webmanifest` di browser. |
| Build gagal / error SDK | Hapus folder `kulinara-android`, ulangi dari C1 dengan internet stabil. |
| Lupa password keystore | Tidak bisa dipulihkan. Harus buat keystore + Application ID baru. |

---

# Setelah aplikasi terbit

**Untuk update isi aplikasi** (resep baru, perbaikan tampilan, dll):
→ cukup update web & push ke GitHub. Vercel deploy, **aplikasi HP otomatis
ikut ter-update.** Tidak perlu apa-apa di Play Store. 🎉

**Perlu upload ulang ke Play Store hanya kalau:**
- Ganti nama aplikasi atau ikon aplikasi
- Google menaikkan syarat target SDK (biasanya setahun sekali)

Caranya: naikkan `appVersion` di file `twa-manifest.json`, lalu
`bubblewrap update` → `bubblewrap build` → upload `.aab` baru.

---

## Alternatif: Capacitor (kalau nanti butuh fitur HP asli)

Kalau suatu saat butuh **notifikasi push**, kamera native, atau offline penuh,
ganti dari TWA ke **Capacitor**. Lebih rumit, butuh Android Studio. Untuk
sekarang TWA sudah cukup.
