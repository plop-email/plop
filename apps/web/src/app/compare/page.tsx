import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { comparisons } from "@/data/comparisons";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Compare plop.email vs Alternatives | plop.email",
  description:
    "Compare plop.email with Mailosaur, Mailtrap, MailHog and other email testing tools. See features, pricing, and which is right for you.",
  alternates: {
    canonical: `${siteConfig.url}/compare`,
  },
  openGraph: {
    title: "plop.email vs Alternatives | Email Testing Comparison",
    description:
      "Compare plop.email with Mailosaur, Mailtrap, MailHog and other email testing tools.",
    url: `${siteConfig.url}/compare`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <Header />
      <main className="pt-32 pb-20">
        <Section>
          <PageHeader
            badge="Comparisons"
            title="plop.email vs Alternatives"
            description="See how plop.email compares to other email testing tools. Honest, detailed breakdowns to help you choose."
            className="mb-16"
          />

          <div className="max-w-3xl mx-auto space-y-4">
            {comparisons.map((comparison) => (
              <Link
                key={comparison.slug}
                href={`/compare/${comparison.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-[#B8FF2C]/10 p-3">
                    <Scale className="size-5 text-[#B8FF2C]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white group-hover:text-[#B8FF2C] transition-colors">
                      {comparison.title}
                    </h2>
                    <p className="text-sm text-gray-400">
                      Compare features, pricing, and use cases
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-5 text-gray-600 group-hover:text-[#B8FF2C] transition-colors" />
              </Link>
            ))}
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
