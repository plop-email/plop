# Inbox (Cloudflare Email Routing)

Standalone Cloudflare Worker that:

- Configures **Email Routing catch-all** to send all inbound email to this Worker.
- Receives inbound email via **Email Workers** and stores raw `.eml` messages in **R2**.
- Exposes a small **admin HTTP API** to browse stored messages.

## Prereqs

- A domain on Cloudflare with **Email Routing enabled**.
- Cloudflare must be the **authoritative DNS** provider for the zone (full setup).
- A Cloudflare **API Token** with permission to manage Email Routing rules for the zone.
- An **R2 bucket** for storing emails.

## Cloudflare one-time setup

In Cloudflare:

1) Enable **Email Routing** for your zone (`plop.email`).

2) Create an API Token (used by this Worker to manage Email Routing + DNS records):

- Permissions:
  - `Zone` → `Email Routing` → `Edit`
  - `Zone` → `DNS` → `Edit` (required for enabling Email Routing DNS records)
- Zone resources: limit to `plop.email`.

3) Copy your **Zone ID** for `plop.email` (Dashboard → `plop.email` → Overview).

## Configure

1) Create an R2 bucket (example name: `inbox-emails`).

```sh
cd apps/inbox
bunx wrangler r2 bucket create inbox-emails
```

2) Configure `apps/inbox/wrangler.toml`:

- `EMAIL_DOMAIN` (set this to `in.plop.email`)
- `EMAIL_WORKER_NAME` (usually the Worker’s deployed name)
- `CLOUDFLARE_ZONE_ID` (Zone ID for `plop.email`)

3) Set secrets:

```sh
cd apps/inbox
bunx wrangler secret put ADMIN_TOKEN
bunx wrangler secret put CLOUDFLARE_API_TOKEN
```

## Deploy

```sh
cd apps/inbox
bun run deploy
```

## Bootstrap (catch-all + DNS records)

After the Worker is deployed, you can configure everything via the Worker admin API:

Option A: run the bootstrap script:

```sh
cd apps/inbox
WORKER_URL='https://<your-worker-host>' \
ADMIN_TOKEN='<ADMIN_TOKEN>' \
EMAIL_DOMAIN='in.plop.email' \
bash scripts/bootstrap.sh

# Add an org subdomain (optional)
WORKER_URL='https://<your-worker-host>' \
ADMIN_TOKEN='<ADMIN_TOKEN>' \
SUBDOMAIN='company1' \
bash scripts/bootstrap.sh
```

Notes:

- This uses the Worker admin API, so make sure `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ZONE_ID` are configured on the Worker first.
- The DNS enablement calls are safe to run multiple times.

Option B: do it manually via curl (see sections below).

## Enable catch-all routing to this Worker

This is a one-time setup per zone. After this, Cloudflare Email Routing forwards all inbound email to your Worker and your Worker decides what to do.

```sh
curl -X POST 'https://<your-worker-host>/admin/catch-all/worker' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data '{"enabled":true}'
```

## Domain layout

This app assumes:

- Your Cloudflare zone is `plop.email`.
- Your inbound email root is `in.plop.email` (set in `EMAIL_DOMAIN`).
- Each organisation gets its own subdomain under `in.plop.email`:
  - `company1.in.plop.email`
  - `company2.in.plop.email`

Inbound examples:

- `hello@in.plop.email` (default)
- `hello@company1.in.plop.email` (organisation-scoped)
- `hello+tag@company1.in.plop.email` (stored under mailbox `hello`)

## List mailboxes

Status values:

- `unprocessed` (default, webhook not yet acknowledged)
- `processed` (aka `archived`)

```sh
curl 'https://<your-worker-host>/admin/inboxes?limit=200' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'

# For an organisation subdomain:
curl 'https://<your-worker-host>/admin/inboxes?domain=company1.in.plop.email&limit=200' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'

# List processed mailboxes:
curl 'https://<your-worker-host>/admin/inboxes?status=processed&limit=200' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'

# `archived` is an alias for `processed`:
curl 'https://<your-worker-host>/admin/inboxes?status=archived&limit=200' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'
```

## List messages

```sh
curl 'https://<your-worker-host>/admin/inboxes/hello/messages?limit=50' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'

# For an organisation subdomain:
curl 'https://<your-worker-host>/admin/inboxes/hello/messages?domain=company1.in.plop.email&limit=50' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'

# List processed messages:
curl 'https://<your-worker-host>/admin/inboxes/hello/messages?status=processed&limit=50' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'
```

## Get message (parsed content + download URL)

