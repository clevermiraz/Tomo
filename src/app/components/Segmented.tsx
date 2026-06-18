"use client";

export interface SegItem {
  key: string;
  label: string;
}

/**
 * Segmented control with a single highlight pill that smoothly slides
 * between equal-width segments. Used for the tool switcher and every
 * in-card tab row.
 */
export default function Segmented({
  items,
  value,
  onChange,
  containerClassName = "inset",
}: {
  items: SegItem[];
  value: string;
  onChange: (key: string) => void;
  containerClassName?: string;
}) {
  const n = items.length;
  const idx = Math.max(0, items.findIndex((i) => i.key === value));

  return (
    <div className={`relative flex w-full rounded-full p-1.5 ${containerClassName}`}>
      <span
        aria-hidden
        className="absolute bottom-1.5 left-1.5 top-1.5 rounded-full"
        style={{
          width: `calc((100% - 0.75rem) / ${n})`,
          transform: `translateX(${idx * 100}%)`,
          transition: "transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "linear-gradient(180deg, var(--accent-soft), var(--accent))",
          boxShadow: "0 6px 16px -8px rgba(var(--glow), 0.7)",
        }}
      />
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={`relative z-10 flex-1 rounded-full px-1 py-2 text-xs font-semibold transition-colors sm:text-sm ${
            value === it.key ? "text-white" : "text-muted hover:text-fg"
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
