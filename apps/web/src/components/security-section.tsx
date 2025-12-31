import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@plop/ui/accordion";
import { Key, Shield } from "lucide-react";

const securityHighlights = [
  {
    title: "Private inboxes",
    description: "Mailboxes live inside your team and require an API key.",
    icon: Shield,
  },
  {
    title: "Scoped API keys",
    description: "Grant full access or lock a key to one mailbox.",
    icon: Shield,
  },
  {
    title: "Strict routing",
    description: "Unknown mailboxes are rejected and never stored.",
    icon: Key,
  },
];

export function SecuritySection() {
  return (
    <section
      id="security"
      className="relative overflow-hidden border-b border-white/12 bg-[#0B0D0F]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(184,255,44,0.12),transparent_55%)]" />
      <div className="relative mx-auto max-w-[1120px] px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Security
          </p>
          <h2 className="font-heading text-3xl lg:text-4xl text-white mt-4 mb-4">
            Secure by default.
          </h2>
          <p className="text-[#A3A7AE] text-lg max-w-2xl mx-auto">
            Every mailbox is protected with explicit auth, scoped access, and
            predictable routing rules.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {securityHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="border border-white/12 bg-[#111418] p-5 sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center bg-[#0B0D0F] text-[#B8FF2C]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-[#A3A7AE]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 border border-white/12 bg-[#0B0D0F]/60 p-5 sm:p-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="api-access" className="border-white/12">
              <AccordionTrigger className="text-white/70 hover:text-white hover:no-underline font-heading data-[state=open]:text-[#B8FF2C]">
                API key access
              </AccordionTrigger>
              <AccordionContent className="text-[#A3A7AE]">
                All reads require a Bearer API key from Team settings. Use it in
                the <code>Authorization</code> header.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="api-scopes" className="border-white/12">
              <AccordionTrigger className="text-white/70 hover:text-white hover:no-underline font-heading data-[state=open]:text-[#B8FF2C]">
                Scoped keys
              </AccordionTrigger>
              <AccordionContent className="text-[#A3A7AE]">
                Keys can be scoped to <code>api.full</code>,{" "}
                <code>email.full</code>, or <code>email.mailbox</code> so tests
                only access the mailboxes they need.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="mailbox-isolation"
              className="border-white/12"
            >
              <AccordionTrigger className="text-white/70 hover:text-white hover:no-underline font-heading data-[state=open]:text-[#B8FF2C]">
                Mailbox isolation
              </AccordionTrigger>
              <AccordionContent className="text-[#A3A7AE]">
                Mailbox filters keep access scoped to the inboxes you need.
                Requests for unknown mailboxes return 404 and never write data.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}
