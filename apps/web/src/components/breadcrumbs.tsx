import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteConfig.url,
    },
    ...items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: item.label,
      ...(item.href && { item: `${siteConfig.url}${item.href}` }),
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const jsonLd = generateBreadcrumbJsonLd(items);

  return (
    <>
      <script
        type="application/ld+json"
        // Safe: JSON-LD generated from trusted internal data, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-gray-400"
      >
        <Link
          href="/"
          className="hover:text-white transition-colors"
          aria-label="Home"
        >
          <Home className="size-4" />
        </Link>
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <ChevronRight className="size-4 text-gray-600" />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-white">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
