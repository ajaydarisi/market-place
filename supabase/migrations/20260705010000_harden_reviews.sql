-- F2: reviews are forgeable and unbounded at the DB layer.
--
-- (a) The base reviews table declared `rating integer not null` with no range
--     check; v15's `create table if not exists ... check (rating between 1
--     and 5)` was a no-op because the table already existed. Add the real
--     constraint now. Clamp any existing out-of-range rows first so the
--     ALTER can validate.
update public.reviews set rating = 5 where rating > 5;
update public.reviews set rating = 1 where rating < 1;

alter table public.reviews
  drop constraint if exists reviews_rating_range;
alter table public.reviews
  add constraint reviews_rating_range check (rating between 1 and 5);

-- (b) Both insert policies ("Users can create reviews" from base and
--     reviews_insert_self from v15) only checked reviewer_id = auth.uid(),
--     so any authenticated user could insert a review for anyone on any
--     project straight through PostgREST, bypassing the API's eligibility
--     rules. Replace both with a single policy that mirrors the API: the
--     project must be completed and the reviewer must be a participant
--     (the client or the assigned developer). The reviews_project_reviewer_unique
--     index continues to enforce one review per reviewer per project.
drop policy if exists "Users can create reviews" on public.reviews;
drop policy if exists reviews_insert_self on public.reviews;

create policy reviews_insert_eligible
  on public.reviews
  for insert
  to authenticated
  with check (
    reviewer_id = auth.uid()
    and exists (
      select 1
      from public.projects p
      where p.id = reviews.project_id
        and p.status = 'completed'
        and (p.client_id = auth.uid() or p.assigned_developer_id = auth.uid())
    )
  );
