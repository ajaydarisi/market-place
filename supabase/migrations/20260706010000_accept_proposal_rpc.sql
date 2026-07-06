-- F5: make proposal acceptance atomic. Previously the route ran
-- updateInterestStatus → assignDeveloper → rejectOtherInterests as separate
-- statements; a crash between them left an accepted interest on a still-open,
-- unassigned project, and the pending-only guard then wedged every retry.
-- This function performs the whole state change in one transaction under the
-- caller's RLS (SECURITY INVOKER), validating project/interest state while
-- holding row locks, and returns the developers whose proposals were
-- auto-rejected so the caller can notify them.
create or replace function public.accept_proposal(p_project_id integer, p_interest_id integer)
returns table(developer_id uuid)
language plpgsql
set search_path = ''
as $$
declare
  v_developer_id uuid;
  v_status text;
  v_project_status text;
  v_client_id uuid;
  v_rejected uuid[];
begin
  select status, client_id into v_project_status, v_client_id
  from public.projects
  where id = p_project_id and is_deleted = false
  for update;

  if not found then raise exception 'PROJECT_NOT_FOUND'; end if;
  if v_client_id <> auth.uid() then raise exception 'FORBIDDEN'; end if;
  if v_project_status <> 'open' then raise exception 'PROJECT_NOT_OPEN'; end if;

  select project_interests.developer_id, status into v_developer_id, v_status
  from public.project_interests
  where id = p_interest_id and project_id = p_project_id
  for update;

  if not found then raise exception 'INTEREST_NOT_FOUND'; end if;
  if v_status <> 'pending' then raise exception 'INTEREST_NOT_PENDING'; end if;

  select coalesce(array_agg(pi.developer_id), '{}') into v_rejected
  from public.project_interests pi
  where pi.project_id = p_project_id and pi.status = 'pending' and pi.id <> p_interest_id;

  update public.project_interests set status = 'accepted' where id = p_interest_id;
  update public.projects
    set assigned_developer_id = v_developer_id, status = 'in_progress'
    where id = p_project_id;
  update public.project_interests set status = 'rejected'
    where project_id = p_project_id and status = 'pending' and id <> p_interest_id;

  return query select unnest(v_rejected);
end;
$$;

revoke execute on function public.accept_proposal(integer, integer) from anon;
grant execute on function public.accept_proposal(integer, integer) to authenticated;
