import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

const BASE_URL = "https://docs.plop.email";

export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => ({
    url: `${BASE_URL}/${page.slugs.join("/")}`,
    lastModified: new Date(),
  }));
}
