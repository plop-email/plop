export interface Comparison {
  slug: string;
  competitor: string;
  competitorUrl: string;
  title: string;
  metaDescription: string;
  heroTitle: string;
  heroDescription: string;
  verdict: {
    title: string;
    description: string;
    choosePlop: string[];
    chooseCompetitor: string[];
  };
  features: {
    category: string;
    items: {
      feature: string;
      plop: string | boolean;
      competitor: string | boolean;
      winner: "plop" | "competitor" | "tie";
    }[];
  }[];
  plopAdvantages: {
    title: string;
    description: string;
  }[];
  competitorAdvantages: {
    title: string;
    description: string;
  }[];
  pricing: {
    plop: {
      free: string;
      paid: string;
    };
    competitor: {
      free: string;
      paid: string;
    };
  };
}

export const comparisons: Comparison[] = [
  {
    slug: "plop-vs-mailosaur",
    competitor: "Mailosaur",
    competitorUrl: "https://mailosaur.com",
    title: "plop.email vs Mailosaur",
    metaDescription:
      "Compare plop.email and Mailosaur for email testing. See features, pricing, and which tool is right for your team.",
    heroTitle: "plop.email vs Mailosaur",
    heroDescription:
      "Both tools help you test emails programmatically. Here's how they compare for different use cases.",
    verdict: {
      title: "The Verdict",
      description:
        "Mailosaur is a mature, feature-rich platform with SMS testing and visual email previews. plop.email is simpler, open-source, and focused purely on email API testing with transparent pricing.",
      choosePlop: [
        "You want open-source with self-hosting option",
        "You need simple, transparent pricing",
        "You only need email testing (not SMS)",
        "You prefer a lightweight, focused tool",
      ],
      chooseCompetitor: [
        "You need SMS testing alongside email",
        "You want visual email rendering previews",
        "You need email client previews (Outlook, Gmail)",
        "Enterprise compliance is a priority",
      ],
    },
    features: [
      {
        category: "Core Features",
        items: [
          {
            feature: "Programmable inboxes",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "REST API",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "Plus-addressing (tags)",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "Webhooks",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "SMS testing",
            plop: false,
            competitor: true,
            winner: "competitor",
          },
        ],
      },
      {
        category: "Developer Experience",
        items: [
          {
            feature: "Open source",
            plop: true,
            competitor: false,
            winner: "plop",
          },
          {
            feature: "Self-hosting option",
            plop: true,
            competitor: false,
            winner: "plop",
          },
          {
            feature: "Official SDKs",
            plop: "REST only",
            competitor: "Multiple languages",
            winner: "competitor",
          },
          {
            feature: "Playwright/Cypress guides",
            plop: true,
            competitor: true,
            winner: "tie",
          },
        ],
      },
      {
        category: "Pricing",
        items: [
          {
            feature: "Free trial",
            plop: "14-day trial",
            competitor: "14-day trial",
            winner: "tie",
          },
          {
            feature: "Transparent pricing",
            plop: true,
            competitor: "Contact sales",
            winner: "plop",
          },
          {
            feature: "Pay-as-you-go",
            plop: true,
            competitor: false,
            winner: "plop",
          },
        ],
      },
    ],
    plopAdvantages: [
      {
        title: "Open Source",
        description:
          "plop.email is AGPL-3.0 licensed. Audit the code, self-host, or contribute.",
      },
      {
        title: "Simple Pricing",
        description:
          "Transparent plans starting at $5/mo. No sales calls required.",
      },
      {
        title: "Focused on Testing",
        description:
          "Built specifically for test automation, not marketing email.",
      },
    ],
    competitorAdvantages: [
      {
        title: "SMS Testing",
        description: "Test SMS alongside email in the same workflow.",
      },
      {
        title: "Email Previews",
        description:
          "See how emails render across different clients and devices.",
      },
      {
        title: "Mature Ecosystem",
        description: "Official SDKs for many languages and frameworks.",
      },
    ],
    pricing: {
      plop: {
        free: "14-day free trial",
        paid: "From $5/mo",
      },
      competitor: {
        free: "14-day trial",
        paid: "From $9/mo",
      },
    },
  },
  {
    slug: "plop-vs-mailtrap",
    competitor: "Mailtrap",
    competitorUrl: "https://mailtrap.io",
    title: "plop.email vs Mailtrap",
    metaDescription:
      "Compare plop.email and Mailtrap for email testing. See how they differ in features, pricing, and developer experience.",
    heroTitle: "plop.email vs Mailtrap",
    heroDescription:
      "Mailtrap offers both testing and sending. plop.email focuses purely on test automation. Here's the breakdown.",
    verdict: {
      title: "The Verdict",
      description:
        "Mailtrap is a full email platform with testing and sending capabilities. plop.email is a focused testing tool with open-source transparency and simpler pricing.",
      choosePlop: [
        "You only need testing, not sending",
        "You want open-source transparency",
        "You prefer simpler, focused tooling",
        "You want self-hosting capability",
      ],
      chooseCompetitor: [
        "You need email sending + testing in one platform",
        "You want HTML email template checking",
        "You need spam score analysis",
        "You want a visual inbox UI for debugging",
      ],
    },
    features: [
      {
        category: "Core Features",
        items: [
          {
            feature: "Test inbox API",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "Email sending",
            plop: false,
            competitor: true,
            winner: "competitor",
          },
          {
            feature: "Spam analysis",
            plop: false,
            competitor: true,
            winner: "competitor",
          },
          {
            feature: "HTML validation",
            plop: false,
            competitor: true,
            winner: "competitor",
          },
          {
            feature: "Plus-addressing",
            plop: true,
            competitor: true,
            winner: "tie",
          },
        ],
      },
      {
        category: "Developer Experience",
        items: [
          {
            feature: "Open source",
            plop: true,
            competitor: false,
            winner: "plop",
          },
          {
            feature: "Self-hosting",
            plop: true,
            competitor: false,
            winner: "plop",
          },
          {
            feature: "API simplicity",
            plop: "3 endpoints",
            competitor: "Many endpoints",
            winner: "plop",
          },
          {
            feature: "Visual inbox UI",
            plop: "Basic",
            competitor: "Full-featured",
            winner: "competitor",
          },
        ],
      },
      {
        category: "Pricing",
        items: [
          {
            feature: "Free option",
            plop: "14-day trial",
            competitor: "Free tier (100 emails/mo)",
            winner: "competitor",
          },
          {
            feature: "Pricing transparency",
            plop: "Fully public",
            competitor: "Public",
            winner: "tie",
          },
          {
            feature: "Starting paid price",
            plop: "$5/mo",
            competitor: "$10/mo",
            winner: "plop",
          },
        ],
      },
    ],
    plopAdvantages: [
      {
        title: "Testing-Focused",
        description:
          "Built for test automation, not email marketing or transactional sending.",
      },
      {
        title: "Open Source",
        description: "Inspect the code, self-host, contribute improvements.",
      },
      {
        title: "Simple API",
        description: "Just 3 endpoints. No complexity for simple use cases.",
      },
    ],
    competitorAdvantages: [
      {
        title: "All-in-One Platform",
        description: "Testing, sending, and analytics in a single dashboard.",
      },
      {
        title: "Spam Analysis",
        description: "Check spam scores before sending to production.",
      },
      {
        title: "HTML Validation",
        description: "Verify email templates render correctly.",
      },
    ],
    pricing: {
      plop: {
        free: "14-day free trial",
        paid: "From $5/mo",
      },
      competitor: {
        free: "Free tier available",
        paid: "From $10/mo",
      },
    },
  },
  {
    slug: "plop-vs-mailhog",
    competitor: "MailHog",
    competitorUrl: "https://github.com/mailhog/MailHog",
    title: "plop.email vs MailHog",
    metaDescription:
      "Compare plop.email and MailHog for local email testing. See why teams are moving from self-hosted MailHog to cloud-based plop.",
    heroTitle: "plop.email vs MailHog",
    heroDescription:
      "MailHog is a local SMTP server for development. Note: MailHog is no longer maintained—consider Mailpit as an alternative. plop.email is a cloud API for modern email testing.",
    verdict: {
      title: "The Verdict",
      description:
        "MailHog is no longer actively maintained and hasn't received updates since 2020. For self-hosted local testing, consider Mailpit (a maintained fork). plop.email works everywhere (local, CI, staging) with zero setup and ongoing development.",
      choosePlop: [
        "You need email testing in CI/CD",
        "You want zero infrastructure management",
        "You test across multiple environments",
        "You need reliable cloud-based testing",
      ],
      chooseCompetitor: [
        "You only test locally (consider Mailpit instead)",
        "You want 100% free, self-hosted",
        "You need SMTP protocol (not REST)",
        "You prefer complete data privacy",
      ],
    },
    features: [
      {
        category: "Core Features",
        items: [
          {
            feature: "REST API",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "SMTP server",
            plop: false,
            competitor: true,
            winner: "competitor",
          },
          {
            feature: "Works in CI/CD",
            plop: "Native",
            competitor: "Requires setup",
            winner: "plop",
          },
          {
            feature: "Cloud hosted",
            plop: true,
            competitor: false,
            winner: "plop",
          },
          {
            feature: "Self-hosted option",
            plop: true,
            competitor: true,
            winner: "tie",
          },
        ],
      },
      {
        category: "Developer Experience",
        items: [
          {
            feature: "Zero setup",
            plop: true,
            competitor: false,
            winner: "plop",
          },
          {
            feature: "Docker required",
            plop: false,
            competitor: true,
            winner: "plop",
          },
          {
            feature: "Works across envs",
            plop: "All environments",
            competitor: "Local only",
            winner: "plop",
          },
          {
            feature: "Maintenance",
            plop: "Managed",
            competitor: "Self-managed",
            winner: "plop",
          },
          {
            feature: "Active development",
            plop: true,
            competitor: "Unmaintained since 2020",
            winner: "plop",
          },
        ],
      },
      {
        category: "Pricing",
        items: [
          {
            feature: "Free option",
            plop: "14-day trial",
            competitor: "100% free",
            winner: "competitor",
          },
          {
            feature: "Infrastructure cost",
            plop: "Included",
            competitor: "Your servers",
            winner: "plop",
          },
          {
            feature: "Maintenance cost",
            plop: "Zero",
            competitor: "Your time",
            winner: "plop",
          },
        ],
      },
    ],
    plopAdvantages: [
      {
        title: "Zero Setup",
        description: "No Docker, no SMTP config. Just API calls.",
      },
      {
        title: "CI/CD Native",
        description:
          "Works identically in GitHub Actions, GitLab CI, Jenkins, etc.",
      },
      {
        title: "Managed Service",
        description: "No infrastructure to maintain or update.",
      },
    ],
    competitorAdvantages: [
      {
        title: "100% Free",
        description: "Open source with no usage limits or paid tiers.",
      },
      {
        title: "SMTP Protocol",
        description:
          "Accepts email via SMTP, useful for apps that can't use REST.",
      },
      {
        title: "Complete Privacy",
        description:
          "All data stays on your machine, never leaves your network.",
      },
    ],
    pricing: {
      plop: {
        free: "14-day free trial",
        paid: "From $5/mo",
      },
      competitor: {
        free: "100% free",
        paid: "N/A (open source)",
      },
    },
  },
  {
    slug: "plop-vs-mailslurp",
    competitor: "MailSlurp",
    competitorUrl: "https://mailslurp.com",
    title: "plop.email vs MailSlurp",
    metaDescription:
      "Compare plop.email and MailSlurp for email testing. See how they differ in features, pricing, and developer experience.",
    heroTitle: "plop.email vs MailSlurp",
    heroDescription:
      "Both tools provide programmable inboxes for testing. Here's how they compare for different use cases.",
    verdict: {
      title: "The Verdict",
      description:
        "MailSlurp is a feature-rich platform with many language SDKs and advanced email features. plop.email is simpler, open-source, and focused on core testing workflows with transparent pricing.",
      choosePlop: [
        "You want open-source with self-hosting option",
        "You need simple, transparent pricing",
        "You prefer a focused, lightweight tool",
        "You value API simplicity over SDK variety",
      ],
      chooseCompetitor: [
        "You need SDKs for many languages",
        "You want advanced email features (attachments, parsing)",
        "You need phone/SMS testing",
        "You require enterprise-grade SLAs",
      ],
    },
    features: [
      {
        category: "Core Features",
        items: [
          {
            feature: "Programmable inboxes",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "REST API",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "Plus-addressing (tags)",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "Attachment handling",
            plop: "Basic",
            competitor: "Advanced",
            winner: "competitor",
          },
          {
            feature: "Phone/SMS testing",
            plop: false,
            competitor: true,
            winner: "competitor",
          },
        ],
      },
      {
        category: "Developer Experience",
        items: [
          {
            feature: "Open source",
            plop: true,
            competitor: false,
            winner: "plop",
          },
          {
            feature: "Self-hosting option",
            plop: true,
            competitor: false,
            winner: "plop",
          },
          {
            feature: "Official SDKs",
            plop: "REST only",
            competitor: "15+ languages",
            winner: "competitor",
          },
          {
            feature: "API simplicity",
            plop: "3 endpoints",
            competitor: "Many endpoints",
            winner: "plop",
          },
        ],
      },
      {
        category: "Pricing",
        items: [
          {
            feature: "Free tier",
            plop: "14-day trial",
            competitor: "Limited free tier",
            winner: "tie",
          },
          {
            feature: "Transparent pricing",
            plop: true,
            competitor: "Complex tiers",
            winner: "plop",
          },
          {
            feature: "Starting price",
            plop: "$5/mo",
            competitor: "$19/mo",
            winner: "plop",
          },
        ],
      },
    ],
    plopAdvantages: [
      {
        title: "Open Source",
        description:
          "plop.email is AGPL-3.0 licensed. Audit the code, self-host, or contribute.",
      },
      {
        title: "Simple Pricing",
        description:
          "Transparent plans starting at $5/mo. No complex tier calculations.",
      },
      {
        title: "API Simplicity",
        description:
          "Just 3 endpoints to learn. No SDK required, works with any HTTP client.",
      },
    ],
    competitorAdvantages: [
      {
        title: "SDK Ecosystem",
        description:
          "Official SDKs for Java, Python, PHP, Ruby, Go, C#, and more.",
      },
      {
        title: "Advanced Email Parsing",
        description:
          "Sophisticated attachment handling and HTML/text parsing features.",
      },
      {
        title: "Phone Testing",
        description: "Test SMS and voice alongside email in the same workflow.",
      },
    ],
    pricing: {
      plop: {
        free: "14-day free trial",
        paid: "From $5/mo",
      },
      competitor: {
        free: "Free for personal use",
        paid: "From $19/mo",
      },
    },
  },
  {
    slug: "plop-vs-ethereal",
    competitor: "Ethereal",
    competitorUrl: "https://ethereal.email",
    title: "plop.email vs Ethereal",
    metaDescription:
      "Compare plop.email and Ethereal for email testing. See when to use a free catch-all service vs a programmable inbox API.",
    heroTitle: "plop.email vs Ethereal",
    heroDescription:
      "Ethereal is a free fake SMTP service. plop.email is a programmable inbox API. Here's when to use each.",
    verdict: {
      title: "The Verdict",
      description:
        "Ethereal is perfect for quick manual testing during development. plop.email is built for automated testing in CI/CD pipelines where you need programmatic access to emails.",
      choosePlop: [
        "You need automated email testing in CI/CD",
        "You want programmatic API access to emails",
        "You need test isolation with unique addresses",
        "You want reliable, production-grade infrastructure",
      ],
      chooseCompetitor: [
        "You only need manual testing during development",
        "You want completely free service",
        "You prefer SMTP-based sending",
        "You're just prototyping and don't need automation",
      ],
    },
    features: [
      {
        category: "Core Features",
        items: [
          {
            feature: "REST API",
            plop: true,
            competitor: "Limited",
            winner: "plop",
          },
          {
            feature: "SMTP server",
            plop: false,
            competitor: true,
            winner: "competitor",
          },
          {
            feature: "Programmable inboxes",
            plop: true,
            competitor: false,
            winner: "plop",
          },
          {
            feature: "Works in CI/CD",
            plop: "Native",
            competitor: "Manual only",
            winner: "plop",
          },
          {
            feature: "Unique addresses per test",
            plop: true,
            competitor: false,
            winner: "plop",
          },
        ],
      },
      {
        category: "Developer Experience",
        items: [
          {
            feature: "Open source",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "Self-hosting",
            plop: true,
            competitor: false,
            winner: "plop",
          },
          {
            feature: "Web UI",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "Test automation support",
            plop: "Built-in",
            competitor: "Manual",
            winner: "plop",
          },
        ],
      },
      {
        category: "Pricing",
        items: [
          {
            feature: "Free option",
            plop: "14-day trial",
            competitor: "100% free",
            winner: "competitor",
          },
          {
            feature: "Production reliability",
            plop: "SLA backed",
            competitor: "Best effort",
            winner: "plop",
          },
          {
            feature: "Support",
            plop: "Email & docs",
            competitor: "Community",
            winner: "plop",
          },
        ],
      },
    ],
    plopAdvantages: [
      {
        title: "Automation First",
        description:
          "Built for CI/CD pipelines with deterministic API-based testing.",
      },
      {
        title: "Test Isolation",
        description: "Unique addresses per test eliminate race conditions.",
      },
      {
        title: "Production Ready",
        description: "Reliable infrastructure with SLA-backed uptime.",
      },
    ],
    competitorAdvantages: [
      {
        title: "100% Free",
        description: "No cost, no account required for basic testing.",
      },
      {
        title: "SMTP Protocol",
        description:
          "Works with apps that need to send via SMTP, not just API.",
      },
      {
        title: "Quick Setup",
        description: "Generate test account instantly, no signup needed.",
      },
    ],
    pricing: {
      plop: {
        free: "14-day free trial",
        paid: "From $5/mo",
      },
      competitor: {
        free: "100% free",
        paid: "N/A",
      },
    },
  },
  {
    slug: "plop-vs-testmail",
    competitor: "Testmail.app",
    competitorUrl: "https://testmail.app",
    title: "plop.email vs Testmail.app",
    metaDescription:
      "Compare plop.email and Testmail.app for automated email testing. See features, pricing, and which is right for your team.",
    heroTitle: "plop.email vs Testmail.app",
    heroDescription:
      "Both tools are built for automated email testing. Here's how they compare.",
    verdict: {
      title: "The Verdict",
      description:
        "Testmail.app is a solid email testing service with good automation features. plop.email offers open-source transparency, simpler pricing, and self-hosting capability.",
      choosePlop: [
        "You want open-source with self-hosting",
        "You need simpler, lower-cost pricing",
        "You prefer minimal API surface",
        "You want to audit the code yourself",
      ],
      chooseCompetitor: [
        "You want a mature, established service",
        "You need advanced filtering options",
        "You prefer namespace-based organization",
        "You want more email history retention",
      ],
    },
    features: [
      {
        category: "Core Features",
        items: [
          {
            feature: "Programmable inboxes",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "REST API",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "Plus-addressing",
            plop: true,
            competitor: true,
            winner: "tie",
          },
          {
            feature: "Namespace organization",
            plop: "Tags",
            competitor: "Namespaces",
            winner: "tie",
          },
          {
            feature: "Email history",
            plop: "7 days",
            competitor: "30 days",
            winner: "competitor",
          },
        ],
      },
      {
        category: "Developer Experience",
        items: [
          {
            feature: "Open source",
            plop: true,
            competitor: false,
            winner: "plop",
          },
          {
            feature: "Self-hosting",
            plop: true,
            competitor: false,
            winner: "plop",
          },
          {
            feature: "API documentation",
            plop: "OpenAPI",
            competitor: "REST docs",
            winner: "tie",
          },
          {
            feature: "CI/CD examples",
            plop: true,
            competitor: true,
            winner: "tie",
          },
        ],
      },
      {
        category: "Pricing",
        items: [
          {
            feature: "Free tier",
            plop: "14-day trial",
            competitor: "Free tier",
            winner: "tie",
          },
          {
            feature: "Starting price",
            plop: "$5/mo",
            competitor: "$9/mo",
            winner: "plop",
          },
          {
            feature: "Pricing transparency",
            plop: "Fully public",
            competitor: "Public",
            winner: "tie",
          },
        ],
      },
    ],
    plopAdvantages: [
      {
        title: "Open Source",
        description:
          "AGPL-3.0 licensed. Self-host or contribute to the codebase.",
      },
      {
        title: "Lower Cost",
        description: "Plans start at $5/mo vs $9/mo for similar features.",
      },
      {
        title: "Simpler API",
        description: "Minimal endpoints to learn, works with any HTTP client.",
      },
    ],
    competitorAdvantages: [
      {
        title: "Email Retention",
        description: "30-day email history vs 7 days on plop.",
      },
      {
        title: "Namespace System",
        description: "Organize tests by project with namespace isolation.",
      },
      {
        title: "Established Service",
        description: "Longer track record in the email testing space.",
      },
    ],
    pricing: {
      plop: {
        free: "14-day free trial",
        paid: "From $5/mo",
      },
      competitor: {
        free: "Free forever plan",
        paid: "From $9/mo",
      },
    },
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}
