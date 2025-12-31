"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface ArticleInViewProps {
  slug: string;
  className?: string;
}

export function ArticleInView({ slug, className }: ArticleInViewProps) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement | null>(null);
  const fullSlug = `/updates/${slug}`;

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (pathname === fullSlug) return;
        window.history.replaceState({ urlPath: fullSlug }, "", fullSlug);
        window.dispatchEvent(new PopStateEvent("popstate"));
      },
      { threshold: 0.5, rootMargin: "-120px 0px -40% 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fullSlug, pathname]);

  return <div ref={ref} className={className} />;
}
