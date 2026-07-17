export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return "Rp " + Math.round(value).toLocaleString("id-ID");
}

export function formatCookTime(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} jam` : `${h} jam ${m} menit`;
}

export function stars(rating: number): { filled: string; empty: string } {
  const rounded = Math.round(rating);
  const clamped = Math.max(0, Math.min(5, rounded));
  return { filled: "★".repeat(clamped), empty: "★".repeat(5 - clamped) };
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  return `${months} bulan lalu`;
}

const IMAGE_MAX_DIMENSION = 900;
const IMAGE_QUALITY = 0.8;

export function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal membaca gambar"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > IMAGE_MAX_DIMENSION) {
          height = Math.round((height * IMAGE_MAX_DIMENSION) / width);
          width = IMAGE_MAX_DIMENSION;
        } else if (height > IMAGE_MAX_DIMENSION) {
          width = Math.round((width * IMAGE_MAX_DIMENSION) / height);
          height = IMAGE_MAX_DIMENSION;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas tidak didukung"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
