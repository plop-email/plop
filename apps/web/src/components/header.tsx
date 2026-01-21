"use client";

import { Button } from "@plop/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-[#0B0D0F]/95 backdrop-blur-sm border-b border-white/12"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1120px] px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
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
              priority
            />
            <span className="font-heading font-semibold text-lg">
              plop.email
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/use-cases"
              className="text-white text-sm hover:underline underline-offset-4 transition-all"
            >
              Use Cases
            </Link>
            <Link
              href="/integrations"
              className="text-white text-sm hover:underline underline-offset-4 transition-all"
            >
              Integrations
            </Link>
            <Link
              href="/#get-started"
              className="text-white text-sm hover:underline underline-offset-4 transition-all"
            >
              Pricing
            </Link>
            <Link
              href="/updates"
              className="text-white text-sm hover:underline underline-offset-4 transition-all"
            >
              Updates
            </Link>
            <Link
              href="/about"
              className="text-white text-sm hover:underline underline-offset-4 transition-all"
            >
              About
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="hidden sm:inline-flex text-white hover:bg-white/20"
              asChild
            >
              <a href={siteConfig.docsUrl}>Docs</a>
            </Button>
            <Button
              className="bg-[#B8FF2C] text-[#0B0D0F] hover:bg-[#B8FF2C]/90 font-semibold hover:translate-y-[-2px] transition-all"
              asChild
            >
              <Link href="/#get-started">Start testing</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
