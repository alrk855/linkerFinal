-- 010_admin.sql
-- Admin whitelist and utility functions

create table public.admin_whitelist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  added_at timestamptz default now()
);

-- NO RLS on admin_whitelist — only accessible via service role key

-- Faculties reference table
create table public.faculties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text unique not null,
  sort_order integer default 0
);

alter table public.faculties enable row level security;

create policy "Anyone can view faculties"
  on public.faculties for select
  using (true);

-------------------------------------------------------------------
-- Utility functions
-------------------------------------------------------------------

-- Anonymous student card for companies (pre-acknowledgment view)
create or replace function public.get_anonymous_student_card(p_student_profile_id uuid)
returns jsonb as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'experience_level', sp.experience_level,
    'focus_area', sp.focus_area,
    'faculty', sp.faculty,
    'year_of_study', sp.year_of_study,
    'degree_type', sp.degree_type,
    'bio_excerpt', left(sp.short_description, 120),
    'skill_slugs', coalesce(
      (select jsonb_agg(s.slug)
       from public.student_skills ss
       join public.skills s on s.id = ss.skill_id
       where ss.profile_id = p_student_profile_id),
      '[]'::jsonb
    )
  ) into v_result
  from public.student_profiles sp
  where sp.profile_id = p_student_profile_id;

  return coalesce(v_result, '{}'::jsonb);
end;
$$ language plpgsql stable security definer;

-- Skill match score between a listing and a student
create or replace function public.get_skill_match_score(p_listing_id uuid, p_student_profile_id uuid)
returns integer as $$
declare
  v_total integer;
  v_matched integer;
begin
  select count(*) into v_total
  from public.listing_skills
  where listing_id = p_listing_id;

  if v_total = 0 then return 0; end if;

  select count(*) into v_matched
  from public.listing_skills ls
  join public.student_skills ss on ss.skill_id = ls.skill_id
  where ls.listing_id = p_listing_id
    and ss.profile_id = p_student_profile_id;

  return round((v_matched::numeric / v_total) * 100)::integer;
end;
$$ language plpgsql stable security definer;

-------------------------------------------------------------------
-- Remaining indexes (from spec)
-------------------------------------------------------------------
create index on public.profiles(role);
create index on public.profiles(is_verified_student);
create index on public.student_profiles(experience_level);
create index on public.student_profiles(focus_area);
create index on public.student_profiles(faculty);

-------------------------------------------------------------------
-- Storage buckets
-------------------------------------------------------------------

-- Avatars bucket (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- CVs bucket (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cvs', 'cvs', false, 10485760,
  array['application/pdf']
) on conflict (id) do nothing;

-- Storage RLS policies for avatars
create policy "Public avatar read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS policies for CVs
create policy "Users read own CV"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'cvs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.acknowledgments
        where student_profile_id = ((storage.foldername(name))[1])::uuid
          and status = 'accepted'
          and company_profile_id in (
            select id from public.company_profiles where profile_id = auth.uid()
          )
      )
    )
  );

create policy "Users upload own CV"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own CV"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own CV"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
