import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ScrollStory } from "@/components/scroll-story";
import { FeatureGrid } from "@/components/feature-grid";
import { DocsSection } from "@/components/docs-section";
import { WorkflowTabs } from "@/components/workflow-tabs";
import { SecuritySection } from "@/components/security-section";
import { PricingSection } from "@/components/pricing-section";
import { SubscribeSection } from "@/components/subscribe-section";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0B0D0F]">
      <Header />
      <Hero />
      <ScrollStory />
      <FeatureGrid />
      <DocsSection />
      <WorkflowTabs />
      <SecuritySection />
      <PricingSection />
      <SubscribeSection />
      <Footer />
    </main>
  );
}
