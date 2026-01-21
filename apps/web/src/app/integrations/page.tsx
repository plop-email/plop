import type { Metadata } from "next";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { CardGrid } from "@/components/card-grid";
import { integrations } from "@/data/integrations";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Integrations | plop.email",
  description:
    "Integrate plop.email with Playwright, Cypress, Jest, pytest, Postman and more. Add email testing to your existing workflow.",
  alternates: {
    canonical: `${siteConfig.url}/integrations`,
  },
  openGraph: {
    title: "Email Testing Integrations | plop.email",
    description:
      "Integrate plop.email with Playwright, Cypress, Jest, pytest, Postman and more.",
    url: `${siteConfig.url}/integrations`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function IntegrationsPage() {
  const items = integrations.map((int) => ({
    slug: int.slug,
    title: int.name,
    description: int.description,
    icon: int.icon,
  }));

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <Header />
      <main className="pt-32 pb-20">
        <Section>
          <PageHeader
            badge="Integrations"
            title="Works With Your Stack"
            description="Add email testing to Playwright, Cypress, Jest, pytest, or any tool that can make HTTP requests."
            className="mb-16"
          />
          <CardGrid items={items} basePath="/integrations" columns={3} />
        </Section>
      </main>
      <Footer />
    </div>
  );
}