This endpoint parses the stored `.eml` and returns:

- `rawContent` / `plainContent`
- `headers`
- `emlUrl` (direct URL to download the full `.eml`)

```sh
curl 'https://<your-worker-host>/admin/inboxes/hello/messages/<id>' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'
```

## Download raw `.eml`

```sh
curl -L 'https://<your-worker-host>/admin/inboxes/hello/messages/<id>/raw' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -o message.eml
```

## Webhook processing (optional)

If you configure a webhook, this Worker will:

1) Store the raw `.eml` in R2 under `raw/<domain>/<mailbox>/<id>.eml`
2) Store metadata under `messages/unprocessed/<domain>/<mailbox>/<id>.json`
3) POST a webhook payload to your main service
4) If the webhook returns **2xx**, move metadata to `messages/processed/...`

The webhook payload includes:

- `rawContent` (best-effort HTML body if available, otherwise plain)
- `plainContent` (best-effort text/plain body if available)
- `headers` (parsed RFC822 headers)
- `from`, `to`, `subject`, `domain`, `tenantSubdomain`, `mailbox`, `mailboxWithTag`, `tag`, `receivedAt`

The `.eml` itself remains stored only in R2.

Example payload:

```json
{
  "event": "email.received",
  "id": "b3b9c8b1-9d2a-4f1c-9b0f-2d4d2a2f2b3a",
  "domain": "in.plop.email",
  "tenantSubdomain": null,
  "mailbox": "hello",
  "mailboxWithTag": "hello",
  "tag": null,
  "from": "sender@example.com",
  "to": "hello@in.plop.email",
  "subject": "Your invoice",
  "receivedAt": "2025-12-19T08:15:30.000Z",
  "headers": [
    { "name": "Subject", "value": "Your invoice" },
    { "name": "From", "value": "sender@example.com" }
  ],
  "rawContent": "<html>...</html>",
  "plainContent": "..."
}
```

Example payload (org subdomain + tag):

```json
{
  "event": "email.received",
  "id": "b3b9c8b1-9d2a-4f1c-9b0f-2d4d2a2f2b3a",
  "domain": "company1.in.plop.email",
  "tenantSubdomain": "company1",
  "mailbox": "hello",
  "mailboxWithTag": "hello+invoice",
  "tag": "invoice",
  "from": "sender@example.com",
  "to": "hello+invoice@company1.in.plop.email",
  "subject": "Your invoice",
  "receivedAt": "2025-12-19T08:15:30.000Z",
  "headers": [
    { "name": "Subject", "value": "Your invoice" },
    { "name": "From", "value": "sender@example.com" }
  ],
  "rawContent": "<html>...</html>",
  "plainContent": "..."
}
```

Configure:

```sh
cd apps/inbox
bunx wrangler secret put WEBHOOK_AUTH_TOKEN
```

Set `WEBHOOK_URL` (and optionally adjust `WEBHOOK_TIMEOUT_MS`) in `apps/inbox/wrangler.toml`.

The Worker sends `Authorization: Bearer <WEBHOOK_AUTH_TOKEN>` to your webhook if the secret is set.

Manual retry (moves to `processed` only if the webhook succeeds):

```sh
curl -X POST 'https://<your-worker-host>/admin/inboxes/hello/messages/<id>/webhook' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'
```

## Subdomains (optional)

Cloudflare Email Routing can be used with subdomains under the same zone. In this setup, you’ll enable Email Routing DNS records for:

- `in.plop.email` (default)
- `company1.in.plop.email` (per-organisation)

To receive email for a subdomain, that subdomain must have the required Email Routing DNS records (MX/SPF/etc).

This app exposes admin helpers:

```sh
# See required records for `company1.in.plop.email`
curl 'https://<your-worker-host>/admin/email-routing/dns?subdomain=company1.in.plop.email' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'

# Ask Cloudflare to add+lock the required records for `in.plop.email`
curl -X POST 'https://<your-worker-host>/admin/email-routing/dns/enable' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data '{"name":"in.plop.email"}'

# Convenience helper (builds `company1.<EMAIL_DOMAIN>` for you)
curl -X POST 'https://<your-worker-host>/admin/subdomains' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data '{"subdomain":"company1"}'
```

When an email arrives, the Worker uses the full recipient domain (including subdomains) when deciding where to store it.

## Main service API key

Your main service can create per-organisation subdomains by calling this Worker’s admin endpoints using the `ADMIN_TOKEN` secret (send it as `Authorization: Bearer <ADMIN_TOKEN>`).
