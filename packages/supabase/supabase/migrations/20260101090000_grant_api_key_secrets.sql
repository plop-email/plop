-- Allow authenticated role to insert API key secrets when RLS is enabled.

grant usage on schema private to authenticated;
grant insert on private.api_key_secrets to authenticated;
grant select (id, key_hash) on private.api_key_secrets to authenticated;
