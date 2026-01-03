import { Mail, Terminal, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Mail,
    title: "Send to Plop",
    description:
      "Use qa+signup@in.plop.email as your test user's email address.",
  },
  {
    number: "02",
    icon: Terminal,
    title: "Fetch via API",
    description: "GET /v1/messages/latest returns the email as JSON instantly.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Assert in tests",
    description: "Extract OTP codes, verify links, and check content.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-white/12">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl text-white mb-4">
            Three steps to reliable email tests
          </h2>
          <p className="text-[#A3A7AE] text-lg max-w-2xl mx-auto">
            No mail server setup. No flaky waits. Just a simple API.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group bg-[#111418] border border-white/12 p-6 sm:p-8 hover:border-white/24 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-8 w-8 items-center justify-center border border-[#B8FF2C]/40 text-[#B8FF2C] text-sm font-semibold">
                  {step.number}
                </span>
                <step.icon className="w-6 h-6 text-[#B8FF2C]" />
              </div>
              <h3 className="font-heading text-xl text-white mb-2">
                {step.title}
              </h3>
              <p className="text-[#A3A7AE] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
