import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import { POSTS } from "./posts";

export const metadata: Metadata = {
  title: "Blog — Tomo",
  description:
    "Focus, productivity, and the Pomodoro Technique — practical guides and inspiration from Tomo, your focus friend.",
};

export default function BlogIndex() {
  return (
    <>
      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-3xl px-5 pb-20 pt-28">
        <header className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-white/40">
            The Tomo Journal
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Focus better. Live better.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/55">
            Guides and ideas on the Pomodoro Technique, deep work, and building a
            calmer, more productive day with Tomo.
          </p>
        </header>

        <div className="space-y-4">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card-3d group block rounded-2xl p-5 transition-transform hover:-translate-y-1 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl"
                  style={{ background: "linear-gradient(180deg, var(--accent-soft), var(--accent))" }}
                >
                  {post.emoji}
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2 text-xs text-white/45">
                    <span className="font-semibold text-[var(--accent-soft)]">
                      {post.category}
                    </span>
                    <span>·</span>
                    <span>{post.readMins} min read</span>
                  </div>
                  <h2 className="text-lg font-bold leading-snug group-hover:text-white">
                    {post.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-white/55">{post.excerpt}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="btn-3d btn-primary inline-block px-6 py-3 text-sm font-bold text-white"
          >
            Start focusing with Tomo →
          </Link>
        </div>
      </main>
    </>
  );
}
