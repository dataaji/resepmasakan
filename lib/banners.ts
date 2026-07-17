export interface Banner {
  label: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  gradient: string;
  href: string;
}

export const BANNERS: Banner[] = [
  {
    label: "Rekomendasi Minggu Ini",
    title: "Rendang Daging Sapi favorit komunitas",
    subtitle: "Resep autentik dengan rating tertinggi di Kulinara",
    ctaLabel: "Lihat Resep",
    gradient: "linear-gradient(120deg,#D94A24,#FF5A36)",
    href: "/resep?id=aaaaaaaa-0000-4000-8000-000000000002",
  },
  {
    label: "Buat Cepat",
    title: "Masakan siap dalam 15 menit",
    subtitle: "Ide masak praktis untuk hari yang sibuk",
    ctaLabel: "Jelajah Resep Kilat",
    gradient: "linear-gradient(120deg,#1D7A8C,#5DCAA5)",
    href: "/?time=15",
  },
  {
    label: "Sedang Musim",
    title: "Es Cendol Durian segar",
    subtitle: "Cocok dinikmati di cuaca yang panas",
    ctaLabel: "Lihat Resep",
    gradient: "linear-gradient(120deg,#7F77DD,#D94A8C)",
    href: "/resep?id=aaaaaaaa-0000-4000-8000-000000000008",
  },
];
