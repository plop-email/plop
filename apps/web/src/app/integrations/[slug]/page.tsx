import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CodeBlock } from "@/components/code-block";
import {
  integrations,
  getIntegration,
  getRelatedIntegrations,
} from "@/data/integrations";
import { getRelatedUseCases } from "@/data/use-cases";
import { siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return integrations.map((int) => ({ slug: int.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const integration = getIntegration(slug);
  if (!integration) return {};

  return {
    title: `${integration.name} Integration | plop.email`,
    description: integration.metaDescription,
    alternates: {
      canonical: `${siteConfig.url}/integrations/${slug}`,
    },
    openGraph: {
      title: `${integration.heroTitle} | plop.email`,
      description: integration.metaDescription,
      url: `${siteConfig.url}/integrations/${slug}`,
      siteName: siteConfig.name,
      type: "article",
    },
  };
}

export default async function IntegrationPage({ params }: PageProps) {
  const { slug } = await params;
  const integration = getIntegration(slug);

  if (!integration) {
    notFound();
  }

  const IconComponent = Icons[
    integration.icon as keyof typeof Icons
  ] as React.ComponentType<{
    className?: string;
  }>;

  const relatedIntegrations = getRelatedIntegrations(
    integration.relatedIntegrations,
  );
  const relatedUseCases = getRelatedUseCases(integration.relatedUseCases);

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <Header />
      <main className="pt-32 pb-20">
        {/* Breadcrumbs */}
        <Section noBorder className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Integrations", href: "/integrations" },
              { label: integration.name },
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
              {integration.heroTitle}
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              {integration.heroDescription}
            </p>
            {integration.docsUrl && (
              <a
                href={integration.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-[#B8FF2C] hover:underline"
              >
                {integration.name} Documentation
                <Icons.ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </Section>

        {/* Features */}
        <Section noBorder className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Features</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {integration.features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-5"
              >
                <h3 className="font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Installation */}
        <Section noBorder className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            {integration.installation.title}
          </h2>
          <CodeBlock code={integration.installation.code} language="bash" />
        </Section>

        {/* Quick Start */}
        <Section noBorder className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-2">
            {integration.quickStart.title}
          </h2>
          <p className="text-gray-400 mb-6">
            {integration.quickStart.description}
          </p>
          <CodeBlock
            code={integration.quickStart.code}
            language="typescript"
            title={integration.quickStart.title}
          />
        </Section>

        {/* Advanced Example */}
        <Section noBorder className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-2">
            {integration.advancedExample.title}
          </h2>
          <p className="text-gray-400 mb-6">
            {integration.advancedExample.description}
          </p>
          <CodeBlock
            code={integration.advancedExample.code}
            language="typescript"
            title={integration.advancedExample.title}
          />
        </Section>

        {/* Tips */}
        <Section noBorder className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Tips</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
            <ul className="space-y-3">
              {integration.tips.map((tip) => (
                <li key={tip} className="flex gap-3 text-gray-300">
                  <Icons.Lightbulb className="size-5 text-yellow-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Related */}
        <Section noBorder>
          <div className="grid md:grid-cols-2 gap-8">
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
          </div>
        </Section>

        {/* CTA */}
        <Section noBorder className="mt-16">
          <div className="rounded-xl border border-[#B8FF2C]/20 bg-[#B8FF2C]/5 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Start testing with {integration.name}
            </h2>
            <p className="text-gray-400 mb-6">
              Add email verification to your {integration.name} tests in
              minutes.
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
