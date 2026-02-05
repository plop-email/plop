import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CodeBlock } from "@/components/code-block";
import { useCases, getUseCase, getRelatedUseCases } from "@/data/use-cases";
import { getRelatedIntegrations } from "@/data/integrations";
import { siteConfig } from "@/lib/site";
import { generateBreadcrumbSchema, generateArticleSchema } from "@/lib/schema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return useCases.map((uc) => ({ slug: uc.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const useCase = getUseCase(slug);
  if (!useCase) return {};

  return {
    title: `${useCase.title} | Email Testing Use Cases | plop.email`,
    description: useCase.metaDescription,
    alternates: {
      canonical: `${siteConfig.url}/use-cases/${slug}`,
    },
    openGraph: {
      title: `${useCase.heroTitle} | plop.email`,
      description: useCase.metaDescription,
      url: `${siteConfig.url}/use-cases/${slug}`,
      siteName: siteConfig.name,
      type: "article",
    },
  };
}

export default async function UseCasePage({ params }: PageProps) {
  const { slug } = await params;
  const useCase = getUseCase(slug);

  if (!useCase) {
    notFound();
  }

  const IconComponent = Icons[
    useCase.icon as keyof typeof Icons
  ] as React.ComponentType<{
    className?: string;
  }>;

  const relatedUseCases = getRelatedUseCases(useCase.relatedUseCases);
  const relatedIntegrations = getRelatedIntegrations(
    useCase.relatedIntegrations,
  );

  // SAFETY: Schema.org JSON-LD using data from our own use-cases data file, not user input
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Use Cases", url: `${siteConfig.url}/use-cases` },
    { name: useCase.title },
  ]);

  const articleSchema = generateArticleSchema({
    headline: useCase.heroTitle,
    description: useCase.metaDescription,
    datePublished: new Date().toISOString(),
    url: `${siteConfig.url}/use-cases/${slug}`,
  });

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      {/* eslint-disable-next-line react/no-danger -- Schema.org structured data from trusted internal data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema]),
        }}
      />
      <Header />
      <main className="pt-32 pb-20">
        {/* Breadcrumbs */}
        <Section noBorder className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Use Cases", href: "/use-cases" },
              { label: useCase.title },
            ]}
          />
        </Section>

        {/* Hero */}
        <Section noBorder className="mb-16">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-lg bg-[#B8FF2C]/10 p-3 mb-6">
              {IconComponent && (
                <IconComponent className="size-6 text-[#B8FF2C]" />
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              {useCase.heroTitle}
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              {useCase.heroDescription}
            </p>
          </div>
        </Section>

        {/* Problem / Solution */}
        <Section noBorder className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <h2 className="text-lg font-semibold text-red-400 mb-4">
                {useCase.problem.title}
              </h2>
              <ul className="space-y-3">
                {useCase.problem.points.map((point) => (
                  <li key={point} className="flex gap-3 text-gray-300">
                    <Icons.X className="size-5 text-red-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="rounded-xl border border-[#B8FF2C]/20 bg-[#B8FF2C]/5 p-6">
              <h2 className="text-lg font-semibold text-[#B8FF2C] mb-4">
                {useCase.solution.title}
              </h2>
              <ul className="space-y-3">
                {useCase.solution.points.map((point) => (
                  <li key={point} className="flex gap-3 text-gray-300">
                    <Icons.Check className="size-5 text-[#B8FF2C] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Code Example */}
        <Section noBorder className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Example</h2>
          <CodeBlock
            code={useCase.codeExample.code}
            language={useCase.codeExample.language}
            title={useCase.codeExample.title}
          />
        </Section>

        {/* Benefits */}
        <Section noBorder className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Benefits</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {useCase.benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-5"
              >
                <h3 className="font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Related */}
        <Section noBorder>
          <div className="grid md:grid-cols-2 gap-8">
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
                      <Icons.ArrowRight className="size-4 text-[#B8FF2C]" />
                      <span className="text-white">{uc.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Integrations */}
            {relatedIntegrations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Related Integrations
                </h3>
                <div className="space-y-2">
                  {relatedIntegrations.map((int) => (
                    <Link
                      key={int.slug}
                      href={`/integrations/${int.slug}`}
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:border-white/20 hover:bg-white/[0.04] transition-colors"
                    >
                      <Icons.ArrowRight className="size-4 text-[#B8FF2C]" />
                      <span className="text-white">{int.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* CTA */}
        <Section noBorder className="mt-16">
          <div className="rounded-xl border border-[#B8FF2C]/20 bg-[#B8FF2C]/5 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to test {useCase.title.toLowerCase()}?
            </h2>
            <p className="text-gray-400 mb-6">
              Get started with plop.email in minutes. No credit card required.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href={siteConfig.appUrl}
                className="inline-flex items-center justify-center rounded-lg bg-[#B8FF2C] px-6 py-3 text-sm font-semibold text-black hover:bg-[#a8ef1c] transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href={siteConfig.docsUrl}
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
              >
                Read Docs
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
