import Image from "next/image";
import { GradientText } from "@/components/gradient-text";
import { Section } from "@/components/section";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "About Plop - Inbox automation for teams",
  description:
    "Learn why Plop exists, how we think about inbox automation, and what we are building next.",
  path: "/about",
});

export default function Page() {
  return (
    <div className="flex justify-center py-16">
      <Section id="about">
        <div className="border border-white/12 bg-[#111418]/80 p-8 backdrop-blur">
          <GradientText
            as="h1"
            className="font-medium text-center text-4xl sm:text-5xl mb-16 leading-snug"
          >
            Keeping inbox automation boring, fast, and reliable
          </GradientText>

          <div className="space-y-12">
            <section>
              <GradientText as="h3" className="font-medium text-xl mb-4">
                Our Mission
              </GradientText>
              <p className="text-[#A3A7AE] leading-relaxed">
                Plop exists to make inbound email dependable for modern teams.
                Too often, email sits outside the product stack, making support
                flows, onboarding, and testing unpredictable. We are building a
                platform that lets teams route, store, and automate email with
                the same clarity they expect from the rest of their systems.
              </p>
            </section>

            <section>
              <GradientText as="h3" className="font-medium text-xl mb-4">
                Built for real workflows
              </GradientText>
              <p className="text-[#A3A7AE] leading-relaxed mb-8">
                We started with a simple goal: make it effortless to fetch the
                right email at the right time. That means deterministic inboxes,
                strong observability, and an API surface designed for automation
                rather than a traditional mail client.
              </p>
              <p className="text-[#A3A7AE] leading-relaxed">
                Whether you are shipping a product, running QA, or supporting a
                customer base, Plop keeps email workflows visible and
                repeatable, without standing up your own mail stack.
              </p>
            </section>

            <section>
              <div className="flex justify-center">
                <Image
                  src="/alex.jpeg"
                  width={450}
                  height={290}
                  alt="Alex Vakhitov"
                  className="border border-white/12"
                  priority
                />
              </div>
            </section>

            <div className="flex items-center pt-6 border-t border-white/12">
              <div className="space-y-1">
                <p className="text-sm text-[#A3A7AE]">Best regards,</p>
                <p className="font-medium text-white">Alex Vakhitov</p>
                <p className="text-sm text-[#A3A7AE]">
                  Founder &amp; CEO, Plop
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
