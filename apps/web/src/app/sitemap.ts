import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site";

export const baseUrl = siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split("T")[0];

  const posts = getBlogPosts().map((post) => ({
    url: `${baseUrl}/updates/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const routes = ["", "/updates", "/about"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: today,
  }));

  return [...routes, ...posts];
}
