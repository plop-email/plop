import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { personas, getPersona, getRelatedPersonas } from "@/data/personas";
import { getRelatedUseCases } from "@/data/use-cases";
import { siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return personas.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const persona = getPersona(slug);
  if (!persona) return {};

  return {
    title: `${persona.title} | plop.email`,
    description: persona.metaDescription,
    alternates: {
      canonical: `${siteConfig.url}/for/${slug}`,
    },
    openGraph: {
      title: persona.title,
      description: persona.metaDescription,
      url: `${siteConfig.url}/for/${slug}`,
      siteName: siteConfig.name,
      type: "article",
    },
  };
}

export default async function PersonaPage({ params }: PageProps) {
  const { slug } = await params;
  const persona = getPersona(slug);

  if (!persona) {
    notFound();
  }

  const IconComponent = Icons[
    persona.icon as keyof typeof Icons
  ] as React.ComponentType<{
    className?: string;
  }>;

  const relatedUseCases = getRelatedUseCases(persona.useCases);
  const relatedPersonas = getRelatedPersonas(persona.relatedPersonas);

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <Header />
      <main className="pt-32 pb-20">
        {/* Breadcrumbs */}
        <Section noBorder className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Solutions", href: "/for" },
              { label: persona.name },
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
              {persona.heroTitle}
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              {persona.heroDescription}
            </p>
          </div>
        </Section>

        {/* Pain Points → Solutions */}
        <Section noBorder className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pain Points */}
            <div>
              <h2 className="text-xl font-semibold text-red-400 mb-6">
                The Challenges
              </h2>
              <div className="space-y-4">
                {persona.painPoints.map((point) => (
                  <div
                    key={point.title}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 p-4"
                  >
                    <h3 className="font-medium text-white mb-1">
                      {point.title}
                    </h3>
                    <p className="text-sm text-gray-400">{point.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h2 className="text-xl font-semibold text-[#B8FF2C] mb-6">
                How plop.email Helps
              </h2>
              <div className="space-y-4">
                {persona.solutions.map((solution) => (
                  <div
                    key={solution.title}
                    className="rounded-lg border border-[#B8FF2C]/20 bg-[#B8FF2C]/5 p-4"
                  >
                    <h3 className="font-medium text-white mb-1">
                      {solution.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {solution.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Related Use Cases */}
        {relatedUseCases.length > 0 && (
          <Section noBorder className="mb-16">
            <h2 className="text-xl font-semibold text-white mb-6">
              Popular Use Cases for {persona.name}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedUseCases.map((uc) => {
                const UseCaseIcon = Icons[
                  uc.icon as keyof typeof Icons
                ] as React.ComponentType<{
                  className?: string;
                }>;
                return (
                  <Link
                    key={uc.slug}
                    href={`/use-cases/${uc.slug}`}
                    className="group rounded-lg border border-white/10 bg-white/[0.02] p-4 hover:border-white/20 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {UseCaseIcon && (
                        <UseCaseIcon className="size-5 text-[#B8FF2C]" />
                      )}
                      <h3 className="font-medium text-white group-hover:text-[#B8FF2C] transition-colors">
                        {uc.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400">{uc.description}</p>
                  </Link>
                );
              })}
            </div>
          </Section>
        )}

        {/* Related Personas */}
        {relatedPersonas.length > 0 && (
          <Section noBorder className="mb-16">
            <h2 className="text-lg font-semibold text-white mb-4">
              Also Explore
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedPersonas.map((p) => (
                <Link
                  key={p.slug}
                  href={`/for/${p.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-gray-300 hover:border-white/20 hover:text-white transition-colors"
                >
                  {p.name}
                  <Icons.ArrowRight className="size-3" />
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* CTA */}
        <Section noBorder>
          <div className="rounded-xl border border-[#B8FF2C]/20 bg-[#B8FF2C]/5 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              {persona.cta.title}
            </h2>
            <p className="text-gray-400 mb-6">{persona.cta.description}</p>
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
                View Documentation
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
