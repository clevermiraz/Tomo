import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import { getPost, POSTS, type Block } from "../posts";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found — Tomo" };
  return {
    title: `${post.title} — Tomo`,
    description: post.excerpt,
  };
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={i} className="mt-9 mb-3 text-xl font-bold text-white sm:text-2xl">
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p key={i} className="mb-4 leading-relaxed text-white/70">
          {block.text}
        </p>
      );
    case "quote":
      return (
        <blockquote
          key={i}
          className="my-6 rounded-2xl border-l-4 border-[var(--accent)] bg-white/5 p-4 italic text-white/80"
        >
          “{block.text}”
          {block.cite ? (
            <footer className="mt-2 text-sm not-italic text-white/45">— {block.cite}</footer>
          ) : null}
        </blockquote>
      );
    case "ul":
      return (
        <ul key={i} className="mb-4 list-disc space-y-1.5 pl-5 text-white/70">
          {block.items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={i} className="mb-4 list-decimal space-y-1.5 pl-5 text-white/70">
          {block.items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ol>
      );
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-2xl px-5 pb-20 pt-28">
        <Link
          href="/blog"
          className="mb-8 inline-block text-sm text-white/50 transition-colors hover:text-white"
        >
          ← All articles
        </Link>

        <div className="mb-2 flex items-center gap-2 text-xs text-white/45">
          <span className="font-semibold text-[var(--accent-soft)]">{post.category}</span>
          <span>·</span>
          <span>{post.readMins} min read</span>
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-lg text-white/55">{post.excerpt}</p>

        <article className="mt-8">{post.body.map(renderBlock)}</article>

        <div className="card-3d mt-12 rounded-2xl p-6 text-center">
          <p className="text-lg font-bold">Ready to focus?</p>
          <p className="mt-1 text-sm text-white/55">
            Put it into practice with one 25-minute sprint.
          </p>
          <Link
            href="/"
            className="btn-3d btn-primary mt-4 inline-block px-6 py-3 text-sm font-bold text-white"
          >
            Open Tomo →
          </Link>
        </div>
      </main>
    </>
  );
}
