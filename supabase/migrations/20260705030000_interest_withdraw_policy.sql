-- Milestone 2.3: let a developer withdraw their own pending proposal.
-- The base schema has no DELETE policy on project_interests, so RLS blocked
-- withdrawal entirely. Allow a developer to delete only their own, still-pending
-- interest (accepted/rejected proposals stay for the record).
drop policy if exists "Developers can withdraw own pending interest" on public.project_interests;
create policy "Developers can withdraw own pending interest"
  on public.project_interests for delete
  using (auth.uid() = developer_id and status = 'pending');
