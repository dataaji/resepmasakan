"use client";

import { useRef, useState } from "react";
import RecipePhoto from "./RecipePhoto";
import { fileToCompressedDataUrl } from "@/lib/utils";

export default function ImageUpload({
  value,
  gradientIndex,
  onChange,
  label = "Foto",
  aspect = "aspect-[4/3]",
}: {
  value: string | null;
  gradientIndex: number;
  onChange: (dataUrl: string) => void;
  label?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`relative w-full ${aspect} overflow-hidden rounded-2xl border-2 border-dashed border-inputBorder bg-card`}
      >
        <RecipePhoto src={value} gradientIndex={gradientIndex} alt={label} />
        <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
          {busy ? "Memproses..." : value ? "Ganti foto" : "Unggah foto"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
