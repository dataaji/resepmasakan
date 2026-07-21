# Menerbitkan Kulinara ke Google Play Store

Kulinara adalah aplikasi web (Next.js). Cara resmi & paling hemat untuk
menaruhnya di Play Store adalah **TWA (Trusted Web Activity)** — aplikasi
Android asli yang menampilkan website-mu **tanpa address bar**, dibuat memakai
alat resmi Google bernama **Bubblewrap**.

Sisi aplikasi web-nya **sudah siap** (PWA valid: manifest + ikon + HTTPS).
Yang tersisa adalah langkah-langkah di komputer kamu + akun Play Console.

---

## 0. Yang perlu disiapkan

| Kebutuhan | Keterangan |
|---|---|
| Akun Google Play Console | **$25 sekali bayar** — https://play.google.com/console |
| Node.js | Sudah ada di komputermu |
| JDK 17 | https://adoptium.net (Temurin 17) |
| Android SDK | Ikut ter-install otomatis oleh Bubblewrap, atau via Android Studio |
| Domain HTTPS | URL Vercel kamu, mis. `https://kulinara.vercel.app` |

---

## 1. Install Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

## 2. Buat proyek Android dari website

Jalankan di folder kosong (BUKAN di dalam folder proyek web ini):

```bash
mkdir kulinara-android && cd kulinara-android
bubblewrap init --manifest https://DOMAIN-KAMU/manifest.webmanifest
```

Saat ditanya, isi kira-kira begini:

- **Domain**: `DOMAIN-KAMU` (tanpa https://)
- **Application ID / package**: `id.kulinara.app`
- **App name**: `Kulinara`
- **Short name**: `Kulinara`
- **Theme color**: `#FF5A36`
- **Background color**: `#FFF6EE`
- **Icon URL**: `https://DOMAIN-KAMU/icon-512.png`
- **Signing key**: pilih **buat baru** (Bubblewrap akan bikin keystore)

> ⚠️ **Simpan file keystore + passwordnya baik-baik!** Kalau hilang, kamu
> **tidak bisa** meng-update aplikasi di Play Store selamanya. Jangan pernah
> di-commit ke Git.

## 3. Ambil SHA-256 fingerprint & pasang assetlinks

Tampilkan fingerprint keystore-mu:

```bash
bubblewrap fingerprint list
```

Salin nilai **SHA-256** (format `AA:BB:CC:...`), lalu buka file:

```
public/.well-known/assetlinks.json
```

Ganti `GANTI_DENGAN_SHA256_FINGERPRINT_KEYSTORE_KAMU` dengan fingerprint tadi,
lalu commit & push (Vercel akan otomatis deploy).

Cek sudah tayang di: `https://DOMAIN-KAMU/.well-known/assetlinks.json`

> Kalau langkah ini dilewati, aplikasi tetap jalan tapi **muncul address bar**
> di atas layar (tanda belum terverifikasi).

## 4. Build file rilis (.aab)

```bash
bubblewrap build
```

Hasilnya: **`app-release-bundle.aab`** — file inilah yang diunggah ke Play Store.
(Ada juga `app-release-signed.apk` untuk uji coba langsung di HP.)

Uji dulu di HP (opsional):
```bash
adb install app-release-signed.apk
```

## 5. Upload ke Play Console

1. Buka https://play.google.com/console → **Create app**
2. Isi nama **Kulinara**, bahasa **Indonesia**, tipe **App**, **Free**
3. Masuk ke **Production → Create new release**
4. Upload file **`app-release-bundle.aab`**
5. Lengkapi **Store listing**:
   - Deskripsi singkat & panjang
   - **Ikon 512×512** → pakai `public/icon-512.png`
   - **Feature graphic 1024×500** (wajib, harus kamu buat)
   - **Screenshot HP** minimal 2 (screenshot aplikasi di HP)
6. Isi **Content rating**, **Target audience**, **Data safety**
7. **Privacy Policy URL** — **WAJIB**, lihat catatan di bawah
8. Kirim untuk **review** (biasanya beberapa hari)

---

## ⚠️ Yang wajib disiapkan sebelum submit

### Privacy Policy (wajib)
Aplikasi ini punya login & upload foto, jadi Google **mewajibkan** halaman
kebijakan privasi publik. Perlu menjelaskan minimal:
- data apa yang dikumpulkan (email/nama/foto profil via Google, resep & foto yang diunggah)
- disimpan di mana (Supabase)
- cara pengguna menghapus akun/datanya
- kontak kamu

Bisa dibuatkan sebagai halaman `/privasi` di aplikasi ini — tinggal minta.

### Akun & penghapusan data
Google mewajibkan ada cara pengguna **menghapus akun**. Saat ini aplikasi
belum punya fitur itu — sebaiknya ditambahkan sebelum submit.

---

## Alternatif: Capacitor

Kalau nanti butuh fitur asli HP (notifikasi push, akses kamera native, offline
penuh), gunakan **Capacitor** sebagai ganti TWA:

```bash
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init Kulinara id.kulinara.app
npx cap add android
```

Perlu Android Studio dan pengaturan tambahan. TWA lebih simpel & cukup untuk
sekarang.

---

## Catatan penting

- **Update aplikasi**: karena TWA hanya "membungkus" website, setiap kali kamu
  update web di Vercel, **aplikasi di HP ikut ter-update otomatis** — tidak
  perlu upload ulang ke Play Store (kecuali ganti ikon/nama/target SDK).
- **Kebijakan Google**: aplikasi yang cuma membungkus website *bisa ditolak*
  kalau dianggap tidak bermanfaat. Kulinara punya fungsi nyata (akun, resep,
  upload, komunitas), jadi umumnya aman — pastikan store listing rapi & jujur.
