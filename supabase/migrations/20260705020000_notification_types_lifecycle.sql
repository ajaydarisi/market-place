-- Milestone 2.3: notifications for the delivery half of the loop — proposal
-- withdrawal, completion requests, and project completion/cancellation.
-- Widen the type check constraint to cover the new lifecycle events.
alter table public.notifications
  drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check check (type in (
    'proposal_received',
    'proposal_accepted',
    'proposal_rejected',
    'proposal_withdrawn',
    'completion_requested',
    'project_completed',
    'project_cancelled',
    'message_received'
  ));
