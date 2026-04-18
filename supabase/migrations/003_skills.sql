-- 003_skills.sql
-- Predefined skill taxonomy

create table public.skill_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sort_order integer default 0
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.skill_categories(id),
  name text not null,
  slug text unique not null,
  sort_order integer default 0
);

create table public.student_skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id),
  unique(profile_id, skill_id),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.skill_categories enable row level security;
alter table public.skills enable row level security;
alter table public.student_skills enable row level security;

-- skill_categories RLS: public read
create policy "Anyone can view skill categories"
  on public.skill_categories for select
  using (true);

-- skills RLS: public read
create policy "Anyone can view skills"
  on public.skills for select
  using (true);

-- student_skills RLS
create policy "Anyone authenticated can view student skills"
  on public.student_skills for select
  to authenticated
  using (true);

create policy "Students can insert own skills"
  on public.student_skills for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "Students can delete own skills"
  on public.student_skills for delete
  to authenticated
  using (profile_id = auth.uid());

-- Profile completeness calculation
create or replace function public.calculate_profile_completeness(p_profile_id uuid)
returns integer as $$
declare
  v_score numeric := 0;
  v_profile record;
  v_student record;
  v_skill_count integer;
  v_field_count integer := 0;
  v_student_field_count integer := 0;
begin
  select * into v_profile from public.profiles where id = p_profile_id;
  if not found then return 0; end if;

  -- profiles fields: 8 fields, each worth 6.25% = 50% total
  if v_profile.full_name is not null and v_profile.full_name <> '' then v_field_count := v_field_count + 1; end if;
  if v_profile.avatar_url is not null and v_profile.avatar_url <> '' then v_field_count := v_field_count + 1; end if;
  if v_profile.bio is not null and v_profile.bio <> '' then v_field_count := v_field_count + 1; end if;
  if v_profile.cv_url is not null and v_profile.cv_url <> '' then v_field_count := v_field_count + 1; end if;
  if v_profile.github_url is not null and v_profile.github_url <> '' then v_field_count := v_field_count + 1; end if;
  if v_profile.linkedin_url is not null and v_profile.linkedin_url <> '' then v_field_count := v_field_count + 1; end if;
  if v_profile.portfolio_url is not null and v_profile.portfolio_url <> '' then v_field_count := v_field_count + 1; end if;
  if v_profile.phone is not null and v_profile.phone <> '' then v_field_count := v_field_count + 1; end if;

  v_score := v_score + (v_field_count * 6.25);

  -- student_profiles fields: 5 fields, each worth 5% = 25% total
  if v_profile.role = 'student' then
    select * into v_student from public.student_profiles where profile_id = p_profile_id;
    if found then
      if v_student.faculty is not null and v_student.faculty <> '' then v_student_field_count := v_student_field_count + 1; end if;
      if v_student.year_of_study is not null then v_student_field_count := v_student_field_count + 1; end if;
      if v_student.experience_level is not null and v_student.experience_level <> '' then v_student_field_count := v_student_field_count + 1; end if;
      if v_student.focus_area is not null and v_student.focus_area <> '' then v_student_field_count := v_student_field_count + 1; end if;
      if v_student.short_description is not null and v_student.short_description <> '' then v_student_field_count := v_student_field_count + 1; end if;
    end if;
    v_score := v_score + (v_student_field_count * 5);

    -- student_skills: at least 3 = 15%, at least 6 = 25%
    select count(*) into v_skill_count from public.student_skills where profile_id = p_profile_id;
    if v_skill_count >= 6 then
      v_score := v_score + 25;
    elsif v_skill_count >= 3 then
      v_score := v_score + 15;
    end if;
  end if;

  return least(round(v_score)::integer, 100);
end;
$$ language plpgsql stable;

-- Profile completeness trigger
create or replace function public.handle_profile_completeness()
returns trigger as $$
begin
  new.profile_completeness := public.calculate_profile_completeness(new.id);
  return new;
end;
$$ language plpgsql;

create trigger profiles_completeness
  before update on public.profiles
  for each row execute function public.handle_profile_completeness();

-- Recalculate profile completeness when student profile changes
create or replace function public.handle_student_profile_completeness()
returns trigger as $$
begin
  update public.profiles
  set profile_completeness = public.calculate_profile_completeness(new.profile_id)
  where id = new.profile_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger student_profiles_completeness
  after insert or update on public.student_profiles
  for each row execute function public.handle_student_profile_completeness();

-- Recalculate profile completeness when skills change
create or replace function public.handle_skills_completeness()
returns trigger as $$
declare
  v_profile_id uuid;
begin
  v_profile_id := coalesce(new.profile_id, old.profile_id);
  update public.profiles
  set profile_completeness = public.calculate_profile_completeness(v_profile_id)
  where id = v_profile_id;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger student_skills_completeness
  after insert or delete on public.student_skills
  for each row execute function public.handle_skills_completeness();

-- Indexes
create index on public.student_skills(profile_id);
create index on public.student_skills(skill_id);
