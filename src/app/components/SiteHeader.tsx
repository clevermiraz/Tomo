import Link from "next/link";
import { Sparkles, Sprout } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader({
  onOpenGarden,
  streak,
  onOpenPremium,
  premium,
}: {
  onOpenGarden?: () => void;
  streak?: number;
  onOpenPremium?: () => void;
  premium?: boolean;
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg text-base"
            style={{ background: "linear-gradient(180deg, var(--accent-soft), var(--accent))" }}
          >
            🍅
          </span>
          <span className="text-lg font-bold tracking-tight">Tomo</span>
        </Link>
        <div className="flex items-center gap-1.5 text-sm font-medium">
          {onOpenPremium ? (
            <button
              onClick={onOpenPremium}
              aria-label="Tomo Premium"
              className="press flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold text-white"
              style={
                premium
                  ? { background: "linear-gradient(180deg, var(--accent-soft), var(--accent))" }
                  : { background: "linear-gradient(180deg, #f5b942, #e8941f)" }
              }
            >
              <Sparkles size={14} />
              {premium ? "Premium" : "Go Premium"}
            </button>
          ) : null}
          <Link
            href="/"
            className="hidden rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-surface2 hover:text-fg sm:block"
          >
            Timer
          </Link>
          <Link
            href="/blog"
            className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-surface2 hover:text-fg"
          >
            Blog
          </Link>
          {onOpenGarden ? (
            <button
              onClick={onOpenGarden}
              aria-label="Focus garden"
              className="press flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1.5 text-fg/80 hover:text-fg"
            >
              <Sprout size={16} className="text-accent" />
              {streak ? <span className="text-xs font-bold">{streak}🔥</span> : null}
            </button>
          ) : null}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
