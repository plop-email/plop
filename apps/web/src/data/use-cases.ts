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
  expect(email.htmlContent).toContain('Get started');
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
  const resetLink = email.htmlContent.match(/href="([^"]*reset[^"]*)"/)?.[1];
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

  expect(welcome.htmlContent).toContain('Test User');
  expect(welcome.htmlContent).toContain('Get Started');

  // Verify activation link
  const activationLink = extractLink(welcome.htmlContent, 'activate');
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
  const magicLink = extractMagicLink(email.htmlContent);

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
  {
    slug: "otp-verification",
    title: "OTP & 2FA Testing",
    description: "Test one-time passwords and two-factor authentication flows",
    metaDescription:
      "Automate OTP and 2FA email testing. Extract verification codes programmatically and verify your authentication flows work correctly.",
    icon: "KeyRound",
    heroTitle: "Test OTP & 2FA Email Flows",
    heroDescription:
      "Extract one-time passwords and verification codes from emails. Test your two-factor authentication without manual copy-paste.",
    problem: {
      title: "OTP testing is tedious and error-prone",
      points: [
        "Manually checking email for codes slows down testing",
        "Codes expire quickly, causing flaky tests",
        "Copy-paste errors lead to false test failures",
        "No way to automate 2FA flows in CI/CD",
      ],
    },
    solution: {
      title: "Automated OTP extraction with plop",
      points: [
        "Fetch emails via API and extract codes programmatically",
        "Use regex patterns to parse any OTP format",
        "Test expiration logic by timing your requests",
        "Run 2FA tests in CI/CD alongside other E2E tests",
      ],
    },
    codeExample: {
      language: "typescript",
      title: "Extracting OTP from Email",
      code: `import { test, expect } from '@playwright/test';

test('2FA login with OTP', async ({ page, request }) => {
  const testEmail = \`otp+\${Date.now()}@in.plop.email\`;

  // Login with credentials
  await page.goto('/login');
  await page.fill('[name="email"]', testEmail);
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');

  // Wait for 2FA prompt
  await expect(page.locator('text=Enter verification code')).toBeVisible();

  // Fetch OTP email
  const response = await request.get(
    'https://api.plop.email/v1/messages/latest',
    {
      params: { to: testEmail },
      headers: { Authorization: \`Bearer \${process.env.PLOP_API_KEY}\` },
    }
  );
  const email = await response.json();

  // Extract 6-digit OTP code
  const otpMatch = email.textContent.match(/\\b(\\d{6})\\b/);
  expect(otpMatch).toBeTruthy();
  const otpCode = otpMatch[1];

  // Enter OTP
  await page.fill('[name="otp"]', otpCode);
  await page.click('button:has-text("Verify")');

  // Verify login success
  await expect(page.locator('text=Dashboard')).toBeVisible();
});`,
    },
    benefits: [
      {
        title: "No More Manual Testing",
        description:
          "Extract OTP codes automatically without checking your inbox.",
      },
      {
        title: "Fast Execution",
        description:
          "API-based retrieval is faster than IMAP polling or manual checks.",
      },
      {
        title: "Expiration Testing",
        description: "Test that expired codes are properly rejected.",
      },
      {
        title: "CI/CD Compatible",
        description: "Run 2FA tests as part of your automated pipeline.",
      },
    ],
    relatedUseCases: ["magic-links", "transactional-emails"],
    relatedIntegrations: ["playwright", "cypress"],
  },
  {
    slug: "newsletter-testing",
    title: "Newsletter Testing",
    description: "Verify email signup flows and newsletter delivery",
    metaDescription:
      "Test newsletter signup forms and email delivery. Verify double opt-in flows, welcome sequences, and unsubscribe links work correctly.",
    icon: "Newspaper",
    heroTitle: "Test Newsletter Signups",
    heroDescription:
      "Verify your newsletter signup flow from form submission to inbox delivery. Test double opt-in, welcome emails, and unsubscribe functionality.",
    problem: {
      title: "Newsletter flows have many failure points",
      points: [
        "Double opt-in confirmation links may not work",
        "Welcome emails may fail to send or render incorrectly",
        "Unsubscribe links might be broken or missing",
        "Hard to test across different email scenarios",
      ],
    },
    solution: {
      title: "End-to-end newsletter testing",
      points: [
        "Test the complete signup → confirm → welcome flow",
        "Verify confirmation links work and redirect correctly",
        "Check that unsubscribe links are present and functional",
        "Test with unique emails to avoid list pollution",
      ],
    },
    codeExample: {
      language: "typescript",
      title: "Testing Newsletter Double Opt-in",
      code: `import { test, expect } from '@playwright/test';

test('newsletter double opt-in flow', async ({ page, request }) => {
  const testEmail = \`newsletter+\${Date.now()}@in.plop.email\`;

  // Submit newsletter signup form
  await page.goto('/');
  await page.fill('[name="newsletter-email"]', testEmail);
  await page.click('button:has-text("Subscribe")');
  await expect(page.locator('text=Check your email')).toBeVisible();

  // Fetch confirmation email
  const confirmEmail = await request.get(
    'https://api.plop.email/v1/messages/latest',
    {
      params: { to: testEmail },
      headers: { Authorization: \`Bearer \${process.env.PLOP_API_KEY}\` },
    }
  );
  const { htmlContent, subject } = await confirmEmail.json();

  expect(subject).toContain('Confirm');

  // Extract and visit confirmation link
  const confirmLink = htmlContent.match(/href="([^"]*confirm[^"]*)"/)?.[1];
  expect(confirmLink).toBeTruthy();
  await page.goto(confirmLink);
  await expect(page.locator('text=Subscription confirmed')).toBeVisible();

  // Verify welcome email arrives
  await page.waitForTimeout(2000);
  const welcomeEmail = await request.get(
    'https://api.plop.email/v1/messages/latest',
    {
      params: { to: testEmail },
      headers: { Authorization: \`Bearer \${process.env.PLOP_API_KEY}\` },
    }
  );
  const welcome = await welcomeEmail.json();
  expect(welcome.subject).toContain('Welcome');

  // Verify unsubscribe link exists
  expect(welcome.htmlContent).toMatch(/unsubscribe/i);
});`,
    },
    benefits: [
      {
        title: "Complete Flow Testing",
        description: "Test signup → confirmation → welcome → unsubscribe.",
      },
      {
        title: "Link Validation",
        description: "Verify all links work and redirect to the correct pages.",
      },
      {
        title: "Compliance Checking",
        description: "Ensure unsubscribe links are present (CAN-SPAM, GDPR).",
      },
      {
        title: "Clean Test Data",
        description: "Unique test emails don't pollute your subscriber list.",
      },
    ],
    relatedUseCases: ["transactional-emails", "onboarding-flows"],
    relatedIntegrations: ["playwright", "cypress"],
  },
  {
    slug: "invoice-emails",
    title: "Invoice & Receipt Testing",
    description: "Test order confirmations, invoices, and payment receipts",
    metaDescription:
      "Verify invoice emails, order confirmations, and payment receipts. Test that amounts, items, and links are correct before they reach customers.",
    icon: "Receipt",
    heroTitle: "Test Invoice & Receipt Emails",
    heroDescription:
      "Catch invoice bugs before customers do. Verify amounts, line items, and payment links are correct in your transactional emails.",
    problem: {
      title: "Invoice errors damage trust and cause refunds",
      points: [
        "Wrong amounts or calculations go unnoticed until complaints",
        "Missing or broken payment links frustrate customers",
        "Dynamic content like names and items may not render",
        "Currency and locale formatting can break silently",
      ],
    },
    solution: {
      title: "Automated invoice validation",
      points: [
        "Assert on amounts, taxes, and totals programmatically",
        "Verify payment and download links work correctly",
        "Test with different order scenarios and edge cases",
        "Validate currency formatting and localization",
      ],
    },
    codeExample: {
      language: "typescript",
      title: "Testing Order Confirmation Email",
      code: `import { test, expect } from 'vitest';

test('order confirmation email has correct details', async () => {
  const orderEmail = \`order+\${Date.now()}@in.plop.email\`;
  const orderData = {
    items: [
      { name: 'Pro Plan', price: 29.00, quantity: 1 },
      { name: 'Extra Seats', price: 10.00, quantity: 3 },
    ],
    tax: 5.90,
    total: 64.90,
    currency: 'USD',
  };

  // Trigger order and email
  await api.createOrder({ email: orderEmail, ...orderData });

  // Fetch receipt email
  const response = await fetch(
    \`https://api.plop.email/v1/messages/latest?to=\${orderEmail}\`,
    { headers: { Authorization: \`Bearer \${process.env.PLOP_API_KEY}\` } }
  );
  const email = await response.json();

  // Verify subject
  expect(email.subject).toContain('Order Confirmation');

  // Verify line items
  expect(email.htmlContent).toContain('Pro Plan');
  expect(email.htmlContent).toContain('Extra Seats');

  // Verify amounts (accounting for currency formatting)
  expect(email.htmlContent).toMatch(/\\$64\\.90|64\\.90\\s*USD/);

  // Verify receipt/invoice link exists
  const receiptLink = email.htmlContent.match(/href="([^"]*receipt[^"]*)"/);
  expect(receiptLink).toBeTruthy();

  // Verify link works
  const linkResponse = await fetch(receiptLink[1]);
  expect(linkResponse.status).toBe(200);
});`,
    },
    benefits: [
      {
        title: "Prevent Revenue Loss",
        description: "Catch billing errors before they reach customers.",
      },
      {
        title: "Content Verification",
        description: "Assert on amounts, items, and calculations.",
      },
      {
        title: "Link Testing",
        description: "Verify invoice downloads and payment links work.",
      },
      {
        title: "Edge Case Coverage",
        description: "Test discounts, refunds, and international orders.",
      },
    ],
    relatedUseCases: ["transactional-emails", "e2e-testing"],
    relatedIntegrations: ["jest", "pytest"],
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return useCases.find((uc) => uc.slug === slug);
}

export function getRelatedUseCases(slugs: string[]): UseCase[] {
  return useCases.filter((uc) => slugs.includes(uc.slug));
}
