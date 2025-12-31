import { cn } from "@plop/ui/cn";
import Image from "next/image";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
}

interface UserAvatarProps {
  name: string;
  email?: string | null;
  src?: string | null;
  className?: string;
}

export function UserAvatar({ name, email, src, className }: UserAvatarProps) {
  const displayName = name || email || "User";
  const initials = getInitials(displayName);

  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden  bg-muted text-xs font-semibold text-muted-foreground",
        className,
      )}
      aria-hidden
    >
      {src ? (
        <Image
          src={src}
          alt={displayName}
          width={36}
          height={36}
          sizes="36px"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          unoptimized
        />
      ) : (
        initials
      )}
    </span>
  );
}
