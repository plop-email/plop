import { getBlogPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site";

export async function GET() {
  const posts = getBlogPosts();
  const sortedPosts = [...posts].sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime(),
  );

  const feedItems = sortedPosts.map((post) => {
    const url = `${siteConfig.url}/updates/${post.slug}`;
    const pubDate = new Date(post.metadata.publishedAt).toUTCString();
    const imageUrl = post.metadata.image
      ? `${siteConfig.url}${post.metadata.image}`
      : null;

    return `    <item>
      <title><![CDATA[${post.metadata.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.metadata.summary}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${siteConfig.author}</author>
      <category>${post.metadata.tag}</category>${
        imageUrl
          ? `
      <enclosure url="${imageUrl}" type="image/png" />`
          : ""
      }
    </item>`;
  });

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${siteConfig.name} - Product Updates</title>
    <link>${siteConfig.url}/updates</link>
    <description>Product releases, engineering notes, and platform upgrades from the plop.email team.</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteConfig.url}/logo.png</url>
      <title>${siteConfig.name}</title>
      <link>${siteConfig.url}</link>
    </image>
${feedItems.join("\n")}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
