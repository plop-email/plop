export interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "pricing" | "technical" | "security";
}

export const faqItems: FAQItem[] = [
  // General
  {
    question: "What is plop.email?",
    answer:
      "plop.email is an email testing service that provides programmable inboxes for automated testing. Send emails to generated addresses during tests, then fetch and verify them via our REST API. It's built for developers who need reliable email testing in their test automation suites.",
    category: "general",
  },
  {
    question: "How does plop.email work?",
    answer:
      "1) Generate a unique test email address (e.g., signup+test123@in.plop.email). 2) Use that address in your application flow (signup, password reset, etc.). 3) Fetch the email via our API: GET /v1/messages/latest?to=signup+test123@in.plop.email. 4) Assert on the email content in your test code.",
    category: "general",
  },
  {
    question: "What's the difference between plop.email and Mailhog/Mailtrap?",
    answer:
      "MailHog is a self-hosted SMTP server you run locally—great for development but requires infrastructure. Note: MailHog is no longer maintained (last updated 2020); consider Mailpit as an alternative. Mailtrap offers testing and sending in one platform. plop.email is a cloud-based API specifically designed for test automation—no infrastructure to manage, works identically in local dev and CI/CD, and is open-source.",
    category: "general",
  },
  {
    question: "Is plop.email open source?",
    answer:
      "Yes! plop.email is licensed under AGPL-3.0. You can view the source code, self-host it, or contribute on GitHub. The cloud service is also available for teams who prefer a managed solution.",
    category: "general",
  },
  {
    question: "Can I use plop.email for production email?",
    answer:
      "plop.email is designed for testing, not production email delivery. For sending production emails, use services like Resend, SendGrid, or Postmark. Use plop.email to test that your integration with those services works correctly.",
    category: "general",
  },

  // Pricing
  {
    question: "Is there a free trial?",
    answer:
      "Yes, plop.email offers a 14-day free trial on all plans with no credit card required. It's perfect for evaluating the service and testing your integration before committing to a paid plan.",
    category: "pricing",
  },
  {
    question: "How does pricing work?",
    answer:
      "Pricing is based on mailboxes, email volume, and retention period. Starter is $5/month for 1 mailbox, 5,000 emails, and 7-day retention. Team is $19/month for 5 mailboxes, 25,000 emails, and 30-day retention. Pro is $49/month for 20 mailboxes, 100,000 emails, and 90-day retention. Enterprise plans offer custom domains and unlimited mailboxes. Annual billing saves 20%.",
    category: "pricing",
  },
  {
    question: "Do you offer discounts for startups or open source projects?",
    answer:
      "Yes, we offer discounts for early-stage startups and qualifying open source projects. Contact us with details about your project and we'll work something out.",
    category: "pricing",
  },

  // Technical
  {
    question: "What testing frameworks does plop.email work with?",
    answer:
      "plop.email works with any framework that can make HTTP requests. We have guides for Playwright, Cypress, Jest, pytest, and Postman. Since it's a REST API, it works with any language or framework—Ruby, Go, PHP, Java, you name it.",
    category: "technical",
  },
  {
    question: "How do I handle email delivery delays in tests?",
    answer:
      "Email delivery typically takes 1-3 seconds. In your tests, either: 1) Add a short delay before fetching (simple but slower), 2) Poll the API with retries until the email arrives (recommended), or 3) Use webhooks to get notified instantly when emails arrive. See docs for setup.",
    category: "technical",
  },
  {
    question: "Can I test email attachments?",
    answer:
      "Yes, the API returns attachment metadata including filename, content type, and size. You can download attachment content via the API to verify file contents in your tests.",
    category: "technical",
  },
  {
    question: "How do I test emails in CI/CD pipelines?",
    answer:
      "Add your PLOP_API_KEY as a secret in your CI environment (GitHub Secrets, GitLab CI Variables, etc.). Use unique email addresses per test run (e.g., include the CI run ID in the address). The same API calls work identically in CI as they do locally.",
    category: "technical",
  },
  {
    question: "What's the rate limit on the API?",
    answer:
      "Rate limits depend on your plan. Starter: 100 requests/minute. Team and Pro: 1000+ requests/minute. Enterprise plans offer custom rate limits for high-volume testing.",
    category: "technical",
  },

  // Security
  {
    question: "Is my test data secure?",
    answer:
      "Yes. All data is encrypted in transit (TLS) and at rest. Test emails are automatically deleted after your plan's retention period. We don't share or sell your data. See our privacy policy for details.",
    category: "security",
  },
  {
    question: "Can other users see my test emails?",
    answer:
      "No. Each team has isolated mailboxes. API keys are scoped to your team, and you can create keys scoped to specific mailboxes for additional isolation. Other users cannot access your emails.",
    category: "security",
  },
  {
    question: "Where is data stored?",
    answer:
      "Data is stored in secure cloud infrastructure with Supabase (Postgres) and Cloudflare. We use data centers in the US and EU. Enterprise plans can specify data residency requirements.",
    category: "security",
  },
  {
    question: "Do you have SOC 2 compliance?",
    answer:
      "We're working toward SOC 2 Type II certification. Enterprise customers can request our current security documentation and practices. Contact us for details.",
    category: "security",
  },
];

export function getFAQByCategory(category: FAQItem["category"]): FAQItem[] {
  return faqItems.filter((item) => item.category === category);
}

export function getAllFAQCategories(): FAQItem["category"][] {
  return ["general", "pricing", "technical", "security"];
}
