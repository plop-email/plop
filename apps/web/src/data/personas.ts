export interface Persona {
  slug: string;
  name: string;
  title: string;
  metaDescription: string;
  heroTitle: string;
  heroDescription: string;
  icon: string;
  painPoints: {
    title: string;
    description: string;
  }[];
  solutions: {
    title: string;
    description: string;
  }[];
  useCases: string[];
  cta: {
    title: string;
    description: string;
  };
  relatedPersonas: string[];
}

export const personas: Persona[] = [
  {
    slug: "qa-teams",
    name: "QA Teams",
    title: "Email Testing for QA Teams",
    metaDescription:
      "plop.email for QA teams: automate email verification, eliminate flaky tests, and ship with confidence.",
    heroTitle: "Email Testing for QA Teams",
    heroDescription:
      "Stop manually checking inboxes. Automate email verification in your test suites and catch bugs before users do.",
    icon: "ClipboardCheck",
    painPoints: [
      {
        title: "Manual inbox checking",
        description:
          "QA engineers waste hours manually checking test emails instead of writing tests.",
      },
      {
        title: "Flaky email tests",
        description:
          "Shared test inboxes cause race conditions and intermittent failures.",
      },
      {
        title: "Environment inconsistency",
        description:
          "Email testing works locally but fails in CI or staging environments.",
      },
      {
        title: "No visibility into email content",
        description:
          "Hard to verify dynamic content, links, and personalization programmatically.",
      },
    ],
    solutions: [
      {
        title: "Automated email assertions",
        description:
          "Fetch emails via API and assert on subject, body, links, and attachments in your test code.",
      },
      {
        title: "Isolated test addresses",
        description:
          "Generate unique mailbox+tag addresses per test. No more race conditions.",
      },
      {
        title: "Works everywhere",
        description:
          "Same API works in local dev, CI/CD, and staging. No environment-specific config.",
      },
      {
        title: "Full email inspection",
        description:
          "Access raw HTML, text, headers, and metadata for complete verification.",
      },
    ],
    useCases: ["e2e-testing", "transactional-emails", "ci-cd-pipelines"],
    cta: {
      title: "Automate your email testing",
      description:
        "Get your QA team set up with reliable email testing in minutes.",
    },
    relatedPersonas: ["devops", "startups"],
  },
  {
    slug: "devops",
    name: "DevOps",
    title: "Email Testing for DevOps",
    metaDescription:
      "plop.email for DevOps: zero-infrastructure email testing for CI/CD pipelines. No SMTP servers to manage.",
    heroTitle: "Email Testing for DevOps",
    heroDescription:
      "Add email testing to your pipelines without managing mail servers. Works with GitHub Actions, GitLab CI, Jenkins, and more.",
    icon: "Server",
    painPoints: [
      {
        title: "Mail server maintenance",
        description:
          "Running MailHog or similar in Docker adds complexity and maintenance burden.",
      },
      {
        title: "CI environment differences",
        description:
          "Email testing setup differs between local, CI, and staging environments.",
      },
      {
        title: "Flaky pipeline tests",
        description:
          "Email tests fail randomly due to timing issues and shared resources.",
      },
      {
        title: "Security concerns",
        description:
          "Self-hosted mail servers create additional attack surface to secure.",
      },
    ],
    solutions: [
      {
        title: "Zero infrastructure",
        description:
          "No SMTP servers to deploy, configure, or maintain. Just API calls.",
      },
      {
        title: "Environment parity",
        description:
          "Same configuration works identically across all environments.",
      },
      {
        title: "Deterministic tests",
        description:
          "Unique addresses per pipeline run eliminate interference between jobs.",
      },
      {
        title: "Managed security",
        description:
          "We handle security, compliance, and uptime. You focus on your product.",
      },
    ],
    useCases: ["ci-cd-pipelines", "e2e-testing"],
    cta: {
      title: "Simplify your pipeline",
      description:
        "Add email testing to CI/CD without infrastructure overhead.",
    },
    relatedPersonas: ["qa-teams", "startups"],
  },
  {
    slug: "startups",
    name: "Startups",
    title: "Email Testing for Startups",
    metaDescription:
      "plop.email for startups: affordable email testing that scales with you. Free trial, simple pricing, no enterprise sales calls.",
    heroTitle: "Email Testing for Startups",
    heroDescription:
      "Ship faster with confidence. Test your email flows without breaking the budget or wasting engineering time.",
    icon: "Rocket",
    painPoints: [
      {
        title: "Limited engineering time",
        description:
          "Small teams can't afford to build and maintain email testing infrastructure.",
      },
      {
        title: "Budget constraints",
        description:
          "Enterprise email testing tools are expensive and require sales calls.",
      },
      {
        title: "Moving fast, breaking things",
        description:
          "Email bugs slip through because there's no time for manual testing.",
      },
      {
        title: "Scaling concerns",
        description:
          "Need a solution that grows with the company without re-architecting.",
      },
    ],
    solutions: [
      {
        title: "14-day free trial",
        description:
          "Start with a free trial. Plans from $5/mo when you're ready.",
      },
      {
        title: "Transparent pricing",
        description:
          "No sales calls, no surprises. See pricing on the website.",
      },
      {
        title: "Quick integration",
        description: "Add email testing in an afternoon, not a sprint.",
      },
      {
        title: "Scales automatically",
        description:
          "Same simple API whether you send 100 or 100,000 test emails.",
      },
    ],
    useCases: ["transactional-emails", "onboarding-flows", "magic-links"],
    cta: {
      title: "Start testing today",
      description: "14-day free trial. No credit card required.",
    },
    relatedPersonas: ["qa-teams", "saas-companies"],
  },
  {
    slug: "saas-companies",
    name: "SaaS Companies",
    title: "Email Testing for SaaS Companies",
    metaDescription:
      "plop.email for SaaS: test transactional emails, onboarding sequences, and notifications. Ensure every email reaches your users.",
    heroTitle: "Email Testing for SaaS",
    heroDescription:
      "Your SaaS depends on email—password resets, notifications, onboarding. Make sure they all work, every time.",
    icon: "Cloud",
    painPoints: [
      {
        title: "Critical email failures",
        description:
          "Broken password reset emails mean locked-out users and support tickets.",
      },
      {
        title: "Onboarding drop-off",
        description:
          "Welcome emails that don't arrive or render correctly hurt activation.",
      },
      {
        title: "Notification reliability",
        description:
          "Users miss important notifications due to untested email flows.",
      },
      {
        title: "Multi-tenant complexity",
        description:
          "Testing emails across different customer configurations is hard.",
      },
    ],
    solutions: [
      {
        title: "Test every email path",
        description:
          "Verify password resets, welcome emails, and notifications programmatically.",
      },
      {
        title: "Onboarding verification",
        description:
          "Ensure welcome sequences arrive and activation links work.",
      },
      {
        title: "Notification testing",
        description:
          "Test notification emails for all scenarios in your test suite.",
      },
      {
        title: "Multi-tenant isolation",
        description:
          "Unique addresses per test isolate customer-specific scenarios.",
      },
    ],
    useCases: ["transactional-emails", "onboarding-flows", "magic-links"],
    cta: {
      title: "Protect your email flows",
      description: "Never ship broken emails to your SaaS users again.",
    },
    relatedPersonas: ["startups", "qa-teams"],
  },
];

export function getPersona(slug: string): Persona | undefined {
  return personas.find((p) => p.slug === slug);
}

export function getRelatedPersonas(slugs: string[]): Persona[] {
  return personas.filter((p) => slugs.includes(p.slug));
}
