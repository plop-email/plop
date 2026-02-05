import { siteConfig } from "./site";

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  const baseItems = [{ name: "Home", url: siteConfig.url }];
  const allItems = [...baseItems, ...items];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

export interface HowToStep {
  name: string;
  text: string;
  url?: string;
}

export function generateHowToSchema({
  name,
  description,
  steps,
  totalTime,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(totalTime && { totalTime }),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: step.url }),
    })),
  };
}

export function generateArticleSchema({
  headline,
  description,
  datePublished,
  dateModified,
  image,
  url,
}: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    image: image || `${siteConfig.url}/opengraph-image.png`,
    url,
    author: {
      "@type": "Person",
      name: siteConfig.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
  };
}

export function generateComparisonSchema({
  name,
  description,
  items,
}: {
  name: string;
  description: string;
  items: Array<{ name: string; description: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      description: item.description,
    })),
  };
}
