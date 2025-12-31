export type CloudflareApiError = {
  code?: number;
  message?: string;
};

export type CloudflareApiResponse<T> = {
  success: boolean;
  errors?: CloudflareApiError[];
  messages?: unknown[];
  result?: T;
};

export type EmailRoutingRule = {
  id: string;
  name?: string;
  enabled?: boolean;
};

export type EmailRoutingCatchAllRule = EmailRoutingRule;

export type EmailRoutingDnsRecord = {
  name: string;
  type: string;
  content: string;
  priority?: number;
};

const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4";

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function cfRequest<T>(
  apiToken: string,
  path: string,
  init: RequestInit,
): Promise<T> {
  const res = await fetch(`${CLOUDFLARE_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });

  const data = (await res.json()) as CloudflareApiResponse<T>;
  if (!res.ok || !data.success) {
    const errors = data.errors?.length
      ? data.errors
      : [{ message: "Unknown error" }];
    throw new Error(
      `Cloudflare API error (${res.status}) ${path}: ${JSON.stringify(errors)}`,
    );
  }

  return data.result as T;
}

export async function getCatchAllRule(params: {
  apiToken: string;
  zoneId: string;
}): Promise<EmailRoutingCatchAllRule> {
  const { apiToken, zoneId } = params;
  return cfRequest<EmailRoutingCatchAllRule>(
    requireEnv(apiToken, "CLOUDFLARE_API_TOKEN"),
    `/zones/${requireEnv(zoneId, "CLOUDFLARE_ZONE_ID")}/email/routing/rules/catch_all`,
    { method: "GET" },
  );
}

export async function updateCatchAllRuleToWorker(params: {
  apiToken: string;
  zoneId: string;
  workerName: string;
  enabled: boolean;
}): Promise<void> {
  const { apiToken, zoneId, workerName, enabled } = params;

  await cfRequest<unknown>(
    requireEnv(apiToken, "CLOUDFLARE_API_TOKEN"),
    `/zones/${requireEnv(zoneId, "CLOUDFLARE_ZONE_ID")}/email/routing/rules/catch_all`,
    {
      method: "PUT",
      body: JSON.stringify({
        name: "Catch-all to Worker",
        enabled,
        actions: [
          {
            type: "worker",
            value: [requireEnv(workerName, "EMAIL_WORKER_NAME")],
          },
        ],
        matchers: [{ type: "all" }],
      }),
    },
  );
}

export async function getEmailRoutingDnsRecords(params: {
  apiToken: string;
  zoneId: string;
  subdomain?: string;
}): Promise<{ record: EmailRoutingDnsRecord[]; errors?: unknown[] }> {
  const { apiToken, zoneId, subdomain } = params;
  const qs = subdomain ? `?subdomain=${encodeURIComponent(subdomain)}` : "";
  return cfRequest<{ record: EmailRoutingDnsRecord[]; errors?: unknown[] }>(
    requireEnv(apiToken, "CLOUDFLARE_API_TOKEN"),
    `/zones/${requireEnv(zoneId, "CLOUDFLARE_ZONE_ID")}/email/routing/dns${qs}`,
    { method: "GET" },
  );
}

export async function enableEmailRoutingDns(params: {
  apiToken: string;
  zoneId: string;
  name?: string;
}): Promise<void> {
  const { apiToken, zoneId, name } = params;
  await cfRequest<unknown>(
    requireEnv(apiToken, "CLOUDFLARE_API_TOKEN"),
    `/zones/${requireEnv(zoneId, "CLOUDFLARE_ZONE_ID")}/email/routing/dns`,
    {
      method: "POST",
      body: JSON.stringify(name ? { name } : {}),
    },
  );
}
