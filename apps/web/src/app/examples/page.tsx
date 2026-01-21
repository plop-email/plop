import type { Metadata } from "next";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { CardGrid } from "@/components/card-grid";
import { examples } from "@/data/examples";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Code Examples | plop.email",
  description:
    "Copy-paste ready code examples for email testing with Playwright, Cypress, Jest, pytest, and more.",
  alternates: {
    canonical: `${siteConfig.url}/examples`,
  },
  openGraph: {
    title: "Email Testing Code Examples | plop.email",
    description:
      "Copy-paste ready code examples for email testing with Playwright, Cypress, Jest, pytest, and more.",
    url: `${siteConfig.url}/examples`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function ExamplesPage() {
  const items = examples.map((e) => ({
    slug: e.slug,
    title: e.title,
    description: e.description,
    icon: e.icon,
  }));

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <Header />
      <main className="pt-32 pb-20">
        <Section>
          <PageHeader
            badge="Examples"
            title="Code Examples"
            description="Copy-paste ready examples for email testing. Playwright, Cypress, Jest, pytest, and CI/CD workflows."
            className="mb-16"
          />
          <CardGrid items={items} basePath="/examples" columns={2} />
        </Section>
      </main>
      <Footer />
    </div>
  );
}
