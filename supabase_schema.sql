-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
-- This table matches the Supabase Auth user and stores basic profile info
-- In Market Place, the existing 'users' table had: id, email, firstName, lastName, profileImageUrl
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  first_name text,
  last_name text,
  profile_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROFILES TABLE
-- Existing 'profiles' had: userId, role, bio, skills, portfolioLinks, experienceLevel, availabilityStatus
create table public.profiles (
  id serial primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  role text check (role in ('client', 'developer')) default 'client' not null,
  bio text,
  skills text[], -- Array of strings
  portfolio_links jsonb, -- Array of strings/objects
  experience_level text check (experience_level in ('junior', 'mid', 'senior', 'lead')),
  availability_status text check (availability_status in ('available', 'busy', 'open_to_offers')) default 'available',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- PROJECTS TABLE
create table public.projects (
  id serial primary key,
  client_id uuid references public.users(id) not null,
  title text not null,
  category text not null,
  description text not null,
  budget_min integer,
  budget_max integer,
  deadline timestamp,
  status text check (status in ('open', 'in_progress', 'completed', 'cancelled')) default 'open' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECT INTERESTS TABLE
create table public.project_interests (
  id serial primary key,
  project_id integer references public.projects(id) on delete cascade not null,
  developer_id uuid references public.users(id) on delete cascade not null,
  message text not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, developer_id)
);

-- MESSAGES TABLE
create table public.messages (
  id serial primary key,
  project_id integer references public.projects(id) not null,
  sender_id uuid references public.users(id) not null,
  receiver_id uuid references public.users(id) not null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEWS TABLE
create table public.reviews (
  id serial primary key,
  project_id integer references public.projects(id) not null,
  reviewer_id uuid references public.users(id) not null,
  reviewee_id uuid references public.users(id) not null,
  rating integer not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_interests enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- USERS
create policy "Users are viewable by everyone" on public.users for select using (true);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

-- PROFILES
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);

-- PROJECTS
create policy "Projects are viewable by everyone" on public.projects for select using (true);
create policy "Clients can insert projects" on public.projects for insert with check (auth.uid() = client_id);
create policy "Clients can update own projects" on public.projects for update using (auth.uid() = client_id);

-- PROJECT INTERESTS
create policy "Project interests viewable by involved parties" on public.project_interests for select 
using (auth.uid() = developer_id or exists (select 1 from public.projects where id = project_interests.project_id and client_id = auth.uid()));
create policy "Developers can create interests" on public.project_interests for insert with check (auth.uid() = developer_id);
create policy "Clients can update status" on public.project_interests for update using (exists (select 1 from public.projects where id = project_interests.project_id and client_id = auth.uid()));

-- MESSAGES
create policy "Messages viewable by sender and receiver" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = sender_id);

-- REVIEWS
create policy "Reviews viewable by everyone" on public.reviews for select using (true);
create policy "Users can create reviews" on public.reviews for insert with check (auth.uid() = reviewer_id);

-- TRIGGER FOR NEW USER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, first_name, last_name, profile_image_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
