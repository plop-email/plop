import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/12">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(3,auto)]">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.png"
                alt="plop.email"
                width={24}
                height={24}
                className=""
              />
              <span className="font-heading font-semibold text-lg">
                plop.email
              </span>
            </Link>
            <p className="mt-4 text-sm text-[#A3A7AE] max-w-sm">
              Inbox automation for product teams, QA, and support. Route mail,
              pull the right message, and keep workflows predictable.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Product
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#A3A7AE]">
              <Link
                href="/#how-it-works"
                className="hover:text-white transition-colors"
              >
                How it works
              </Link>
              <Link
                href="/#docs"
                className="hover:text-white transition-colors"
              >
                Messages API
              </Link>
              <Link
                href="/#security"
                className="hover:text-white transition-colors"
              >
                Security
              </Link>
              <Link
                href="/#get-started"
                className="hover:text-white transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Resources
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#A3A7AE]">
              <a
                href={siteConfig.docsUrl}
                className="hover:text-white transition-colors"
              >
                Documentation
              </a>
              <a
                href={siteConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
              {siteConfig.calLink ? (
                <a
                  href={siteConfig.calLink}
                  className="hover:text-white transition-colors"
                >
                  Book a demo
                </a>
              ) : null}
              <Link
                href="/updates"
                className="hover:text-white transition-colors"
              >
                Updates
              </Link>
              <Link
                href="/about"
                className="hover:text-white transition-colors"
              >
                About
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Legal
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#A3A7AE]">
              <Link
                href="/legal/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/legal/terms"
                className="hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/legal/cookies"
                className="hover:text-white transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#A3A7AE]">
          <p>© {new Date().getFullYear()} plop.email</p>
          <span>Built for teams who rely on email every day.</span>
        </div>
      </div>
    </footer>
  );
}
