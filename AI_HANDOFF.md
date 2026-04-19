# AI Handoff Summary (Linker)

Last updated: 2026-04-19

## 1) What this project is
Linker is a role-based matching platform between students and companies.

- Student flow: sign up -> verify UKIM status -> complete profile -> discover/apply to listings -> receive/respond to acknowledgments.
- Company flow: sign up -> wait for admin approval -> create listings -> discover anonymous candidates -> send acknowledgments -> review applications.
- Admin flow: authenticate with master password + Google token + whitelist -> approve/reject companies -> view stats.

## 2) Stack and structure
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Auth/DB/Storage: Supabase
- i18n: next-intl (`en`, `mk`)
- Styling/UI: Tailwind + custom UI components
- Route groups:
  - `app/[locale]/(public)` public/auth/legal
  - `app/[locale]/(app)` authenticated app area
  - `app/[locale]/admin` admin area
  - `app/api/**` backend APIs

## 3) Reality check: backend vs frontend
Backend APIs and DB rules are mostly implemented and enforce core business logic.
A large part of UI pages still use mock data/placeholders.

### Mostly real/wired
- `app/api/**` (auth, listings, applications, acknowledgments, profile, subscriptions, notifications, admin)
- Auth session provider (`providers/auth-provider.tsx`)
- Sign in/up pages call auth APIs
- Verification page starts Azure verification flow
- Profile edit page posts to `/api/profile/me`

### Still mock/prototype-heavy UI
- Dashboard, listings browse/detail, notifications, acknowledgments
- Company discover/listings/listing detail/new listing
- Admin dashboard/students/companies pages
- Public profile view page uses mock profile structure

## 4) Critical business rules (enforced mostly in APIs + SQL)
- Only verified students can apply, set skills, subscribe.
- Only approved companies can create listings, discover students, send acknowledgments.
- Company listing limit: max 3 active listings.
- Listing slots are consumed on acknowledgment insert.
- Declined acknowledgment returns a slot.
- Accepted acknowledgment reveals student email.
- Student discovery excludes candidates already acknowledged by that company.
- Student discoverability requires verified student and profile completeness >= 40.
- Notifications are trigger-driven at DB level.

## 5) Auth and access model
- Middleware protects app/admin paths and handles locale routing.
- API-level guards in `lib/api/auth-guard.ts` are the source of truth for authorization.
- OAuth state context is handled via short-lived first-party cookies (`linker_oauth_role`, `linker_verify_user_id`).

Important note:
- OAuth callback/session continuity relies on same-origin callback URLs built from `request.nextUrl.origin`.

## 6) DB schema and triggers you must know
Migrations in `supabase/migrations/001-010` define core behavior.

Key tables:
- `profiles`, `student_profiles`, `company_profiles`
- `skills`, `student_skills`, `listings`, `listing_skills`
- `applications`, `acknowledgments`, `company_subscriptions`, `notifications`, `admin_whitelist`

Key DB functions/triggers:
- profile auto-create on auth user insert
- profile completeness calculation + recalculation triggers
- listing slot init + active listing cap + soft delete
- acknowledgment slot decrement/status transitions
- notification triggers for application/ack/company status/subscription events
- anonymous student card + skill match RPCs

## 7) Environment variables used in code
Required/important:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_MASTER_PASSWORD`
- `GOOGLE_CLIENT_ID` (admin token audience check)
- `ADMIN_WHITELISTED_EMAILS` (optional CSV allowlist)

## 8) Known gaps / high-value next tasks
1. Replace mock data in app pages with real API calls (`/api/listings`, `/api/notifications`, `/api/acknowledgments`, `/api/discover/students`, admin APIs).
2. Implement `app/api/profile/[username]/route.ts` (currently returns 501).
3. Align UI enum values with backend enum values everywhere.
4. Add end-to-end tests for full student/company/admin journeys.
5. Add persistent/distributed rate limiting (current in-memory limiter is process-local).

## 9) Important implementation constraints
- Next.js 14 route handlers should type dynamic context params as synchronous objects (not Promise-wrapped params).
- Do not move OAuth callback URL construction to static app URL env var unless same-origin/cookie behavior is fully preserved.

## 10) Quick orientation for a new AI session
If you are a new AI agent entering this repo:
1. Start with this file.
2. Then read `middleware.ts`, `lib/api/auth-guard.ts`, and `supabase/migrations/`.
3. Treat `app/api/**` and SQL migrations as behavioral source of truth.
4. Treat many `app/[locale]/**/page.tsx` files as UI prototypes until verified otherwise.
