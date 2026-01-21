import { cn } from "@plop/ui/cn";

interface PageHeaderProps {
  badge?: string;
  title: string;
  description: string;
  className?: string;
}

export function PageHeader({
  badge,
  title,
  description,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("text-center max-w-3xl mx-auto", className)}>
      {badge && (
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-400 mb-4">
          {badge}
        </div>
      )}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
        {title}
      </h1>
      <p className="text-lg text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
