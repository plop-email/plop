import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CodeBlock } from "@/components/code-block";
import {
  glossaryTerms,
  getGlossaryTerm,
  getRelatedTerms,
} from "@/data/glossary";
import { getRelatedUseCases } from "@/data/use-cases";
import { siteConfig } from "@/lib/site";
import { generateBreadcrumbSchema } from "@/lib/schema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return glossaryTerms.map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return {};

  return {
    title: `What is ${term.term}? | Email Testing Glossary | plop.email`,
    description: term.metaDescription,
    alternates: {
      canonical: `${siteConfig.url}/glossary/${slug}`,
    },
    openGraph: {
      title: `What is ${term.term}? | plop.email`,
      description: term.metaDescription,
      url: `${siteConfig.url}/glossary/${slug}`,
      siteName: siteConfig.name,
      type: "article",
    },
  };
}

function StructuredData({
  term,
  slug,
}: {
  term: { term: string; fullDefinition: string };
  slug: string;
}) {
  // SAFETY: Schema.org JSON-LD using data from our own glossary data file, not user input
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Glossary", url: `${siteConfig.url}/glossary` },
    { name: term.term },
  ]);

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.fullDefinition,
    url: `${siteConfig.url}/glossary/${slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Email Testing Glossary",
      url: `${siteConfig.url}/glossary`,
    },
  };

  // eslint-disable-next-line react/no-danger -- Schema.org structured data from trusted internal data
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([breadcrumbSchema, definedTermSchema]),
      }}
    />
  );
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);

  if (!term) {
    notFound();
  }

  const relatedTerms = getRelatedTerms(term.relatedTerms);
  const relatedUseCases = getRelatedUseCases(term.relatedUseCases);

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <StructuredData term={term} slug={slug} />
      <Header />
      <main className="pt-32 pb-20">
        {/* Breadcrumbs */}
        <Section noBorder className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Glossary", href: "/glossary" },
              { label: term.term },
            ]}
          />
        </Section>

        {/* Hero */}
        <Section noBorder className="mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-lg bg-[#B8FF2C]/10 p-3 mb-6">
              <BookOpen className="size-6 text-[#B8FF2C]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              What is {term.term}?
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              {term.fullDefinition}
            </p>
          </div>
        </Section>

        {/* Content Sections */}
        <Section noBorder className="mb-16">
          <div className="max-w-3xl space-y-12">
            {term.sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-2xl font-bold text-white mb-4">
                  {section.title}
                </h2>
                <div className="prose prose-invert prose-gray max-w-none">
                  {section.content.split("\n\n").map((paragraph, i) => {
                    // Handle code blocks in content
                    if (paragraph.startsWith("```")) {
                      const lines = paragraph.split("\n");
                      const code = lines.slice(1, -1).join("\n");
                      return (
                        <CodeBlock
                          key={`code-${i}`}
                          code={code}
                          language="typescript"
                        />
                      );
                    }
                    // Handle bullet lists
                    if (paragraph.includes("\n- ")) {
                      const [intro, ...items] = paragraph.split("\n- ");
                      return (
                        <div key={`list-${i}`}>
                          {intro && (
                            <p className="text-gray-300 mb-3">{intro}</p>
                          )}
                          <ul className="list-disc list-inside space-y-1 text-gray-300">
                            {items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                    // Handle headers within content
                    if (
                      paragraph.startsWith("**") &&
                      paragraph.endsWith("**")
                    ) {
                      return (
                        <h3
                          key={`header-${i}`}
                          className="text-lg font-semibold text-white mt-6 mb-2"
                        >
                          {paragraph.slice(2, -2)}
                        </h3>
                      );
                    }
                    return (
                      <p
                        key={`para-${i}`}
                        className="text-gray-300 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Example */}
        {term.example && (
          <Section noBorder className="mb-16">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-white mb-6">Example</h2>
              <CodeBlock
                code={term.example.code}
                language={term.example.language}
                title={term.example.title}
              />
            </div>
          </Section>
        )}

        {/* Related */}
        <Section noBorder>
          <div className="max-w-3xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Related Terms */}
              {relatedTerms.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Related Terms
                  </h3>
                  <div className="space-y-2">
                    {relatedTerms.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/glossary/${t.slug}`}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:border-white/20 hover:bg-white/[0.04] transition-colors"
                      >
                        <ArrowRight className="size-4 text-[#B8FF2C]" />
                        <span className="text-white">{t.term}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Use Cases */}
              {relatedUseCases.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Related Use Cases
                  </h3>
                  <div className="space-y-2">
                    {relatedUseCases.map((uc) => (
                      <Link
                        key={uc.slug}
                        href={`/use-cases/${uc.slug}`}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:border-white/20 hover:bg-white/[0.04] transition-colors"
                      >
                        <ArrowRight className="size-4 text-[#B8FF2C]" />
                        <span className="text-white">{uc.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <Section noBorder className="mt-16">
          <div className="max-w-3xl mx-auto rounded-xl border border-[#B8FF2C]/20 bg-[#B8FF2C]/5 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Try {term.term.toLowerCase()} with plop.email
            </h2>
            <p className="text-gray-400 mb-6">
              Get started with reliable email testing in minutes.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href={siteConfig.appUrl}
                className="inline-flex items-center justify-center rounded-lg bg-[#B8FF2C] px-6 py-3 text-sm font-semibold text-black hover:bg-[#a8ef1c] transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/glossary"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
              >
                Browse Glossary
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
