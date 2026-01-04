import { Button } from "@plop/ui/button";
import { siteConfig } from "@/lib/site";
import { GitBranch, Star, Users, Code2 } from "lucide-react";

const benefits = [
  {
    icon: Code2,
    title: "Full transparency",
    description: "Audit every line. No black boxes, no hidden logic.",
  },
  {
    icon: Users,
    title: "Community-driven",
    description: "Contributions welcome. Shape the future of email testing.",
  },
  {
    icon: GitBranch,
    title: "Self-host friendly",
    description:
      "Run on your own infrastructure. Full control, full ownership.",
  },
];

export function OpenSource() {
  return (
    <section className="border-b border-white/12">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8 py-20 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#B8FF2C]/10 border border-[#B8FF2C]/20 px-3 py-1.5 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping bg-[#B8FF2C] opacity-75" />
                <span className="relative inline-flex h-2 w-2 bg-[#B8FF2C]" />
              </span>
              <span className="text-xs font-medium text-[#B8FF2C] uppercase tracking-wider">
                Open Source
              </span>
            </div>

            <h2 className="font-heading text-3xl lg:text-4xl text-white mb-4">
              Open source.
              <br />
              <span className="text-[#B8FF2C]">Open book.</span>
            </h2>

            <p className="text-[#A3A7AE] text-lg leading-relaxed mb-8 max-w-md">
              Plop is fully open source under the AGPL-3.0 license. Inspect the
              code, self-host it, or contribute back. Your email testing
              infrastructure, your rules.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button
                size="lg"
                className="bg-white text-[#0B0D0F] hover:bg-white/90 font-semibold hover:translate-y-[-2px] transition-all px-6 h-11"
                asChild
              >
                <a
                  href={siteConfig.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Star on GitHub
                </a>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-[#A3A7AE] hover:text-white hover:bg-white/10 px-6 h-11"
                asChild
              >
                <a
                  href={`${siteConfig.githubUrl}#readme`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the README
                </a>
              </Button>
            </div>
          </div>

          {/* Right: Benefits grid */}
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="group bg-[#111418] border border-white/12 p-5 hover:border-white/24 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#B8FF2C]/10 border border-[#B8FF2C]/20 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-[#B8FF2C]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg text-white mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-[#A3A7AE] leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* License badge */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5">
                <span className="text-xs text-[#A3A7AE]">License:</span>
                <span className="text-xs font-mono text-white">AGPL-3.0</span>
              </div>
              <span className="text-xs text-[#A3A7AE]">
                Free for non-commercial use
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
