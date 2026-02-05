import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { GradientText } from "@/components/gradient-text";
import { CustomMDX } from "@/components/mdx";
import { PostAuthor } from "@/components/post-author";
import { PostStatus } from "@/components/post-status";
import { RecommendedArticles } from "@/components/recommended-articles";
import { Section } from "@/components/section";
import { UpdatesToolbar } from "@/components/updates-toolbar";
import { getBlogPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site";
import { generateBreadcrumbSchema } from "@/lib/schema";

export async function generateStaticParams() {
  const posts = getBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const post = getBlogPosts().find((entry) => entry.slug === params.slug);
  if (!post) {
    return;
  }

  const { title, publishedAt, summary: description, image } = post.metadata;
  const url = `${siteConfig.url}/updates/${post.slug}`;
  const ogImage = image
    ? `${siteConfig.url}${image}`
    : `${siteConfig.url}/opengraph-image.png`;

  return {
    title: `${title} | plop.email`,
    description,
    authors: [{ name: siteConfig.author, url: "https://x.com/vahaah" }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: publishedAt,
      authors: [siteConfig.author],
      section: "Product Updates",
      url,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: siteConfig.twitter,
    },
  };
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const allPosts = getBlogPosts();
  const sortedPosts = [...allPosts].sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime(),
  );
  const post = sortedPosts.find((entry) => entry.slug === params.slug);

  if (!post) {
    notFound();
  }

  const recommendedPostsData = sortedPosts
    .filter((entry) => entry.slug !== post.slug)
    .slice(0, 3);

  // SAFETY: Schema.org JSON-LD using data from our own blog posts, not user input
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Updates", url: `${siteConfig.url}/updates` },
    { name: post.metadata.title },
  ]);

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    datePublished: post.metadata.publishedAt,
    dateModified: post.metadata.publishedAt,
    description: post.metadata.summary,
    image: post.metadata.image
      ? `${siteConfig.url}${post.metadata.image}`
      : `${siteConfig.url}/opengraph-image.png`,
    url: `${siteConfig.url}/updates/${post.slug}`,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: "https://x.com/vahaah",
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/updates/${post.slug}`,
    },
  };

  return (
    <div className="flex justify-center py-16 pb-24">
      {/* eslint-disable-next-line react/no-danger -- Schema.org structured data from trusted internal data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, blogPostingSchema]),
        }}
      />

      <Section id={post.slug} noBorder>
        <div className="border border-white/12 bg-[#111418]/80 p-8 backdrop-blur">
          <article className="space-y-6">
            <div className="space-y-4">
              <PostStatus status={post.metadata.tag} />
              <GradientText as="h1" className="font-medium text-4xl">
                {post.metadata.title}
              </GradientText>
              <time className="text-sm text-[#A3A7AE] block">
                {new Date(post.metadata.publishedAt).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </time>
            </div>

            {post.metadata.image && (
              <div className="relative w-full my-8 group">
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={post.metadata.image}
                    alt=""
                    fill
                    className="object-cover scale-150 blur-3xl opacity-40 pointer-events-none"
                    aria-hidden="true"
                    priority
                  />
                </div>

                <div className="relative z-10 flex justify-center py-10">
                  <div className="max-w-[calc(100%-40px)]">
                    <Image
                      src={post.metadata.image}
                      alt={post.metadata.title}
                      width={post.metadata.imageWidth || 960}
                      height={post.metadata.imageHeight || 540}
                      className="block w-auto h-auto max-h-[520px] border border-white/12 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                      priority
                    />
                  </div>
                </div>
              </div>
            )}

            <CustomMDX source={post.content} />

            <PostAuthor author="alex" />
          </article>
        </div>

        {recommendedPostsData.length > 0 && (
          <div className="mt-16">
            <RecommendedArticles posts={recommendedPostsData} />
          </div>
        )}
      </Section>
      <UpdatesToolbar
        posts={sortedPosts.map((entry) => ({
          slug: entry.slug,
          title: entry.metadata.title,
        }))}
      />
    </div>
  );
}
