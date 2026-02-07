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
    slug: "typescript-sdk",
    name: "TypeScript SDK",
    description:
      "Official TypeScript SDK for Plop with built-in polling, typed responses, and zero runtime dependencies.",
    metaDescription:
      "Official TypeScript SDK for plop.email. Built-in polling with waitFor(), typed responses, and zero runtime dependencies.",
    icon: "FileCode",
    category: "language",
    heroTitle: "TypeScript SDK for plop.email",
    heroDescription:
      "The official TypeScript SDK with built-in polling, typed responses, and zero runtime dependencies. One line to wait for emails.",
    features: [
      {
        title: "Built-in Polling",
        description:
          "Use waitFor() to poll for emails with configurable timeout and interval. No manual retry loops.",
      },
      {
        title: "Typed Responses",
        description:
          "Full TypeScript types for all API responses. Autocomplete for message fields, filters, and options.",
      },
      {
        title: "Zero Dependencies",
        description:
          "No runtime dependencies. Uses native fetch under the hood. Works in Node.js, Bun, and Deno.",
      },
      {
        title: "Webhook Verification",
        description:
          "Built-in webhook signature verification with verifyWebhookSignature() for secure integrations.",
      },
    ],
    installation: {
      title: "Setup",
      code: `# Install the SDK
npm install @plop/sdk

# Set your API key
export PLOP_API_KEY=your_api_key`,
    },
    quickStart: {
      title: "Wait for an Email",
      description:
        "Initialize the client and wait for an email to arrive. One line replaces manual polling loops.",
      code: `import { Plop } from '@plop/sdk';

const plop = new Plop({ apiKey: process.env.PLOP_API_KEY });

// Wait for the latest email (polls automatically)
const message = await plop.waitFor({
  mailbox: 'qa',
  tag: 'signup',
  timeout: 10_000,
});

// Typed response — full autocomplete
console.log(message.subject);
console.log(message.textContent);

// Extract OTP from email body
const otp = message.textContent?.match(/\\b\\d{6}\\b/)?.[0];`,
    },
    advancedExample: {
      title: "List, Filter & Verify Webhooks",
      description:
        "List messages with filters and verify incoming webhook signatures.",
      code: `import { Plop, verifyWebhookSignature } from '@plop/sdk';

const plop = new Plop({ apiKey: process.env.PLOP_API_KEY });

// List messages with filters
const messages = await plop.messages.list({
  mailbox: 'qa',
  tag: 'password-reset',
  limit: 5,
});

for (const msg of messages.data) {
  console.log(\`\${msg.subject} — \${msg.from}\`);
}

// Verify webhook signature
const isValid = verifyWebhookSignature({
  payload: requestBody,
  signature: headers['x-plop-signature'],
  secret: process.env.PLOP_WEBHOOK_SECRET!,
});`,
    },
    tips: [
      "Use waitFor() instead of manual polling loops — it handles retries and timeout",
      "Set PLOP_API_KEY as an environment variable to avoid hardcoding secrets",
      "Use the tag parameter to isolate emails per test for parallel execution",
      "The SDK works with any test framework — Playwright, Cypress, Jest, Vitest",
      "Use plop.messages.stream() for real-time SSE notifications instead of polling",
      "Manage webhooks programmatically with plop.webhooks.create(), .delete(), .toggle()",
    ],
    relatedIntegrations: ["python-sdk", "playwright", "cypress"],
    relatedUseCases: ["e2e-testing", "transactional-emails"],
    docsUrl: "https://docs.plop.email/sdks/typescript",
  },
  {
    slug: "python-sdk",
    name: "Python SDK",
    description:
      "Official Python SDK for Plop with sync/async clients, Pydantic models, and built-in polling.",
    metaDescription:
      "Official Python SDK for plop.email. Sync and async clients, Pydantic models, and built-in polling with wait_for().",
    icon: "Terminal",
    category: "language",
    heroTitle: "Python SDK for plop.email",
    heroDescription:
      "The official Python SDK with sync and async clients, Pydantic models, and built-in polling. One line to wait for emails.",
    features: [
      {
        title: "Sync & Async Clients",
        description:
          "Use Plop() for synchronous code or AsyncPlop() for async/await. Both share the same API surface.",
      },
      {
        title: "Built-in Polling",
        description:
          "Use wait_for() to poll for emails with configurable timeout and interval. No manual retry loops.",
      },
      {
        title: "Pydantic Models",
        description:
          "All responses are typed Pydantic models with full IDE autocomplete and validation.",
      },
      {
        title: "pytest Ready",
        description:
          "Drop-in pytest fixture included. One decorator to inject a plop client into any test.",
      },
    ],
    installation: {
      title: "Setup",
      code: `# Install the SDK
pip install plop-sdk

# Set your API key
export PLOP_API_KEY=your_api_key`,
    },
    quickStart: {
      title: "Wait for an Email",
      description:
        "Initialize the client and wait for an email to arrive. One line replaces manual polling loops.",
      code: `from plop import Plop

client = Plop(api_key="your_api_key")

# Wait for the latest email (polls automatically)
message = client.wait_for(
    mailbox="qa",
    tag="signup",
    timeout=10.0,
)

# Pydantic model — full autocomplete
print(message.subject)
print(message.text_content)

# Extract OTP from email body
import re
otp = re.search(r"\\b\\d{6}\\b", message.text_content or "")`,
    },
    advancedExample: {
      title: "Async Client & pytest Fixture",
      description:
        "Use the async client for high-throughput scenarios and the built-in pytest fixture for testing.",
      code: `import pytest
from plop import AsyncPlop

# Async client for concurrent operations
async def check_emails():
    async with AsyncPlop(api_key="your_api_key") as client:
        messages = await client.messages.list(
            mailbox="qa",
            tag="password-reset",
            limit=5,
        )
        for msg in messages.data:
            print(f"{msg.subject} — {msg.sender}")


# pytest fixture — inject plop into any test
@pytest.fixture
def plop_client():
    return Plop(api_key=os.environ["PLOP_API_KEY"])


def test_welcome_email(plop_client):
    # Trigger your app to send an email...
    msg = plop_client.wait_for(
        mailbox="qa",
        tag="welcome",
        timeout=10.0,
    )
    assert "Welcome" in msg.subject
    assert "Get Started" in msg.text_content`,
    },
    tips: [
      "Use wait_for() instead of time.sleep() loops — it handles retries and timeout",
      "Use AsyncPlop for FastAPI, aiohttp, or any async Python framework",
      "Set PLOP_API_KEY as an environment variable to avoid hardcoding secrets",
      "Use the tag parameter to isolate emails per test for parallel execution",
      "Use plop.messages.stream() for real-time SSE notifications instead of polling",
      "Manage webhooks, mailboxes, and API keys with full CRUD methods",
    ],
    relatedIntegrations: ["typescript-sdk", "playwright", "cypress"],
    relatedUseCases: ["e2e-testing", "transactional-emails"],
    docsUrl: "https://docs.plop.email/sdks/python",
  },
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
  const magicLinkMatch = email.htmlContent.match(/href="([^"]*magic[^"]*)"/);
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
    expect(email.htmlContent).toContain('Test User');
    expect(email.htmlContent).toContain('Get Started');
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
    assert "Test User" in email["htmlContent"]
    assert "Get Started" in email["htmlContent"]`,
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
        assert content in email["htmlContent"], f"Missing: {content}"`,
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
  {
    slug: "selenium",
    name: "Selenium",
    description: "E2E testing with Selenium WebDriver",
    metaDescription:
      "Integrate plop.email with Selenium for email verification in browser automation tests. Test email flows with Java, Python, or JavaScript.",
    icon: "Globe",
    category: "testing",
    heroTitle: "Selenium + plop.email",
    heroDescription:
      "Add email verification to your Selenium tests. Works with Java, Python, C#, and all Selenium language bindings.",
    features: [
      {
        title: "Language Agnostic",
        description:
          "Use with any Selenium binding—Java, Python, C#, Ruby, JavaScript.",
      },
      {
        title: "REST API Integration",
        description:
          "Fetch emails using standard HTTP libraries in your test code.",
      },
      {
        title: "Grid Compatible",
        description:
          "Works with Selenium Grid for parallel and distributed testing.",
      },
      {
        title: "Cross-Browser Testing",
        description: "Verify email flows across Chrome, Firefox, Safari, Edge.",
      },
    ],
    installation: {
      title: "Setup",
      code: `# Python example
pip install selenium requests

# Java example (add to pom.xml)
<dependency>
  <groupId>org.seleniumhq.selenium</groupId>
  <artifactId>selenium-java</artifactId>
</dependency>

# Set environment variable
export PLOP_API_KEY=your_api_key`,
    },
    quickStart: {
      title: "Python Selenium Example",
      description: "Test email flows with Selenium and Python.",
      code: `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests
import time
import os

def test_signup_email():
    driver = webdriver.Chrome()
    test_email = f"selenium+{int(time.time())}@in.plop.email"

    try:
        # Complete signup flow
        driver.get("https://yourapp.com/signup")
        driver.find_element(By.NAME, "email").send_keys(test_email)
        driver.find_element(By.NAME, "password").send_keys("SecurePass123!")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        # Wait for confirmation page
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "success-message"))
        )

        # Fetch email via plop API
        time.sleep(2)  # Allow email delivery
        response = requests.get(
            "https://api.plop.email/v1/messages/latest",
            params={"to": test_email},
            headers={"Authorization": f"Bearer {os.environ['PLOP_API_KEY']}"}
        )
        email = response.json()

        # Verify email content
        assert "Welcome" in email["subject"]
        assert "Get Started" in email["htmlContent"]

    finally:
        driver.quit()`,
    },
    advancedExample: {
      title: "Java Selenium Example",
      description: "Email testing with Selenium and Java.",
      code: `import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import java.net.http.*;
import java.net.URI;

public class EmailTest {
    public void testPasswordReset() throws Exception {
        WebDriver driver = new ChromeDriver();
        String testEmail = "selenium+" + System.currentTimeMillis() + "@in.plop.email";

        try {
            // Request password reset
            driver.get("https://yourapp.com/forgot-password");
            driver.findElement(By.name("email")).sendKeys(testEmail);
            driver.findElement(By.cssSelector("button[type='submit']")).click();

            Thread.sleep(3000); // Wait for email

            // Fetch email via API
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.plop.email/v1/messages/latest?to=" + testEmail))
                .header("Authorization", "Bearer " + System.getenv("PLOP_API_KEY"))
                .build();

            HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());

            // Parse and verify
            assert response.body().contains("Reset");

        } finally {
            driver.quit();
        }
    }
}`,
    },
    tips: [
      "Use explicit waits for email delivery instead of Thread.sleep()",
      "Generate unique emails using timestamps or UUIDs",
      "Store PLOP_API_KEY in CI secrets or environment variables",
      "Consider using a Page Object pattern for email verification methods",
    ],
    relatedIntegrations: ["playwright", "cypress"],
    relatedUseCases: ["e2e-testing", "transactional-emails"],
    docsUrl: "https://www.selenium.dev/documentation/",
  },
  {
    slug: "puppeteer",
    name: "Puppeteer",
    description: "Browser automation with Puppeteer",
    metaDescription:
      "Integrate plop.email with Puppeteer for email testing in Node.js browser automation. Test email flows with headless Chrome.",
    icon: "Wand",
    category: "testing",
    heroTitle: "Puppeteer + plop.email",
    heroDescription:
      "Add email verification to your Puppeteer browser automation tests. Perfect for Node.js testing with headless Chrome.",
    features: [
      {
        title: "Native Node.js",
        description:
          "First-class JavaScript/TypeScript support with async/await.",
      },
      {
        title: "Headless Chrome",
        description: "Fast, efficient testing with Chrome's DevTools Protocol.",
      },
      {
        title: "Screenshot & PDF",
        description: "Capture visual evidence alongside email verification.",
      },
      {
        title: "Network Interception",
        description:
          "Mock and intercept network requests for isolated testing.",
      },
    ],
    installation: {
      title: "Setup",
      code: `# Install Puppeteer
npm install puppeteer

# Or for just the core library (bring your own browser)
npm install puppeteer-core

# Add environment variable
echo "PLOP_API_KEY=your_api_key" >> .env`,
    },
    quickStart: {
      title: "Basic Email Test",
      description: "Test email flows with Puppeteer.",
      code: `const puppeteer = require('puppeteer');

async function testSignupEmail() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const testEmail = \`puppeteer+\${Date.now()}@in.plop.email\`;

  try {
    // Complete signup
    await page.goto('https://yourapp.com/signup');
    await page.type('[name="email"]', testEmail);
    await page.type('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.success-message');

    // Wait for email delivery
    await new Promise(r => setTimeout(r, 2000));

    // Fetch email via plop API
    const response = await fetch(
      \`https://api.plop.email/v1/messages/latest?to=\${testEmail}\`,
      {
        headers: { Authorization: \`Bearer \${process.env.PLOP_API_KEY}\` }
      }
    );
    const email = await response.json();

    // Verify
    console.assert(email.subject.includes('Welcome'), 'Should have welcome subject');
    console.assert(email.htmlContent.includes('Get Started'), 'Should have CTA');

  } finally {
    await browser.close();
  }
}

testSignupEmail();`,
    },
    advancedExample: {
      title: "Email Link Navigation",
      description: "Extract links from emails and navigate to them.",
      code: `const puppeteer = require('puppeteer');

async function testEmailVerificationFlow() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const testEmail = \`verify+\${Date.now()}@in.plop.email\`;

  // Trigger verification email
  await page.goto('https://yourapp.com/signup');
  await page.type('[name="email"]', testEmail);
  await page.type('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');

  // Fetch verification email
  await new Promise(r => setTimeout(r, 3000));
  const response = await fetch(
    \`https://api.plop.email/v1/messages/latest?to=\${testEmail}\`,
    { headers: { Authorization: \`Bearer \${process.env.PLOP_API_KEY}\` } }
  );
  const email = await response.json();

  // Extract verification link
  const linkMatch = email.htmlContent.match(/href="([^"]*verify[^"]*)"/);
  if (!linkMatch) throw new Error('No verification link found');

  // Navigate to verification link
  await page.goto(linkMatch[1]);

  // Verify account is now confirmed
  await page.waitForSelector('text=Email verified');

  // Take screenshot as evidence
  await page.screenshot({ path: 'verified.png' });

  await browser.close();
}`,
    },
    tips: [
      "Use page.waitForNetworkIdle() after form submissions before fetching emails",
      "Set a longer navigation timeout for pages that send emails",
      "Use puppeteer-extra for additional features like stealth mode",
      "Consider using jest-puppeteer for test framework integration",
    ],
    relatedIntegrations: ["playwright", "cypress"],
    relatedUseCases: ["e2e-testing", "magic-links"],
    docsUrl: "https://pptr.dev/",
  },
  {
    slug: "webdriverio",
    name: "WebdriverIO",
    description: "Browser automation with WebdriverIO",
    metaDescription:
      "Integrate plop.email with WebdriverIO for email verification in your automated tests. Test email flows with WDIO's powerful test runner.",
    icon: "Zap",
    category: "testing",
    heroTitle: "WebdriverIO + plop.email",
    heroDescription:
      "Add email verification to your WebdriverIO tests. Leverage WDIO's powerful async API and test runner capabilities.",
    features: [
      {
        title: "Built-in Test Runner",
        description:
          "Integrated test runner with Mocha, Jasmine, or Cucumber support.",
      },
      {
        title: "Multi-Browser Support",
        description:
          "Test across Chrome, Firefox, Safari, and mobile browsers.",
      },
      {
        title: "Service Integration",
        description:
          "Easy integration with Sauce Labs, BrowserStack, and other services.",
      },
      {
        title: "Page Object Pattern",
        description: "Built-in support for maintainable test architecture.",
      },
    ],
    installation: {
      title: "Setup",
      code: `# Install WebdriverIO
npm init wdio@latest ./

# Select your preferences in the wizard

# Add to wdio.conf.js
export const config = {
  // ... your config
  before: function () {
    global.PLOP_API_KEY = process.env.PLOP_API_KEY;
  },
};`,
    },
    quickStart: {
      title: "WDIO Email Test",
      description: "Test email flows with WebdriverIO.",
      code: `// test/specs/email.e2e.js
describe('Email verification', () => {
  it('should send welcome email after signup', async () => {
    const testEmail = \`wdio+\${Date.now()}@in.plop.email\`;

    // Navigate and fill form
    await browser.url('/signup');
    await $('[name="email"]').setValue(testEmail);
    await $('[name="password"]').setValue('SecurePass123!');
    await $('button[type="submit"]').click();

    // Wait for success
    await expect($('.success-message')).toBeDisplayed();

    // Fetch email
    await browser.pause(2000);
    const response = await fetch(
      \`https://api.plop.email/v1/messages/latest?to=\${testEmail}\`,
      { headers: { Authorization: \`Bearer \${global.PLOP_API_KEY}\` } }
    );
    const email = await response.json();

    // Assert
    expect(email.subject).toContain('Welcome');
    expect(email.htmlContent).toContain('Get Started');
  });
});`,
    },
    advancedExample: {
      title: "Custom Email Command",
      description: "Add a reusable command for email fetching.",
      code: `// wdio.conf.js - Add custom command
export const config = {
  before: function () {
    browser.addCommand('getEmail', async function (toAddress) {
      const maxRetries = 5;
      const delay = 2000;

      for (let i = 0; i < maxRetries; i++) {
        const response = await fetch(
          \`https://api.plop.email/v1/messages/latest?to=\${toAddress}\`,
          { headers: { Authorization: \`Bearer \${process.env.PLOP_API_KEY}\` } }
        );
        const data = await response.json();

        if (!data.error) return data;
        await browser.pause(delay);
      }
      throw new Error(\`No email received for \${toAddress}\`);
    });
  },
};

// Usage in test
describe('Password reset', () => {
  it('should receive reset email', async () => {
    const testEmail = \`reset+\${Date.now()}@in.plop.email\`;

    await browser.url('/forgot-password');
    await $('[name="email"]').setValue(testEmail);
    await $('button').click();

    const email = await browser.getEmail(testEmail);
    expect(email.subject).toContain('Reset');
  });
});`,
    },
    tips: [
      "Add custom commands for email operations to keep tests DRY",
      "Use browser.pause() strategically for email delivery timing",
      "Configure retries in wdio.conf.js for email-dependent tests",
      "Use Allure reporter to capture email verification results",
    ],
    relatedIntegrations: ["selenium", "playwright"],
    relatedUseCases: ["e2e-testing", "transactional-emails"],
    docsUrl: "https://webdriver.io/docs/gettingstarted",
  },
  {
    slug: "vitest",
    name: "Vitest",
    description: "Fast unit testing with Vitest",
    metaDescription:
      "Use plop.email with Vitest for email testing in your Vite projects. Fast, ESM-native testing with email verification.",
    icon: "Sparkles",
    category: "testing",
    heroTitle: "Vitest + plop.email",
    heroDescription:
      "Add email verification to your Vitest test suites. Fast, ESM-native testing with Vite's speed.",
    features: [
      {
        title: "Vite-Powered",
        description:
          "Instant test startup with Vite's transformation pipeline.",
      },
      {
        title: "ESM Native",
        description: "First-class ES modules support, no CommonJS workarounds.",
      },
      {
        title: "Jest Compatible",
        description: "Familiar API with Jest-compatible matchers and mocks.",
      },
      {
        title: "TypeScript Ready",
        description: "Out-of-the-box TypeScript support without configuration.",
      },
    ],
    installation: {
      title: "Setup",
      code: `# Install Vitest
npm install -D vitest

# Add to package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}

# Create vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
  },
});`,
    },
    quickStart: {
      title: "Basic Email Test",
      description: "Test email sending in your application with Vitest.",
      code: `import { describe, it, expect } from 'vitest';
import { sendWelcomeEmail } from '../src/email';

describe('Email Service', () => {
  it('sends welcome email with correct content', async () => {
    const testEmail = \`vitest+\${Date.now()}@in.plop.email\`;

    // Send email from your app
    await sendWelcomeEmail({
      to: testEmail,
      name: 'Test User',
    });

    // Fetch from plop
    const response = await fetch(
      \`https://api.plop.email/v1/messages/latest?to=\${testEmail}\`,
      { headers: { Authorization: \`Bearer \${process.env.PLOP_API_KEY}\` } }
    );
    const email = await response.json();

    // Assert
    expect(email.subject).toBe('Welcome to Our App!');
    expect(email.htmlContent).toContain('Test User');
  });
});`,
    },
    advancedExample: {
      title: "Email Test Helper",
      description: "Create a reusable email testing utility.",
      code: `// test/helpers/plop.ts
export async function fetchEmail(to: string, options?: {
  timeout?: number;
  subject?: RegExp;
}) {
  const { timeout = 10000, subject } = options ?? {};
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const response = await fetch(
      \`https://api.plop.email/v1/messages/latest?to=\${to}\`,
      { headers: { Authorization: \`Bearer \${process.env.PLOP_API_KEY}\` } }
    );
    const email = await response.json();

    if (!email.error) {
      if (subject && !subject.test(email.subject)) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      return email;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(\`Timeout waiting for email to \${to}\`);
}

// Usage in tests
import { fetchEmail } from './helpers/plop';

it('receives password reset email', async () => {
  const testEmail = \`reset+\${Date.now()}@in.plop.email\`;
  await requestPasswordReset(testEmail);

  const email = await fetchEmail(testEmail, {
    subject: /reset/i,
    timeout: 15000,
  });

  expect(email.htmlContent).toContain('Reset your password');
});`,
    },
    tips: [
      "Use vi.setSystemTime() for testing email timestamps",
      "Create a beforeEach hook to generate unique test emails",
      "Use test.concurrent for parallel email tests with unique addresses",
      "Configure testTimeout for longer email delivery tests",
    ],
    relatedIntegrations: ["jest", "playwright"],
    relatedUseCases: ["transactional-emails", "ci-cd-pipelines"],
    docsUrl: "https://vitest.dev/",
  },
];

export function getIntegration(slug: string): Integration | undefined {
  return integrations.find((integration) => integration.slug === slug);
}

export function getRelatedIntegrations(slugs: string[]): Integration[] {
  return integrations.filter((integration) => slugs.includes(integration.slug));
}

export function getIntegrationsByCategory(
  category: Integration["category"],
): Integration[] {
  return integrations.filter(
    (integration) => integration.category === category,
  );
}
