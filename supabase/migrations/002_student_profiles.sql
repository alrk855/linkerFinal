-- 002_student_profiles.sql
-- Student-specific extended profile data

create table public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique not null references public.profiles(id) on delete cascade,
  faculty text,
  university text default 'UKIM',
  year_of_study integer check (year_of_study between 1 and 7),
  degree_type text check (degree_type in ('bachelor', 'master', 'phd')),
  graduation_year integer,
  experience_level text check (experience_level in ('no_experience', 'junior', 'mid', 'senior')),
  focus_area text check (focus_area in ('frontend', 'backend', 'fullstack', 'mobile', 'devops', 'data', 'other')),
  short_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.student_profiles enable row level security;

-- RLS policies
create policy "Anyone authenticated can view student profiles"
  on public.student_profiles for select
  to authenticated
  using (true);

create policy "Students can insert own student profile"
  on public.student_profiles for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "Students can update own student profile"
  on public.student_profiles for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- updated_at trigger
create trigger student_profiles_updated_at
  before update on public.student_profiles
  for each row execute function public.handle_updated_at();

