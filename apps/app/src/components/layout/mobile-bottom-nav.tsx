"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@plop/ui/cn";
import { navItems } from "./nav-items";

export function MobileBottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[calc(env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const active = isActive(item.url);
          const label = item.shortTitle ?? item.title;
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1  px-2 py-2 text-[11px] font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.icon ? (
                <item.icon
                  className={cn(
                    "size-5",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                />
              ) : null}
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
