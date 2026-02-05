"use client";

import { Button } from "@plop/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const example = {
    subject: "Confirm your email",
    from: "hello@acme.co",
    code: "482913",
  };

  const apiResponse = `{
  "subject": "${example.subject}",
  "text": "Your code is ${example.code}",
  "from": "${example.from}"
}`;

  return (
    <section className="relative overflow-hidden border-b border-white/12">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.1] text-white text-balance mb-4">
              Email Testing API
              <br />
              <span className="text-[#B8FF2C]">for developers.</span>
            </h1>
            <p className="text-[#A3A7AE] text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              Send emails to Plop, fetch via API, assert in tests. No mail
              server. No flaky waits.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#B8FF2C] text-[#0B0D0F] hover:bg-[#B8FF2C]/90 font-semibold hover:translate-y-[-2px] transition-all px-8 h-12"
                asChild
              >
                <Link href="#get-started">
                  Start free trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Link
                href="https://docs.plop.email"
                className="text-sm text-[#A3A7AE] hover:text-white transition-colors"
              >
                Read the docs →
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-[#A3A7AE]/80">
              <span>✓ 14-day free trial</span>
              <span>✓ No credit card</span>
              <span>✓ Setup in 2 minutes</span>
            </div>
          </div>

          {/* Right: Flow Panel */}
          <div className="bg-[#0D1014] border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <span className="text-sm text-white font-medium">
                Email in → JSON out
              </span>
              <span className="text-[10px] text-[#B8FF2C] uppercase tracking-wider">
                Live demo
              </span>
            </div>

            {/* Steps */}
            <div className="p-4 space-y-3">
              {/* Step 1 */}
              <div className="bg-[#0B0D0F] border border-white/8 rounded-lg px-4 py-3">
                <div className="mb-2">
                  <span className="text-xs text-[#A3A7AE]">
                    <span className="text-[#B8FF2C] font-semibold mr-2">1</span>
                    Generate a test address
                  </span>
                </div>
                <code className="text-[13px] font-mono">
                  <span className="text-[#B8FF2C]/70">{"<inbox>"}</span>
                  <span className="text-white/50">+</span>
                  <span className="text-[#B8FF2C]/70">{"<tag>"}</span>
                  <span className="text-white">@in.plop.email</span>
                </code>
              </div>

              {/* Step 2 */}
              <div className="bg-[#0B0D0F] border border-white/8 rounded-lg px-4 py-3">
                <span className="text-xs text-[#A3A7AE]">
                  <span className="text-[#B8FF2C] font-semibold mr-2">2</span>
                  Email arrives
                </span>
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white text-xs font-medium">
                    ✉
                  </div>
                  <div>
                    <div className="text-sm text-white">{example.subject}</div>
                    <div className="text-xs text-[#A3A7AE]">
                      Code:{" "}
                      <span className="text-white font-mono">
                        {example.code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#0B0D0F] border border-white/8 rounded-lg px-4 py-3">
                <span className="text-xs text-[#A3A7AE]">
                  <span className="text-[#B8FF2C] font-semibold mr-2">3</span>
                  Fetch via API
                </span>
                <pre className="mt-2 text-[12px] text-white/90 font-mono leading-relaxed overflow-x-auto">
                  {apiResponse}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
