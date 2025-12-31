import { Key, LayoutDashboard, Mail, Terminal } from "lucide-react";

const features = [
  {
    icon: Mail,
    title: "Mailboxes + tags",
    description:
      "Route flows with mailbox+tag addresses like qa+login@in.plop.email.",
  },
  {
    icon: Terminal,
    title: "Messages API",
    description: "List, filter, and fetch the latest message for E2E polling.",
  },
  {
    icon: Key,
    title: "Scoped API keys",
    description: "Use api.full, email.full, or mailbox-scoped keys.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard + filters",
    description: "Manage mailboxes and browse inbox history in the app.",
  },
];

export function FeatureGrid() {
  return (
    <section className="border-b border-white/12">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8 py-20 sm:py-24">
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-[#111418] border border-white/12 p-6 sm:p-8 hover:border-white/24 transition-all cursor-pointer"
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
