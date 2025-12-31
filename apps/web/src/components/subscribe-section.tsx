import { SubscribeForm } from "@/components/subscribe-form";

export function SubscribeSection() {
  return (
    <section id="subscribe" className="border-b border-white/12">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8 py-20">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">
              Stay in the loop
            </p>
            <h2 className="mt-4 font-heading text-3xl lg:text-4xl text-white">
              Product updates, inbox playbooks, and release notes.
            </h2>
            <p className="mt-4 text-[#A3A7AE] text-lg">
              One email per month. No spam. Unsubscribe whenever you want.
            </p>
          </div>
          <div className="border border-white/12 bg-[#111418] p-6">
            <SubscribeForm group="web-landing" placeholder="you@company.com" />
            <p className="mt-3 text-xs text-white/50">
              Join QA and product teams using plop.email.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
