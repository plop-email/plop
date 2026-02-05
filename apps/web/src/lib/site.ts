export const siteConfig = {
  name: "plop.email",
  title: "plop.email",
  description:
    "Email testing API for developers and QA teams. Send emails to programmable inboxes, fetch via REST API, and verify in your E2E tests. No mail server setup.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://plop.email",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://app.plop.email",
  docsUrl: "https://docs.plop.email",
  githubUrl: "https://github.com/plop-email/plop",
  calLink: process.env.NEXT_PUBLIC_CAL_LINK ?? "",
  locale: "en_GB",
  author: "Alex Vakhitov",
  publisher: "Comonad Limited",
  legalName: "Comonad Limited",
  companyNumber: "15713725",
  twitter: "@vahaah",
} as const;
