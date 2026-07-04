-- Prevent email harvesting via the public anon key. The users SELECT policy is
-- `using (true)` and the row includes `email`, so any unauthenticated client
-- could read every user's email directly through PostgREST. Column-level grants
-- only take effect once the table-level SELECT grant is removed, so we revoke
-- table SELECT from anon and re-grant every column except `email`.
--
-- Authenticated app paths (self profile, admin views) still read email; those
-- API responses strip email for non-self/non-admin callers at the app layer
-- (mapUser includeEmail). Authenticated direct reads of the column are a known
-- residual — close fully later with a SECURITY DEFINER accessor if required.
revoke select on public.users from anon;
grant select (
  id, first_name, last_name, profile_image_url,
  created_at, updated_at, is_deleted, deleted_at, deleted_by
) on public.users to anon;
