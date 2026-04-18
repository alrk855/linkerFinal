-- 009_subscriptions.sql
-- Company subscriptions for listing notifications

create table public.company_subscriptions (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  company_profile_id uuid not null references public.company_profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(student_profile_id, company_profile_id)
);

alter table public.company_subscriptions enable row level security;

-- RLS policies
create policy "Students see own subscriptions"
  on public.company_subscriptions for select
  to authenticated
  using (student_profile_id = auth.uid());

create policy "Verified students can subscribe"
  on public.company_subscriptions for insert
  to authenticated
  with check (
    student_profile_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and is_verified_student = true
    )
  );

create policy "Students can unsubscribe"
  on public.company_subscriptions for delete
  to authenticated
  using (student_profile_id = auth.uid());

-- Notify subscribers when a new active listing is posted
create or replace function public.notify_subscribers_new_listing()
returns trigger as $$
declare
  v_company_name text;
  v_sub record;
begin
  if new.is_active = true then
    select company_name into v_company_name
    from public.company_profiles
    where id = new.company_profile_id;

    for v_sub in
      select student_profile_id
      from public.company_subscriptions
      where company_profile_id = new.company_profile_id
    loop
      insert into public.notifications (recipient_id, type, title, body, related_entity_id, related_entity_type)
      values (
        v_sub.student_profile_id,
        'listing_posted',
        'New listing from ' || v_company_name,
        '"' || new.title || '" has been posted',
        new.id,
        'listing'
      );
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger listings_notify_subscribers
  after insert on public.listings
  for each row execute function public.notify_subscribers_new_listing();
