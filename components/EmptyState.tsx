export default function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-16 px-5 text-center text-[15px]" style={{ color: "var(--muted2)" }}>
      {text}
    </div>
  );
}
