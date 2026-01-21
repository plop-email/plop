import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site";
import { useCases } from "@/data/use-cases";
import { integrations } from "@/data/integrations";
import { glossaryTerms } from "@/data/glossary";
import { comparisons } from "@/data/comparisons";
import { personas } from "@/data/personas";
import { examples } from "@/data/examples";

export const baseUrl = siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split("T")[0];

  // Blog posts
  const posts = getBlogPosts().map((post) => ({
    url: `${baseUrl}/updates/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  // Use cases
  const useCasePages = useCases.map((uc) => ({
    url: `${baseUrl}/use-cases/${uc.slug}`,
    lastModified: today,
  }));

  // Integrations
  const integrationPages = integrations.map((int) => ({
    url: `${baseUrl}/integrations/${int.slug}`,
    lastModified: today,
  }));

  // Glossary
  const glossaryPages = glossaryTerms.map((term) => ({
    url: `${baseUrl}/glossary/${term.slug}`,
    lastModified: today,
  }));

  // Comparisons
  const comparisonPages = comparisons.map((c) => ({
    url: `${baseUrl}/compare/${c.slug}`,
    lastModified: today,
  }));

  // Personas
  const personaPages = personas.map((p) => ({
    url: `${baseUrl}/for/${p.slug}`,
    lastModified: today,
  }));

  // Code Examples
  const examplePages = examples.map((e) => ({
    url: `${baseUrl}/examples/${e.slug}`,
    lastModified: today,
  }));

  // Static routes
  const routes = [
    "",
    "/updates",
    "/about",
    "/use-cases",
    "/integrations",
    "/glossary",
    "/compare",
    "/for",
    "/faq",
    "/examples",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: today,
  }));

  return [
    ...routes,
    ...posts,
    ...useCasePages,
    ...integrationPages,
    ...glossaryPages,
    ...comparisonPages,
    ...personaPages,
    ...examplePages,
  ];
}
