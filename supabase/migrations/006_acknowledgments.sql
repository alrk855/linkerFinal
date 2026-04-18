-- 006_acknowledgments.sql
-- Core acknowledgment mechanic

create table public.acknowledgments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id),
  company_profile_id uuid not null references public.company_profiles(id),
  student_profile_id uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  student_email_revealed boolean default false,
  acknowledged_at timestamptz default now(),
  responded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(listing_id, student_profile_id)
);

alter table public.acknowledgments enable row level security;

-- RLS policies
create policy "Companies see own acknowledgments"
  on public.acknowledgments for select
  to authenticated
  using (
    exists (
      select 1 from public.company_profiles
      where id = company_profile_id and profile_id = auth.uid()
    )
  );

create policy "Students see acknowledgments addressed to them"
  on public.acknowledgments for select
  to authenticated
  using (student_profile_id = auth.uid());

create policy "Approved companies can insert acknowledgments"
  on public.acknowledgments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.company_profiles
      where id = company_profile_id
        and profile_id = auth.uid()
        and approval_status = 'approved'
    )
  );

create policy "Students can update acknowledgment status"
  on public.acknowledgments for update
  to authenticated
  using (student_profile_id = auth.uid())
  with check (student_profile_id = auth.uid());

-- Trigger: check slots and decrement on insert
create or replace function public.handle_acknowledgment_insert()
returns trigger as $$
declare
  v_remaining integer;
begin
  select slots_remaining into v_remaining
  from public.listings
  where id = new.listing_id
  for update;

  if v_remaining is null or v_remaining <= 0 then
    raise exception 'No slots remaining for this listing';
  end if;

  update public.listings
  set slots_remaining = slots_remaining - 1
  where id = new.listing_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger acknowledgments_check_slots
  before insert on public.acknowledgments
  for each row execute function public.handle_acknowledgment_insert();

-- Trigger: handle status changes
create or replace function public.handle_acknowledgment_status_change()
returns trigger as $$
begin
  if old.status = 'pending' and new.status = 'declined' then
    -- Return slot
    update public.listings
    set slots_remaining = least(slots_remaining + 1, total_slots)
    where id = new.listing_id;
    new.responded_at := now();
  end if;

  if old.status = 'pending' and new.status = 'accepted' then
    new.student_email_revealed := true;
    new.responded_at := now();
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger acknowledgments_status_change
  before update on public.acknowledgments
  for each row execute function public.handle_acknowledgment_status_change();

-- updated_at trigger
create trigger acknowledgments_updated_at
  before update on public.acknowledgments
  for each row execute function public.handle_updated_at();

-- Indexes
create index on public.acknowledgments(listing_id);
create index on public.acknowledgments(student_profile_id);
