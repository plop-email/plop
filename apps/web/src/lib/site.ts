export const siteConfig = {
  name: "plop.email",
  title: "plop.email",
  description:
    "Programmable inboxes for devs and QA. Use mailbox + tag addresses and pull the latest message from the Messages API for reliable E2E tests.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://plop.email",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://app.plop.email",
  docsUrl: "https://docs.plop.email",
  calLink: process.env.NEXT_PUBLIC_CAL_LINK ?? "",
  locale: "en_GB",
  author: "Alex Vakhitov",
  publisher: "Comonad Limited",
  legalName: "Comonad Limited",
  companyNumber: "15713725",
  twitter: "@vahaah",
} as const;
