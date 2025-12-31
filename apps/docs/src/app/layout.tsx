import { RootProvider } from "fumadocs-ui/provider/next";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./global.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://docs.plop.email";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Plop Docs",
    template: "%s | Plop Docs",
  },
  description:
    "Documentation for Plop (plop.email), inbox automation, and ops playbooks.",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Plop Docs",
    title: "Plop Docs",
    description: "Product documentation, inbox automation, and references.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Plop Docs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plop Docs",
    description: "Product documentation, inbox automation, and references.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      "text/plain": "/llms-full.txt",
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`flex min-h-screen flex-col bg-background antialiased ${GeistSans.className}`}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
