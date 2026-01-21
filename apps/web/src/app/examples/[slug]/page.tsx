import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CodeBlock } from "@/components/code-block";
import { examples, getExample, getRelatedExamples } from "@/data/examples";
import { getRelatedUseCases } from "@/data/use-cases";
import { getRelatedIntegrations } from "@/data/integrations";
import { siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return examples.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const example = getExample(slug);
  if (!example) return {};

  return {
    title: `${example.title} | Code Examples | plop.email`,
    description: example.metaDescription,
    alternates: {
      canonical: `${siteConfig.url}/examples/${slug}`,
    },
    openGraph: {
      title: `${example.title} | plop.email`,
      description: example.metaDescription,
      url: `${siteConfig.url}/examples/${slug}`,
      siteName: siteConfig.name,
      type: "article",
    },
  };
}

const difficultyColors = {
  beginner: "text-green-400 bg-green-400/10",
  intermediate: "text-yellow-400 bg-yellow-400/10",
  advanced: "text-red-400 bg-red-400/10",
};

export default async function ExamplePage({ params }: PageProps) {
  const { slug } = await params;
  const example = getExample(slug);

  if (!example) {
    notFound();
  }

  const IconComponent = Icons[
    example.icon as keyof typeof Icons
  ] as React.ComponentType<{
    className?: string;
  }>;

  const relatedExamples = getRelatedExamples(example.relatedExamples);
  const relatedUseCases = getRelatedUseCases(example.relatedUseCases);
  const relatedIntegrations = getRelatedIntegrations(
    example.relatedIntegrations,
  );

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <Header />
      <main className="pt-32 pb-20">
        {/* Breadcrumbs */}
        <Section noBorder className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Examples", href: "/examples" },
              { label: example.title },
            ]}
          />
        </Section>

        {/* Hero */}
        <Section noBorder className="mb-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="rounded-lg bg-[#B8FF2C]/10 p-3">
                {IconComponent && (
                  <IconComponent className="size-6 text-[#B8FF2C]" />
                )}
              </div>
              <div className="flex items-center gap-3">
                {example.framework && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                    {example.framework}
                  </span>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-sm capitalize ${
                    difficultyColors[example.difficulty]
                  }`}
                >
                  {example.difficulty}
                </span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              {example.title}
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              {example.description}
            </p>
          </div>
        </Section>

        {/* Code */}
        <Section noBorder className="mb-16">
          <div className="max-w-4xl">
            <CodeBlock
              code={example.code}
              language={example.language}
              title={`${example.title} (${example.language})`}
            />
          </div>
        </Section>

        {/* Explanation */}
        <Section noBorder className="mb-16">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
            <div className="grid gap-4">
              {example.explanation.map((section, index) => (
                <div
                  key={section.title}
                  className="rounded-lg border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#B8FF2C]/10 text-sm font-semibold text-[#B8FF2C]">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        {section.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Related */}
        <Section noBorder className="mb-16">
          <div className="max-w-4xl">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Related Examples */}
              {relatedExamples.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    More Examples
                  </h3>
                  <div className="space-y-2">
                    {relatedExamples.map((ex) => (
                      <Link
                        key={ex.slug}
                        href={`/examples/${ex.slug}`}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:border-white/20 hover:bg-white/[0.04] transition-colors"
                      >
                        <Icons.Code className="size-4 text-[#B8FF2C]" />
                        <span className="text-white text-sm">{ex.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Use Cases */}
              {relatedUseCases.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Use Cases
                  </h3>
                  <div className="space-y-2">
                    {relatedUseCases.map((uc) => (
                      <Link
                        key={uc.slug}
                        href={`/use-cases/${uc.slug}`}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:border-white/20 hover:bg-white/[0.04] transition-colors"
                      >
                        <Icons.ArrowRight className="size-4 text-[#B8FF2C]" />
                        <span className="text-white text-sm">{uc.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Integrations */}
              {relatedIntegrations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Integrations
                  </h3>
                  <div className="space-y-2">
                    {relatedIntegrations.map((int) => (
                      <Link
                        key={int.slug}
                        href={`/integrations/${int.slug}`}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:border-white/20 hover:bg-white/[0.04] transition-colors"
                      >
                        <Icons.Plug className="size-4 text-[#B8FF2C]" />
                        <span className="text-white text-sm">{int.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <Section noBorder>
          <div className="max-w-4xl mx-auto rounded-xl border border-[#B8FF2C]/20 bg-[#B8FF2C]/5 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Try This Example
            </h2>
            <p className="text-gray-400 mb-6">
              Get a free API key and test this example in minutes.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href={siteConfig.appUrl}
                className="inline-flex items-center justify-center rounded-lg bg-[#B8FF2C] px-6 py-3 text-sm font-semibold text-black hover:bg-[#a8ef1c] transition-colors"
              >
                Get API Key
              </Link>
              <Link
                href="/examples"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
              >
                More Examples
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
