import { cn } from "@plop/ui/cn";

interface PostStatusProps {
  status: string;
  className?: string;
  variant?: "lime" | "blue" | "neutral";
}

const STATUS_VARIANTS = {
  lime: "border-[#B8FF2C]/30 bg-[#B8FF2C]/10 text-[#B8FF2C]",
  blue: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  neutral: "border-white/12 bg-white/5 text-white/70",
} as const;

export function PostStatus({
  status,
  className,
  variant = "lime",
}: PostStatusProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border px-3 py-1 text-xs uppercase tracking-[0.2em] font-mono",
        STATUS_VARIANTS[variant],
        className,
      )}
    >
      {status}
    </div>
  );
}
