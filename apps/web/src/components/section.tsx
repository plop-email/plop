import { cn } from "@plop/ui/cn";
import type React from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  noBorder?: boolean;
  className?: string;
}

export function Section({
  id,
  children,
  className,
  noBorder = false,
  ...props
}: SectionProps) {
  return (
    <section id={id} className="w-full" {...props}>
      <div
        className={cn("mx-auto w-full max-w-[1120px] px-6 lg:px-8", className)}
      >
        <div
          className={cn(
            "w-full",
            !noBorder &&
              "border border-white/12 bg-[#111418]/80 backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.02)] p-6 md:p-8 lg:p-10",
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
