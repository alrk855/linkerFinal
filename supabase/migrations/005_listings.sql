-- 005_listings.sql
-- Job and internship listings

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  company_profile_id uuid not null references public.company_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  listing_type text not null check (listing_type in ('internship', 'part_time', 'full_time')),
  focus_area text check (focus_area in ('frontend', 'backend', 'fullstack', 'mobile', 'devops', 'data', 'other')),
  experience_level text check (experience_level in ('no_experience', 'junior', 'mid', 'senior')),
  total_slots integer not null check (total_slots > 0 and total_slots <= 20),
  slots_remaining integer not null,
  is_active boolean default true,
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint slots_remaining_valid check (slots_remaining >= 0 and slots_remaining <= total_slots)
);

create table public.listing_skills (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  skill_id uuid not null references public.skills(id),
  unique(listing_id, skill_id)
);

alter table public.listings enable row level security;
alter table public.listing_skills enable row level security;

-- RLS: listings
create policy "Anyone authenticated can view active listings"
  on public.listings for select
  to authenticated
  using (is_active = true and is_deleted = false);

create policy "Approved companies can insert listings"
  on public.listings for insert
  to authenticated
  with check (
    exists (
      select 1 from public.company_profiles
      where id = company_profile_id
        and profile_id = auth.uid()
        and approval_status = 'approved'
    )
  );

create policy "Companies can update own listings"
  on public.listings for update
  to authenticated
  using (
    exists (
      select 1 from public.company_profiles
      where id = company_profile_id and profile_id = auth.uid()
    )
  );

-- RLS: listing_skills
create policy "Anyone authenticated can view listing skills"
  on public.listing_skills for select
  to authenticated
  using (true);

create policy "Companies can manage listing skills"
  on public.listing_skills for insert
  to authenticated
  with check (
    exists (
      select 1 from public.listings l
      join public.company_profiles cp on cp.id = l.company_profile_id
      where l.id = listing_id and cp.profile_id = auth.uid()
    )
  );

create policy "Companies can delete listing skills"
  on public.listing_skills for delete
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      join public.company_profiles cp on cp.id = l.company_profile_id
      where l.id = listing_id and cp.profile_id = auth.uid()
    )
  );

-- Trigger: set slots_remaining = total_slots on insert
create or replace function public.handle_listing_insert()
returns trigger as $$
begin
  new.slots_remaining := new.total_slots;
  return new;
end;
$$ language plpgsql;

create trigger listings_set_slots
  before insert on public.listings
  for each row execute function public.handle_listing_insert();

-- Trigger: max 3 active non-deleted listings per company
create or replace function public.check_active_listing_limit()
returns trigger as $$
declare
  v_count integer;
begin
  if new.is_active = true and new.is_deleted = false then
    select count(*) into v_count
    from public.listings
    where company_profile_id = new.company_profile_id
      and is_active = true
      and is_deleted = false
      and id <> new.id;

    if v_count >= 3 then
      raise exception 'A company cannot have more than 3 active listings';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger listings_active_limit
  before insert or update on public.listings
  for each row execute function public.check_active_listing_limit();

-- Trigger: prevent hard delete, soft-delete instead
create or replace function public.handle_listing_soft_delete()
returns trigger as $$
begin
  update public.listings set is_deleted = true, is_active = false where id = old.id;
  return null; -- prevent the actual delete
end;
$$ language plpgsql;

create trigger listings_soft_delete
  before delete on public.listings
  for each row execute function public.handle_listing_soft_delete();

-- updated_at trigger
create trigger listings_updated_at
  before update on public.listings
  for each row execute function public.handle_updated_at();

-- Indexes
create index on public.listings(company_profile_id);
create index on public.listings(is_active, is_deleted);
create index on public.listings(focus_area);
create index on public.listings(experience_level);
