-- Audit remediation.

-- #4: public.health is exposed to anon/authenticated with RLS disabled (203 rows).
-- The application never references this table; enable RLS with no policy so it is
-- no longer reachable through the public PostgREST API. Service-role writers
-- (infra/health checks) bypass RLS and are unaffected.
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'health') then
    alter table public.health enable row level security;
  end if;
end $$;

-- #5: the `avatars` bucket is public, so objects are served via their public URL
-- without needing a SELECT policy. The broad "Anyone can view avatars" SELECT
-- policy only enables listing/enumeration of every file, which the app never does
-- (it uploads by PUT and renders by stored public URL). Drop it to stop
-- enumeration while keeping URL rendering intact.
drop policy if exists "Anyone can view avatars" on storage.objects;
