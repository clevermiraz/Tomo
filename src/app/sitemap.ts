import type { MetadataRoute } from "next";
import { POSTS } from "./blog/posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tomo.lavlos.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/blog"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const posts = POSTS.map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...routes, ...posts];
}
