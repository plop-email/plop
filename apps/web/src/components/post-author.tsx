import Image from "next/image";
import { PostCopyURL } from "@/components/post-copy-url";
import { cn } from "@plop/ui/cn";

interface Author {
  name: string;
  src: string;
  tagline: string;
}

const AUTHORS = {
  alex: {
    name: "Alex Vakhitov",
    src: "/alex.jpeg",
    tagline: "Founder & CEO, Plop",
  },
  team: {
    name: "Plop Team",
    src: "/logo.png",
    tagline: "Inbox automation for teams",
  },
} satisfies Record<string, Author>;

type AuthorKey = keyof typeof AUTHORS;

interface AuthorAvatarProps {
  src: string;
  name: string;
  className?: string;
}

function AuthorAvatar({ src, name, className }: AuthorAvatarProps) {
  return (
    <Image
      src={src}
      width={36}
      height={36}
      alt={name}
      className={cn(" border border-white/10", className)}
      quality={90}
    />
  );
}

interface AuthorInfoProps {
  name: string;
  tagline: string;
  className?: string;
}

function AuthorInfo({ name, tagline, className }: AuthorInfoProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="font-medium text-sm text-white">{name}</span>
      <span className="text-xs text-[#A3A7AE]">{tagline}</span>
    </div>
  );
}

interface PostAuthorProps {
  author: AuthorKey;
  className?: string;
}

export function PostAuthor({ author, className }: PostAuthorProps) {
  const authorData = AUTHORS[author] ?? AUTHORS.alex;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-6 mt-6 border-t border-white/12",
        className,
      )}
    >
      <div className="flex items-center space-x-3">
        <AuthorAvatar src={authorData.src} name={authorData.name} />
        <AuthorInfo name={authorData.name} tagline={authorData.tagline} />
      </div>
      <PostCopyURL />
    </div>
  );
}
