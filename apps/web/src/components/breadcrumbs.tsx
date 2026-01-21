import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
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
  );
}
