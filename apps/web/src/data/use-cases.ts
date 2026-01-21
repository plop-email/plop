export interface UseCase {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;
  icon: string;
  heroTitle: string;
  heroDescription: string;
  problem: {
    title: string;
    points: string[];
  };
  solution: {
    title: string;
    points: string[];
  };
  codeExample: {
    language: string;
    title: string;
    code: string;
  };
  benefits: {
    title: string;
    description: string;
  }[];
  relatedUseCases: string[];
  relatedIntegrations: string[];
}

export const useCases: UseCase[] = [
  {
    slug: "e2e-testing",
    title: "E2E Testing",
    description: "End-to-end email testing for your test automation suite",
    metaDescription:
      "Automate email verification in your E2E tests. Fetch real emails via API, assert content, and eliminate flaky mail server setups.",
    icon: "TestTube",
    heroTitle: "E2E Testing with Real Emails",
    heroDescription:
      "Stop mocking emails. Test the real flow—from trigger to inbox—with deterministic, API-driven email verification.",
    problem: {
      title: "E2E email tests are notoriously flaky",
      points: [
        "Setting up mail servers for tests is complex and brittle",
        "Timing issues cause intermittent failures",
        "Shared inboxes create race conditions between parallel tests",
        "Mocking skips the actual email delivery path",
      ],
    },
    solution: {
      title: "Deterministic email testing with plop",
      points: [
        "Generate unique mailbox+tag addresses per test run",
        "Fetch emails via REST API with polling or webhooks",
        "Assert on subject, body, headers, and attachments",
        "Isolated inboxes eliminate cross-test interference",
      ],
    },
    codeExample: {
      language: "typescript",
      title: "Playwright E2E Test Example",
      code: `import { test, expect } from '@playwright/test';

test('user receives welcome email after signup', async ({ page }) => {
  const testEmail = \`signup+\${Date.now()}@in.plop.email\`;

  // Trigger the signup flow
  await page.goto('/signup');
  await page.fill('[name="email"]', testEmail);
  await page.click('button[type="submit"]');

  // Fetch the welcome email via plop API
  const response = await fetch(
    \`https://api.plop.email/v1/messages/latest?to=\${testEmail}\`,
    { headers: { Authorization: \`Bearer \${process.env.PLOP_API_KEY}\` } }
  );
  const email = await response.json();

  // Assert email content
  expect(email.subject).toContain('Welcome');
  expect(email.html).toContain('Get started');
});`,
    },
    benefits: [
      {
        title: "Zero Infrastructure",
        description:
          "No SMTP servers to maintain. Just API calls to fetch emails.",
      },
      {
        title: "Parallel-Safe",
        description:
          "Unique addresses per test eliminate race conditions entirely.",
      },
      {
        title: "CI/CD Ready",
        description:
          "Works in any environment—local, Docker, or cloud CI runners.",
      },
      {
        title: "Real Email Path",
        description: "Test actual delivery, not mocked responses.",
      },
    ],
    relatedUseCases: ["ci-cd-pipelines", "transactional-emails"],
    relatedIntegrations: ["playwright", "cypress"],
  },
  {
    slug: "transactional-emails",
    title: "Transactional Emails",
    description: "Test password resets, receipts, and notifications",
    metaDescription:
      "Verify transactional emails like password resets, order confirmations, and notifications. Catch broken templates before users do.",
    icon: "Mail",
    heroTitle: "Test Transactional Emails",
    heroDescription:
      "Password resets, receipts, notifications—test them all programmatically before they reach real users.",
    problem: {
      title: "Transactional emails break silently",
      points: [
        "Template changes can break rendering across email clients",
        "Dynamic content (names, amounts) may not populate correctly",
        "Links and CTAs can point to wrong URLs",
        "You only find out when users complain",
      ],
    },
    solution: {
      title: "Catch issues before production",
      points: [
        "Trigger emails in staging and verify content programmatically",
        "Assert dynamic variables are correctly interpolated",
        "Validate links and CTAs point to expected URLs",
        "Test across different data scenarios",
      ],
    },
    codeExample: {
      language: "typescript",
      title: "Testing Password Reset Email",
      code: `import { expect } from 'vitest';

test('password reset email contains valid link', async () => {
  const userEmail = \`reset+\${crypto.randomUUID()}@in.plop.email\`;

  // Trigger password reset
  await api.post('/auth/forgot-password', { email: userEmail });

  // Fetch the reset email
  const email = await plop.messages.latest({ to: userEmail });

  // Extract and validate reset link
  const resetLink = email.html.match(/href="([^"]*reset[^"]*)"/)?.[1];
  expect(resetLink).toBeDefined();
  expect(resetLink).toContain('/reset-password?token=');

  // Verify link works
  const response = await fetch(resetLink);
  expect(response.status).toBe(200);
});`,
    },
    benefits: [
      {
        title: "Prevent Revenue Loss",
        description: "Broken receipt emails mean support tickets and refunds.",
      },
      {
        title: "Security Validation",
        description: "Ensure reset tokens and magic links work correctly.",
      },
      {
        title: "Template Regression",
        description: "Catch template bugs before they ship.",
      },
      {
        title: "Content Accuracy",
        description: "Verify dynamic content renders correctly.",
      },
    ],
    relatedUseCases: ["magic-links", "onboarding-flows"],
    relatedIntegrations: ["jest", "pytest"],
  },
  {
    slug: "onboarding-flows",
    title: "Onboarding Flows",
    description: "Test welcome sequences and activation emails",
    metaDescription:
      "Test user onboarding email sequences. Verify welcome emails, activation links, and drip campaigns work correctly.",
    icon: "UserPlus",
    heroTitle: "Test Onboarding Email Sequences",
    heroDescription:
      "Welcome emails, activation links, drip campaigns—ensure your onboarding flow converts from day one.",
    problem: {
      title: "Onboarding emails are hard to test",
      points: [
        "Multi-step sequences require waiting for triggers",
        "Personalization logic may have edge cases",
        "Activation links must work across environments",
        "A/B test variants need separate validation",
      ],
    },
    solution: {
      title: "Automated onboarding verification",
      points: [
        "Create test users with unique plop addresses",
        "Trigger each step of the onboarding sequence",
        "Validate email content and timing",
        "Test activation links actually work",
      ],
    },
    codeExample: {
      language: "typescript",
      title: "Testing Welcome Email Sequence",
      code: `test('new user receives welcome sequence', async () => {
  const userEmail = \`onboard+\${Date.now()}@in.plop.email\`;

  // Create user and trigger welcome email
  await createUser({ email: userEmail, name: 'Test User' });

  // Verify welcome email
  const welcome = await plop.messages.waitFor({
    to: userEmail,
    subject: /welcome/i,
    timeout: 5000,
  });

  expect(welcome.html).toContain('Test User');
  expect(welcome.html).toContain('Get Started');

  // Verify activation link
  const activationLink = extractLink(welcome.html, 'activate');
  const activateResponse = await fetch(activationLink);
  expect(activateResponse.ok).toBe(true);
});`,
    },
    benefits: [
      {
        title: "Conversion Confidence",
        description: "Know your welcome emails actually arrive and work.",
      },
      {
        title: "Personalization Testing",
        description: "Verify merge tags render correctly.",
      },
      {
        title: "Sequence Validation",
        description: "Test multi-email flows end-to-end.",
      },
      {
        title: "Link Verification",
        description: "Ensure activation links point to the right place.",
      },
    ],
    relatedUseCases: ["transactional-emails", "magic-links"],
    relatedIntegrations: ["playwright", "cypress"],
  },
  {
    slug: "magic-links",
    title: "Magic Links",
    description: "Test passwordless authentication flows",
    metaDescription:
      "Test magic link and passwordless authentication. Verify tokens work, expire correctly, and provide secure access.",
    icon: "Wand2",
    heroTitle: "Test Magic Link Authentication",
    heroDescription:
      "Passwordless auth is growing—ensure your magic links work securely and reliably in automated tests.",
    problem: {
      title: "Magic links are security-critical",
      points: [
        "Broken magic links mean locked-out users",
        "Token expiration logic must work correctly",
        "Links should be single-use to prevent replay attacks",
        "Testing requires actually receiving and clicking the link",
      ],
    },
    solution: {
      title: "Secure magic link testing",
      points: [
        "Generate unique email per authentication test",
        "Extract and validate token from email content",
        "Test successful authentication flow",
        "Verify token expiration and single-use behavior",
      ],
    },
    codeExample: {
      language: "typescript",
      title: "Testing Magic Link Auth",
      code: `test('magic link grants access and expires', async () => {
  const userEmail = \`magic+\${Date.now()}@in.plop.email\`;

  // Request magic link
  await api.post('/auth/magic-link', { email: userEmail });

  // Get the email
  const email = await plop.messages.latest({ to: userEmail });
  const magicLink = extractMagicLink(email.html);

  // First use should succeed
  const firstUse = await fetch(magicLink, { redirect: 'manual' });
  expect(firstUse.status).toBe(302); // Redirect to app

  // Second use should fail (single-use token)
  const secondUse = await fetch(magicLink);
  expect(secondUse.status).toBe(401);
});

test('magic link expires after 15 minutes', async () => {
  // ... time-based expiration test
});`,
    },
    benefits: [
      {
        title: "Security Assurance",
        description: "Verify tokens expire and can't be reused.",
      },
      {
        title: "User Experience",
        description: "Ensure magic links work on first click.",
      },
      {
        title: "Edge Cases",
        description: "Test expiration, reuse, and invalid tokens.",
      },
      {
        title: "Cross-Device",
        description: "Verify links work across different sessions.",
      },
    ],
    relatedUseCases: ["transactional-emails", "e2e-testing"],
    relatedIntegrations: ["playwright", "cypress"],
  },
  {
    slug: "ci-cd-pipelines",
    title: "CI/CD Pipelines",
    description: "Email testing in continuous integration",
    metaDescription:
      "Add email testing to your CI/CD pipeline. Run email tests on every PR with GitHub Actions, GitLab CI, or any CI platform.",
    icon: "GitBranch",
    heroTitle: "Email Testing in CI/CD",
    heroDescription:
      "Run email tests on every commit. Catch email bugs before they reach production with automated pipeline integration.",
    problem: {
      title: "Email tests don't fit CI/CD well",
      points: [
        "CI runners can't receive email directly",
        "Mail server setup in Docker is complex",
        "Tests need to be fast and deterministic",
        "Parallel test runs cause mailbox conflicts",
      ],
    },
    solution: {
      title: "Cloud-native email testing",
      points: [
        "No infrastructure to set up—just API calls",
        "Works in any CI environment (GitHub Actions, GitLab, Jenkins)",
        "Unique addresses per test run prevent conflicts",
        "Fast API responses keep pipelines quick",
      ],
    },
    codeExample: {
      language: "yaml",
      title: "GitHub Actions Workflow",
      code: `name: E2E Tests with Email

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          PLOP_API_KEY: \${{ secrets.PLOP_API_KEY }}
          TEST_MAILBOX: ci-\${{ github.run_id }}@in.plop.email

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/`,
    },
    benefits: [
      {
        title: "Zero Setup",
        description: "No Docker mail servers or complex configuration.",
      },
      {
        title: "Parallel Safe",
        description: "Run ID in address prevents test conflicts.",
      },
      {
        title: "Fast Feedback",
        description: "API-based tests run in seconds, not minutes.",
      },
      {
        title: "Any Platform",
        description: "Works with GitHub, GitLab, Jenkins, CircleCI, etc.",
      },
    ],
    relatedUseCases: ["e2e-testing", "transactional-emails"],
    relatedIntegrations: ["playwright", "jest", "pytest"],
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return useCases.find((uc) => uc.slug === slug);
}

export function getRelatedUseCases(slugs: string[]): UseCase[] {
  return useCases.filter((uc) => slugs.includes(uc.slug));
}
