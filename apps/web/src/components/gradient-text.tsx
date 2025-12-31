import type React from "react";
import { cn } from "@plop/ui/cn";

interface GradientTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  className?: string;
}

export function GradientText({
  as: Component = "span",
  className,
  ...props
}: GradientTextProps) {
  return (
    <Component
      className={cn(
        "bg-gradient-to-r from-white via-white to-[#A3A7AE] bg-clip-text text-transparent",
        className,
      )}
      {...props}
    />
  );
}
