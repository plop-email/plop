"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@plop/ui/cn";
import { UserMenu } from "./user-menu";

interface ContentHeaderProps extends PropsWithChildren {
  className?: string;
  secondary?: ReactNode;
}

export function ContentHeader({
  children,
  className,
  secondary,
}: ContentHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 border-b bg-background/90 backdrop-blur",
        className,
      )}
    >
      <div className="container mx-auto w-full overflow-x-hidden pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
        <header className="grid h-14 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 overflow-hidden">
          <div className="min-w-0">{children}</div>
          <div className="flex items-center justify-end">
            <UserMenu className="shrink-0" />
          </div>
        </header>
        {secondary ? <div className="min-w-0 pb-4">{secondary}</div> : null}
      </div>
    </div>
  );
}
