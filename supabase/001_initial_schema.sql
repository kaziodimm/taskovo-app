create extension if not exists pgcrypto;

create type public.task_status as enum (
  'pending_review',
  'open',
  'offers_received',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
  'disputed'
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  city text not null,
  district text,
  budget_czk integer not null check (budget_czk >= 0),
  desired_time text not null,
  client_name text not null,
  client_contact text not null,
  status public.task_status not null default 'pending_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasker_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  categories text not null,
  contact text not null,
  bio text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  tasker_name text not null,
  tasker_contact text not null,
  price_czk integer not null check (price_czk >= 0),
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete set null,
  reviewer_name text not null,
  reviewee_name text not null,
  rating integer not null check (rating between 1 and 5),
  text text,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  sender_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger tasker_profiles_set_updated_at
before update on public.tasker_profiles
for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.tasker_profiles enable row level security;
alter table public.offers enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;

create policy "Public can read open task marketplace"
on public.tasks for select
using (status in ('open', 'offers_received', 'assigned', 'in_progress', 'completed'));

create policy "Anyone can create a task"
on public.tasks for insert
with check (true);

create policy "Public can read verified taskers"
on public.tasker_profiles for select
using (verified = true);

create policy "Anyone can register as tasker"
on public.tasker_profiles for insert
with check (true);

create policy "Public can read offers"
on public.offers for select
using (true);

create policy "Anyone can submit an offer"
on public.offers for insert
with check (true);

create index tasks_city_status_idx on public.tasks(city, status);
create index offers_task_id_idx on public.offers(task_id);
create index tasker_profiles_city_idx on public.tasker_profiles(city);
