-- In-app notifications: new proposal, proposal accepted/rejected, new message.
create table if not exists public.notifications (
  id serial primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  actor_id uuid references public.users(id) on delete cascade not null,
  type text check (type in ('proposal_received', 'proposal_accepted', 'proposal_rejected', 'message_received')) not null,
  project_id integer references public.projects(id) on delete cascade not null,
  content text not null,
  read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists notifications_user_id_created_at_idx
  on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
  on public.notifications for select using (auth.uid() = user_id);

-- The acting user inserts the notification for the recipient (API routes run
-- with the actor's token). Gating on actor_id alone would let any authenticated
-- user forge a notification to an arbitrary victim with attacker-chosen type and
-- content. So we additionally require that actor and recipient are genuine
-- counterparties on the referenced project: one is the project's client and the
-- other is a developer who submitted a proposal to it. This covers every real
-- notification event (proposal received/accepted/rejected, message) while making
-- it impossible to target a user you have no relationship with.
drop policy if exists "Actors can create notifications" on public.notifications;
create policy "Actors can create notifications"
  on public.notifications for insert
  with check (
    auth.uid() = actor_id
    and actor_id <> user_id
    and exists (
      select 1 from public.projects p
      where p.id = project_id
        and (
          (p.client_id = actor_id and exists (
            select 1 from public.project_interests i
            where i.project_id = p.id and i.developer_id = user_id))
          or
          (p.client_id = user_id and exists (
            select 1 from public.project_interests i
            where i.project_id = p.id and i.developer_id = actor_id))
        )
    )
  );

drop policy if exists "Users can mark own notifications read" on public.notifications;
create policy "Users can mark own notifications read"
  on public.notifications for update using (auth.uid() = user_id);

-- Realtime feed for the notification bell
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
