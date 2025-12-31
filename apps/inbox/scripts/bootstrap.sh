#!/usr/bin/env bash
set -euo pipefail

WORKER_URL="${WORKER_URL:-}"
ADMIN_TOKEN="${ADMIN_TOKEN:-}"
EMAIL_DOMAIN="${EMAIL_DOMAIN:-in.plop.email}"

SUBDOMAIN="${SUBDOMAIN:-}"

usage() {
  cat <<'EOF'
Bootstrap Cloudflare Inbox Worker (admin API calls only).

Required env:
  WORKER_URL    Example: https://inbox.<your-account>.workers.dev
  ADMIN_TOKEN   Must match wrangler secret ADMIN_TOKEN

Optional env:
  EMAIL_DOMAIN  Default: in.plop.email
  SUBDOMAIN     Example: company1   (enables company1.<EMAIL_DOMAIN>)

Examples:
  WORKER_URL=https://<your-worker-host> ADMIN_TOKEN=... ./scripts/bootstrap.sh
  WORKER_URL=https://<your-worker-host> ADMIN_TOKEN=... SUBDOMAIN=company1 ./scripts/bootstrap.sh
EOF
}

if [[ -z "$WORKER_URL" || -z "$ADMIN_TOKEN" ]]; then
  usage
  exit 1
fi

auth=(-H "Authorization: Bearer ${ADMIN_TOKEN}" -H "Content-Type: application/json")

echo "1) Configure zone catch-all -> Worker"
curl -fsS -X POST "${WORKER_URL%/}/admin/catch-all/worker" "${auth[@]}" --data '{"enabled":true}' >/dev/null
echo "   OK"

echo "2) Ensure Email Routing DNS records for ${EMAIL_DOMAIN}"
curl -fsS -X POST "${WORKER_URL%/}/admin/email-routing/dns/enable" "${auth[@]}" --data "{\"name\":\"${EMAIL_DOMAIN}\"}" >/dev/null
echo "   OK"

if [[ -n "$SUBDOMAIN" ]]; then
  echo "3) Enable Email Routing DNS for ${SUBDOMAIN}.${EMAIL_DOMAIN}"
  curl -fsS -X POST "${WORKER_URL%/}/admin/subdomains" "${auth[@]}" --data "{\"subdomain\":\"${SUBDOMAIN}\"}" >/dev/null
  echo "   OK"
fi

echo
echo "Done. Next:"
echo "- Send a test email to hello@${EMAIL_DOMAIN} (or hello@${SUBDOMAIN}.${EMAIL_DOMAIN})"
echo "- List inboxes: curl -H \"Authorization: Bearer ...\" \"${WORKER_URL%/}/admin/inboxes?domain=${EMAIL_DOMAIN}\""

