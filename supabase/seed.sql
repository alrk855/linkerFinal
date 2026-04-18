-- seed.sql
-- Reference data for Linker platform
-- Idempotent: safe to run multiple times

-------------------------------------------------------------------
-- Skill Categories
-------------------------------------------------------------------
insert into public.skill_categories (name, slug, sort_order) values
  ('Languages', 'languages', 1),
  ('Frontend', 'frontend', 2),
  ('Backend', 'backend', 3),
  ('Mobile', 'mobile', 4),
  ('Databases', 'databases', 5),
  ('DevOps & Tools', 'devops-tools', 6),
  ('Design & UI', 'design-ui', 7),
  ('Other', 'other', 8)
on conflict (slug) do nothing;

-------------------------------------------------------------------
-- Skills
-------------------------------------------------------------------

-- Languages
insert into public.skills (category_id, name, slug, sort_order)
select c.id, s.name, s.slug, s.sort_order
from public.skill_categories c
cross join (values
  ('JavaScript', 'javascript', 1),
  ('TypeScript', 'typescript', 2),
  ('Python', 'python', 3),
  ('Java', 'java', 4),
  ('C#', 'csharp', 5),
  ('C++', 'cpp', 6),
  ('PHP', 'php', 7),
  ('Go', 'go', 8),
  ('Rust', 'rust', 9),
  ('Swift', 'swift', 10),
  ('Kotlin', 'kotlin', 11),
  ('Dart', 'dart', 12)
) as s(name, slug, sort_order)
where c.slug = 'languages'
on conflict (slug) do nothing;

-- Frontend
insert into public.skills (category_id, name, slug, sort_order)
select c.id, s.name, s.slug, s.sort_order
from public.skill_categories c
cross join (values
  ('React', 'react', 1),
  ('Next.js', 'nextjs', 2),
  ('Vue.js', 'vuejs', 3),
  ('Angular', 'angular', 4),
  ('Svelte', 'svelte', 5),
  ('HTML', 'html', 6),
  ('CSS', 'css', 7),
  ('Tailwind CSS', 'tailwindcss', 8),
  ('SASS', 'sass', 9),
  ('Redux', 'redux', 10),
  ('Zustand', 'zustand', 11),
  ('React Query', 'react-query', 12)
) as s(name, slug, sort_order)
where c.slug = 'frontend'
on conflict (slug) do nothing;

-- Backend
insert into public.skills (category_id, name, slug, sort_order)
select c.id, s.name, s.slug, s.sort_order
from public.skill_categories c
cross join (values
  ('Node.js', 'nodejs', 1),
  ('Express', 'express', 2),
  ('FastAPI', 'fastapi', 3),
  ('Django', 'django', 4),
  ('Laravel', 'laravel', 5),
  ('Spring Boot', 'spring-boot', 6),
  ('ASP.NET', 'aspnet', 7),
  ('GraphQL', 'graphql', 8),
  ('REST API Design', 'rest-api-design', 9),
  ('tRPC', 'trpc', 10)
) as s(name, slug, sort_order)
where c.slug = 'backend'
on conflict (slug) do nothing;

-- Mobile
insert into public.skills (category_id, name, slug, sort_order)
select c.id, s.name, s.slug, s.sort_order
from public.skill_categories c
cross join (values
  ('React Native', 'react-native', 1),
  ('Flutter', 'flutter', 2),
  ('Expo', 'expo', 3),
  ('iOS (Swift)', 'ios-swift', 4),
  ('Android (Kotlin)', 'android-kotlin', 5)
) as s(name, slug, sort_order)
where c.slug = 'mobile'
on conflict (slug) do nothing;

-- Databases
insert into public.skills (category_id, name, slug, sort_order)
select c.id, s.name, s.slug, s.sort_order
from public.skill_categories c
cross join (values
  ('PostgreSQL', 'postgresql', 1),
  ('MySQL', 'mysql', 2),
  ('MongoDB', 'mongodb', 3),
  ('Redis', 'redis', 4),
  ('SQLite', 'sqlite', 5),
  ('Supabase', 'supabase', 6),
  ('Firebase', 'firebase', 7),
  ('Prisma', 'prisma', 8),
  ('Drizzle ORM', 'drizzle-orm', 9)
) as s(name, slug, sort_order)
where c.slug = 'databases'
on conflict (slug) do nothing;

-- DevOps & Tools
insert into public.skills (category_id, name, slug, sort_order)
select c.id, s.name, s.slug, s.sort_order
from public.skill_categories c
cross join (values
  ('Git', 'git', 1),
  ('Docker', 'docker', 2),
  ('Kubernetes', 'kubernetes', 3),
  ('CI/CD', 'cicd', 4),
  ('GitHub Actions', 'github-actions', 5),
  ('Vercel', 'vercel', 6),
  ('AWS', 'aws', 7),
  ('Linux', 'linux', 8),
  ('Nginx', 'nginx', 9)
) as s(name, slug, sort_order)
where c.slug = 'devops-tools'
on conflict (slug) do nothing;

-- Design & UI
insert into public.skills (category_id, name, slug, sort_order)
select c.id, s.name, s.slug, s.sort_order
from public.skill_categories c
cross join (values
  ('Figma', 'figma', 1),
  ('Adobe XD', 'adobe-xd', 2),
  ('UI/UX Principles', 'ui-ux-principles', 3),
  ('Accessibility (WCAG)', 'accessibility-wcag', 4)
) as s(name, slug, sort_order)
where c.slug = 'design-ui'
on conflict (slug) do nothing;

-- Other
insert into public.skills (category_id, name, slug, sort_order)
select c.id, s.name, s.slug, s.sort_order
from public.skill_categories c
cross join (values
  ('Agile/Scrum', 'agile-scrum', 1),
  ('Technical Writing', 'technical-writing', 2),
  ('Open Source Contribution', 'open-source', 3),
  ('Testing (Jest, Cypress)', 'testing-jest-cypress', 4)
) as s(name, slug, sort_order)
where c.slug = 'other'
on conflict (slug) do nothing;

-------------------------------------------------------------------
-- Faculties (UKIM)
-------------------------------------------------------------------
insert into public.faculties (name, abbreviation, sort_order) values
  ('Faculty of Computer Science and Engineering', 'FCSE', 1),
  ('Faculty of Electrical Engineering and Information Technologies', 'FEEIT', 2),
  ('Faculty of Natural Sciences and Mathematics', 'PMF', 3),
  ('Faculty of Economics', 'Economics', 4),
  ('Faculty of Law', 'Law', 5),
  ('Faculty of Civil Engineering', 'GF', 6),
  ('Faculty of Mechanical Engineering', 'MF', 7),
  ('Faculty of Architecture', 'AF', 8),
  ('Faculty of Medicine', 'MF-Med', 9),
  ('Faculty of Dentistry', 'Dentistry', 10),
  ('Faculty of Pharmacy', 'Pharmacy', 11),
  ('Faculty of Philosophy', 'Philosophy', 12),
  ('Faculty of Philology', 'Philology', 13),
  ('Faculty of Music', 'Music', 14),
  ('Faculty of Drama Arts', 'Drama', 15),
  ('Faculty of Fine Arts', 'FineArts', 16),
  ('Institute of Informatics', 'PMF-II', 17)
on conflict (abbreviation) do nothing;

-------------------------------------------------------------------
-- Admin Whitelist
-- !! REPLACE THIS EMAIL BEFORE PRODUCTION !!
-------------------------------------------------------------------
insert into public.admin_whitelist (email) values
  ('admin@linker.mk')
on conflict (email) do nothing;
