import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { faqItems, getAllFAQCategories } from "@/data/faq";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ | plop.email",
  description:
    "Frequently asked questions about plop.email. Learn about pricing, features, security, and how to get started with email testing.",
  alternates: {
    canonical: `${siteConfig.url}/faq`,
  },
  openGraph: {
    title: "FAQ | plop.email",
    description:
      "Frequently asked questions about plop.email email testing service.",
    url: `${siteConfig.url}/faq`,
    siteName: siteConfig.name,
    type: "website",
  },
};

function FAQStructuredData() {
  // SAFETY: Schema.org JSON-LD using data from our own FAQ data file, not user input
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- Schema.org structured data from trusted internal data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}

const categoryLabels: Record<string, string> = {
  general: "General",
  pricing: "Pricing",
  technical: "Technical",
  security: "Security",
};

export default function FAQPage() {
  const categories = getAllFAQCategories();

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <FAQStructuredData />
      <Header />
      <main className="pt-32 pb-20">
        <Section>
          <PageHeader
            badge="FAQ"
            title="Frequently Asked Questions"
            description="Everything you need to know about plop.email. Can't find what you're looking for? Contact us."
            className="mb-16"
          />

          <div className="max-w-3xl mx-auto">
            {categories.map((category) => {
              const categoryItems = faqItems.filter(
                (item) => item.category === category,
              );

              return (
                <div key={category} className="mb-12">
                  <h2 className="text-xl font-semibold text-white mb-6">
                    {categoryLabels[category]}
                  </h2>
                  <div className="space-y-4">
                    {categoryItems.map((item) => (
                      <details
                        key={item.question}
                        className="group rounded-xl border border-white/10 bg-white/[0.02]"
                      >
                        <summary className="flex cursor-pointer items-center justify-between p-6 text-white font-medium hover:text-[#B8FF2C] transition-colors list-none">
                          {item.question}
                          <span className="ml-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                            <svg
                              className="size-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                          {item.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Still have questions */}
          <div className="max-w-3xl mx-auto mt-16">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <h2 className="text-xl font-semibold text-white mb-3">
                Still have questions?
              </h2>
              <p className="text-gray-400 mb-6">
                Can't find the answer you're looking for? We're here to help.
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href={`mailto:support@${siteConfig.url.replace("https://", "")}`}
                  className="inline-flex items-center justify-center rounded-lg bg-[#B8FF2C] px-6 py-3 text-sm font-semibold text-black hover:bg-[#a8ef1c] transition-colors"
                >
                  Contact Support
                </a>
                <Link
                  href={siteConfig.docsUrl}
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                >
                  Read Docs
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
