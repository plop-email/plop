import type { ReactNode } from "react";
import { cn } from "@plop/ui/cn";
import { ContentHeader } from "./content-header";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <ContentHeader
      secondary={
        description ? (
          <p className="hidden text-sm text-muted-foreground sm:block sm:truncate">
            {description}
          </p>
        ) : null
      }
    >
      <div className={cn("flex min-w-0 items-center gap-4", className)}>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {title}
          </h1>
        </div>
        {children ? (
          <div className="flex shrink-0 items-center gap-2">{children}</div>
        ) : null}
      </div>
    </ContentHeader>
  );
}
