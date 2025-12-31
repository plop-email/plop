import { Article } from "@/components/article";
import { UpdatesToolbar } from "@/components/updates-toolbar";
import { Section } from "@/components/section";
import { GradientText } from "@/components/gradient-text";
import { getBlogPosts } from "@/lib/blog";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Product Updates | plop.email",
  description:
    "Notes from the plop.email team on shipping inbox automation, API tooling, and developer workflows.",
  path: "/updates",
});

export default function Page() {
  const data = getBlogPosts();
  const sortedPosts = [...data].sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1;
    }
    return 1;
  });

  const posts = sortedPosts.map((post, index) => (
    <Article data={post} firstPost={index === 0} key={post.slug} />
  ));

  return (
    <div className="flex justify-center py-16 pb-24">
      <Section id="updates" noBorder>
        <div className="mb-12">
          <GradientText as="h1" className="text-4xl sm:text-5xl font-medium">
            Updates
          </GradientText>
          <p className="mt-4 text-[#A3A7AE] max-w-2xl">
            Product releases, engineering notes, and platform upgrades from the
            plop.email team.
          </p>
        </div>
        <div className="space-y-16">{posts}</div>
        <UpdatesToolbar
          posts={sortedPosts.map((post) => ({
            slug: post.slug,
            title: post.metadata.title,
          }))}
        />
      </Section>
    </div>
  );
}
