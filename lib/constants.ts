import { Category, Difficulty } from "./types";

export const CATEGORIES: { value: Category; dot: string }[] = [
  { value: "Makanan", dot: "#FF5A36" },
  { value: "Camilan", dot: "#FFC93C" },
  { value: "Minuman", dot: "#1D7A8C" },
  { value: "Kue & Dessert", dot: "#D94A8C" },
];

export const DIFFICULTIES: Difficulty[] = ["Mudah", "Sedang", "Sulit"];

export const UNIT_GROUPS: { label: string; units: string[] }[] = [
  { label: "Berat", units: ["gram", "kg"] },
  { label: "Volume", units: ["ml", "liter", "sdm", "sdt", "gelas"] },
  {
    label: "Satuan hitung",
    units: ["buah", "siung", "lembar", "butir", "ikat", "potong"],
  },
];

export const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg,#FF5A36,#FFC93C)",
  "linear-gradient(135deg,#1D7A8C,#5DCAA5)",
  "linear-gradient(135deg,#D94A8C,#FFC93C)",
  "linear-gradient(135deg,#7F77DD,#D94A8C)",
  "linear-gradient(135deg,#639922,#FFC93C)",
  "linear-gradient(135deg,#D85A30,#F0997B)",
];

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Apakah ResepKita gratis digunakan?",
    a: "Ya, semua fitur dasar ResepKita — membuat, membagikan, dan menjelajah resep — gratis digunakan.",
  },
  {
    q: "Kenapa saya harus verifikasi email?",
    a: "Verifikasi email diperlukan sebelum kamu bisa membagikan resep, memberi rating, atau berkomentar. Ini membantu menjaga kualitas komunitas ResepKita.",
  },
  {
    q: "Apa itu resep 'Modifikasi'?",
    a: "Kamu bisa memodifikasi resep publik milik pengguna lain — hasilnya jadi resep baru milikmu, tetap mencantumkan kredit ke resep dan pembuat aslinya.",
  },
  {
    q: "Bagaimana peringkat resep dihitung?",
    a: "Peringkat All-Time dihitung dari rata-rata rating sepanjang waktu. Trending Minggu Ini dihitung dari rating dan suka yang masuk dalam 7 hari terakhir.",
  },
  {
    q: "Bagaimana cara melaporkan resep atau komentar?",
    a: "Klik tombol 'Laporkan' pada resep atau komentar yang bermasalah. Laporan akan masuk ke antrian moderasi admin untuk ditinjau.",
  },
];
