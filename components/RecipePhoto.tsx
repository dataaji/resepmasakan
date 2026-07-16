"use client";

import { PLACEHOLDER_GRADIENTS } from "@/lib/constants";

export default function RecipePhoto({
  src,
  gradientIndex,
  alt,
  className = "",
}: {
  src: string | null;
  gradientIndex: number;
  alt: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  const gradient =
    PLACEHOLDER_GRADIENTS[gradientIndex % PLACEHOLDER_GRADIENTS.length];
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className}`}
      style={{ background: gradient }}
      title={alt}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 34, height: 34, opacity: 0.85 }}
        aria-hidden="true"
      >
        <path d="M6 2v7a3 3 0 0 0 3 3v10" />
        <path d="M6 2v7" />
        <path d="M9 2v7" />
        <path d="M18 2c-1.5 2-2 4-2 7 0 2 1 3 2 3v10" />
      </svg>
    </div>
  );
}
