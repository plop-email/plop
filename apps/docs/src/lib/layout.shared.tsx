import Image from "next/image";
import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";

function DocsLogo() {
  return (
    <span className="flex items-center gap-2 text-fd-foreground">
      <Image src="/icon.png" alt="Plop" width={24} height={24} />
      <span className="text-sm font-medium">Plop Docs</span>
    </span>
  );
}

export function baseOptions(): Partial<DocsLayoutProps> {
  return {
    nav: {
      title: <DocsLogo />,
    },
    sidebar: {
      collapsible: true,
    },
  };
}
