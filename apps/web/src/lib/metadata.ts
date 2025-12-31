import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  path = "",
  ogImage = "/opengraph-image.png",
  noIndex = false,
}: GenerateMetadataProps = {}): Metadata {
  const baseUrl = siteConfig.url;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${baseUrl}${normalizedPath}`;

  const defaultTitle = "plop.email - Test emails. Extract data. Ship faster.";
  const defaultDescription = siteConfig.description;

  const defaultKeywords = [
    "inbox automation",
    "email testing",
    "email API",
    "QA automation",
    "mailbox routing",
    "transactional email",
    "email webhooks",
    "developer tools",
    "E2E testing",
    "email parsing",
    "email storage",
    "mailbox tags",
  ];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      absolute: title || defaultTitle,
      default: defaultTitle,
      template: "%s | plop.email",
    },
    applicationName: siteConfig.name,
    description: description || defaultDescription,
    alternates: {
      canonical: normalizedPath || "/",
      languages: {
        "en-GB": normalizedPath || "/",
      },
    },
    openGraph: {
      title: title || defaultTitle,
      description: description || defaultDescription,
      url: fullUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "plop.email - Inbox automation for teams",
        },
      ],
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title || defaultTitle,
      description: description || defaultDescription,
      images: [{ url: ogImage }],
      creator: siteConfig.twitter,
      site: siteConfig.twitter,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.publisher,
    keywords: defaultKeywords,
    icons: {
      icon: "/favicon.ico",
      apple: "/logo.png",
    },
  };
}

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#org`,
      name: siteConfig.name,
      legalName: siteConfig.legalName,
      url: siteConfig.url,
      logo: `${siteConfig.url}/logo.png`,
      identifier: {
        "@type": "PropertyValue",
        propertyID: "Company Number",
        value: siteConfig.companyNumber,
      },
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.author,
      sameAs: ["https://x.com/vahaah"],
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: "en-GB",
      publisher: {
        "@id": `${siteConfig.url}/#org`,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteConfig.url}/#app`,
      name: siteConfig.name,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description: siteConfig.description,
      url: siteConfig.url,
      image: `${siteConfig.url}/logo.png`,
      author: {
        "@id": `${siteConfig.url}/#person`,
      },
      provider: {
        "@id": `${siteConfig.url}/#org`,
      },
      category: "Inbox automation and email tooling",
      applicationSubCategory: "Email testing and inbox automation",
    },
  ],
};
