![hero](image.png)

<p align="center">
  <h1 align="center"><b>Plop</b></h1>
  <p align="center">
    Inbox automation and email routing for modern teams
    <br />
    <br />
    <a href="https://plop.email">Landing</a>
    ·
    <a href="https://app.plop.email">App</a>
    ·
    <a href="https://docs.plop.email">Docs</a>
    ·
    <a href="https://api.plop.email">API</a>
    ·
    <a href="https://github.com/plop-email/plop/issues">Issues</a>
  </p>
</p>

## About Plop

Plop is an inbox automation platform that pairs Cloudflare Email Routing with a first‑class UI, API, and operational tooling. It stores inbound mail, normalizes content, and exposes structured access for product workflows, support ops, and test automation.

## Features

- 📬 **Email routing + storage**: catch‑all routing to a Cloudflare Worker and R2 storage
- 🔍 **Message search + filtering**: query by mailbox, tags, subjects, and time windows
- 🧭 **Team + domain aware routing**: root domain fallbacks and custom domains
- ⚡ **E2E friendly**: “latest message” endpoint built for test polling
- 🧩 **Composable stack**: Next.js app + Hono API + Supabase + shared packages

## Get started

Documentation lives in `apps/docs` and is rendered with Fumadocs. Run it with:

```sh
bun dev:docs
```

### Hosted endpoints

- App: https://app.plop.email
- Docs: https://docs.plop.email
- API: https://api.plop.email

## Architecture

- Monorepo
- TypeScript
- Bun
- React
- Next.js
- Hono
- Supabase
- TailwindCSS
- Shadcn

### Hosting

- Supabase (auth, database, storage)
- Vercel (web + app)
- Cloudflare (email routing + worker + R2)

### Services

- Resend
- GitHub Actions
- Upstash

## License

This project is licensed under the **[AGPL-3.0](https://opensource.org/licenses/AGPL-3.0)** for non-commercial use.
