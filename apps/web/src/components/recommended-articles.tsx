import Link from "next/link";
import Image from "next/image";
import { GradientText } from "@/components/gradient-text";
import { cn } from "@plop/ui/cn";

interface PostMetadata {
  title: string;
  image?: string;
  tag: string;
  summary: string;
  publishedAt: string;
}

interface RecommendedPost {
  slug: string;
  metadata: PostMetadata;
}

interface RecommendedArticlesProps {
  posts: RecommendedPost[];
  className?: string;
}

export function RecommendedArticles({
  posts,
  className,
}: RecommendedArticlesProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-12", className)}>
      <GradientText as="h2" className="text-3xl font-medium mb-8 text-center">
        More from the team
      </GradientText>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            href={`/updates/${post.slug}`}
            key={post.slug}
            className="block group"
          >
            <div className="border border-white/12 bg-[#111418]/80 p-6 hover:bg-[#171B21] transition-colors duration-300 space-y-4 h-full flex flex-col justify-between">
              <div>
                {post.metadata.image && (
                  <div className="relative aspect-video overflow-hidden border border-white/12 mb-4">
                    <Image
                      src={post.metadata.image}
                      alt={post.metadata.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white group-hover:text-[#B8FF2C] transition-colors mb-2">
                  {post.metadata.title}
                </h3>
              </div>
              <span className="inline-block bg-white/10 text-white/70 text-xs px-2 py-1 self-start">
                {post.metadata.tag}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
