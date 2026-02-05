export interface GlossaryTerm {
  slug: string;
  term: string;
  shortDefinition: string;
  metaDescription: string;
  fullDefinition: string;
  sections: {
    title: string;
    content: string;
  }[];
  example?: {
    title: string;
    code: string;
    language: string;
  };
  relatedTerms: string[];
  relatedUseCases: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "smtp-testing",
    term: "SMTP Testing",
    shortDefinition:
      "The process of verifying that email sending and receiving works correctly via the Simple Mail Transfer Protocol.",
    metaDescription:
      "Learn what SMTP testing is, why it matters, and how to test email delivery in your applications without managing mail servers.",
    fullDefinition:
      "SMTP (Simple Mail Transfer Protocol) testing verifies that your application can successfully send emails through an SMTP server and that those emails are delivered correctly. This includes validating connection settings, authentication, message formatting, and delivery to recipient inboxes.",
    sections: [
      {
        title: "Why SMTP Testing Matters",
        content: `Email is critical infrastructure for most applications. Failed emails mean:

- Users can't reset passwords or verify accounts
- Transactional receipts and confirmations don't arrive
- Support and notification workflows break
- Customer trust erodes when expected emails don't come

SMTP testing catches these issues before they affect real users.`,
      },
      {
        title: "Traditional SMTP Testing Challenges",
        content: `Setting up SMTP testing traditionally requires:

- Running a local mail server (Mailhog, MailCatcher, etc.)
- Configuring DNS and network settings
- Managing test email accounts
- Dealing with spam filters and deliverability issues

This infrastructure is complex to maintain and often differs from production, leading to "works on my machine" problems.`,
      },
      {
        title: "Modern SMTP Testing",
        content: `Modern approaches use cloud-based email testing services that:

- Provide programmable inboxes accessible via API
- Eliminate local mail server setup
- Work identically in development, CI, and staging
- Offer deterministic, fast email retrieval

plop.email provides this modern approach—send emails to generated addresses and fetch them via REST API.`,
      },
    ],
    example: {
      title: "Testing SMTP with plop.email",
      language: "typescript",
      code: `// Instead of running a local SMTP server, use plop

// 1. Configure your app to send to plop addresses
const testEmail = 'smtp-test+1234@in.plop.email';

// 2. Trigger email from your application
await yourApp.sendEmail({
  to: testEmail,
  subject: 'Test Email',
  body: 'Hello from SMTP test!',
});

// 3. Fetch via API to verify delivery
const response = await fetch(
  'https://api.plop.email/v1/messages/latest?to=' + testEmail,
  { headers: { Authorization: 'Bearer YOUR_API_KEY' } }
);
const email = await response.json();

// 4. Assert on content
expect(email.subject).toBe('Test Email');`,
    },
    relatedTerms: ["email-deliverability", "email-api", "mailbox-routing"],
    relatedUseCases: ["e2e-testing", "transactional-emails"],
  },
  {
    slug: "email-deliverability",
    term: "Email Deliverability",
    shortDefinition:
      "The ability of an email to successfully reach the recipient's inbox rather than being blocked, bounced, or sent to spam.",
    metaDescription:
      "Understand email deliverability: what affects inbox placement, how to test it, and why it matters for your application's email success.",
    fullDefinition:
      "Email deliverability refers to whether an email successfully arrives in the recipient's inbox. It's affected by sender reputation, email authentication (SPF, DKIM, DMARC), content quality, recipient engagement, and ISP filtering. Poor deliverability means emails land in spam folders or are rejected entirely.",
    sections: [
      {
        title: "Factors Affecting Deliverability",
        content: `Email deliverability depends on multiple factors:

**Sender Reputation**
- IP address reputation
- Domain reputation
- Sending patterns and volume

**Authentication**
- SPF (Sender Policy Framework)
- DKIM (DomainKeys Identified Mail)
- DMARC (Domain-based Message Authentication)

**Content Quality**
- Spam trigger words
- HTML/text ratio
- Link quality and quantity

**Recipient Behavior**
- Open rates
- Spam complaints
- Unsubscribes`,
      },
      {
        title: "Testing vs. Production Deliverability",
        content: `When testing email functionality, you're typically testing:

1. **Functional delivery**: Does the email get sent and received?
2. **Content correctness**: Is the content what you expect?
3. **Link validation**: Do links work correctly?

This is different from production deliverability testing, which measures real-world inbox placement rates across ISPs.

For functional email testing (which plop.email provides), you verify your email logic works correctly before worrying about production deliverability optimization.`,
      },
      {
        title: "Deliverability in Development",
        content: `In development and testing environments:

- Use dedicated test inboxes (like plop.email) to verify emails are sent
- Don't send to real email addresses in tests
- Focus on content and functionality, not ISP deliverability
- Save production deliverability optimization for actual sending infrastructure

plop.email helps you verify emails are correctly generated before they reach your production email infrastructure.`,
      },
    ],
    relatedTerms: ["smtp-testing", "email-api"],
    relatedUseCases: ["transactional-emails", "onboarding-flows"],
  },
  {
    slug: "mailbox-routing",
    term: "Mailbox Routing",
    shortDefinition:
      "A technique for directing emails to specific destinations based on address patterns, commonly using plus-addressing (user+tag@domain).",
    metaDescription:
      "Learn about mailbox routing and plus-addressing: how to use email tags for organization, testing, and automated workflows.",
    fullDefinition:
      "Mailbox routing uses patterns in email addresses to direct messages to specific handlers or folders. The most common technique is plus-addressing (also called subaddressing), where anything after a '+' in the local part is a tag that can be used for filtering, organization, or identification while delivering to the same mailbox.",
    sections: [
      {
        title: "How Plus-Addressing Works",
        content: `Plus-addressing follows the pattern: **user+tag@domain.com**

- **user**: The main mailbox identifier
- **+tag**: A custom tag for routing/identification
- **@domain.com**: The email domain

For example:
- john+newsletter@example.com
- john+shopping@example.com
- john+github@example.com

All deliver to john@example.com, but the tag can be used for filtering.`,
      },
      {
        title: "Mailbox Routing for Testing",
        content: `In testing, mailbox routing provides powerful benefits:

**Test Isolation**: Each test uses a unique tag
\`\`\`
signup+test-001@in.plop.email
signup+test-002@in.plop.email
\`\`\`

**Deterministic Fetching**: Fetch emails by exact address
\`\`\`
GET /messages?to=signup+test-001@in.plop.email
\`\`\`

**Parallel Safety**: No conflicts between concurrent tests

**Context Encoding**: Include test metadata in the tag
\`\`\`
signup+ci-run-123-user-456@in.plop.email
\`\`\``,
      },
      {
        title: "plop.email Routing",
        content: `plop.email uses mailbox+tag routing for deterministic email testing:

- **Mailbox**: Your team's mailbox identifier
- **Tag**: Unique per test/scenario

Example workflow:
1. Generate unique address: \`orders+\${orderId}@in.plop.email\`
2. Use in test: Send order confirmation to that address
3. Fetch by address: \`GET /messages/latest?to=orders+12345@in.plop.email\`
4. Assert: Verify content matches order

This pattern ensures each test gets exactly the email it triggered.`,
      },
    ],
    example: {
      title: "Using Tags for Test Isolation",
      language: "typescript",
      code: `// Each test gets a unique tag
function generateTestEmail(prefix: string): string {
  const uniqueId = crypto.randomUUID();
  return \`\${prefix}+\${uniqueId}@in.plop.email\`;
}

// Test 1: Signup flow
test('signup sends welcome email', async () => {
  const email = generateTestEmail('signup');
  await signup(email);
  const message = await plop.getLatest(email);
  expect(message.subject).toContain('Welcome');
});

// Test 2: Password reset (runs in parallel, no conflict)
test('password reset sends link', async () => {
  const email = generateTestEmail('reset');
  await requestReset(email);
  const message = await plop.getLatest(email);
  expect(message.subject).toContain('Reset');
});`,
    },
    relatedTerms: ["smtp-testing", "email-api"],
    relatedUseCases: ["e2e-testing", "ci-cd-pipelines"],
  },
  {
    slug: "email-api",
    term: "Email API",
    shortDefinition:
      "A programmatic interface for sending, receiving, or managing emails without direct SMTP server interaction.",
    metaDescription:
      "Understand email APIs: how they work, types of email APIs (sending vs receiving), and how to use them for automation and testing.",
    fullDefinition:
      "An email API is a set of programmatic endpoints that allow applications to send, receive, or manage emails over HTTP rather than using SMTP directly. Email APIs abstract away the complexity of email protocols and provide features like delivery tracking, analytics, and programmable inboxes.",
    sections: [
      {
        title: "Types of Email APIs",
        content: `Email APIs generally fall into two categories:

**Sending APIs** (Transactional Email)
- Resend, SendGrid, Postmark, Mailgun
- Send emails programmatically via HTTP
- Provide delivery tracking and analytics
- Handle SMTP complexity behind the scenes

**Receiving APIs** (Programmable Inboxes)
- plop.email, Mailosaur, Mailtrap
- Receive and store emails for programmatic access
- Fetch email content via REST endpoints
- Used for testing and automation`,
      },
      {
        title: "Email API vs SMTP",
        content: `**SMTP (Direct)**
- Lower-level protocol
- Requires server configuration
- Synchronous, connection-based
- More control, more complexity

**Email API**
- HTTP-based, RESTful
- No server setup required
- Async, stateless requests
- Simpler integration, less control

For most applications, APIs provide the right balance of simplicity and functionality.`,
      },
      {
        title: "Using Email APIs for Testing",
        content: `Email APIs enable automated email testing workflows:

1. **Generate Test Address**: Create a unique address for the test
2. **Trigger Action**: Your app sends email to that address
3. **API Fetch**: Retrieve the email via REST endpoint
4. **Assert**: Verify content matches expectations

\`\`\`
POST /your-app/signup { email: "test+123@in.plop.email" }
GET  /plop/messages/latest?to=test+123@in.plop.email
→ Returns { subject, htmlContent, textContent, from, to, ... }
\`\`\`

This is simpler and more reliable than SMTP-based testing approaches.`,
      },
    ],
    example: {
      title: "plop.email API Example",
      language: "typescript",
      code: `// plop.email receiving API endpoints

// List all messages in a mailbox
const list = await fetch('https://api.plop.email/v1/messages', {
  headers: { Authorization: 'Bearer YOUR_KEY' },
});

// Get the latest message for a specific address
const latest = await fetch(
  'https://api.plop.email/v1/messages/latest?to=test@in.plop.email',
  { headers: { Authorization: 'Bearer YOUR_KEY' } }
);

// Get a specific message by ID
const message = await fetch(
  'https://api.plop.email/v1/messages/msg_abc123',
  { headers: { Authorization: 'Bearer YOUR_KEY' } }
);

// Response includes full email data
// { id, from, to, subject, htmlContent, textContent, receivedAt, ... }`,
    },
    relatedTerms: ["smtp-testing", "email-deliverability", "mailbox-routing"],
    relatedUseCases: ["transactional-emails", "e2e-testing"],
  },
  {
    slug: "email-testing",
    term: "Email Testing",
    shortDefinition:
      "The practice of verifying that application email functionality works correctly, including sending, content, delivery, and rendering.",
    metaDescription:
      "Complete guide to email testing: what it is, why it matters, different approaches, and best practices for testing email in your applications.",
    fullDefinition:
      "Email testing encompasses all practices for verifying email functionality in applications. This includes testing that emails are sent correctly, contain expected content, links work, templates render properly, and emails arrive at the intended recipients. Email testing can be manual or automated, and ranges from unit testing email generation to end-to-end testing of complete email workflows.",
    sections: [
      {
        title: "Types of Email Testing",
        content: `**Unit Testing**
- Test email template generation
- Mock email sending service
- Verify email object structure

**Integration Testing**
- Test email service integration
- Verify emails reach test inboxes
- Check content and attachments

**End-to-End Testing**
- Test complete user flows involving email
- Signup → receive welcome → click link → activate
- Password reset → receive email → reset → confirm

**Visual/Rendering Testing**
- Test email appearance across clients
- Gmail, Outlook, Apple Mail rendering
- Mobile vs desktop views`,
      },
      {
        title: "Email Testing Challenges",
        content: `Email testing presents unique challenges:

**Asynchronous Nature**
- Emails don't arrive instantly
- Tests need waiting/polling logic
- Timing varies by environment

**Infrastructure Requirements**
- Need to receive emails somewhere
- Production inboxes are off-limits
- Local mail servers are complex

**Isolation**
- Parallel tests can't share inboxes
- Need unique addresses per test
- Cleanup between test runs

**Content Verification**
- HTML parsing for assertions
- Link extraction and validation
- Dynamic content handling`,
      },
      {
        title: "Modern Email Testing Approach",
        content: `Modern email testing uses cloud services like plop.email:

**1. Programmable Test Addresses**
Generate unique addresses per test:
\`signup+\${testId}@in.plop.email\`

**2. API-Based Retrieval**
Fetch emails via REST:
\`GET /messages/latest?to=...\`

**3. Structured Assertions**
JSON response enables easy assertions:
\`expect(email.subject).toContain('Welcome')\`

**4. CI/CD Integration**
Works in any environment—no infrastructure needed.`,
      },
    ],
    example: {
      title: "Complete Email Test Example",
      language: "typescript",
      code: `import { test, expect } from '@playwright/test';

test.describe('Email Testing Examples', () => {
  test('complete signup flow with email verification', async ({ page }) => {
    // 1. Generate unique test email
    const testEmail = \`signup+\${Date.now()}@in.plop.email\`;

    // 2. Trigger signup
    await page.goto('/signup');
    await page.fill('[name="email"]', testEmail);
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    // 3. Fetch verification email
    const email = await fetchEmail(testEmail);

    // 4. Assert email content
    expect(email.subject).toContain('Verify');
    expect(email.htmlContent).toContain('Click here to verify');

    // 5. Extract and visit verification link
    const verifyLink = extractLink(email.htmlContent, 'verify');
    await page.goto(verifyLink);

    // 6. Confirm verification succeeded
    await expect(page.locator('text=Email verified')).toBeVisible();
  });
});`,
    },
    relatedTerms: ["smtp-testing", "email-api", "mailbox-routing"],
    relatedUseCases: ["e2e-testing", "transactional-emails", "ci-cd-pipelines"],
  },
  {
    slug: "dkim",
    term: "DKIM",
    shortDefinition:
      "DomainKeys Identified Mail - a method for email authentication that uses cryptographic signatures to verify sender identity.",
    metaDescription:
      "Learn what DKIM is, how it works, and why it matters for email deliverability and authentication in your applications.",
    fullDefinition:
      "DKIM (DomainKeys Identified Mail) is an email authentication method that adds a digital signature to outgoing emails. This signature is verified by receiving mail servers using a public key published in the sender's DNS records. DKIM helps prevent email spoofing and improves deliverability by proving emails truly came from the claimed domain.",
    sections: [
      {
        title: "How DKIM Works",
        content: `DKIM works through a cryptographic signing process:

1. **Signing**: The sending mail server adds a DKIM-Signature header containing a cryptographic signature of certain email headers and body
2. **Publishing**: The sending domain publishes a public key in their DNS records
3. **Verification**: Receiving servers fetch the public key and verify the signature
4. **Result**: If valid, the email is authenticated as genuinely from that domain

The signature covers the email content, so any tampering in transit will cause verification to fail.`,
      },
      {
        title: "DKIM in Development",
        content: `When testing emails, DKIM affects your workflow in several ways:

**Production Emails**
- Your email service (SendGrid, Postmark, etc.) handles DKIM signing
- You need to add DKIM DNS records for your sending domain
- Improperly configured DKIM can cause emails to go to spam

**Test Emails**
- Test services like plop.email handle DKIM for the receiving side
- When testing your app's emails, you're testing that emails are sent, not DKIM configuration
- DKIM testing is typically done during email infrastructure setup, not in E2E tests`,
      },
      {
        title: "Testing DKIM Configuration",
        content: `While plop.email focuses on functional email testing, verifying DKIM setup is part of email infrastructure:

- Use tools like mail-tester.com to check DKIM signing
- Verify your DNS records are correctly published
- Test with real inboxes (Gmail, Outlook) to confirm deliverability
- Monitor DMARC reports for DKIM failures

For E2E testing, focus on the email content and functionality, leaving DKIM verification to infrastructure tests.`,
      },
    ],
    relatedTerms: ["email-deliverability", "smtp-testing"],
    relatedUseCases: ["transactional-emails"],
  },
  {
    slug: "spf",
    term: "SPF",
    shortDefinition:
      "Sender Policy Framework - an email authentication standard that specifies which servers can send email for a domain.",
    metaDescription:
      "Learn what SPF is, how to set it up, and why it's essential for email deliverability and preventing spoofing.",
    fullDefinition:
      "SPF (Sender Policy Framework) is an email authentication protocol that allows domain owners to specify which mail servers are authorized to send email on behalf of their domain. It works through DNS TXT records that list authorized IP addresses and servers, helping receiving servers detect forged sender addresses.",
    sections: [
      {
        title: "How SPF Works",
        content: `SPF uses DNS records to define authorized senders:

1. **Record Publishing**: Domain owner adds a TXT record listing authorized mail servers
2. **Email Sending**: Mail is sent from a server
3. **SPF Check**: Receiving server looks up the SPF record for the sender's domain
4. **Verification**: Server checks if the sending IP is authorized
5. **Result**: Pass, fail, softfail, or neutral based on the policy

Example SPF record:
\`\`\`
v=spf1 include:_spf.google.com include:sendgrid.net ~all
\`\`\`

This allows Google and SendGrid servers to send email for the domain.`,
      },
      {
        title: "SPF for Developers",
        content: `As a developer, SPF affects you when:

**Setting Up Email Sending**
- Add SPF records for your email service provider
- Include all services that send email (app, marketing, transactional)
- Test that emails pass SPF checks

**Multiple Senders**
- Combine all senders in one SPF record
- Watch the 10 DNS lookup limit
- Use includes for third-party services

SPF alone isn't enough—combine with DKIM and DMARC for full protection.`,
      },
    ],
    relatedTerms: ["dkim", "email-deliverability"],
    relatedUseCases: ["transactional-emails"],
  },
  {
    slug: "bounce-handling",
    term: "Email Bounce Handling",
    shortDefinition:
      "The process of managing undeliverable emails, including hard bounces (permanent) and soft bounces (temporary).",
    metaDescription:
      "Learn about email bounce handling: types of bounces, how to handle them, and best practices for maintaining email list health.",
    fullDefinition:
      "Email bounce handling is the process of managing emails that cannot be delivered to recipients. Bounces are categorized as hard bounces (permanent failures like invalid addresses) or soft bounces (temporary issues like full mailboxes). Proper bounce handling is crucial for maintaining sender reputation and email deliverability.",
    sections: [
      {
        title: "Types of Bounces",
        content: `**Hard Bounces** (Permanent)
- Invalid email address
- Domain doesn't exist
- Recipient server permanently rejects
- Action: Remove immediately from list

**Soft Bounces** (Temporary)
- Mailbox full
- Server temporarily unavailable
- Message too large
- Action: Retry, then remove after multiple failures

**Block Bounces**
- Spam filter rejection
- IP/domain blacklisted
- Content-based filtering
- Action: Investigate and fix the underlying issue`,
      },
      {
        title: "Handling Bounces in Your Application",
        content: `Most email services provide bounce handling via webhooks:

\`\`\`typescript
// Example bounce webhook handler
app.post('/webhooks/email-bounces', async (req, res) => {
  const { email, type, reason, timestamp } = req.body;

  if (type === 'hard_bounce') {
    // Immediately mark as invalid
    await db.user.update({
      where: { email },
      data: { emailStatus: 'invalid', emailInvalidReason: reason }
    });
  } else if (type === 'soft_bounce') {
    // Track soft bounces, disable after threshold
    await db.emailBounce.create({
      data: { email, reason, timestamp }
    });
  }

  res.status(200).send('OK');
});
\`\`\`

Test your bounce handling by sending to known invalid addresses in staging.`,
      },
      {
        title: "Testing Bounce Handling",
        content: `Testing bounce scenarios requires different approaches:

**Webhook Testing**
- Use your email service's test endpoints
- Simulate bounce webhooks in integration tests
- Verify user records are updated correctly

**End-to-End Testing**
- Some services provide special addresses that always bounce
- Test that bounced users are handled in your UI
- Verify re-engagement flows for soft bounces

Note: plop.email is for testing successful delivery. For bounce testing, use your email service's testing features.`,
      },
    ],
    relatedTerms: ["email-deliverability", "smtp-testing"],
    relatedUseCases: ["transactional-emails"],
  },
  {
    slug: "email-headers",
    term: "Email Headers",
    shortDefinition:
      "Metadata fields at the top of an email that contain routing information, sender/recipient details, and processing instructions.",
    metaDescription:
      "Learn about email headers: what they contain, how to read them, and how to use them in email testing and debugging.",
    fullDefinition:
      "Email headers are lines of metadata at the beginning of an email message containing information about the sender, recipient, routing path, timestamps, and various processing instructions. Headers are crucial for email delivery, authentication, and debugging delivery issues.",
    sections: [
      {
        title: "Common Email Headers",
        content: `**Essential Headers**
- \`From\`: Sender's email address
- \`To\`: Recipient's email address
- \`Subject\`: Email subject line
- \`Date\`: When the email was sent
- \`Message-ID\`: Unique identifier for the email

**Routing Headers**
- \`Received\`: Added by each server handling the email
- \`Return-Path\`: Where bounces should be sent

**Authentication Headers**
- \`DKIM-Signature\`: Digital signature for authentication
- \`Authentication-Results\`: SPF/DKIM/DMARC check results

**Custom Headers**
- \`X-*\`: Custom application headers
- \`List-Unsubscribe\`: Unsubscribe URL for mailing lists`,
      },
      {
        title: "Testing Email Headers",
        content: `When testing emails, headers help verify correct behavior:

\`\`\`typescript
test('email has correct headers', async () => {
  const testEmail = \`headers+\${Date.now()}@in.plop.email\`;

  await sendEmail({
    to: testEmail,
    subject: 'Test Email',
    headers: {
      'X-Campaign-ID': 'campaign-123',
      'List-Unsubscribe': '<mailto:unsubscribe@example.com>',
    },
  });

  const email = await plop.getLatest(testEmail);

  // Verify custom headers are present
  expect(email.headers['x-campaign-id']).toBe('campaign-123');
  expect(email.headers['list-unsubscribe']).toBeDefined();

  // Verify standard headers
  expect(email.headers['from']).toContain('@example.com');
  expect(email.headers['message-id']).toBeDefined();
});
\`\`\``,
      },
    ],
    example: {
      title: "Parsing Email Headers",
      language: "typescript",
      code: `// Common header patterns to check in tests

// Verify unsubscribe header (required for marketing emails)
expect(email.headers['list-unsubscribe']).toMatch(
  /<mailto:|<https?:\\/\\//
);

// Check custom tracking headers
expect(email.headers['x-mailer']).toBe('MyApp/1.0');

// Verify reply-to is set correctly
expect(email.headers['reply-to']).toBe('support@example.com');

// Check content type for HTML emails
expect(email.headers['content-type']).toContain('multipart/alternative');`,
    },
    relatedTerms: ["smtp-testing", "email-api"],
    relatedUseCases: ["transactional-emails", "e2e-testing"],
  },
  {
    slug: "mime-types",
    term: "MIME Types in Email",
    shortDefinition:
      "Multipurpose Internet Mail Extensions (MIME) define content types in emails, enabling HTML, attachments, and multiple content formats.",
    metaDescription:
      "Learn about MIME types in email: how they enable HTML, attachments, and multipart messages, plus testing considerations.",
    fullDefinition:
      "MIME (Multipurpose Internet Mail Extensions) extends email beyond plain text by defining content types and encoding schemes. MIME enables HTML emails, file attachments, and multipart messages that contain both text and HTML versions. Understanding MIME is essential for building and testing rich email experiences.",
    sections: [
      {
        title: "Common Email MIME Types",
        content: `**Content Types**
- \`text/plain\`: Plain text email
- \`text/html\`: HTML formatted email
- \`multipart/alternative\`: Contains both text and HTML versions
- \`multipart/mixed\`: Email with attachments

**Attachment Types**
- \`application/pdf\`: PDF documents
- \`image/png\`, \`image/jpeg\`: Images
- \`application/octet-stream\`: Binary files

**Email Structure**
\`\`\`
multipart/mixed
├── multipart/alternative
│   ├── text/plain (fallback)
│   └── text/html (rich content)
└── application/pdf (attachment)
\`\`\``,
      },
      {
        title: "Testing MIME Content",
        content: `When testing emails, verify both text and HTML versions:

\`\`\`typescript
test('email has both plain text and HTML versions', async () => {
  const email = await plop.getLatest(testEmail);

  // Verify plain text version exists
  expect(email.textContent).toBeDefined();
  expect(email.textContent).toContain('Welcome');

  // Verify HTML version exists
  expect(email.htmlContent).toBeDefined();
  expect(email.htmlContent).toContain('<h1>Welcome</h1>');

  // Verify they contain equivalent content
  const textLinks = email.textContent.match(/https?:\\/\\/[^\\s]+/g);
  const htmlLinks = email.htmlContent.match(/href="([^"]+)"/g);
  expect(textLinks?.length).toBeGreaterThan(0);
});
\`\`\`

Always provide a text fallback—some email clients don't render HTML.`,
      },
    ],
    relatedTerms: ["email-headers", "email-api"],
    relatedUseCases: ["transactional-emails"],
  },
];

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find((t) => t.slug === slug);
}

export function getRelatedTerms(slugs: string[]): GlossaryTerm[] {
  return glossaryTerms.filter((t) => slugs.includes(t.slug));
}
