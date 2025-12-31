import Image from "next/image";
import Link from "next/link";
import { ArticleInView } from "@/components/article-in-view";
import { CustomMDX } from "@/components/mdx";
import { PostStatus } from "@/components/post-status";
import { GradientText } from "@/components/gradient-text";
import { cn } from "@plop/ui/cn";

interface ArticleMetadata {
  tag: string;
  title: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  publishedAt: string;
}

interface ArticleData {
  slug: string;
  metadata: ArticleMetadata;
  content: string;
}

interface ArticleProps {
  firstPost: boolean;
  data: ArticleData;
  className?: string;
}

function ArticleHeader({
  metadata,
  slug,
  firstPost,
}: {
  metadata: ArticleMetadata;
  slug: string;
  firstPost: boolean;
}) {
  return (
    <header className="space-y-4">
      <PostStatus status={metadata.tag} />
      <Link
        className="group/title"
        href={`/updates/${slug}`}
        prefetch={firstPost}
      >
        <GradientText as="h2" className="font-medium text-3xl sm:text-4xl">
          {metadata.title}
        </GradientText>
      </Link>
      <time
        dateTime={metadata.publishedAt}
        className="text-sm text-[#A3A7AE] block"
      >
        {new Date(metadata.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </time>
    </header>
  );
}

function ArticleImage({
  src,
  alt,
  imageWidth,
  imageHeight,
  firstPost,
}: {
  src: string;
  alt: string;
  imageWidth?: number;
  imageHeight?: number;
  firstPost: boolean;
}) {
  return (
    <div className="relative w-full my-8 group">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={src}
          alt=""
          fill
          className="object-cover scale-150 blur-3xl opacity-40 pointer-events-none"
          aria-hidden="true"
          priority={firstPost}
        />
      </div>
      <div className="relative z-10 flex justify-center py-8">
        <div className="max-w-[calc(100%-32px)]">
          <Image
            src={src}
            alt={alt}
            width={imageWidth || 960}
            height={imageHeight || 540}
            className="block w-auto h-auto max-h-[520px] border border-white/12 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
            priority={firstPost}
            sizes="(min-width: 1280px) 720px, (min-width: 1024px) 640px, (min-width: 768px) 560px, 100vw"
          />
        </div>
      </div>
    </div>
  );
}

export function Article({ data, firstPost, className }: ArticleProps) {
  return (
    <div
      id={data.slug}
      className={cn(
        "border border-white/12 bg-[#111418]/80 p-8 backdrop-blur first:mt-0 mt-16",
        className,
      )}
    >
      <article className="space-y-6">
        <ArticleInView slug={data.slug} />
        <ArticleHeader
          metadata={data.metadata}
          slug={data.slug}
          firstPost={firstPost}
        />

        {data.metadata.image && (
          <ArticleImage
            src={data.metadata.image}
            alt={data.metadata.title}
            imageWidth={data.metadata.imageWidth}
            imageHeight={data.metadata.imageHeight}
            firstPost={firstPost}
          />
        )}
        <div className="mt-6">
          <CustomMDX source={data.content} />
        </div>
      </article>
    </div>
  );
}
