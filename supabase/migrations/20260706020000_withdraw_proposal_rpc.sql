-- Withdraw a pending proposal atomically. Doing the notification insert and the
-- delete in one transaction fixes two bugs: (1) notifying the client before the
-- delete could fire a false "withdrawn" notice when a concurrent accept had
-- already flipped the row; (2) the notification RLS insert policy requires the
-- interest row to still exist, so a post-delete notify would silently never
-- deliver. Here the notification is inserted while the row still exists, then
-- the row is deleted, both under the developer's RLS (SECURITY INVOKER).
-- Returns false when there is no still-pending interest owned by the caller
-- (lost race / not the owner), so the route can 409 instead of reporting a
-- false success.
create or replace function public.withdraw_proposal(p_project_id integer, p_interest_id integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_client_id uuid;
  v_title text;
  v_status text;
begin
  select client_id, title into v_client_id, v_title
  from public.projects
  where id = p_project_id and is_deleted = false;
  if not found then raise exception 'PROJECT_NOT_FOUND'; end if;

  select status into v_status
  from public.project_interests
  where id = p_interest_id and project_id = p_project_id and developer_id = auth.uid()
  for update;

  if not found or v_status <> 'pending' then
    return false;
  end if;

  insert into public.notifications (user_id, actor_id, type, project_id, content)
  values (v_client_id, auth.uid(), 'proposal_withdrawn', p_project_id,
          'A proposal on "' || v_title || '" was withdrawn');

  delete from public.project_interests where id = p_interest_id;
  return true;
end;
$$;

revoke execute on function public.withdraw_proposal(integer, integer) from anon;
grant execute on function public.withdraw_proposal(integer, integer) to authenticated;
