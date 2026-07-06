-- project_interests had two identical foreign keys to projects
-- (project_interests_project_id_fk and _fkey), which makes PostgREST embeds
-- like project_interests(count) ambiguous (PGRST201). Drop the redundant one;
-- referential integrity is still enforced by the remaining _fkey constraint,
-- which the codebase already references by name for disambiguation.
alter table public.project_interests
  drop constraint if exists project_interests_project_id_fk;
