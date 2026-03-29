alter table if exists public.projects
  add column if not exists business_goal text,
  add column if not exists current_state text,
  add column if not exists target_users text,
  add column if not exists project_type text,
  add column if not exists scope_size text,
  add column if not exists preferred_skills text[] not null default '{}'::text[],
  add column if not exists technology_tags text[] not null default '{}'::text[],
  add column if not exists deliverables text[] not null default '{}'::text[],
  add column if not exists must_haves text[] not null default '{}'::text[],
  add column if not exists nice_to_haves text[] not null default '{}'::text[],
  add column if not exists success_criteria text[] not null default '{}'::text[],
  add column if not exists estimated_duration_weeks integer,
  add column if not exists start_date date,
  add column if not exists screening_questions text[] not null default '{}'::text[],
  add column if not exists reference_links jsonb not null default '[]'::jsonb,
  add column if not exists team_preference text,
  add column if not exists communication_cadence text;

alter table if exists public.project_interests
  add column if not exists screening_answers jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'search_document'
  ) then
    alter table public.projects
      add column search_document tsvector;
  end if;
end $$;

create or replace function public.projects_search_document_sync()
returns trigger
language plpgsql
as $$
begin
  new.search_document :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.business_goal, '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.deliverables, '{}'::text[]), ' ')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.technology_tags, '{}'::text[]), ' ')), 'A');

  return new;
end;
$$;

drop trigger if exists projects_search_document_sync_trigger on public.projects;

create trigger projects_search_document_sync_trigger
before insert or update of title, description, business_goal, deliverables, technology_tags
on public.projects
for each row
execute function public.projects_search_document_sync();

update public.projects
set search_document =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(business_goal, '')), 'A') ||
  setweight(to_tsvector('english', array_to_string(coalesce(deliverables, '{}'::text[]), ' ')), 'B') ||
  setweight(to_tsvector('english', array_to_string(coalesce(technology_tags, '{}'::text[]), ' ')), 'A');

update public.projects
set category = case category
  when 'web_dev' then 'web_frontend'
  when 'mobile_app' then 'mobile'
  when 'design' then 'design_ux'
  when 'ai_ml' then 'ai_llm'
  when 'devops' then 'devops_cloud'
  else category
end
where category in ('web_dev', 'mobile_app', 'design', 'ai_ml', 'devops');

update public.profiles
set primary_categories = (
  select coalesce(array_agg(distinct case category
    when 'web_dev' then 'web_frontend'
    when 'mobile_app' then 'mobile'
    when 'design' then 'design_ux'
    when 'ai_ml' then 'ai_llm'
    when 'devops' then 'devops_cloud'
    else category
  end), '{}'::text[])
  from unnest(coalesce(primary_categories, '{}'::text[])) as category
)
where primary_categories is not null;

create index if not exists projects_preferred_skills_gin_idx
  on public.projects using gin (preferred_skills);

create index if not exists projects_technology_tags_gin_idx
  on public.projects using gin (technology_tags);

create index if not exists projects_search_document_gin_idx
  on public.projects using gin (search_document);
