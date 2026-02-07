<p align="center">
  <img src="apps/web/public/logo.png" alt="Plop Logo" width="80" />
</p>

<h1 align="center">Plop</h1>

<p align="center">
  <strong>Reliable email tests. Finally.</strong>
</p>

<p align="center">
  Programmable inboxes for devs and QA. Send emails to Plop, fetch via API, assert in tests.<br/>
  No mail server. No flaky waits. Just a simple API.
</p>

<p align="center">
  <a href="https://plop.email">Website</a> |
  <a href="https://app.plop.email">Dashboard</a> |
  <a href="https://docs.plop.email">Docs</a> |
  <a href="https://api.plop.email">API</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-Bun-f9f1e1?style=flat-square&logo=bun" alt="Built with Bun" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=flat-square" alt="License" />
  <a href="https://www.npmjs.com/package/@plop-email/plop-ts"><img src="https://img.shields.io/npm/v/@plop-email/plop-ts?style=flat-square&label=@plop-email/plop-ts&color=B8FF2C" alt="npm" /></a>
  <a href="https://pypi.org/project/plop-sdk/"><img src="https://img.shields.io/pypi/v/plop-sdk?style=flat-square&label=plop-sdk&color=B8FF2C" alt="PyPI" /></a>
</p>

---

## The Problem

Testing email flows is painful:

- **Flaky waits** - Polling IMAP servers with arbitrary timeouts
- **Infrastructure overhead** - Running Mailhog, MailCatcher, or real SMTP servers
- **Unpredictable routing** - Shared test inboxes causing race conditions
- **No observability** - Email sits outside your product stack

## The Solution

Plop makes email testing **deterministic and fast**:

```
1. Send to Plop     →  qa+signup@in.plop.email
2. Fetch via API    →  GET /v1/messages/latest
3. Assert in tests  →  Extract OTP, verify links, check content
```

That's it. Email arrives, you fetch it as JSON, your test passes.

---

## Features

### Core

- **Mailboxes + Tags** - Route flows with `mailbox+tag` addresses (e.g., `qa+login@in.plop.email`)
- **REST API** - List, filter, and fetch emails. Poll for the latest message
- **Scoped API Keys** - Full access, email-only, or mailbox-scoped permissions
- **Instant Delivery** - Email arrives → stored → available via API instantly
- **Message Retention** - 14-90 days depending on plan

### Security

- **Private Inboxes** - Mailboxes require API key authentication
- **Strict Routing** - Unknown mailboxes are rejected and never stored
- **Mailbox Isolation** - API keys can be scoped to specific mailboxes
- **Reserved Names** - 180+ protected mailbox names prevent phishing/impersonation

### Developer Experience

- Works with **Cypress**, **Playwright**, and any Node test framework
- Simple REST API - just `fetch()` with an API key
- OpenAPI documentation with interactive Scalar UI
- Comprehensive filtering by mailbox, tag, date range, and search query

---

## Official SDKs

Install an SDK to skip the boilerplate and get built-in polling, typed responses, and error handling.

### TypeScript

```bash
npm install @plop-email/plop-ts
```

```typescript
import { Plop } from "@plop-email/plop-ts";

const plop = new Plop(); // reads PLOP_API_KEY env var

// Wait for a verification email (polls automatically)
const email = await plop.messages.waitFor(
  { mailbox: "qa", tag: "verification" },
  { timeout: 30_000 },
);

const otp = email.textContent?.match(/\d{6}/)?.[0];
```

### Python

```bash
pip install plop-sdk
```

```python
from plop_sdk import Plop

plop = Plop()  # reads PLOP_API_KEY env var

email = plop.messages.wait_for(
    mailbox="qa", tag="verification", timeout=30,
)

import re
otp = re.search(r"\d{6}", email.text_content).group()
```

> **Zero runtime dependencies** (TypeScript) · **httpx + pydantic** (Python) · Works with Playwright, Cypress, pytest, and any test framework.
>
> Full API coverage: mailbox CRUD, message deletion, SSE streaming, webhook management, API key rotation, and cursor pagination.

