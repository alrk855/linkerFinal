-- 004_company_profiles.sql
-- Company-specific profile data

create table public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique not null references public.profiles(id) on delete cascade,
  company_name text not null,
  company_email text not null,
  company_website text,
  company_description text,
  logo_url text,
  industry text,
  size_range text check (size_range in ('1-10', '11-50', '51-200', '201-1000', '1000+')),
  location text,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  rejection_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.company_profiles enable row level security;

-- RLS policies
-- Approved companies visible to all authenticated users; pending/rejected only to owner
create policy "View approved companies or own company"
  on public.company_profiles for select
  to authenticated
  using (
    approval_status = 'approved'
    or profile_id = auth.uid()
  );

create policy "Company users can insert own company profile"
  on public.company_profiles for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.profiles where id = auth.uid() and role = 'company'
    )
  );

create policy "Company users can update own profile"
  on public.company_profiles for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- updated_at trigger
create trigger company_profiles_updated_at
  before update on public.company_profiles
  for each row execute function public.handle_updated_at();
