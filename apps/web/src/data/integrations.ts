export interface Integration {
  slug: string;
  name: string;
  description: string;
  metaDescription: string;
  icon: string;
  category: "testing" | "language" | "api";
  heroTitle: string;
  heroDescription: string;
  features: {
    title: string;
    description: string;
  }[];
  installation: {
    title: string;
    code: string;
  };
  quickStart: {
    title: string;
    description: string;
    code: string;
  };
  advancedExample: {
    title: string;
    description: string;
    code: string;
  };
  tips: string[];
  relatedIntegrations: string[];
  relatedUseCases: string[];
  docsUrl?: string;
}

export const integrations: Integration[] = [
  {
    slug: "playwright",
    name: "Playwright",
    description: "E2E testing with Microsoft Playwright",
    metaDescription:
      "Integrate plop.email with Playwright for E2E email testing. Verify emails in your browser automation tests.",
    icon: "Tv",
    category: "testing",
    heroTitle: "Playwright + plop.email",
    heroDescription:
      "Add email verification to your Playwright E2E tests. Test signup flows, password resets, and notifications.",
    features: [
      {
        title: "Async Email Fetching",
        description:
          "Use Playwright's built-in request API to fetch emails during tests.",
      },
      {
        title: "Test Isolation",
        description:
          "Generate unique email addresses per test for parallel execution.",
      },
      {
        title: "Content Assertions",
        description: "Assert on email subject, body, links, and attachments.",
      },
      {
        title: "Visual Testing",
        description:
          "Render email HTML in browser for visual regression testing.",
      },
    ],
    installation: {
      title: "Setup",
      code: `# Install Playwright
npm init playwright@latest

# Add plop API key to your environment
echo "PLOP_API_KEY=your_api_key" >> .env`,
    },
    quickStart: {
      title: "Basic Email Test",
      description:
        "Test that a user receives a welcome email after signing up.",
      code: `import { test, expect } from '@playwright/test';

test('signup sends welcome email', async ({ page, request }) => {
  const testEmail = \`test+\${Date.now()}@in.plop.email\`;

  // Complete signup flow
  await page.goto('/signup');
  await page.fill('[name="email"]', testEmail);
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');

  // Wait for email to arrive
  await page.waitForTimeout(2000);

  // Fetch email via plop API
  const response = await request.get(
    \`https://api.plop.email/v1/messages/latest\`,
    {
      params: { to: testEmail },
      headers: {
        Authorization: \`Bearer \${process.env.PLOP_API_KEY}\`,
      },
    }
  );

  const email = await response.json();
  expect(email.subject).toContain('Welcome');
});`,
    },
    advancedExample: {
      title: "Email Link Verification",
      description: "Extract and navigate to links from emails.",
      code: `import { test, expect } from '@playwright/test';

test('magic link authentication', async ({ page, request, context }) => {
  const testEmail = \`magic+\${Date.now()}@in.plop.email\`;

  // Request magic link
  await page.goto('/login');
  await page.fill('[name="email"]', testEmail);
  await page.click('text=Send Magic Link');

  // Fetch the email
  const emailResponse = await request.get(
    'https://api.plop.email/v1/messages/latest',
    {
      params: { to: testEmail },
      headers: { Authorization: \`Bearer \${process.env.PLOP_API_KEY}\` },
    }
  );
  const email = await emailResponse.json();

  // Extract magic link from email HTML
  const magicLinkMatch = email.html.match(/href="([^"]*magic[^"]*)"/);
  expect(magicLinkMatch).toBeTruthy();

  // Navigate to magic link
  await page.goto(magicLinkMatch[1]);

  // Verify user is logged in
  await expect(page.locator('text=Dashboard')).toBeVisible();
});`,
    },
    tips: [
      "Use Date.now() or crypto.randomUUID() for unique test emails",
      "Add retry logic for email fetching in case of delivery delays",
      "Store PLOP_API_KEY in CI secrets, not in code",
      "Use Playwright's request fixture for API calls within tests",
    ],
    relatedIntegrations: ["cypress", "jest"],
    relatedUseCases: ["e2e-testing", "magic-links"],
    docsUrl: "https://playwright.dev/docs/intro",
  },
  {
    slug: "cypress",
    name: "Cypress",
    description: "E2E testing with Cypress",
    metaDescription:
      "Integrate plop.email with Cypress for email verification in E2E tests. Test email flows with cy.request().",
    icon: "Leaf",
    category: "testing",
    heroTitle: "Cypress + plop.email",
    heroDescription:
      "Verify emails in your Cypress E2E tests. Use cy.request() to fetch and assert on email content.",
    features: [
      {
        title: "Custom Commands",
        description:
          "Create reusable cy.getEmail() and cy.waitForEmail() commands.",
      },
      {
        title: "Chainable API",
        description: "Fluent assertions that fit Cypress patterns.",
      },
      {
        title: "Retry Built-in",
        description: "Leverage Cypress retry-ability for email polling.",
      },
      {
        title: "Dashboard Integration",
        description: "Email test results visible in Cypress Dashboard.",
      },
    ],
    installation: {
      title: "Setup",
      code: `# Install Cypress
npm install cypress --save-dev

# Add to cypress.config.ts
export default defineConfig({
  e2e: {
    env: {
      PLOP_API_KEY: process.env.PLOP_API_KEY,
      PLOP_API_URL: 'https://api.plop.email/v1',
    },
  },
});`,
    },
    quickStart: {
      title: "Custom Command Setup",
      description: "Add a reusable command for fetching emails.",
      code: `// cypress/support/commands.ts
Cypress.Commands.add('getLatestEmail', (toAddress: string) => {
  return cy.request({
    method: 'GET',
    url: \`\${Cypress.env('PLOP_API_URL')}/messages/latest\`,
    headers: {
      Authorization: \`Bearer \${Cypress.env('PLOP_API_KEY')}\`,
    },
    qs: { to: toAddress },
  }).its('body');
});

// Usage in test
describe('Email Verification', () => {
  it('sends confirmation email', () => {
    const testEmail = \`test+\${Date.now()}@in.plop.email\`;

    cy.visit('/signup');
    cy.get('[name="email"]').type(testEmail);
    cy.get('form').submit();

    cy.wait(2000);
    cy.getLatestEmail(testEmail).then((email) => {
      expect(email.subject).to.include('Confirm');
    });
  });
});`,
    },
    advancedExample: {
      title: "Polling for Email Arrival",
      description: "Retry until email arrives with custom timeout.",
      code: `// cypress/support/commands.ts
Cypress.Commands.add('waitForEmail', (toAddress: string, options = {}) => {
  const { timeout = 10000, interval = 1000, subject } = options;

  const fetchEmail = () => {
    return cy.request({
      method: 'GET',
      url: \`\${Cypress.env('PLOP_API_URL')}/messages/latest\`,
      headers: {
        Authorization: \`Bearer \${Cypress.env('PLOP_API_KEY')}\`,
      },
      qs: { to: toAddress },
      failOnStatusCode: false,
    });
  };

  return cy.wrap(null, { timeout }).should(() => {
    return fetchEmail().then((response) => {
      if (response.status !== 200) {
        throw new Error('Email not yet received');
      }
      if (subject && !response.body.subject.includes(subject)) {
        throw new Error('Email subject does not match');
      }
      return response.body;
    });
  });
});

// Usage
cy.waitForEmail(testEmail, { subject: 'Reset', timeout: 15000 });`,
    },
    tips: [
      "Define custom commands in cypress/support/commands.ts",
      "Use cy.intercept() to stub email sending in unit tests",
      "Add TypeScript types for custom commands in cypress.d.ts",
      "Run email tests in a separate spec file for better organization",
    ],
    relatedIntegrations: ["playwright", "jest"],
    relatedUseCases: ["e2e-testing", "transactional-emails"],
    docsUrl: "https://docs.cypress.io",
  },
  {
    slug: "jest",
    name: "Jest",
    description: "JavaScript/TypeScript testing with Jest",
    metaDescription:
      "Use plop.email with Jest for testing email functionality. Verify emails in Node.js integration tests.",
    icon: "FlaskConical",
    category: "testing",
    heroTitle: "Jest + plop.email",
    heroDescription:
      "Add email verification to your Jest test suites. Perfect for API and integration tests.",
    features: [
      {
        title: "Async/Await",
        description: "Clean async syntax for email fetching and assertions.",
      },
      {
        title: "Custom Matchers",
        description: "Create expect.toHaveReceivedEmail() custom matchers.",
      },
      {
        title: "Setup/Teardown",
        description: "Use beforeAll/afterAll for mailbox setup and cleanup.",
      },
      {
        title: "Snapshot Testing",
        description: "Snapshot email content for regression detection.",
      },
    ],
    installation: {
      title: "Setup",
      code: `# Install Jest and fetch
npm install jest @types/jest ts-jest --save-dev

# Create a plop client helper
// src/test/plop-client.ts
export const plopClient = {
  baseUrl: 'https://api.plop.email/v1',
  apiKey: process.env.PLOP_API_KEY,

  async getLatest(to: string) {
    const res = await fetch(\`\${this.baseUrl}/messages/latest?to=\${to}\`, {
      headers: { Authorization: \`Bearer \${this.apiKey}\` },
    });
    return res.json();
  },
};`,
    },
    quickStart: {
      title: "Basic Integration Test",
      description: "Test email sending in your application.",
      code: `import { plopClient } from './plop-client';
import { sendWelcomeEmail } from '../src/email';

describe('Email Service', () => {
  it('sends welcome email with correct content', async () => {
    const testEmail = \`jest+\${Date.now()}@in.plop.email\`;

    // Trigger email from your application
    await sendWelcomeEmail({
      to: testEmail,
      name: 'Test User',
    });

    // Wait for delivery
    await new Promise(r => setTimeout(r, 2000));

    // Fetch and verify
    const email = await plopClient.getLatest(testEmail);

    expect(email.subject).toBe('Welcome to Our App!');
    expect(email.html).toContain('Test User');
    expect(email.html).toContain('Get Started');
  });
});`,
    },
    advancedExample: {
      title: "Custom Jest Matcher",
      description: "Create a reusable email assertion matcher.",
      code: `// test/matchers/email.ts
import { plopClient } from '../plop-client';

expect.extend({
  async toHaveReceivedEmail(address: string, expected: {
    subject?: string | RegExp;
    bodyContains?: string[];
  }) {
    const email = await plopClient.getLatest(address);

    if (!email || email.error) {
      return {
        pass: false,
        message: () => \`Expected \${address} to have received an email\`,
      };
    }

    if (expected.subject) {
      const subjectMatch = expected.subject instanceof RegExp
        ? expected.subject.test(email.subject)
        : email.subject.includes(expected.subject);

      if (!subjectMatch) {
        return {
          pass: false,
          message: () => \`Expected subject "\${email.subject}" to match \${expected.subject}\`,
        };
      }
    }

    return { pass: true, message: () => '' };
  },
});

// Usage
await expect(testEmail).toHaveReceivedEmail({
  subject: /Welcome/,
  bodyContains: ['Get Started', 'Dashboard'],
});`,
    },
    tips: [
      "Use jest.setTimeout() for longer email delivery times",
      "Create a shared test utility file for email helpers",
      "Mock the email service in unit tests, use plop for integration tests",
      "Use describe.each() for testing multiple email templates",
    ],
    relatedIntegrations: ["playwright", "cypress"],
    relatedUseCases: ["transactional-emails", "ci-cd-pipelines"],
    docsUrl: "https://jestjs.io/docs/getting-started",
  },
  {
    slug: "pytest",
    name: "pytest",
    description: "Python testing with pytest",
    metaDescription:
      "Use plop.email with pytest for testing email in Python applications. Verify Django, FastAPI, and Flask emails.",
    icon: "Code",
    category: "testing",
    heroTitle: "pytest + plop.email",
    heroDescription:
      "Test email functionality in Python applications. Works with Django, FastAPI, Flask, and any Python framework.",
    features: [
      {
        title: "Fixtures",
        description: "Create pytest fixtures for email testing setup.",
      },
      {
        title: "Parametrize",
        description:
          "Test multiple email scenarios with @pytest.mark.parametrize.",
      },
      {
        title: "Async Support",
        description: "Use pytest-asyncio for async email fetching.",
      },
      {
        title: "Framework Agnostic",
        description: "Works with Django, FastAPI, Flask, and more.",
      },
    ],
    installation: {
      title: "Setup",
      code: `# Install pytest and requests
pip install pytest requests python-dotenv

# Create conftest.py with fixtures
# tests/conftest.py
import pytest
import requests
import os
import time

@pytest.fixture
def plop_client():
    class PlopClient:
        def __init__(self):
            self.base_url = "https://api.plop.email/v1"
            self.api_key = os.environ["PLOP_API_KEY"]

        def get_latest(self, to: str):
            response = requests.get(
                f"{self.base_url}/messages/latest",
                params={"to": to},
                headers={"Authorization": f"Bearer {self.api_key}"},
            )
            return response.json()

    return PlopClient()`,
    },
    quickStart: {
      title: "Basic Email Test",
      description: "Test email sending in a Python application.",
      code: `import pytest
import time
from myapp.email import send_welcome_email

def test_welcome_email(plop_client):
    test_email = f"pytest+{int(time.time())}@in.plop.email"

    # Send email from your application
    send_welcome_email(to=test_email, name="Test User")

    # Wait for delivery
    time.sleep(2)

    # Fetch and verify
    email = plop_client.get_latest(test_email)

    assert "Welcome" in email["subject"]
    assert "Test User" in email["html"]
    assert "Get Started" in email["html"]`,
    },
    advancedExample: {
      title: "Parametrized Email Tests",
      description: "Test multiple email templates with parametrize.",
      code: `import pytest
import time

@pytest.fixture
def unique_email():
    return f"pytest+{int(time.time() * 1000)}@in.plop.email"

@pytest.mark.parametrize("template,expected_subject,expected_content", [
    ("welcome", "Welcome", ["Get Started", "Dashboard"]),
    ("password_reset", "Reset Your Password", ["Reset Link", "expires in"]),
    ("invoice", "Your Invoice", ["Amount Due", "Pay Now"]),
])
def test_email_templates(
    plop_client,
    unique_email,
    template,
    expected_subject,
    expected_content
):
    # Trigger email
    send_email(template=template, to=unique_email)
    time.sleep(2)

    # Verify
    email = plop_client.get_latest(unique_email)

    assert expected_subject in email["subject"]
    for content in expected_content:
        assert content in email["html"], f"Missing: {content}"`,
    },
    tips: [
      "Use pytest fixtures for DRY test setup",
      "Add @pytest.mark.integration for email tests",
      "Use freezegun for testing time-sensitive emails",
      "Consider pytest-asyncio for async frameworks like FastAPI",
    ],
    relatedIntegrations: ["jest", "playwright"],
    relatedUseCases: ["transactional-emails", "ci-cd-pipelines"],
    docsUrl: "https://docs.pytest.org",
  },
  {
    slug: "postman",
    name: "Postman",
    description: "API testing with Postman",
    metaDescription:
      "Test email APIs with Postman. Create collections for email verification workflows and automate with Newman.",
    icon: "Send",
    category: "api",
    heroTitle: "Postman + plop.email",
    heroDescription:
      "Build and test email workflows in Postman. Perfect for API exploration, testing, and documentation.",
    features: [
      {
        title: "Collection Workflows",
        description: "Chain requests: trigger email → fetch → verify content.",
      },
      {
        title: "Environment Variables",
        description: "Store API keys and test emails securely.",
      },
      {
        title: "Newman CLI",
        description: "Run Postman collections in CI/CD with Newman.",
      },
      {
        title: "Pre-request Scripts",
        description: "Generate unique emails dynamically.",
      },
    ],
    installation: {
      title: "Setup",
      code: `// 1. Create a Postman Environment with:
{
  "PLOP_API_KEY": "your_api_key",
  "PLOP_BASE_URL": "https://api.plop.email/v1",
  "TEST_MAILBOX": "postman"
}

// 2. Add Pre-request Script to generate unique emails:
const timestamp = Date.now();
pm.environment.set("TEST_EMAIL",
  \`\${pm.environment.get("TEST_MAILBOX")}+\${timestamp}@in.plop.email\`
);`,
    },
    quickStart: {
      title: "Basic Request",
      description: "Fetch the latest email from a mailbox.",
      code: `// GET Request
{{PLOP_BASE_URL}}/messages/latest?to={{TEST_EMAIL}}

// Headers
Authorization: Bearer {{PLOP_API_KEY}}

// Tests tab
pm.test("Email received", function () {
    pm.response.to.have.status(200);
    const email = pm.response.json();
    pm.expect(email.subject).to.include("Welcome");
});`,
    },
    advancedExample: {
      title: "Multi-Step Email Workflow",
      description: "Complete email testing workflow in a collection.",
      code: `// Collection Structure:
// 1. Trigger Signup (POST to your API)
// 2. Wait for Email (with retry)
// 3. Verify Email Content
// 4. Extract and Test Magic Link

// Request 2: Fetch Email (with retry script)
// Pre-request Script:
const maxRetries = 5;
const retryDelay = 2000;
let currentRetry = pm.environment.get("retryCount") || 0;

if (currentRetry > 0) {
    console.log(\`Retry attempt \${currentRetry} of \${maxRetries}\`);
}

// Tests tab (with retry logic):
const response = pm.response.json();

if (response.error && pm.environment.get("retryCount") < 5) {
    const retryCount = parseInt(pm.environment.get("retryCount") || "0") + 1;
    pm.environment.set("retryCount", retryCount);

    setTimeout(() => {
        postman.setNextRequest(pm.info.requestName);
    }, 2000);
} else {
    pm.environment.unset("retryCount");
    pm.test("Email received", () => {
        pm.expect(response.subject).to.exist;
    });
}`,
    },
    tips: [
      "Use Collection Runner for repeatable email test workflows",
      "Store sensitive data in Environments, not in collections",
      "Use Newman for CI/CD integration: newman run collection.json -e env.json",
      "Add delays between requests for email delivery time",
    ],
    relatedIntegrations: ["jest", "cypress"],
    relatedUseCases: ["transactional-emails", "ci-cd-pipelines"],
    docsUrl: "https://learning.postman.com",
  },
];

export function getIntegration(slug: string): Integration | undefined {
  return integrations.find((i) => i.slug === slug);
}

export function getRelatedIntegrations(slugs: string[]): Integration[] {
  return integrations.filter((i) => slugs.includes(i.slug));
}

export function getIntegrationsByCategory(
  category: Integration["category"],
): Integration[] {
  return integrations.filter((i) => i.category === category);
}
