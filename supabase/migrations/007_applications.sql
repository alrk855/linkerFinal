-- 007_applications.sql
-- Student proactive applications

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id),
  student_profile_id uuid not null references public.profiles(id),
  cover_note text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'acknowledged', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(listing_id, student_profile_id)
);

alter table public.applications enable row level security;

-- RLS policies
create policy "Students see own applications"
  on public.applications for select
  to authenticated
  using (student_profile_id = auth.uid());

create policy "Companies see applications to their listings"
  on public.applications for select
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      join public.company_profiles cp on cp.id = l.company_profile_id
      where l.id = listing_id and cp.profile_id = auth.uid()
    )
  );

create policy "Verified students can apply"
  on public.applications for insert
  to authenticated
  with check (
    student_profile_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and is_verified_student = true
    )
  );

create policy "Companies can update application status"
  on public.applications for update
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      join public.company_profiles cp on cp.id = l.company_profile_id
      where l.id = listing_id and cp.profile_id = auth.uid()
    )
  );

-- updated_at trigger
create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.handle_updated_at();

-- Indexes
create index on public.applications(listing_id);
