import { PLAN_CATALOG, formatUsd, getMonthlyEquivalent } from "@plop/billing";
import { Button } from "@plop/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site";

const plans = [PLAN_CATALOG.starter, PLAN_CATALOG.pro, PLAN_CATALOG.enterprise];

export function PricingSection() {
  return (
    <section id="get-started" className="border-b border-white/12">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl text-white mb-4">
            Pricing that scales with your inboxes.
          </h2>
          <p className="text-[#A3A7AE] text-lg">
            Start lightweight, then add mailboxes as you grow.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const monthlyEquivalent = getMonthlyEquivalent(plan.tier);
            const isComingSoon = plan.comingSoon;
            const ctaHref = `${siteConfig.appUrl}/sign-up?plan=${plan.tier}`;

            return (
              <div
                key={plan.tier}
                className={`flex flex-col  border border-white/12 bg-[#111418] p-6 ${
                  plan.tier === "pro" ? "shadow-[0_0_0_1px_#B8FF2C40]" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-2xl text-white">
                    {plan.name}
                  </h3>
                  {isComingSoon && (
                    <span className="bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-[#A3A7AE]">
                  {plan.shortDescription}
                </p>

                <div className="mt-6">
                  {isComingSoon ? (
                    <div className="text-2xl font-semibold text-white">
                      Contact us
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-semibold text-white">
                        {formatUsd(monthlyEquivalent)}
                        <span className="text-base font-normal text-[#A3A7AE]">
                          /mo
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#A3A7AE]">
                        Billed yearly ({formatUsd(plan.pricing.yearly)} / year)
                      </p>
                      <p className="text-xs text-[#A3A7AE]">
                        or {formatUsd(plan.pricing.monthly)} billed monthly
                      </p>
                    </>
                  )}
                </div>

                <ul className="mt-6 space-y-2 text-sm text-[#A3A7AE]">
                  {plan.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-[#B8FF2C]" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {isComingSoon ? (
                    <Button
                      className="w-full bg-white/10 text-white hover:bg-white/25"
                      disabled
                    >
                      Join waitlist
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className={`w-full font-semibold ${
                        plan.tier === "pro"
                          ? "bg-[#B8FF2C] text-[#0B0D0F] hover:bg-[#B8FF2C]/90"
                          : "bg-white/10 text-white hover:bg-white/25"
                      }`}
                    >
                      <Link
                        href={ctaHref}
                        className="inline-flex items-center gap-2"
                      >
                        Start {plan.name}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-[#A3A7AE]">
          All plans include unlimited tags and API access. Taxes may apply.
        </div>
      </div>
    </section>
  );
}
