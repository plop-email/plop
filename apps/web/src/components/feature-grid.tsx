import { Key, Mail, Terminal } from "lucide-react";

const features = [
  {
    icon: Mail,
    title: "Mailboxes + tags",
    description:
      "Route flows with mailbox+tag addresses like qa+login@in.plop.email.",
  },
  {
    icon: Terminal,
    title: "REST API",
    description: "List, filter, and fetch emails. Poll for the latest message.",
  },
  {
    icon: Key,
    title: "Scoped API keys",
    description: "Full access, email-only, or mailbox-scoped keys.",
  },
];

export function FeatureGrid() {
  return (
    <section className="border-b border-white/12">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl text-white mb-4">
            Built for test automation
          </h2>
          <p className="text-[#A3A7AE] text-lg">
            Everything you need to test email flows in CI.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-[#111418] border border-white/12 p-6 sm:p-8 hover:border-white/24 transition-all"
            >
              <feature.icon className="w-8 h-8 text-[#B8FF2C] mb-4" />
              <h3 className="font-heading text-xl text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-[#A3A7AE] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
