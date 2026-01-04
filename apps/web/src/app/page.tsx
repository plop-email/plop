import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { FeatureGrid } from "@/components/feature-grid";
import { WorkflowTabs } from "@/components/workflow-tabs";
import { OpenSource } from "@/components/open-source";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0B0D0F]">
      <Header />
      <Hero />
      <HowItWorks />
      <FeatureGrid />
      <WorkflowTabs />
      <OpenSource />
      <PricingSection />
      <Footer />
    </main>
  );
}
