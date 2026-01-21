import { cn } from "@plop/ui/cn";
import * as Icons from "lucide-react";
import Link from "next/link";

interface CardItem {
  slug: string;
  title: string;
  description: string;
  icon?: string;
}

interface CardGridProps {
  items: CardItem[];
  basePath: string;
  columns?: 2 | 3;
}

export function CardGrid({ items, basePath, columns = 3 }: CardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {items.map((item) => {
        const IconComponent = item.icon
          ? (Icons[item.icon as keyof typeof Icons] as React.ComponentType<{
              className?: string;
            }>)
          : null;

        return (
          <Link
            key={item.slug}
            href={`${basePath}/${item.slug}`}
            className="group relative rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
          >
            {IconComponent && (
              <div className="mb-4 inline-flex rounded-lg bg-[#B8FF2C]/10 p-2.5">
                <IconComponent className="size-5 text-[#B8FF2C]" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#B8FF2C] transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {item.description}
            </p>
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Icons.ArrowRight className="size-4 text-[#B8FF2C]" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
