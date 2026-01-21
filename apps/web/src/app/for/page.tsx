import type { Metadata } from "next";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { CardGrid } from "@/components/card-grid";
import { personas } from "@/data/personas";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Email Testing for Your Team | plop.email",
  description:
    "Email testing solutions for QA teams, DevOps, startups, and SaaS companies. See how plop.email fits your workflow.",
  alternates: {
    canonical: `${siteConfig.url}/for`,
  },
  openGraph: {
    title: "Email Testing for Your Team | plop.email",
    description:
      "Email testing solutions for QA teams, DevOps, startups, and SaaS companies.",
    url: `${siteConfig.url}/for`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function PersonasPage() {
  const items = personas.map((p) => ({
    slug: p.slug,
    title: p.name,
    description: p.heroDescription.slice(0, 100) + "...",
    icon: p.icon,
  }));

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <Header />
      <main className="pt-32 pb-20">
        <Section>
          <PageHeader
            badge="Solutions"
            title="Email Testing for Your Team"
            description="Whether you're a QA engineer, DevOps lead, or startup founder—plop.email fits your workflow."
            className="mb-16"
          />
          <CardGrid items={items} basePath="/for" columns={2} />
        </Section>
      </main>
      <Footer />
    </div>
  );
}
