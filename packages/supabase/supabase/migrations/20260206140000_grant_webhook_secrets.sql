-- Allow authenticated role to insert webhook secrets when creating endpoints.
-- Select is intentionally omitted: only service_role (Trigger.dev jobs) reads secrets.

grant insert on private.webhook_secrets to authenticated;
