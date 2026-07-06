-- F1 (part 2): the role-escalation fix only covered UPDATE. Signup creates a
-- users row but no profiles row, so a new user could self-INSERT a profile with
-- role='admin' straight through PostgREST, bypassing the API schema. Restrict
-- the insert the same way as the update. Admin profiles are only ever created
-- via the service-role provisioning script (scripts/set-admin.mjs), which
-- bypasses RLS, or promoted via adminUpdateProfile (an UPDATE) — never a
-- self-service insert.
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = user_id and role in ('client', 'developer'));
