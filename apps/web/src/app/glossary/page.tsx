import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { glossaryTerms } from "@/data/glossary";
import { siteConfig } from "@/lib/site";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Email Testing Glossary | plop.email",
  description:
    "Learn email testing terminology: SMTP testing, email deliverability, mailbox routing, email APIs, and more.",
  alternates: {
    canonical: `${siteConfig.url}/glossary`,
  },
  openGraph: {
    title: "Email Testing Glossary | plop.email",
    description:
      "Learn email testing terminology: SMTP testing, email deliverability, mailbox routing, and more.",
    url: `${siteConfig.url}/glossary`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function GlossaryPage() {
  // Sort terms alphabetically
  const sortedTerms = [...glossaryTerms].sort((a, b) =>
    a.term.localeCompare(b.term),
  );

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <Header />
      <main className="pt-32 pb-20">
        <Section>
          <PageHeader
            badge="Glossary"
            title="Email Testing Terminology"
            description="Everything you need to know about email testing, from SMTP basics to advanced API concepts."
            className="mb-16"
          />

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {sortedTerms.map((term) => (
                <Link
                  key={term.slug}
                  href={`/glossary/${term.slug}`}
                  className="group block rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-[#B8FF2C] transition-colors">
                        {term.term}
                      </h2>
                      <p className="text-gray-400 leading-relaxed">
                        {term.shortDefinition}
                      </p>
                    </div>
                    <ArrowRight className="size-5 text-gray-600 group-hover:text-[#B8FF2C] transition-colors shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
