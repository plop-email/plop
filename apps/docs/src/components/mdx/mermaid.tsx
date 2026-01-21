"use client";

import type { Mermaid as MermaidAPI } from "mermaid";
import { useTheme } from "next-themes";
import {
  type ComponentProps,
  type ReactElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

let mermaidInstance: MermaidAPI | null = null;
const svgCache = new Map<string, string>();

async function renderDiagram(
  id: string,
  definition: string,
  theme: string,
): Promise<string> {
  const cacheKey = `${id}-${theme}-${definition}`;
  const cached = svgCache.get(cacheKey);
  if (cached) return cached;

  if (!mermaidInstance) {
    mermaidInstance = (await import("mermaid")).default;
  }

  mermaidInstance.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    fontFamily: "inherit",
    theme: theme === "dark" ? "dark" : "default",
    themeCSS: "margin: 1.5rem auto 0;",
  });

  const { svg } = await mermaidInstance.render(id, definition);
  svgCache.set(cacheKey, svg);
  return svg;
}

export function Mermaid({
  chart,
  ...props
}: { chart: string } & ComponentProps<"div">): ReactElement {
  const id = useId().replace(/:/g, "-");
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const theme = resolvedTheme ?? "light";
    renderDiagram(`mermaid-${id}`, chart, theme)
      .then(setSvg)
      .catch(console.error);
  }, [id, chart, resolvedTheme, mounted]);

  if (!mounted) {
    return (
      <div
        className="flex h-32 items-center justify-center text-fd-muted-foreground"
        {...props}
      >
        Loading diagram...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
      {...props}
    />
  );
}
