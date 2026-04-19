/**
 * Linker Demo Seed Script
 * Deletes all user data and seeds:
 *   - 1 admin (alektalevski2602@gmail.com)
 *   - 10 companies with 2 listings each (20 total)
 *   - 10 students with varied IT skillsets
 *
 * Run: node scripts/seed-demo.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const contents = readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const eq = line.indexOf("=");
    if (eq <= 0) {
      continue;
    }

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or environment."
  );
}

const svc = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SKILL_CATEGORIES = [
  { name: "Languages", slug: "languages", sort_order: 1 },
  { name: "Frontend", slug: "frontend", sort_order: 2 },
  { name: "Backend", slug: "backend", sort_order: 3 },
  { name: "Mobile", slug: "mobile", sort_order: 4 },
  { name: "Databases", slug: "databases", sort_order: 5 },
  { name: "DevOps & Tools", slug: "devops-tools", sort_order: 6 },
  { name: "Design & UI", slug: "design-ui", sort_order: 7 },
  { name: "Other", slug: "other", sort_order: 8 },
];

const SKILLS_BY_CATEGORY = {
  languages: [
    ["JavaScript", "javascript"],
    ["TypeScript", "typescript"],
    ["Python", "python"],
    ["Java", "java"],
    ["C#", "csharp"],
    ["Swift", "swift"],
    ["Kotlin", "kotlin"],
  ],
  frontend: [
    ["React", "react"],
    ["Next.js", "nextjs"],
    ["Vue.js", "vuejs"],
    ["HTML", "html"],
    ["CSS", "css"],
    ["Tailwind CSS", "tailwindcss"],
    ["SASS", "sass"],
    ["Redux", "redux"],
    ["React Query", "react-query"],
  ],
  backend: [
    ["Node.js", "nodejs"],
    ["Express", "express"],
    ["FastAPI", "fastapi"],
    ["Spring Boot", "spring-boot"],
    ["ASP.NET", "aspnet"],
    ["GraphQL", "graphql"],
    ["REST API Design", "rest-api-design"],
  ],
  mobile: [
    ["React Native", "react-native"],
    ["Flutter", "flutter"],
    ["Expo", "expo"],
    ["iOS (Swift)", "ios-swift"],
    ["Android (Kotlin)", "android-kotlin"],
  ],
  databases: [
    ["PostgreSQL", "postgresql"],
    ["MySQL", "mysql"],
    ["MongoDB", "mongodb"],
    ["Redis", "redis"],
    ["Supabase", "supabase"],
    ["Firebase", "firebase"],
    ["Prisma", "prisma"],
  ],
  "devops-tools": [
    ["Git", "git"],
    ["Docker", "docker"],
    ["Kubernetes", "kubernetes"],
    ["CI/CD", "cicd"],
    ["GitHub Actions", "github-actions"],
    ["AWS", "aws"],
    ["Linux", "linux"],
    ["Nginx", "nginx"],
  ],
  "design-ui": [
    ["Figma", "figma"],
    ["UI/UX Principles", "ui-ux-principles"],
    ["Accessibility (WCAG)", "accessibility-wcag"],
  ],
  other: [
    ["Technical Writing", "technical-writing"],
    ["Testing (Jest, Cypress)", "testing-jest-cypress"],
  ],
};

const EXPERIENCE_LEVEL_MAP = {
  no_experience: "no_experience",
  junior: "junior",
  mid: "mid",
  mid_level: "mid",
  senior: "senior",
};

const FOCUS_AREA_MAP = {
  frontend: "frontend",
  backend: "backend",
  fullstack: "fullstack",
  mobile: "mobile",
  devops: "devops",
  data: "data",
  other: "other",
};

const DEGREE_TYPE_MAP = {
  bachelor: "bachelor",
  master: "master",
  phd: "phd",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function deleteAllAuthUsers() {
  console.log("  Listing auth users...");
  const { data, error } = await svc.auth.admin.listUsers({ perPage: 1000 });
  if (error) { console.error("  Failed to list users:", error.message); return; }
  const users = data?.users || [];
  console.log(`  Deleting ${users.length} auth users...`);
  for (const u of users) {
    await svc.auth.admin.deleteUser(u.id);
  }
  console.log("  Auth users deleted.");
}

async function clearPublicTables() {
  console.log("  Clearing public tables...");
  // Order matters: child → parent to avoid FK violations
  await svc.from("student_skills").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await svc.from("listing_skills").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await svc.from("acknowledgments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await svc.from("applications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await svc.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await svc.from("company_subscriptions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await svc.from("listings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await svc.from("student_profiles").delete().neq("profile_id", "00000000-0000-0000-0000-000000000000");
  await svc.from("company_profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await svc.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await svc.from("admin_whitelist").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("  Public tables cleared.");
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function normalizeExperienceLevel(value) {
  const key = normalizeKey(value);
  return EXPERIENCE_LEVEL_MAP[key] || null;
}

function normalizeFocusArea(value) {
  const key = normalizeKey(value);
  return FOCUS_AREA_MAP[key] || null;
}

function normalizeDegreeType(value) {
  const key = normalizeKey(value);
  return DEGREE_TYPE_MAP[key] || null;
}

async function ensureSkillTaxonomy() {
  const { data: existingSkills, error: existingSkillsError } = await svc
    .from("skills")
    .select("id, slug");

  if (existingSkillsError) {
    throw new Error(`Failed to read skills table: ${existingSkillsError.message}`);
  }

  if ((existingSkills || []).length > 0) {
    return Object.fromEntries((existingSkills || []).map((s) => [s.slug, s.id]));
  }

  console.log("  No skills found. Seeding skill taxonomy...");

  const { error: categoriesUpsertError } = await svc
    .from("skill_categories")
    .upsert(SKILL_CATEGORIES, { onConflict: "slug" });

  if (categoriesUpsertError) {
    throw new Error(`Failed to seed skill categories: ${categoriesUpsertError.message}`);
  }

  const { data: categoryRows, error: categoryRowsError } = await svc
    .from("skill_categories")
    .select("id, slug")
    .in(
      "slug",
      SKILL_CATEGORIES.map((c) => c.slug)
    );

  if (categoryRowsError) {
    throw new Error(`Failed to read skill categories: ${categoryRowsError.message}`);
  }

  const categoryIdBySlug = Object.fromEntries((categoryRows || []).map((c) => [c.slug, c.id]));
  const skillRows = [];

  for (const [categorySlug, skillPairs] of Object.entries(SKILLS_BY_CATEGORY)) {
    const categoryId = categoryIdBySlug[categorySlug];
    if (!categoryId) {
      continue;
    }

    skillPairs.forEach(([name, slug], index) => {
      skillRows.push({
        category_id: categoryId,
        name,
        slug,
        sort_order: index + 1,
      });
    });
  }

  if (skillRows.length > 0) {
    const { error: skillsUpsertError } = await svc
      .from("skills")
      .upsert(skillRows, { onConflict: "slug" });

    if (skillsUpsertError) {
      throw new Error(`Failed to seed skills: ${skillsUpsertError.message}`);
    }
  }

  const { data: finalSkills, error: finalSkillsError } = await svc
    .from("skills")
    .select("id, slug");

  if (finalSkillsError) {
    throw new Error(`Failed to read seeded skills: ${finalSkillsError.message}`);
  }

  return Object.fromEntries((finalSkills || []).map((s) => [s.slug, s.id]));
}

async function createUser(email, password, fullName, role) {
  const { data, error } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) {
    console.error(`  Failed to create user ${email}:`, error.message);
    return null;
  }
  return data.user;
}

// ─── Data Definitions ────────────────────────────────────────────────────────

const COMPANIES = [
  {
    name: "Seavus",
    email: "careers@seavus.com",
    username: "seavus_mk",
    contactName: "Martin Kostovski",
    password: "Seavus@2024!",
    website: "https://seavus.com",
    logo: "https://logo.clearbit.com/seavus.com",
    description: "Seavus is a software development and IT consulting company with 20+ years of experience, headquartered in Skopje. We deliver end-to-end software solutions across telecom, finance, healthcare, and media sectors. Our Skopje engineering hub employs over 800 developers working on projects for clients in Europe and North America.",
    industry: "Software Development",
    size: "201-1000",
    location: "Skopje, North Macedonia",
  },
  {
    name: "Netcetera",
    email: "careers@netcetera.com",
    username: "netcetera_mk",
    contactName: "Ana Trajkovska",
    password: "Netcetera@2024!",
    website: "https://netcetera.com",
    logo: "https://logo.clearbit.com/netcetera.com",
    description: "Netcetera is a Swiss software company with a strong engineering center in Skopje. We build software in banking, payment, ticketing, and health sectors used by millions across Europe. Our Skopje office is one of our largest R&D hubs with over 400 engineers delivering mission-critical systems.",
    industry: "Fintech & Software",
    size: "201-1000",
    location: "Skopje, North Macedonia",
  },
  {
    name: "Endava",
    email: "careers.skopje@endava.com",
    username: "endava_skopje",
    contactName: "Stefan Ilievski",
    password: "Endava@2024!",
    website: "https://endava.com",
    logo: "https://logo.clearbit.com/endava.com",
    description: "Endava is a global technology services company listed on the NYSE, delivering digital transformation for clients worldwide. Our Skopje delivery center focuses on agile software development, cloud engineering, and product design for financial services, healthcare, and retail clients across the UK and US.",
    industry: "Technology Services",
    size: "1000+",
    location: "Skopje, North Macedonia",
  },
  {
    name: "Qinshift",
    email: "talent@qinshift.com",
    username: "qinshift_tech",
    contactName: "Ivana Nikolovska",
    password: "Qinshift@2024!",
    website: "https://qinshift.com",
    logo: "https://logo.clearbit.com/qinshift.com",
    description: "Qinshift (formerly Comtrade Digital Services) is a technology company with deep roots in the Western Balkans. We partner with global enterprises to build software products, data platforms, and automation solutions. Our Skopje team specializes in cloud-native development, DevOps, and digital product engineering.",
    industry: "Digital Transformation",
    size: "201-1000",
    location: "Skopje, North Macedonia",
  },
  {
    name: "EPAM Systems",
    email: "careers@epam.com",
    username: "epam_systems",
    contactName: "Nikola Stojanov",
    password: "EpamSys@2024!",
    website: "https://epam.com",
    logo: "https://logo.clearbit.com/epam.com",
    description: "EPAM Systems is a leading global provider of digital platform engineering and development services. With 50,000+ engineers across 50+ countries, we help clients like Google, Microsoft, and NASDAQ design, build, and scale next-generation software products. Our MK team focuses on full-stack and cloud engineering.",
    industry: "Enterprise Software Engineering",
    size: "1000+",
    location: "Skopje, North Macedonia",
  },
  {
    name: "Brainster",
    email: "hello@brainster.io",
    username: "brainster_io",
    contactName: "Darko Petrovski",
    password: "Brainster@2024!",
    website: "https://brainster.io",
    logo: "https://logo.clearbit.com/brainster.io",
    description: "Brainster is North Macedonia's leading tech education and startup studio. We run intensive coding bootcamps and build in-house digital products in EdTech, HealthTech, and FinTech. Our product team is constantly growing and we actively recruit talent from UKIM faculties who are hungry to build real products.",
    industry: "EdTech & Product Studio",
    size: "51-200",
    location: "Skopje, North Macedonia",
  },
  {
    name: "Scale Focus",
    email: "careers@scalefocus.com",
    username: "scalefocus_dev",
    contactName: "Bojan Stefanovski",
    password: "ScaleFocus@2024!",
    website: "https://scalefocus.com",
    logo: "https://logo.clearbit.com/scalefocus.com",
    description: "Scale Focus is a fast-growing technology company delivering custom software, cloud solutions, and data engineering services to clients across Europe and North America. Our Skopje engineering team works on projects spanning React, .NET, AWS, and machine learning for clients in insurance, retail, and logistics.",
    industry: "Custom Software Development",
    size: "201-1000",
    location: "Skopje, North Macedonia",
  },
  {
    name: "Telerik",
    email: "students@telerik.com",
    username: "telerik_devtools",
    contactName: "Petra Davidovska",
    password: "Telerik@2024!",
    website: "https://telerik.com",
    logo: "https://logo.clearbit.com/telerik.com",
    description: "Telerik, a Progress company, is the maker of leading developer tools and UI components for web, mobile, and desktop apps used by 10M+ developers globally. Our regional office recruits strong frontend and .NET engineers to work on products like Kendo UI, Telerik UI for Blazor, and the Test Studio automation platform.",
    industry: "Developer Tools",
    size: "201-1000",
    location: "Skopje, North Macedonia",
  },
  {
    name: "Limeade",
    email: "engineering@limeade.com",
    username: "limeade_eng",
    contactName: "Sonja Ristovska",
    password: "Limeade@2024!",
    website: "https://limeade.com",
    logo: "https://logo.clearbit.com/limeade.com",
    description: "Limeade is an employee experience platform (acquired by WebMD Health Services) that helps Fortune 500 companies improve wellbeing and engagement for their workforces. Our Skopje engineering team builds the core platform—React frontends, Node.js microservices, and Azure cloud infrastructure—used by over 100 enterprise clients.",
    industry: "HR Technology",
    size: "201-1000",
    location: "Skopje, North Macedonia",
  },
  {
    name: "Neoinfo",
    email: "posao@neoinfo.mk",
    username: "neoinfo_mk",
    contactName: "Aleksandar Janev",
    password: "Neoinfo@2024!",
    website: "https://neoinfo.mk",
    logo: null,
    description: "Neoinfo is a Macedonian software house specializing in enterprise information systems, GIS solutions, and government digitalization projects. We work closely with local municipalities and public institutions to modernize their digital infrastructure using Java, PostgreSQL, and open-source GIS tools.",
    industry: "Enterprise & GIS Software",
    size: "51-200",
    location: "Skopje, North Macedonia",
  },
];

const LISTINGS = [
  // Seavus
  {
    company: "seavus_mk",
    title: "Frontend Developer Intern",
    type: "internship",
    focus: "frontend",
    level: "No experience",
    slots: 3,
    description: `We are looking for ambitious frontend developer interns to join our Skopje engineering teams.

You will work alongside senior developers on real client projects for European telecom and media companies. This is not a coffee-fetching internship — you will write code that ships to production.

**What you will do:**
- Build and maintain React/TypeScript components for web applications
- Implement responsive designs from Figma specifications
- Write unit tests using Jest and React Testing Library
- Participate in daily standups and sprint planning
- Get code reviews from senior engineers

**Requirements:**
- Currently enrolled at FCSE, FEEIT, or PMF
- Solid knowledge of JavaScript fundamentals and HTML/CSS
- Exposure to React (projects, tutorials, or coursework)
- Git basic workflows
- Good written communication in English

**What we offer:**
- Paid internship (700–900 EUR/month)
- Mentorship from senior engineers
- Possibility for full-time employment after graduation
- Flexible hours to accommodate university schedule`,
    skills: ["javascript", "typescript", "react", "html", "css", "tailwindcss", "git"],
  },
  {
    company: "seavus_mk",
    title: "QA Automation Engineer",
    type: "part_time",
    focus: "backend",
    level: "Junior",
    slots: 2,
    description: `Seavus is expanding its QA automation practice and is looking for a junior QA engineer to work part-time on our testing frameworks.

You will join the test automation guild and help maintain our Selenium/Cypress-based test suites across multiple product lines. This role is ideal for final-year students or recent graduates who want hands-on experience with enterprise-scale test infrastructure.

**Responsibilities:**
- Write and maintain automated test scripts (Cypress, Selenium, JUnit)
- Develop test plans and test cases for new features
- Perform regression testing and report defects clearly
- Collaborate with developers to reproduce and fix bugs
- Contribute to CI/CD pipeline improvements

**Requirements:**
- Experience with at least one testing framework (Cypress, Jest, Selenium)
- Strong analytical thinking and attention to detail
- Basic programming skills in JavaScript or Java
- Understanding of REST APIs and HTTP
- ISTQB Foundation certification is a plus

**What we offer:**
- Part-time contract with competitive hourly rate
- Access to ISTQB certification program (company-sponsored)
- Direct path to full-time QA role`,
    skills: ["javascript", "testing-jest-cypress", "git", "rest-api-design", "cicd"],
  },

  // Netcetera
  {
    company: "netcetera_mk",
    title: "Android Developer (Student Position)",
    type: "part_time",
    focus: "mobile",
    level: "Junior",
    slots: 2,
    description: `Netcetera builds mobile payment and ticketing apps used by millions across Europe. We are looking for a junior Android developer to join our mobile team in Skopje on a part-time basis.

You will work on a Swiss public transit ticketing application used by over 2 million commuters daily. Our stack is Kotlin with Jetpack Compose, following clean architecture principles.

**What you will work on:**
- Develop new features in our Kotlin/Compose mobile codebase
- Implement UI components following Material Design guidelines
- Integrate with RESTful backend APIs
- Write unit tests for business logic
- Participate in code reviews and architecture discussions

**Requirements:**
- Solid Kotlin knowledge (Swift/Java experience also considered)
- Familiarity with Android development basics
- Understanding of REST APIs and JSON
- Git workflow experience
- Passion for clean, readable code

**Nice to have:**
- Experience with Jetpack Compose
- Knowledge of MVVM or clean architecture patterns`,
    skills: ["kotlin", "android-kotlin", "git", "rest-api-design", "java"],
  },
  {
    company: "netcetera_mk",
    title: "Full-Stack Developer Intern",
    type: "internship",
    focus: "fullstack",
    level: "No experience",
    slots: 4,
    description: `Join Netcetera's internship program and work on real fintech and transit technology projects that run at scale.

As a full-stack intern, you will rotate across frontend (React/TypeScript) and backend (Spring Boot/Java) teams to get a comprehensive view of how enterprise software is built. Our interns regularly receive return offers.

**Program highlights:**
- 6-month paid internship with possible extension
- Structured onboarding with a dedicated buddy
- Weekly tech talks from senior engineers
- Capstone project presentation at end of program

**Technical exposure:**
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Java, Spring Boot, PostgreSQL
- DevOps: Docker, GitLab CI, Kubernetes (basic)
- Process: Agile, Scrum, code review culture

**Requirements:**
- Enrolled in CS, Software Engineering, or related field
- Basic programming skills in any language
- Eager to learn, open to feedback
- English communication skills`,
    skills: ["javascript", "typescript", "react", "java", "spring-boot", "postgresql", "docker", "git"],
  },

  // Endava
  {
    company: "endava_skopje",
    title: "Junior React Developer",
    type: "full_time",
    focus: "frontend",
    level: "Junior",
    slots: 3,
    description: `Endava is hiring junior React developers for our Skopje delivery center. You will be placed on a client team working for a UK-based financial services company, building their customer-facing web portal.

This is a full-time position with full benefits, targeted at recent graduates or students in their final semester.

**The role:**
- Build and maintain a React/TypeScript SPA with a design system
- Work in a cross-functional agile team (developers, designers, QA, PMs)
- Collaborate daily with engineers in the UK and Romania
- Contribute to component library and design system documentation
- Participate in technical interviews and solution design sessions

**Requirements:**
- 6+ months of React experience (internship, projects, or work)
- TypeScript proficiency
- REST API integration experience
- Understanding of state management (Redux, Zustand, or Context)
- Professional English — daily written and verbal communication with UK clients

**Compensation:** 800–1,200 EUR/month gross for entry-level, reviewed after 6 months`,
    skills: ["react", "typescript", "javascript", "tailwindcss", "redux", "rest-api-design", "git", "figma"],
  },
  {
    company: "endava_skopje",
    title: "DevOps Engineer Intern",
    type: "internship",
    focus: "devops",
    level: "No experience",
    slots: 2,
    description: `Endava's infrastructure team in Skopje is opening internship positions for aspiring DevOps and cloud engineers.

You will be embedded in our platform engineering team, working on CI/CD pipelines, Kubernetes clusters, and cloud infrastructure for multiple client environments. This role is hands-on from day one.

**You will learn and contribute to:**
- CI/CD pipeline design and maintenance (GitLab CI, GitHub Actions)
- Container orchestration with Kubernetes and Helm charts
- Infrastructure as Code using Terraform and Ansible
- Cloud cost monitoring and optimization on AWS
- Incident response and on-call preparation (shadowing only)

**Requirements:**
- Basic Linux command-line comfort (navigating filesystems, editing config files, running scripts)
- Understanding of networking fundamentals (DNS, HTTP, TLS)
- Scripting in Bash or Python
- Curious about cloud technologies — no prior cloud experience required

**Duration:** 3–6 months, paid`,
    skills: ["linux", "docker", "git", "cicd", "github-actions", "aws", "python"],
  },

  // Qinshift
  {
    company: "qinshift_tech",
    title: "Data Engineer (Part-time / Student)",
    type: "part_time",
    focus: "Data",
    level: "Junior",
    slots: 2,
    description: `Qinshift's data platform team is looking for a data engineering student to help build and maintain ETL pipelines for our clients in insurance and logistics.

You will work with modern data stack tools (dbt, Airflow, Snowflake) alongside senior data engineers who will mentor you. This position is designed for students in their 3rd or 4th year with strong SQL skills and basic Python knowledge.

**Responsibilities:**
- Write and optimize SQL transformations in dbt
- Build and monitor Airflow DAGs for data pipelines
- Document data models and lineage in our data catalog
- Help migrate legacy SQL stored procedures to modern pipeline patterns
- Participate in data quality testing and monitoring

**Requirements:**
- Strong SQL skills (joins, window functions, CTEs)
- Python basics (pandas, scripting)
- Understanding of relational database concepts
- Analytical mindset and attention to data quality
- Experience with any BI tool (Power BI, Tableau, Metabase) is a plus`,
    skills: ["python", "postgresql", "mongodb", "git", "rest-api-design"],
  },
  {
    company: "qinshift_tech",
    title: "Backend Developer Intern — .NET",
    type: "internship",
    focus: "backend",
    level: "No experience",
    slots: 3,
    description: `Join Qinshift's .NET backend team and work on enterprise APIs powering supply chain management and insurance claim processing systems.

You will be paired with a senior engineer who will guide you through building RESTful APIs with C#/.NET 8, Entity Framework Core, and SQL Server.

**What you will build:**
- RESTful API endpoints for business-critical workflows
- Database migrations and schema design with EF Core
- Background job services for data processing
- Unit tests using xUnit and Moq
- API documentation with Swagger/OpenAPI

**Requirements:**
- C# programming knowledge (university coursework is sufficient)
- Object-oriented programming fundamentals
- Understanding of HTTP and REST concepts
- SQL basics
- No prior professional experience required — we will teach you the rest`,
    skills: ["csharp", "aspnet", "postgresql", "git", "docker"],
  },

  // EPAM
  {
    company: "epam_systems",
    title: "Node.js Backend Intern",
    type: "internship",
    focus: "backend",
    level: "No experience",
    slots: 4,
    description: `EPAM's Skopje lab is hiring Node.js backend interns for our Google Cloud practice. You will be placed on a project supporting a US-based SaaS company's API infrastructure.

This internship is part of EPAM's formal Lab program — a structured 3-month program with training, mentoring, and a project showcase.

**Lab Program structure:**
- Week 1–2: Onboarding, internal tools, codebase walkthrough
- Week 3–10: Active development sprints with your team
- Week 11–12: Project showcase and performance review

**Technical environment:**
- Node.js (Express / Fastify), TypeScript
- PostgreSQL / Redis caching layer
- Google Cloud Platform (Cloud Run, Pub/Sub, Cloud SQL)
- Docker, GitHub Actions CI

**Requirements:**
- Node.js or JavaScript backend experience (coursework or personal projects)
- Understanding of async programming (Promises, async/await)
- REST API design basics
- Git experience
- English — B2 or above`,
    skills: ["nodejs", "javascript", "typescript", "postgresql", "redis", "docker", "git", "rest-api-design"],
  },
  {
    company: "epam_systems",
    title: "Cloud Infrastructure Engineer (Junior)",
    type: "full_time",
    focus: "devops",
    level: "Junior",
    slots: 2,
    description: `EPAM is expanding its cloud practice in Skopje and is hiring junior cloud/DevOps engineers to work on AWS infrastructure for enterprise US clients.

This is a full-time junior role with clear progression toward cloud architect or SRE tracks. You will work in cross-functional teams alongside application developers to design, automate, and operate cloud environments.

**Key responsibilities:**
- Provision and manage AWS infrastructure with Terraform
- Build and improve CI/CD pipelines (GitHub Actions, AWS CodePipeline)
- Monitor production systems using CloudWatch, Datadog
- Implement security best practices (IAM, VPC, secrets management)
- Participate in on-call rotation (after 3 months, non-mandatory initially)

**Required:**
- AWS fundamentals (EC2, S3, Lambda, IAM)
- Terraform or CloudFormation experience
- Linux system administration basics
- Docker and container fundamentals
- AWS Solutions Architect Associate certification preferred`,
    skills: ["aws", "docker", "kubernetes", "cicd", "linux", "git", "github-actions"],
  },

  // Brainster
  {
    company: "brainster_io",
    title: "React Developer — Internal Products",
    type: "part_time",
    focus: "frontend",
    level: "Junior",
    slots: 2,
    description: `Brainster is building its next generation of learning platform and student tracking tools. We need a part-time React developer to join our small, fast-moving product team.

This is not a corporate role — you will have real ownership over features, ship things fast, and see them used by thousands of Brainster students. We work in TypeScript, Next.js, Tailwind, and Supabase.

**What you will build:**
- Student dashboard with progress tracking
- Live mentoring session booking system
- Certificate generation and verification module
- Notification system for course milestones

**Stack:**
- Next.js 14 (App Router), TypeScript
- Tailwind CSS, Radix UI
- Supabase (Postgres + Auth + Storage)
- Vercel for deployment

**Requirements:**
- React and TypeScript experience
- At least one completed project you can show us
- Self-directed, doesn't need hand-holding
- Available 20h/week minimum`,
    skills: ["react", "nextjs", "typescript", "tailwindcss", "supabase", "git", "figma"],
  },
  {
    company: "brainster_io",
    title: "Full-Stack Intern — HealthTech Product",
    type: "internship",
    focus: "fullstack",
    level: "No experience",
    slots: 2,
    description: `Brainster's studio is launching a new HealthTech SaaS product and needs a motivated full-stack intern to join the founding engineering team.

You will be one of 3–4 engineers on a greenfield project. This means you will have exposure to every part of the stack and real decision-making power over technical choices.

**What the product does:**
A patient-doctor communication and appointment scheduling platform for clinics in the region.

**Your role:**
- Build REST API endpoints with Node.js and Express
- Develop React frontend components
- Design and write PostgreSQL schema migrations
- Integrate third-party calendar and notification APIs
- Write end-to-end tests with Playwright

**Requirements:**
- Know enough JavaScript to be dangerous
- Comfortable with databases (any SQL flavor)
- Eager to learn fast and iterate quickly
- Available 4–5 days a week
- Previous projects or GitHub commits to show`,
    skills: ["javascript", "nodejs", "react", "postgresql", "git", "rest-api-design", "testing-jest-cypress"],
  },

  // Scale Focus
  {
    company: "scalefocus_dev",
    title: "iOS Developer Intern",
    type: "internship",
    focus: "mobile",
    level: "No experience",
    slots: 2,
    description: `Scale Focus is opening iOS internship positions for students interested in Swift development. You will work on a consumer fitness application for a US client that has over 200,000 active users.

Our mobile team follows a clean MVVM architecture pattern with SwiftUI for new screens and UIKit for legacy ones. This is a real internship — your commits will go to production.

**Technical work:**
- Build new SwiftUI screens and UI components
- Integrate REST APIs using URLSession and Combine
- Write unit tests with XCTest
- Work with Core Data for local caching
- Submit builds through Fastlane to TestFlight

**Requirements:**
- Swift fundamentals (variables, optionals, closures, protocols)
- SwiftUI basics
- Understanding of OOP and MVVM
- macOS with Xcode installed
- No prior iOS job experience required

**Duration:** 3–6 months, with a possibility for a part-time contract after`,
    skills: ["swift", "ios-swift", "git", "rest-api-design"],
  },
  {
    company: "scalefocus_dev",
    title: "Python Data Analyst (Part-time)",
    type: "part_time",
    focus: "Data",
    level: "Junior",
    slots: 2,
    description: `Scale Focus's business intelligence team needs a part-time Python data analyst to help our logistics and retail clients turn raw data into actionable insights.

You will work with real datasets, build dashboards in Metabase, and automate reporting pipelines in Python. Ideal for a student in their last 2 years of CS, Mathematics, or Economics.

**Day-to-day work:**
- Write Python scripts to clean, transform, and analyze data (pandas, NumPy)
- Build automated reports with Python + Jinja2 templates
- Create and maintain Metabase dashboards for client KPIs
- Write SQL queries against PostgreSQL and ClickHouse databases
- Present findings to non-technical stakeholders

**Requirements:**
- Python proficiency with pandas and NumPy
- SQL — complex queries, aggregations, window functions
- Statistical thinking — understanding distributions, correlations, outliers
- Nice to have: Experience with any BI/visualization tool`,
    skills: ["python", "postgresql", "mongodb", "git"],
  },

  // Telerik
  {
    company: "telerik_devtools",
    title: "UI Component Developer (React/TypeScript)",
    type: "internship",
    focus: "frontend",
    level: "Junior",
    slots: 2,
    description: `Telerik is hiring UI component developers to work on Kendo UI for React — a suite of 100+ enterprise-grade UI components used by developers at companies like Microsoft, BMW, and SAP.

This is a niche role that requires deep knowledge of React internals, accessibility standards, and cross-browser compatibility. If you love building UI primitives that other developers build on top of, this is your opportunity.

**What you will build:**
- Accessible, themeable React components (Grid, DatePicker, Charts, etc.)
- TypeScript type definitions and API documentation
- Unit tests and visual regression tests
- Code examples for the documentation site

**Technical requirements:**
- Deep React knowledge (hooks, context, render optimization)
- TypeScript
- CSS — animations, custom properties, responsive design
- Accessibility (WCAG 2.1 AA) awareness
- Testing experience (Jest + Testing Library)

**Bonus:**
- Contributions to open-source UI libraries
- Experience with any component library (Radix, Shadcn, MUI)`,
    skills: ["react", "typescript", "javascript", "css", "html", "accessibility-wcag", "testing-jest-cypress", "figma"],
  },
  {
    company: "telerik_devtools",
    title: "Technical Writer / Developer Advocate Intern",
    type: "internship",
    focus: "Other",
    level: "No experience",
    slots: 1,
    description: `Telerik is looking for a technical writing intern to join our DevRel team. You will help create documentation, tutorials, and blog posts for Telerik's developer tools used by millions worldwide.

This is a rare opportunity for a CS student who loves writing and wants to work at the intersection of engineering and communication.

**What you will create:**
- Step-by-step tutorials for new framework integrations
- API reference documentation
- Video script writing and code examples for YouTube tutorials
- Blog posts on web development topics using Telerik tools
- Community responses on Stack Overflow and forums

**Requirements:**
- Strong written English (native-level not required, but clear and precise)
- Programming experience in JavaScript/TypeScript
- Ability to explain technical concepts simply
- React or Angular experience for hands-on examples
- Genuine interest in developer communities

**Tools:** VS Code, Markdown, Git, Confluence, Loom (screen recording)`,
    skills: ["javascript", "typescript", "react", "html", "css", "git", "technical-writing"],
  },

  // Limeade
  {
    company: "limeade_eng",
    title: "Full-Stack Engineer (React + Node.js)",
    type: "full_time",
    focus: "fullstack",
    level: "Junior",
    slots: 2,
    description: `Limeade (a WebMD Health Services company) is hiring junior full-stack engineers to join our Skopje product team building a wellness engagement platform for Fortune 500 HR departments.

This is a full-time position open to recent graduates or final-semester students. You will work on features used by employees at companies like T-Mobile, REI, and Nationwide Insurance.

**Our stack:**
- Frontend: React, TypeScript, Redux, styled-components
- Backend: Node.js (Express), GraphQL, PostgreSQL
- Cloud: Azure (App Service, Storage, SQL)
- Testing: Jest, Cypress, Playwright
- CI/CD: GitHub Actions, Azure DevOps

**The role:**
- Build and ship features across the full stack
- Work in 2-week sprints with US-based product managers
- Participate in architecture discussions and RFC reviews
- Maintain 80%+ code test coverage on your features
- On-call rotation after 3 months (compensated)

**Requirements:**
- React and Node.js or similar full-stack framework
- TypeScript
- REST or GraphQL API experience
- PostgreSQL or any relational DB`,
    skills: ["react", "nodejs", "typescript", "postgresql", "graphql", "redux", "git", "testing-jest-cypress"],
  },
  {
    company: "limeade_eng",
    title: "Junior Backend Developer — Python / Azure",
    type: "part_time",
    focus: "backend",
    level: "Junior",
    slots: 2,
    description: `Limeade's data platform team needs a junior Python developer to work part-time on our Azure-based data ingestion and analytics services.

You will build microservices that process HR data feeds from enterprise clients, running in Azure Functions and containerized on AKS. This is a great role for a student who wants exposure to cloud-native Python development.

**Key work:**
- Develop Azure Functions in Python for event-driven data processing
- Build FastAPI microservices for internal data APIs
- Write data validation and transformation logic (pydantic, pandas)
- Maintain integration tests against staging environments
- Assist with Azure resource provisioning via Bicep templates

**Requirements:**
- Python — comfortable with classes, decorators, async
- FastAPI or Flask experience
- PostgreSQL / SQL Server basics
- Understanding of REST APIs
- Azure fundamentals a plus (will provide study time)`,
    skills: ["python", "fastapi", "postgresql", "docker", "git", "aws", "rest-api-design"],
  },

  // Neoinfo
  {
    company: "neoinfo_mk",
    title: "Java Developer Intern",
    type: "internship",
    focus: "backend",
    level: "No experience",
    slots: 3,
    description: `Neoinfo is a Macedonian software house with 25 years of experience building enterprise and government information systems. We are looking for Java interns to join our backend team and work on geospatial and municipal management systems.

This internship is ideal for students who want solid, structured Java enterprise experience working on systems that are actually used by real government clients in the region.

**Technical environment:**
- Java 17, Spring Boot 3, Spring Security
- PostgreSQL with PostGIS extension for geospatial data
- Hibernate ORM, Flyway for migrations
- Apache Tomcat, REST APIs
- QGIS / GeoServer integration

**Responsibilities:**
- Develop REST API endpoints for municipal data management
- Write database queries and migrations
- Implement business logic for geo-data processing modules
- Write unit tests with JUnit 5

**Requirements:**
- Java programming knowledge (OOP fundamentals)
- SQL basics
- Bonus: Spring Boot or any web framework experience`,
    skills: ["java", "spring-boot", "postgresql", "git", "rest-api-design"],
  },
  {
    company: "neoinfo_mk",
    title: "Frontend Developer (Vue.js)",
    type: "part_time",
    focus: "frontend",
    level: "Junior",
    slots: 2,
    description: `Neoinfo is modernizing its legacy web UIs with Vue.js and needs a part-time frontend developer to help build interactive map-based interfaces for our municipal clients.

You will work directly with our senior architect to redesign the UI of an existing GIS platform used by several Macedonian municipalities. The work involves Vue.js 3, Leaflet.js for maps, and a Java Spring Boot backend.

**Your tasks:**
- Build Vue.js 3 components with Composition API
- Integrate Leaflet.js maps with geospatial data overlays
- Connect to existing REST APIs and render dynamic data
- Improve UI/UX of existing admin dashboards
- Maintain cross-browser compatibility (yes, including IE11 for government clients)

**Requirements:**
- Vue.js or React experience
- JavaScript ES6+
- CSS — layouts, responsiveness
- REST API integration basics
- Bonus: Any GIS or mapping tool experience`,
    skills: ["vuejs", "javascript", "css", "html", "rest-api-design", "git"],
  },
];

const STUDENTS = [
  {
    username: "stefan_react",
    email: "stefan.kostadinov@demo.linker.mk",
    password: "Student@001!",
    fullName: "Stefan Kostadinov",
    faculty: "FCSE",
    year: 4,
    degree: "Bachelor",
    level: "Junior",
    focus: "frontend",
    bio: "4th year CS student at FCSE passionate about building beautiful, accessible web UIs. I maintain a personal component library and contribute to open-source React projects in my spare time. Looking for a frontend internship where I can grow as a developer.",
    github: "https://github.com/stefankostadinov",
    linkedin: "https://linkedin.com/in/stefankostadinov",
    skills: ["react", "typescript", "nextjs", "tailwindcss", "javascript", "html", "css", "git", "figma", "react-query"],
  },
  {
    username: "ana_backend",
    email: "ana.petrovska@demo.linker.mk",
    password: "Student@002!",
    fullName: "Ana Petrovska",
    faculty: "FCSE",
    year: 3,
    degree: "Bachelor",
    level: "Junior",
    focus: "backend",
    bio: "Backend-focused CS student with a strong interest in distributed systems and API design. I have built several REST APIs with Node.js and Python, and I am currently exploring event-driven architectures for my thesis project.",
    github: "https://github.com/anapetrovska",
    linkedin: "https://linkedin.com/in/anapetrovska",
    skills: ["nodejs", "python", "postgresql", "redis", "docker", "git", "rest-api-design", "express", "fastapi", "typescript"],
  },
  {
    username: "ivan_fullstack",
    email: "ivan.dimitrovski@demo.linker.mk",
    password: "Student@003!",
    fullName: "Ivan Dimitrovski",
    faculty: "FEEIT",
    year: 4,
    degree: "Bachelor",
    level: "Junior",
    focus: "fullstack",
    bio: "Full-stack developer with hands-on experience building complete web apps. I enjoy the challenge of owning a feature end-to-end — from database schema to pixel-perfect UI. Active on GitHub with 3 completed projects.",
    github: "https://github.com/ivandimitrovski",
    linkedin: "https://linkedin.com/in/ivandimitrovski",
    skills: ["react", "nodejs", "typescript", "postgresql", "git", "docker", "nextjs", "tailwindcss", "prisma", "rest-api-design"],
  },
  {
    username: "marija_mobile",
    email: "marija.todorovska@demo.linker.mk",
    password: "Student@004!",
    fullName: "Marija Todorovska",
    faculty: "FCSE",
    year: 3,
    degree: "Bachelor",
    level: "No experience",
    focus: "mobile",
    bio: "3rd year student focused on mobile development. I built two apps with React Native (an exam scheduler and a local event finder) and I am exploring Flutter for cross-platform projects. Looking for my first mobile dev internship.",
    github: "https://github.com/marijatodorovska",
    linkedin: "https://linkedin.com/in/marijatodorovska",
    skills: ["react-native", "flutter", "javascript", "typescript", "firebase", "expo", "git", "figma"],
  },
  {
    username: "nikola_data",
    email: "nikola.ristov@demo.linker.mk",
    password: "Student@005!",
    fullName: "Nikola Ristov",
    faculty: "PMF",
    year: 4,
    degree: "Bachelor",
    level: "Junior",
    focus: "Data",
    bio: "Mathematics and CS student specializing in data science. My thesis is on graph neural networks for social network analysis. I have practical experience with pandas, scikit-learn, and PostgreSQL from a data cleaning project for a local NGO.",
    github: "https://github.com/nikolaristov",
    linkedin: "https://linkedin.com/in/nikolaristov",
    skills: ["python", "postgresql", "mongodb", "git", "rest-api-design", "fastapi"],
  },
  {
    username: "elena_devops",
    email: "elena.angelovska@demo.linker.mk",
    password: "Student@006!",
    fullName: "Elena Angelovska",
    faculty: "FEEIT",
    year: 4,
    degree: "Bachelor",
    level: "Junior",
    focus: "devops",
    bio: "Systems-focused engineer who loves automation, infrastructure, and making things reliable. I manage a personal homelab running Proxmox, Docker, and Kubernetes and I have an AWS Cloud Practitioner certification.",
    github: "https://github.com/elenaangelovska",
    linkedin: "https://linkedin.com/in/elenaangelovska",
    skills: ["linux", "docker", "kubernetes", "aws", "git", "cicd", "github-actions", "python", "nginx"],
  },
  {
    username: "aleksandar_java",
    email: "aleksandar.stojkov@demo.linker.mk",
    password: "Student@007!",
    fullName: "Aleksandar Stojkov",
    faculty: "FCSE",
    year: 3,
    degree: "Bachelor",
    level: "No experience",
    focus: "backend",
    bio: "Java enthusiast working through the Spring ecosystem. I have built a library management REST API with Spring Boot and JPA as a course project, and I am learning microservices patterns. Looking to apply my Java skills in a real environment.",
    github: "https://github.com/aleksandarstojkov",
    linkedin: "https://linkedin.com/in/aleksandarstojkov",
    skills: ["java", "spring-boot", "postgresql", "mysql", "git", "docker", "rest-api-design"],
  },
  {
    username: "petra_vue",
    email: "petra.markovska@demo.linker.mk",
    password: "Student@008!",
    fullName: "Petra Markovska",
    faculty: "FCSE",
    year: 2,
    degree: "Bachelor",
    level: "No experience",
    focus: "frontend",
    bio: "2nd year student who started programming in high school. I have built several personal projects with Vue.js and I am comfortable with Figma for basic prototyping. I want to level up my frontend skills in a professional environment.",
    github: "https://github.com/petramarkovska",
    linkedin: "https://linkedin.com/in/petramarkovska",
    skills: ["vuejs", "javascript", "html", "css", "sass", "git", "figma", "ui-ux-principles"],
  },
  {
    username: "bojan_dotnet",
    email: "bojan.vasilevski@demo.linker.mk",
    password: "Student@009!",
    fullName: "Bojan Vasilevski",
    faculty: "FCSE",
    year: 4,
    degree: "Bachelor",
    level: "Junior",
    focus: "backend",
    bio: "C# and .NET developer with a strong foundation in object-oriented design. I have built two ASP.NET Core APIs (one for a student project management tool, one for a small local business inventory system). Comfortable with Azure basics from personal experimentation.",
    github: "https://github.com/bojanvasilevski",
    linkedin: "https://linkedin.com/in/bojanvasilevski",
    skills: ["csharp", "aspnet", "postgresql", "mysql", "git", "docker", "rest-api-design"],
  },
  {
    username: "sara_ux",
    email: "sara.nikolovska@demo.linker.mk",
    password: "Student@010!",
    fullName: "Sara Nikolovska",
    faculty: "FCSE",
    year: 3,
    degree: "Bachelor",
    level: "No experience",
    focus: "frontend",
    bio: "Frontend developer with a strong eye for design. I study both CS and design thinking, and I bridge the gap between engineers and designers on group projects. Proficient in Figma, React, and accessibility best practices.",
    github: "https://github.com/saranikolovska",
    linkedin: "https://linkedin.com/in/saranikolovska",
    skills: ["react", "javascript", "typescript", "figma", "html", "css", "tailwindcss", "accessibility-wcag", "ui-ux-principles", "git"],
  },
];

// ─── Main Seed Logic ──────────────────────────────────────────────────────────

async function main() {
  console.log("=== Linker Demo Seed ===\n");

  // 1. Wipe everything
  console.log("Step 1: Wiping existing data...");
  await deleteAllAuthUsers();
  await clearPublicTables();
  console.log("✓ Data cleared\n");

  // 2. Admin whitelist
  console.log("Step 2: Adding admin whitelist entry...");
  await svc.from("admin_whitelist").insert({
    email: "alektalevski2602@gmail.com",
  });
  console.log("✓ alektalevski2602@gmail.com whitelisted\n");

  // 3. Admin user in auth + profile
  console.log("Step 3: Creating admin user...");
  const adminUser = await createUser(
    "alektalevski2602@gmail.com",
    "Admin@Linker2024!",
    "Aleksandar Talevski",
    "admin"
  );
  if (adminUser) {
    await svc.from("profiles").upsert({
      id: adminUser.id,
      username: "admin_alek",
      full_name: "Aleksandar Talevski",
      role: "admin",
    }, { onConflict: "id" });
    console.log("✓ Admin user created (alektalevski2602@gmail.com)\n");
  }

  // 4. Fetch all skill slugs we'll need
  console.log("Step 4: Loading skill IDs...");
  const skillMap = await ensureSkillTaxonomy();
  const requiredSkillSlugs = new Set([
    ...LISTINGS.flatMap((listing) => listing.skills),
    ...STUDENTS.flatMap((student) => student.skills),
  ]);
  const missingRequiredSkills = Array.from(requiredSkillSlugs).filter((slug) => !skillMap[slug]);
  if (missingRequiredSkills.length > 0) {
    console.warn(`  Missing skill slugs: ${missingRequiredSkills.join(", ")}`);
  }
  console.log(`✓ Loaded ${Object.keys(skillMap).length} skills\n`);

  // 5. Create companies
  console.log("Step 5: Creating companies...");
  const companyProfileMap = {}; // username → company_profile id

  for (const co of COMPANIES) {
    const user = await createUser(co.email, co.password, co.contactName, "company");
    if (!user) { console.warn(`  Skipping ${co.name}`); continue; }

    const { error: companyProfileError } = await svc.from("profiles").upsert({
      id: user.id,
      username: co.username,
      full_name: co.contactName,
      role: "company",
      website_url: co.website,
    }, { onConflict: "id" });

    if (companyProfileError) {
      console.error(`  Failed profile for ${co.name}: ${companyProfileError.message}`);
      continue;
    }

    const { data: cp, error: cpError } = await svc.from("company_profiles").insert({
      profile_id: user.id,
      company_name: co.name,
      company_email: co.email,
      company_website: co.website,
      company_description: co.description,
      industry: co.industry,
      size_range: co.size,
      location: co.location,
      logo_url: co.logo,
      approval_status: "approved",
      approved_at: new Date().toISOString(),
    }).select("id").single();

    if (!cp || cpError) {
      console.error(`  Failed company profile for ${co.name}: ${cpError?.message || "unknown error"}`);
      continue;
    }

    companyProfileMap[co.username] = cp.id;
    console.log(`  ✓ ${co.name}`);
  }
  console.log(`✓ ${Object.keys(companyProfileMap).length} companies created\n`);

  // 6. Create listings
  console.log("Step 6: Creating listings...");
  let listingCount = 0;

  for (const listing of LISTINGS) {
    const companyProfileId = companyProfileMap[listing.company];
    if (!companyProfileId) { console.warn(`  No company profile for ${listing.company}`); continue; }

    const normalizedFocus = normalizeFocusArea(listing.focus);
    const normalizedLevel = normalizeExperienceLevel(listing.level);

    if (!normalizedFocus || !normalizedLevel) {
      console.error(
        `  Invalid listing enum values for ${listing.title}: focus=${listing.focus}, level=${listing.level}`
      );
      continue;
    }

    const { data: newListing, error: listingError } = await svc.from("listings").insert({
      company_profile_id: companyProfileId,
      title: listing.title,
      description: listing.description,
      listing_type: listing.type,
      focus_area: normalizedFocus,
      experience_level: normalizedLevel,
      total_slots: listing.slots,
      slots_remaining: listing.slots,
      is_active: true,
      is_deleted: false,
    }).select("id").single();

    if (!newListing || listingError) {
      console.error(`  Failed listing ${listing.title}: ${listingError?.message || "unknown error"}`);
      continue;
    }

    const skillIds = listing.skills.map((s) => skillMap[s]).filter(Boolean);
    if (skillIds.length === 0) {
      console.warn(`  Listing ${listing.title} has no matched skills in taxonomy.`);
    } else {
      const { error: listingSkillsError } = await svc.from("listing_skills").insert(
        skillIds.map((skillId) => ({ listing_id: newListing.id, skill_id: skillId }))
      );
      if (listingSkillsError) {
        console.error(`  Failed listing skills for ${listing.title}: ${listingSkillsError.message}`);
      }
    }

    listingCount++;
    console.log(`  ✓ ${listing.title} (${listing.company})`);
  }
  console.log(`✓ ${listingCount} listings created\n`);

  // 7. Create students
  console.log("Step 7: Creating student users...");
  let studentCount = 0;

  for (const st of STUDENTS) {
    const user = await createUser(st.email, st.password, st.fullName, "student");
    if (!user) { console.warn(`  Skipping ${st.username}`); continue; }

    const normalizedFocus = normalizeFocusArea(st.focus);
    const normalizedLevel = normalizeExperienceLevel(st.level);
    const normalizedDegree = normalizeDegreeType(st.degree);

    if (!normalizedFocus || !normalizedLevel || !normalizedDegree) {
      console.error(
        `  Invalid student enum values for ${st.username}: degree=${st.degree}, level=${st.level}, focus=${st.focus}`
      );
      continue;
    }

    const { error: studentProfileError } = await svc.from("profiles").upsert({
      id: user.id,
      username: st.username,
      full_name: st.fullName,
      role: "student",
      bio: st.bio,
      github_url: st.github,
      linkedin_url: st.linkedin,
      is_verified_student: true,
    }, { onConflict: "id" });

    if (studentProfileError) {
      console.error(`  Failed profile for ${st.username}: ${studentProfileError.message}`);
      continue;
    }

    const { error: studentDetailsError } = await svc.from("student_profiles").insert({
      profile_id: user.id,
      faculty: st.faculty,
      year_of_study: st.year,
      degree_type: normalizedDegree,
      experience_level: normalizedLevel,
      focus_area: normalizedFocus,
      short_description: st.bio.substring(0, 200),
    });

    if (studentDetailsError) {
      console.error(`  Failed student profile for ${st.username}: ${studentDetailsError.message}`);
      continue;
    }

    const skillIds = st.skills.map((s) => skillMap[s]).filter(Boolean);
    if (skillIds.length > 0) {
      const { error: studentSkillsError } = await svc.from("student_skills").insert(
        skillIds.map((skillId) => ({ profile_id: user.id, skill_id: skillId }))
      );
      if (studentSkillsError) {
        console.error(`  Failed student skills for ${st.username}: ${studentSkillsError.message}`);
      }
    } else {
      console.warn(`  Student ${st.username} has no matched skills in taxonomy.`);
    }

    studentCount++;
    console.log(`  ✓ ${st.fullName} (${st.username})`);
  }
  console.log(`✓ ${studentCount} students created\n`);

  // 8. Write credentials file
  console.log("Step 8: Writing credentials file...");
  const lines = [
    "# Linker Demo Credentials",
    "# Generated: " + new Date().toISOString(),
    "",
    "## ADMIN",
    "Email:    alektalevski2602@gmail.com",
    "Password: Admin@Linker2024!",
    "Role:     admin",
    "Note:     Sign in with Google OAuth using this email. Admin panel at /admin",
    "",
    "## COMPANIES (10)",
    ...COMPANIES.map((co, i) =>
      `${i+1}. ${co.name}\n   Email:    ${co.email}\n   Password: ${co.password}\n   Username: ${co.username}`
    ),
    "",
    "## STUDENTS (10)",
    ...STUDENTS.map((st, i) =>
      `${i+1}. ${st.fullName}\n   Email:    ${st.email}\n   Password: ${st.password}\n   Username: ${st.username}\n   Focus:    ${st.focus} | ${st.level}\n   Skills:   ${st.skills.slice(0,5).join(", ")}...`
    ),
    "",
    "## NOTES",
    "- All students are pre-verified (is_verified_student = true)",
    "- All companies are pre-approved (approval_status = approved)",
    "- Each company has 2 active listings (20 total)",
    "- Admin access requires: sign in with Google + master password via /api/admin/auth",
    "- Master password: configured in local .env.local (not included in repository)",
  ];

  const filepath = "scripts/demo-credentials.txt";
  writeFileSync(filepath, lines.join("\n"), "utf8");
  console.log(`✓ Credentials saved to ${filepath}\n`);

  console.log("=== Seed complete ===");
  console.log(`  - 1 admin`);
  console.log(`  - ${Object.keys(companyProfileMap).length} companies`);
  console.log(`  - ${listingCount} listings`);
  console.log(`  - ${studentCount} students`);
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
