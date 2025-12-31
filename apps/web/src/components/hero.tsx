"use client";

import { PLAN_CATALOG, formatUsd, getMonthlyEquivalent } from "@plop/billing";
import { Button } from "@plop/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@plop/ui/tooltip";
import { Check, Copy, Info, Terminal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Hero() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const starterPlan = PLAN_CATALOG.starter;
  const starterMonthly = formatUsd(getMonthlyEquivalent(starterPlan.tier));

  const example = {
    mailbox: "qa",
    tag: "signup",
    subject: "Confirm your email",
    from: "hello@acme.co",
    snippet: "Verification code: 482913.",
    messageId: "7d19c3e2-5e2a-4c83-8e41-5201f97b7e5e",
    mailboxId: "7e0a7c63-2eab-4bb1-9d64-8a443d6b9e2a",
  };

  const address = `${example.mailbox}+${example.tag}@in.plop.email`;
  const apiRequest = `GET /v1/messages/latest?mailbox=${example.mailbox}&tag=${example.tag}\nAuthorization: Bearer $PLOP_API_KEY`;
  const apiResponse = `{\n  "data": {\n    "id": "${example.messageId}",\n    "from": "${example.from}",\n    "to": "${address}",\n    "subject": "${example.subject}",\n    "receivedAt": "2025-12-25T10:12:31Z"\n  }\n}`;
  const fullApiResponse = `{\n  "data": {\n    "id": "${example.messageId}",\n    "mailboxId": "${example.mailboxId}",\n    "mailbox": "${example.mailbox}",\n    "mailboxWithTag": "${example.mailbox}+${example.tag}",\n    "tag": "${example.tag}",\n    "from": "${example.from}",\n    "to": "${address}",\n    "subject": "${example.subject}",\n    "receivedAt": "2025-12-25T10:12:31Z",\n    "headers": [\n      {\n        "name": "Message-Id",\n        "value": "<${example.messageId}@acme.co>"\n      },\n      {\n        "name": "X-Request-Id",\n        "value": "req_9b4c"\n      }\n    ],\n    "htmlContent": "<p>Verification code: <strong>482913</strong>.</p>",\n    "textContent": "${example.snippet}",\n    "domain": "in.plop.email",\n    "tenantSubdomain": null\n  }\n}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast({
      description: "Copied",
      duration: 1200,
    });
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="relative overflow-hidden border-b border-white/12">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-start">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl leading-[1.0] text-white text-balance mb-6">
              Catch broken emails before your users do.
            </h1>
            <p className="text-[#A3A7AE] text-base sm:text-lg leading-relaxed mb-6 text-pretty">
              {starterPlan.entitlements.mailboxes} mailbox
              {starterPlan.entitlements.mailboxes === 1 ? "" : "es"} +{" "}
              {starterPlan.entitlements.emailsPerMonth?.toLocaleString() ??
                "5,000"}{" "}
              emails/mo included. Fetch the latest message in one API call.
            </p>
            <div className="flex flex-wrap gap-3 mb-6 justify-center lg:justify-start">
              <span className="border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                Starter includes {starterPlan.entitlements.mailboxes} mailbox
              </span>
              <span className="border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                {starterPlan.entitlements.emailsPerMonth?.toLocaleString()}{" "}
                emails/mo
              </span>
              <span className="border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                From {starterMonthly}/mo billed yearly
              </span>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#B8FF2C] text-[#0B0D0F] hover:bg-[#B8FF2C]/90 font-semibold hover:translate-y-[-2px] transition-all"
                asChild
              >
                <Link href="#get-started">Start testing</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/12 text-white hover:bg-white/20 hover:border-white/30 bg-transparent"
                asChild
              >
                <Link href="#docs">Read docs</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-[#A3A7AE] text-center lg:text-left">
              Unlimited tags included on every plan.
            </p>
          </div>

          {/* Right: Flow Panel */}
          <div className="bg-[#111418] border border-white/12 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 text-center sm:text-left">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#A3A7AE]">
                  Try it
                </p>
                <h3 className="font-heading text-white text-lg">
                  Email in → JSON out
                </h3>
                <p className="text-xs text-[#A3A7AE]">
                  Three steps to reliable inbox tests.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/80 self-center sm:self-auto">
                <Terminal className="w-4 h-4" />
                API-ready
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-white/12 bg-[#0B0D0F] px-3 sm:px-4 py-3">
                <div className="flex items-center justify-between text-xs text-[#A3A7AE]">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center border border-[#B8FF2C]/40 text-[#B8FF2C] text-[11px] font-semibold">
                      1
                    </span>
                    Create a user with this email
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-[#A3A7AE] hover:text-white transition-colors"
                    aria-label="Copy address"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#B8FF2C]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <code className="mt-2 block text-white font-mono text-[12px] sm:text-[13px] break-all">
                  {address}
                </code>
              </div>

              <div className="border border-white/12 bg-[#0B0D0F] px-3 sm:px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-[#A3A7AE] mb-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center border border-[#B8FF2C]/40 text-[#B8FF2C] text-[11px] font-semibold">
                    2
                  </span>
                  Latest message
                </div>
                <div className="text-sm text-white font-medium">
                  {example.subject}
                </div>
                <div className="text-xs text-[#A3A7AE] mt-1">
                  {example.from} · {example.snippet}
                </div>
              </div>

              <div className="border border-white/12 bg-[#0B0D0F] px-3 sm:px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-[#A3A7AE] mb-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center border border-[#B8FF2C]/40 text-[#B8FF2C] text-[11px] font-semibold">
                    3
                  </span>
                  Fetch with your API token
                </div>
                <p className="text-[11px] text-[#A3A7AE] mb-3">
                  Get it in Settings → API keys.
                </p>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-[#A3A7AE] mb-2">Request</div>
                    <code className="block text-[12px] sm:text-[13px] text-white font-mono whitespace-pre-wrap leading-relaxed">
                      {apiRequest}
                    </code>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#A3A7AE] mb-2">
                      Response
                      <TooltipProvider delayDuration={120}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label="View full response"
                              className="inline-flex h-5 w-5 items-center justify-center border border-white/10 text-[#A3A7AE] transition-colors hover:text-white hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF2C]/40"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="start"
                            sideOffset={10}
                            className="w-[280px] sm:w-[360px] max-w-[calc(100vw-2rem)] max-h-[240px] overflow-auto border-white/12 bg-[#0B0D0F] p-3 text-white shadow-xl"
                          >
                            <div className="text-[11px] text-[#A3A7AE] mb-2">
                              Full response
                            </div>
                            <code className="block text-[10px] font-mono whitespace-pre-wrap leading-relaxed text-white/90">
                              {fullApiResponse}
                            </code>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <code className="block text-[12px] sm:text-[13px] text-white font-mono whitespace-pre-wrap leading-relaxed">
                      {apiResponse}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
