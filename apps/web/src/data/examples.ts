export interface CodeExample {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;
  icon: string;
  category: "e2e" | "integration" | "api" | "framework";
  framework?: string;
  language: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  code: string;
  explanation: {
    title: string;
    content: string;
  }[];
  relatedExamples: string[];
  relatedUseCases: string[];
  relatedIntegrations: string[];
}

export const examples: CodeExample[] = [
  {
    slug: "playwright-signup-test",
    title: "Playwright Signup Test",
    description: "Test user signup with email verification using Playwright",
    metaDescription:
      "Complete Playwright example for testing user signup with email verification. Copy-paste ready code.",
    icon: "Tv",
    category: "e2e",
    framework: "Playwright",
    language: "typescript",
    difficulty: "beginner",
    code: `import { test, expect } from '@playwright/test';

// Helper to generate unique test emails
function testEmail(prefix: string) {
  return \`\${prefix}+\${Date.now()}@in.plop.email\`;
}

// Helper to fetch email from plop
async function fetchEmail(request: any, toAddress: string) {
  const response = await request.get(
    'https://api.plop.email/v1/messages/latest',
    {
      params: { to: toAddress },
      headers: {
        Authorization: \`Bearer \${process.env.PLOP_API_KEY}\`,
      },
    }
  );
  return response.json();
}

test.describe('User Signup', () => {
  test('sends welcome email after signup', async ({ page, request }) => {
    // Generate unique email for this test
    const email = testEmail('signup');

    // Fill and submit signup form
    await page.goto('/signup');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="name"]', 'Test User');
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('.success-message')).toBeVisible();

    // Wait for email to arrive
    await page.waitForTimeout(2000);

    // Fetch and verify email
    const welcomeEmail = await fetchEmail(request, email);

    expect(welcomeEmail.subject).toContain('Welcome');
    expect(welcomeEmail.html).toContain('Test User');
    expect(welcomeEmail.html).toContain('Get Started');
  });

  test('verification link works', async ({ page, request }) => {
    const email = testEmail('verify');

    // Complete signup
    await page.goto('/signup');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // Get verification email
    const verifyEmail = await fetchEmail(request, email);

    // Extract verification link
    const linkMatch = verifyEmail.html.match(/href="([^"]*verify[^"]*)"/);
    expect(linkMatch).toBeTruthy();

    // Click verification link
    await page.goto(linkMatch[1]);

    // Verify success
    await expect(page.locator('text=Email verified')).toBeVisible();
  });
});`,
    explanation: [
      {
        title: "Test Email Generation",
        content:
          "Each test generates a unique email using timestamp. This ensures tests don't interfere with each other when running in parallel.",
      },
      {
        title: "Fetching Emails",
        content:
          "The fetchEmail helper uses Playwright's request fixture to call the plop API. The API key is stored in environment variables.",
      },
      {
        title: "Email Assertions",
        content:
          "We verify the email subject contains 'Welcome' and the HTML body includes the user's name and a call-to-action.",
      },
      {
        title: "Link Verification",
        content:
          "The second test extracts the verification link from the email HTML and navigates to it, verifying the complete flow.",
      },
    ],
    relatedExamples: ["cypress-password-reset", "jest-email-service"],
    relatedUseCases: ["e2e-testing", "onboarding-flows"],
    relatedIntegrations: ["playwright"],
  },
  {
    slug: "cypress-password-reset",
    title: "Cypress Password Reset Test",
    description: "Test password reset flow with Cypress",
    metaDescription:
      "Cypress example for testing password reset emails. Includes custom commands and retry logic.",
    icon: "Leaf",
    category: "e2e",
    framework: "Cypress",
    language: "typescript",
    difficulty: "intermediate",
    code: `// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      getLatestEmail(to: string): Chainable<any>;
      waitForEmail(to: string, options?: { timeout?: number; subject?: string }): Chainable<any>;
    }
  }
}

Cypress.Commands.add('getLatestEmail', (to: string) => {
  return cy.request({
    method: 'GET',
    url: \`\${Cypress.env('PLOP_API_URL')}/messages/latest\`,
    headers: {
      Authorization: \`Bearer \${Cypress.env('PLOP_API_KEY')}\`,
    },
    qs: { to },
    failOnStatusCode: false,
  }).its('body');
});

Cypress.Commands.add('waitForEmail', (to: string, options = {}) => {
  const { timeout = 10000, subject } = options;

  return cy.wrap(null, { timeout }).should(() => {
    return cy.getLatestEmail(to).then((email) => {
      if (!email || email.error) {
        throw new Error('Email not received yet');
      }
      if (subject && !email.subject.includes(subject)) {
        throw new Error(\`Subject "\${email.subject}" doesn't match "\${subject}"\`);
      }
      return email;
    });
  });
});

// cypress/e2e/password-reset.cy.ts
describe('Password Reset', () => {
  const testEmail = \`reset+\${Date.now()}@in.plop.email\`;

  it('sends reset email with valid link', () => {
    // Request password reset
    cy.visit('/forgot-password');
    cy.get('[name="email"]').type(testEmail);
    cy.get('form').submit();

    // Verify success message
    cy.contains('Check your email').should('be.visible');

    // Wait for and fetch reset email
    cy.waitForEmail(testEmail, { subject: 'Reset', timeout: 15000 })
      .then((email) => {
        // Verify email content
        expect(email.subject).to.include('Reset');
        expect(email.html).to.include('reset your password');

        // Extract reset link
        const linkMatch = email.html.match(/href="([^"]*reset[^"]*)"/);
        expect(linkMatch).to.not.be.null;

        // Visit reset link
        cy.visit(linkMatch[1]);
      });

    // Complete password reset
    cy.get('[name="password"]').type('NewSecurePass123!');
    cy.get('[name="confirmPassword"]').type('NewSecurePass123!');
    cy.get('form').submit();

    // Verify success
    cy.contains('Password updated').should('be.visible');
  });

  it('reset link expires after use', () => {
    cy.visit('/forgot-password');
    cy.get('[name="email"]').type(\`expire+\${Date.now()}@in.plop.email\`);
    cy.get('form').submit();

    cy.waitForEmail(\`expire+\${Date.now()}@in.plop.email\`, { subject: 'Reset' })
      .then((email) => {
        const linkMatch = email.html.match(/href="([^"]*reset[^"]*)"/);

        // Use the link once
        cy.visit(linkMatch[1]);
        cy.get('[name="password"]').type('NewPass123!');
        cy.get('[name="confirmPassword"]').type('NewPass123!');
        cy.get('form').submit();

        // Try to use it again
        cy.visit(linkMatch[1]);
        cy.contains('Link expired').should('be.visible');
      });
  });
});`,
    explanation: [
      {
        title: "Custom Commands",
        content:
          "We define getLatestEmail and waitForEmail as reusable Cypress commands. waitForEmail includes retry logic with configurable timeout.",
      },
      {
        title: "Retry Logic",
        content:
          "The waitForEmail command uses Cypress's should() with a wrapper to retry until the email arrives or timeout is reached.",
      },
      {
        title: "Link Extraction",
        content:
          "We use regex to extract the reset link from the email HTML, then visit it to complete the flow.",
      },
      {
        title: "Security Testing",
        content:
          "The second test verifies that reset links can only be used once—important for security.",
      },
    ],
    relatedExamples: ["playwright-signup-test", "jest-email-service"],
    relatedUseCases: ["transactional-emails", "e2e-testing"],
    relatedIntegrations: ["cypress"],
  },
  {
    slug: "jest-email-service",
    title: "Jest Email Service Test",
    description: "Unit/integration test for email service with Jest",
    metaDescription:
      "Jest example for testing email service functions. Test your email sending logic with real delivery verification.",
    icon: "FlaskConical",
    category: "integration",
    framework: "Jest",
    language: "typescript",
    difficulty: "beginner",
    code: `// src/services/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: 'hello@yourapp.com',
    to,
    subject: \`Welcome to YourApp, \${name}!\`,
    html: \`
      <h1>Welcome, \${name}!</h1>
      <p>Thanks for signing up. Here's how to get started:</p>
      <a href="https://yourapp.com/dashboard">Go to Dashboard</a>
    \`,
  });
}

// tests/email.test.ts
import { sendWelcomeEmail } from '../src/services/email';

const PLOP_API_URL = 'https://api.plop.email/v1';
const PLOP_API_KEY = process.env.PLOP_API_KEY!;

async function fetchEmail(to: string) {
  const response = await fetch(
    \`\${PLOP_API_URL}/messages/latest?to=\${encodeURIComponent(to)}\`,
    {
      headers: { Authorization: \`Bearer \${PLOP_API_KEY}\` },
    }
  );
  return response.json();
}

describe('Email Service', () => {
  it('sends welcome email with correct content', async () => {
    const testEmail = \`welcome+\${Date.now()}@in.plop.email\`;
    const userName = 'Test User';

    // Send the email
    const result = await sendWelcomeEmail(testEmail, userName);
    expect(result.error).toBeUndefined();

    // Wait for delivery
    await new Promise((r) => setTimeout(r, 2000));

    // Fetch from plop
    const email = await fetchEmail(testEmail);

    // Verify content
    expect(email.subject).toBe(\`Welcome to YourApp, \${userName}!\`);
    expect(email.html).toContain(\`Welcome, \${userName}!\`);
    expect(email.html).toContain('Go to Dashboard');
    expect(email.html).toContain('https://yourapp.com/dashboard');
  });

  it('handles special characters in name', async () => {
    const testEmail = \`special+\${Date.now()}@in.plop.email\`;
    const userName = "O'Brien & Co.";

    await sendWelcomeEmail(testEmail, userName);
    await new Promise((r) => setTimeout(r, 2000));

    const email = await fetchEmail(testEmail);

    // Verify HTML escaping
    expect(email.html).toContain("O'Brien");
    expect(email.subject).toContain("O'Brien");
  });
});`,
    explanation: [
      {
        title: "Real Email Sending",
        content:
          "Unlike mocking, this actually sends emails through your email service (Resend in this example) and verifies they arrive correctly.",
      },
      {
        title: "Content Verification",
        content:
          "We verify the exact subject line, personalization (name), and links are present in the delivered email.",
      },
      {
        title: "Edge Cases",
        content:
          "The second test checks that special characters are handled correctly—important for preventing XSS and display issues.",
      },
      {
        title: "Integration Testing",
        content:
          "This pattern tests your complete email pipeline: your code → email service → actual delivery.",
      },
    ],
    relatedExamples: ["pytest-transactional", "playwright-signup-test"],
    relatedUseCases: ["transactional-emails"],
    relatedIntegrations: ["jest"],
  },
  {
    slug: "pytest-transactional",
    title: "pytest Transactional Email Test",
    description: "Test transactional emails in Python with pytest",
    metaDescription:
      "pytest example for testing transactional emails in Python. Works with Django, FastAPI, Flask, and more.",
    icon: "Code",
    category: "integration",
    framework: "pytest",
    language: "python",
    difficulty: "intermediate",
    code: `# tests/conftest.py
import pytest
import requests
import os
import time

@pytest.fixture
def plop():
    """Fixture providing plop.email API client."""
    class PlopClient:
        def __init__(self):
            self.base_url = "https://api.plop.email/v1"
            self.api_key = os.environ["PLOP_API_KEY"]

        def get_latest(self, to: str, retries: int = 5, delay: float = 1.0):
            """Fetch latest email with retry logic."""
            for attempt in range(retries):
                response = requests.get(
                    f"{self.base_url}/messages/latest",
                    params={"to": to},
                    headers={"Authorization": f"Bearer {self.api_key}"},
                )
                data = response.json()
                if response.status_code == 200 and "error" not in data:
                    return data
                time.sleep(delay)
            raise TimeoutError(f"Email not received after {retries} attempts")

        def get_all(self, mailbox: str):
            """Fetch all emails for a mailbox."""
            response = requests.get(
                f"{self.base_url}/messages",
                params={"mailbox": mailbox},
                headers={"Authorization": f"Bearer {self.api_key}"},
            )
            return response.json()

    return PlopClient()


@pytest.fixture
def test_email():
    """Generate unique test email address."""
    def _generate(prefix: str = "test"):
        timestamp = int(time.time() * 1000)
        return f"{prefix}+{timestamp}@in.plop.email"
    return _generate


# tests/test_emails.py
import pytest
from myapp.email import send_order_confirmation, send_shipping_notification


class TestOrderEmails:
    def test_order_confirmation_includes_items(self, plop, test_email):
        """Order confirmation should list all items with prices."""
        email = test_email("order")
        order = {
            "id": "ORD-123",
            "items": [
                {"name": "Widget", "price": 29.99, "qty": 2},
                {"name": "Gadget", "price": 49.99, "qty": 1},
            ],
            "total": 109.97,
        }

        send_order_confirmation(to=email, order=order)

        received = plop.get_latest(email)

        assert "Order Confirmation" in received["subject"]
        assert "ORD-123" in received["html"]
        assert "Widget" in received["html"]
        assert "$29.99" in received["html"]
        assert "$109.97" in received["html"]

    def test_shipping_notification_has_tracking(self, plop, test_email):
        """Shipping notification should include tracking link."""
        email = test_email("shipping")

        send_shipping_notification(
            to=email,
            order_id="ORD-123",
            tracking_number="1Z999AA10123456784",
            carrier="UPS",
        )

        received = plop.get_latest(email)

        assert "shipped" in received["subject"].lower()
        assert "1Z999AA10123456784" in received["html"]
        assert "track" in received["html"].lower()

    @pytest.mark.parametrize("locale,expected", [
        ("en", "Your order has shipped"),
        ("es", "Tu pedido ha sido enviado"),
        ("fr", "Votre commande a été expédiée"),
    ])
    def test_shipping_localization(self, plop, test_email, locale, expected):
        """Shipping emails should be localized."""
        email = test_email(f"locale-{locale}")

        send_shipping_notification(
            to=email,
            order_id="ORD-123",
            tracking_number="TRACK123",
            carrier="UPS",
            locale=locale,
        )

        received = plop.get_latest(email)
        assert expected in received["html"]`,
    explanation: [
      {
        title: "pytest Fixtures",
        content:
          "We create reusable fixtures for the plop client and test email generation. Fixtures keep tests DRY and readable.",
      },
      {
        title: "Retry Logic",
        content:
          "The get_latest method includes retry logic to handle email delivery delays gracefully.",
      },
      {
        title: "Parametrized Tests",
        content:
          "The localization test uses @pytest.mark.parametrize to test multiple languages with the same test logic.",
      },
      {
        title: "Real Data Testing",
        content:
          "We test with realistic order data to verify the email template handles real-world content correctly.",
      },
    ],
    relatedExamples: ["jest-email-service", "github-actions-email-test"],
    relatedUseCases: ["transactional-emails", "ci-cd-pipelines"],
    relatedIntegrations: ["pytest"],
  },
  {
    slug: "github-actions-email-test",
    title: "GitHub Actions Email Testing",
    description: "CI/CD workflow for email testing with GitHub Actions",
    metaDescription:
      "GitHub Actions workflow for automated email testing. Run email tests on every PR.",
    icon: "GitBranch",
    category: "framework",
    framework: "GitHub Actions",
    language: "yaml",
    difficulty: "beginner",
    code: `# .github/workflows/email-tests.yml
name: Email Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  # Use run ID for unique test isolation
  TEST_MAILBOX: ci-\${{ github.run_id }}

jobs:
  email-tests:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Start application
        run: npm run dev &
        env:
          DATABASE_URL: \${{ secrets.TEST_DATABASE_URL }}

      - name: Wait for app to be ready
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: Run email tests
        run: npm run test:email
        env:
          PLOP_API_KEY: \${{ secrets.PLOP_API_KEY }}
          BASE_URL: http://localhost:3000

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: email-test-results
          path: |
            test-results/
            playwright-report/

      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: failure-screenshots
          path: test-results/**/*.png

  # Optional: Test against staging
  staging-email-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: email-tests

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run staging email tests
        run: npm run test:email
        env:
          PLOP_API_KEY: \${{ secrets.PLOP_API_KEY }}
          BASE_URL: https://staging.yourapp.com
          TEST_MAILBOX: staging-\${{ github.run_id }}

# Example package.json scripts:
# "test:email": "playwright test tests/email/",
# "test:email:headed": "playwright test tests/email/ --headed"`,
    explanation: [
      {
        title: "Test Isolation",
        content:
          "Using github.run_id in the mailbox name ensures each CI run is isolated. No conflicts between parallel runs.",
      },
      {
        title: "Secrets Management",
        content:
          "The PLOP_API_KEY is stored in GitHub Secrets, never exposed in logs or code.",
      },
      {
        title: "Artifact Upload",
        content:
          "Test results and screenshots are uploaded as artifacts for debugging failed tests.",
      },
      {
        title: "Staging Tests",
        content:
          "A separate job runs against staging after main branch merges, using a different test mailbox.",
      },
    ],
    relatedExamples: ["playwright-signup-test", "pytest-transactional"],
    relatedUseCases: ["ci-cd-pipelines", "e2e-testing"],
    relatedIntegrations: ["playwright", "jest"],
  },
];

export function getExample(slug: string): CodeExample | undefined {
  return examples.find((e) => e.slug === slug);
}

export function getExamplesByCategory(
  category: CodeExample["category"],
): CodeExample[] {
  return examples.filter((e) => e.category === category);
}

export function getRelatedExamples(slugs: string[]): CodeExample[] {
  return examples.filter((e) => slugs.includes(e.slug));
}
