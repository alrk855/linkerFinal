-- 008_notifications.sql
-- Platform notification system

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in (
    'acknowledgment_received',
    'application_received',
    'application_status_changed',
    'listing_posted',
    'company_approved',
    'company_rejected',
    'student_verified'
  )),
  title text not null,
  body text,
  is_read boolean default false,
  related_entity_id uuid,
  related_entity_type text,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

-- RLS policies
create policy "Recipients see own notifications"
  on public.notifications for select
  to authenticated
  using (recipient_id = auth.uid());

create policy "Recipients can mark as read"
  on public.notifications for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- Indexes
create index on public.notifications(recipient_id, is_read);

-------------------------------------------------------------------
-- Notification triggers
-------------------------------------------------------------------

-- Notify student on new acknowledgment
create or replace function public.notify_acknowledgment_received()
returns trigger as $$
declare
  v_company_name text;
  v_listing_title text;
begin
  select cp.company_name, l.title
  into v_company_name, v_listing_title
  from public.listings l
  join public.company_profiles cp on cp.id = l.company_profile_id
  where l.id = new.listing_id;

  insert into public.notifications (recipient_id, type, title, body, related_entity_id, related_entity_type)
  values (
    new.student_profile_id,
    'acknowledgment_received',
    'New acknowledgment from ' || v_company_name,
    'You have been acknowledged for "' || v_listing_title || '"',
    new.id,
    'acknowledgment'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger acknowledgments_notify
  after insert on public.acknowledgments
  for each row execute function public.notify_acknowledgment_received();

-- Notify company on new application
create or replace function public.notify_application_received()
returns trigger as $$
declare
  v_company_owner uuid;
  v_listing_title text;
begin
  select cp.profile_id, l.title
  into v_company_owner, v_listing_title
  from public.listings l
  join public.company_profiles cp on cp.id = l.company_profile_id
  where l.id = new.listing_id;

  insert into public.notifications (recipient_id, type, title, body, related_entity_id, related_entity_type)
  values (
    v_company_owner,
    'application_received',
    'New application received',
    'A student applied for "' || v_listing_title || '"',
    new.id,
    'application'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger applications_notify
  after insert on public.applications
  for each row execute function public.notify_application_received();

-- Notify student on acknowledgment status change
create or replace function public.notify_acknowledgment_status_changed()
returns trigger as $$
declare
  v_company_name text;
  v_listing_title text;
begin
  if old.status <> new.status then
    select cp.company_name, l.title
    into v_company_name, v_listing_title
    from public.listings l
    join public.company_profiles cp on cp.id = l.company_profile_id
    where l.id = new.listing_id;

    insert into public.notifications (recipient_id, type, title, body, related_entity_id, related_entity_type)
    values (
      new.student_profile_id,
      'application_status_changed',
      'Acknowledgment status updated',
      'Your acknowledgment for "' || v_listing_title || '" is now ' || new.status,
      new.id,
      'acknowledgment'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger acknowledgments_status_notify
  after update on public.acknowledgments
  for each row execute function public.notify_acknowledgment_status_changed();

-- Notify company on approval status change
create or replace function public.notify_company_approval()
returns trigger as $$
begin
  if old.approval_status <> new.approval_status then
    if new.approval_status = 'approved' then
      insert into public.notifications (recipient_id, type, title, body, related_entity_id, related_entity_type)
      values (
        new.profile_id,
        'company_approved',
        'Company approved',
        'Your company "' || new.company_name || '" has been approved. You can now post listings.',
        new.id,
        'company_profile'
      );
    elsif new.approval_status = 'rejected' then
      insert into public.notifications (recipient_id, type, title, body, related_entity_id, related_entity_type)
      values (
        new.profile_id,
        'company_rejected',
        'Company registration rejected',
        coalesce('Reason: ' || new.rejection_reason, 'Your company registration was rejected.'),
        new.id,
        'company_profile'
      );
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger company_approval_notify
  after update on public.company_profiles
  for each row execute function public.notify_company_approval();

-- Notify student on verification
create or replace function public.notify_student_verified()
returns trigger as $$
begin
  if old.is_verified_student = false and new.is_verified_student = true then
    insert into public.notifications (recipient_id, type, title, body, related_entity_id, related_entity_type)
    values (
      new.id,
      'student_verified',
      'Student status verified',
      'Your UKIM student status has been verified. You can now apply to listings.',
      new.id,
      'profile'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger student_verified_notify
  after update on public.profiles
  for each row execute function public.notify_student_verified();