| SDK | Package | GitHub |
|-----|---------|--------|
| TypeScript | [`@plop-email/plop-ts`](https://www.npmjs.com/package/@plop-email/plop-ts) | [plop-email/plop-ts](https://github.com/plop-email/plop-ts) |
| Python | [`plop-sdk`](https://pypi.org/project/plop-sdk/) | [plop-email/plop-python](https://github.com/plop-email/plop-python) |

---

## Quick Start

### 1. Create an Account

Sign up at [app.plop.email](https://app.plop.email) and create a team. Your first mailbox is auto-generated.

### 2. Get Your API Key

Navigate to **Team Settings → API Keys** and create a key.

### 3. Use Plop in Your Tests

**Cypress**

```javascript
// Use a Plop address for signup
cy.get('[data-testid="email-input"]').type('qa+signup@in.plop.email')
cy.get('[data-testid="submit"]').click()

// Fetch the verification email
cy.request({
  method: 'GET',
  url: 'https://api.plop.email/v1/messages/latest?mailbox=qa&tag=signup',
  headers: { Authorization: 'Bearer YOUR_API_KEY' },
}).then(({ body }) => {
  // Extract OTP from email content
  const otp = body.data.textContent?.match(/\b\d{6}\b/)?.[0]
  cy.get('[data-testid="otp-input"]').type(otp)
})
```

**Playwright**

```typescript
import { test, expect } from '@playwright/test'

test('user can verify email', async ({ page, request }) => {
  await page.fill('[data-testid="email"]', 'qa+verify@in.plop.email')
  await page.click('[data-testid="submit"]')

  // Fetch verification email from Plop
  const res = await request.get(
    'https://api.plop.email/v1/messages/latest?mailbox=qa&tag=verify',
    { headers: { Authorization: `Bearer ${process.env.PLOP_API_KEY}` } }
  )

  const { data } = await res.json()
  const otp = data.textContent?.match(/\b\d{6}\b/)?.[0]

  await page.fill('[data-testid="otp"]', otp)
  await expect(page.locator('[data-testid="success"]')).toBeVisible()
})
```

**Node.js / Any Framework**

```typescript
const response = await fetch(
  'https://api.plop.email/v1/messages/latest?mailbox=qa&tag=password-reset',
  {
    headers: { Authorization: `Bearer ${process.env.PLOP_API_KEY}` },
  }
)

const { data } = await response.json()
console.log(data.subject)     // "Reset your password"
console.log(data.textContent) // Plain text body
console.log(data.htmlContent) // HTML body
```

**Using the SDK (recommended)**

```typescript
import { Plop } from "@plop-email/plop-ts";

const plop = new Plop();

// One line — handles polling, timeout, and error handling
const email = await plop.messages.waitFor(
  { mailbox: "qa", tag: "password-reset" },
  { timeout: 30_000 },
);

console.log(email.subject);     // "Reset your password"
console.log(email.textContent); // Plain text body
console.log(email.htmlContent); // HTML body
```

---

## API Reference

### Messages

| Endpoint | Description |
|----------|-------------|
| `GET /v1/messages` | List messages with filters |
| `GET /v1/messages/latest` | Get most recent matching message |
| `GET /v1/messages/:id` | Get specific message by ID |

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| `mailbox` | Filter by mailbox name |
| `tag` | Filter by tag (from `mailbox+tag@`) |
| `from` | Filter by date range start |
| `to` | Filter by date range end |
| `q` | Full-text search query |

### Response Example

```json
{
  "data": {
    "id": "msg_abc123",
    "mailbox": "qa",
    "tag": "signup",
    "from": "noreply@yourapp.com",
    "to": "qa+signup@in.plop.email",
    "subject": "Verify your email",
    "textContent": "Your verification code is 482913",
    "htmlContent": "<html>...</html>",
    "receivedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Your App      │────▶│  Cloudflare     │────▶│   Plop Worker   │
│  sends email    │     │  Email Routing  │     │   (apps/inbox)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Your Tests    │◀────│   Messages API  │◀────│   PostgreSQL    │
│  fetch emails   │     │   GET /latest   │     │   + R2 Storage  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Data Flow:**

1. Email arrives at Cloudflare Email Routing
2. Cloudflare Worker (`apps/inbox`) receives and parses email
3. Metadata stored in PostgreSQL, raw `.eml` in R2
4. Messages API serves emails with filtering and search
5. Your tests fetch the latest matching email

---

## Tech Stack

This is a **Turborepo monorepo** with Bun workspaces.

### Apps

| App | Stack | Purpose |
|-----|-------|---------|
| `apps/app` | Next.js 16 (App Router) | Product dashboard with inbox management |
| `apps/web` | Next.js | Marketing website |
| `apps/docs` | Next.js + Fumadocs | Documentation site |
| `apps/api` | Bun + Hono + tRPC | Backend API with OpenAPI docs |
| `apps/inbox` | Cloudflare Worker | Email ingestion worker |

### Packages

| Package | Purpose |
|---------|---------|
| `@plop/db` | Drizzle schema + Postgres client with read replicas |
| `@plop/supabase` | Supabase clients (server/client/middleware/job) |
| `@plop/ui` | Shared UI components (shadcn-style) |
| `@plop/kv` | Upstash Redis + rate limiting |
| `@plop/jobs` | Trigger.dev background jobs |
| `@plop/email` | React Email templates |
| `@plop/billing` | Polar.sh billing integration |
| `@plop/logger` | Pino structured logger |

### Hosting

| Service | Provider |
|---------|----------|
| Auth, Database, Storage | Supabase |
| Web & App | Vercel |
| Email Routing & Workers | Cloudflare |
| Background Jobs | Trigger.dev |
| Rate Limiting | Upstash Redis |

---

## Development

### Prerequisites

- [Bun](https://bun.sh) v1.3+
- [Docker](https://docker.com) (for local Supabase)

### Setup

```bash
# Clone the repository
git clone https://github.com/plop-email/plop.git
cd plop

# Install dependencies
bun install

# Start local Supabase
bun dev:supabase

# Run migrations
bun migrate

# Start all apps in parallel
bun dev
```

### Available Scripts

```bash
# Development
bun dev              # Run all apps in parallel
bun dev:app          # Product app at localhost:3000
bun dev:web          # Marketing site at localhost:3001
bun dev:docs         # Documentation at localhost:3002
bun dev:api          # API at localhost:3003
bun dev:email        # Email preview at localhost:3004

# Quality
bun run format       # Format with Biome
bun run lint         # Lint with Biome + sherif
bun run typecheck    # TypeScript check all workspaces

# Database
bun migrate          # Run migrations
bun seed             # Generate and run seeds
bun reset            # Reset local database
bun generate         # Regenerate DB types
```

### Local URLs

| Service | URL |
|---------|-----|
| Product App | http://localhost:3000 |
| Marketing Site | http://localhost:3001 |
| Documentation | http://localhost:3002 |
| API | http://localhost:3003 |
| Email Preview | http://localhost:3004 |
| Supabase Studio | http://localhost:54323 |

---

## Pricing

| Plan | Price | Mailboxes | Emails/Month | Retention |
|------|-------|-----------|--------------|-----------|
| **Starter** | $6.99/mo | 1 | 5,000 | 14 days |
| **Pro** | $49/mo | 10 | 60,000 | 90 days |
| **Enterprise** | Contact us | Unlimited | Unlimited | Custom |

All plans include unlimited tags and a 14-day free trial. No credit card required.

---

## Use Cases

### E2E Testing
Verify OTP codes, password reset links, and signup confirmations in your automated test suite.

### QA Automation
Test email flows in CI/CD pipelines with deterministic, isolated inboxes per test run.

### Transactional Email Testing
Assert on receipts, notifications, and order confirmations before shipping to production.

### Onboarding Flow Testing
Verify welcome emails, verification flows, and user activation sequences.

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **[AGPL-3.0](https://opensource.org/licenses/AGPL-3.0)** license for non-commercial use.

---

## Links

- **Website**: [plop.email](https://plop.email)
- **Dashboard**: [app.plop.email](https://app.plop.email)
- **Documentation**: [docs.plop.email](https://docs.plop.email)
- **API**: [api.plop.email](https://api.plop.email)
- **TypeScript SDK**: [github.com/plop-email/plop-ts](https://github.com/plop-email/plop-ts)
- **Python SDK**: [github.com/plop-email/plop-python](https://github.com/plop-email/plop-python)
- **Twitter**: [@vahaah](https://twitter.com/vahaah)

---

<p align="center">
  Built with care by <a href="https://twitter.com/vahaah">Alex Vakhitov</a> at Comonad Limited
</p>
