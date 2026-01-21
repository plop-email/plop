import type { Metadata } from "next";
import { Section } from "@/components/section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { CardGrid } from "@/components/card-grid";
import { useCases } from "@/data/use-cases";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Use Cases | plop.email",
  description:
    "Explore how teams use plop.email for E2E testing, transactional emails, magic links, and CI/CD pipelines.",
  alternates: {
    canonical: `${siteConfig.url}/use-cases`,
  },
  openGraph: {
    title: "Email Testing Use Cases | plop.email",
    description:
      "Explore how teams use plop.email for E2E testing, transactional emails, magic links, and CI/CD pipelines.",
    url: `${siteConfig.url}/use-cases`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function UseCasesPage() {
  const items = useCases.map((uc) => ({
    slug: uc.slug,
    title: uc.title,
    description: uc.description,
    icon: uc.icon,
  }));

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <Header />
      <main className="pt-32 pb-20">
        <Section>
          <PageHeader
            badge="Use Cases"
            title="Email Testing for Every Workflow"
            description="From E2E tests to CI/CD pipelines, see how teams use plop.email to test email flows reliably."
            className="mb-16"
          />
          <CardGrid items={items} basePath="/use-cases" columns={3} />
        </Section>
      </main>
      <Footer />
    </div>
  );
}
