import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 mt-auto border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <span
            className="grid h-7 w-7 place-items-center rounded-lg text-sm"
            style={{ background: "linear-gradient(180deg, var(--accent-soft), var(--accent))" }}
          >
            🍅
          </span>
          <span className="text-sm font-semibold">Tomo</span>
          <span className="text-sm text-faint">· Your focus friend</span>
        </div>

        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-fg">
            Timer
          </Link>
          <Link href="/blog" className="transition-colors hover:text-fg">
            Blog
          </Link>
        </nav>

        <p className="text-xs text-faint">© {year} Tomo · Made with 🍅 &amp; focus</p>
      </div>
    </footer>
  );
}
