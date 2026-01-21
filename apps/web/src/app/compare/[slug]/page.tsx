import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, X, Minus, ExternalLink, ArrowRight } from "lucide-react";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { comparisons, getComparison } from "@/data/comparisons";
import { siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) return {};

  return {
    title: `${comparison.title} | Email Testing Comparison`,
    description: comparison.metaDescription,
    alternates: {
      canonical: `${siteConfig.url}/compare/${slug}`,
    },
    openGraph: {
      title: comparison.title,
      description: comparison.metaDescription,
      url: `${siteConfig.url}/compare/${slug}`,
      siteName: siteConfig.name,
      type: "article",
    },
  };
}

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="size-5 text-green-400" />
    ) : (
      <X className="size-5 text-red-400" />
    );
  }
  return <span className="text-gray-300">{value}</span>;
}

function WinnerBadge({ winner }: { winner: "plop" | "competitor" | "tie" }) {
  if (winner === "tie") {
    return <Minus className="size-4 text-gray-500" />;
  }
  return winner === "plop" ? (
    <span className="text-xs font-medium text-[#B8FF2C]">Winner</span>
  ) : null;
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const comparison = getComparison(slug);

  if (!comparison) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <Header />
      <main className="pt-32 pb-20">
        {/* Breadcrumbs */}
        <Section noBorder className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Compare", href: "/compare" },
              { label: comparison.title },
            ]}
          />
        </Section>

        {/* Hero */}
        <Section noBorder className="mb-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              {comparison.heroTitle}
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-4">
              {comparison.heroDescription}
            </p>
            <a
              href={comparison.competitorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Visit {comparison.competitor}
              <ExternalLink className="size-3" />
            </a>
          </div>
        </Section>

        {/* Pricing Quick Compare */}
        <Section noBorder className="mb-16">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#B8FF2C]/20 bg-[#B8FF2C]/5 p-6">
              <h3 className="font-semibold text-[#B8FF2C] mb-3">plop.email</h3>
              <p className="text-white font-medium">
                {comparison.pricing.plop.free}
              </p>
              <p className="text-gray-400 text-sm">
                {comparison.pricing.plop.paid}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="font-semibold text-white mb-3">
                {comparison.competitor}
              </h3>
              <p className="text-white font-medium">
                {comparison.pricing.competitor.free}
              </p>
              <p className="text-gray-400 text-sm">
                {comparison.pricing.competitor.paid}
              </p>
            </div>
          </div>
        </Section>

        {/* Feature Comparison Table */}
        <Section noBorder className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Feature Comparison
          </h2>
          <div className="space-y-8">
            {comparison.features.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {category.category}
                </h3>
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Feature
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-[#B8FF2C]">
                          plop.email
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-gray-400">
                          {comparison.competitor}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.items.map((item, index) => (
                        <tr
                          key={item.feature}
                          className={
                            index !== category.items.length - 1
                              ? "border-b border-white/5"
                              : ""
                          }
                        >
                          <td className="p-4 text-white">{item.feature}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <FeatureValue value={item.plop} />
                              {item.winner === "plop" && (
                                <WinnerBadge winner="plop" />
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <FeatureValue value={item.competitor} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Verdict */}
        <Section noBorder className="mb-16">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              {comparison.verdict.title}
            </h2>
            <p className="text-gray-300 leading-relaxed mb-8">
              {comparison.verdict.description}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-[#B8FF2C] mb-3">
                  Choose plop.email if:
                </h3>
                <ul className="space-y-2">
                  {comparison.verdict.choosePlop.map((point) => (
                    <li key={point} className="flex gap-3 text-gray-300">
                      <Check className="size-5 text-[#B8FF2C] shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">
                  Choose {comparison.competitor} if:
                </h3>
                <ul className="space-y-2">
                  {comparison.verdict.chooseCompetitor.map((point) => (
                    <li key={point} className="flex gap-3 text-gray-300">
                      <ArrowRight className="size-5 text-gray-500 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* Advantages */}
        <Section noBorder className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[#B8FF2C] mb-4">
                plop.email Advantages
              </h3>
              <div className="space-y-4">
                {comparison.plopAdvantages.map((adv) => (
                  <div
                    key={adv.title}
                    className="rounded-lg border border-[#B8FF2C]/20 bg-[#B8FF2C]/5 p-4"
                  >
                    <h4 className="font-medium text-white mb-1">{adv.title}</h4>
                    <p className="text-sm text-gray-400">{adv.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {comparison.competitor} Advantages
              </h3>
              <div className="space-y-4">
                {comparison.competitorAdvantages.map((adv) => (
                  <div
                    key={adv.title}
                    className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
                  >
                    <h4 className="font-medium text-white mb-1">{adv.title}</h4>
                    <p className="text-sm text-gray-400">{adv.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* CTA */}
        <Section noBorder>
          <div className="rounded-xl border border-[#B8FF2C]/20 bg-[#B8FF2C]/5 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Try plop.email Free
            </h2>
            <p className="text-gray-400 mb-6">
              See for yourself. Get started in minutes with our free tier.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href={siteConfig.appUrl}
                className="inline-flex items-center justify-center rounded-lg bg-[#B8FF2C] px-6 py-3 text-sm font-semibold text-black hover:bg-[#a8ef1c] transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
              >
                More Comparisons
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
