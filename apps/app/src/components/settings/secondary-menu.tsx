"use client";

import { cn } from "@plop/ui/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SecondaryMenu({
  items,
}: {
  items: { title: string; href: string }[];
}) {
  const pathname = usePathname();
  const isActiveMenuItem = (href: string) => pathname.includes(href);

  return (
    <nav className="w-full min-w-0 py-2 sm:py-4">
      <div className="relative min-w-0">
        <ul className="flex min-w-0 max-w-full space-x-2 overflow-x-auto pb-1 text-sm whitespace-nowrap sm:space-x-4">
          {items.map((item) => (
            <li key={item.href} className="flex-shrink-0">
              <Link
                prefetch
                href={item.href}
                className={cn(
                  " px-3 py-2 sm:px-4 transition-colors hover:bg-muted/50 block",
                  isActiveMenuItem(item.href)
                    ? "bg-muted font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </nav>
  );
}
