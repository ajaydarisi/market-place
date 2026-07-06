-- F1: privilege escalation via self-service profile update.
--
-- The base "Users can update own profile" policy had no WITH CHECK, so it
-- defaulted to its USING clause (auth.uid() = user_id) for the NEW row too.
-- That let any user set their own role to 'admin'. The "Admins can update
-- profiles" policy (repair migration) is OR'd with this one, so legitimate
-- admin writes still pass through that policy.
--
-- Replace the self policy with an explicit WITH CHECK that forbids a
-- self-update from landing on role 'admin'. Admins keep full control because
-- their separate policy's check (is-admin) still passes.

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and role in ('client', 'developer'));
