import Link from "next/link";

export default function SiteHeader() {
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
        <div className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            Timer
          </Link>
          <Link
            href="/blog"
            className="rounded-full px-3 py-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            Blog
          </Link>
        </div>
      </nav>
    </header>
  );
}
