-- Repairs the gap between the recovered base schema (v1) and the committed
-- v15/v16 migrations: objects that were created in the never-committed
-- v2-v14 SQL, reconstructed from what lib/storage.ts actually reads.

-- users: soft delete flag used by admin views
alter table public.users
  add column if not exists is_deleted boolean not null default false;

-- profiles: admin role + client-side company fields + completion score
alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('client', 'developer', 'admin'));
alter table public.profiles
  add column if not exists company_name text,
  add column if not exists industry text,
  add column if not exists company_size text,
  add column if not exists profile_completion_score integer;

-- projects: assignment + soft delete
alter table public.projects
  add column if not exists assigned_developer_id uuid references public.users(id),
  add column if not exists is_deleted boolean not null default false;

-- project_logs: progress log used on project detail
create table if not exists public.project_logs (
  id serial primary key,
  project_id integer references public.projects(id) on delete cascade not null,
  author_id uuid references public.users(id) not null,
  content text not null,
  log_type text check (log_type in ('update', 'milestone', 'blocker', 'completed')) default 'update' not null,
  is_system boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.project_logs enable row level security;

-- Logs are derived from private project data (message threads, review notes),
-- so they are readable only by the project's participants — not every logged-in
-- user. Mirrors the ownership check in the GET /logs route handler.
drop policy if exists "Project logs viewable by authenticated" on public.project_logs;
drop policy if exists "Project logs viewable by participants" on public.project_logs;
create policy "Project logs viewable by participants"
  on public.project_logs for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_logs.project_id
      and (p.client_id = auth.uid() or p.assigned_developer_id = auth.uid())
  ));

drop policy if exists "Authors can insert project logs" on public.project_logs;
drop policy if exists "Participants can insert project logs" on public.project_logs;
create policy "Participants can insert project logs"
  on public.project_logs for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.projects p
      where p.id = project_logs.project_id
        and (p.client_id = auth.uid() or p.assigned_developer_id = auth.uid())
    )
  );

-- admin_audit_log: admin action trail
create table if not exists public.admin_audit_log (
  id serial primary key,
  admin_id uuid references public.users(id) not null,
  action text not null,
  target_type text not null,
  target_id text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Admins can read audit log" on public.admin_audit_log;
create policy "Admins can read audit log"
  on public.admin_audit_log for select
  using (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can write audit log" on public.admin_audit_log;
create policy "Admins can write audit log"
  on public.admin_audit_log for insert
  with check (auth.uid() = admin_id
    and exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'));

-- messages: receiver must be able to mark as read
drop policy if exists "Receivers can mark messages read" on public.messages;
create policy "Receivers can mark messages read"
  on public.messages for update using (auth.uid() = receiver_id);

-- admin moderation: admins may update users, profiles, and projects
drop policy if exists "Admins can update users" on public.users;
create policy "Admins can update users"
  on public.users for update
  using (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  using (exists (select 1 from public.profiles as p where p.user_id = auth.uid() and p.role = 'admin'));

drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects"
  on public.projects for update
  using (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'));

-- realtime: the messages hook subscribes to postgres_changes on messages
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
