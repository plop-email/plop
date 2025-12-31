import Image from "next/image";
import { cn } from "@plop/ui/cn";

export function Logo({
  withLabel = true,
  className,
}: {
  className?: string;
  withLabel?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 font-semibold text-foreground",
        className,
      )}
    >
      <span className="flex size-8 items-center justify-center bg-muted">
        <Image src="/logo.png" alt="Plop" width={24} height={24} />
      </span>
      {withLabel ? <span className="text-sm tracking-tight">Plop</span> : null}
    </span>
  );
}
