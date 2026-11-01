# What looks good

Admin entrypoints enforce authorization independently of the proxy. The SQL protects drafts and restricts writes to the admin. No secret credentials were detected in working files or available history. Redirect checks passed; user content is escaped, errors are generic, and external links have protective rel attributes. `npm audit` found zero vulnerabilities, including high/critical.

## High

None identified.

## Medium

None identified.

## Low

1. **Incomplete environment ignore coverage — `.gitignore:3–4`.** `.env.production` and `.env.development` are not ignored, allowing accidental future credential commits; no current leak found. **Suggested fix:** ignore `.env*`, explicitly allowing the blank `.env.example`.
2. **Apply URLs lack rendering validation — `app/job-card.tsx:15`; `app/jobs/[id]/page.tsx:24`.** Stored URLs go directly into `href`. Server validation and SQL's HTTP(S) constraint reduce risk; this is a missing independent safeguard, not demonstrated XSS. **Suggested fix:** re-parse and allow only HTTP(S) immediately before rendering each Apply link.
3. **Security headers absent — `next.config.ts:3–5`.** No X-Frame-Options/frame-ancestors, X-Content-Type-Options, or Referrer-Policy is configured. Browser framing, MIME and referrer protections depend on defaults/hosting. **Suggested fix:** configure framing restrictions, `nosniff`, and an explicit referrer policy; verify deployed responses.
4. **Database validation weaker than forms — `supabase/schema.sql:7–11,19–24`.** Direct authorized API writes bypass form length, slug-format and sort-range rules; URL validation is only a prefix/whitespace regex. **Suggested fix:** mirror relevant validation constraints in SQL.
5. **Unbounded public reads — `app/page.tsx:11–12`; `lib/categories.ts:43–62`.** Uncached anonymous requests can fetch every category/job, increasing database and bandwidth consumption as content grows. **Suggested fix:** bound homepage queries and paginate category listings.

## Remediation status

- **Fixed — finding 1:** `.env*` is ignored with `.env.example` explicitly allowed.
- **Fixed — finding 2:** Apply links are validated when rendered; only HTTP(S) URLs without embedded credentials are allowed. Invalid URLs hide Apply buttons and show plain-text unavailability on job pages.
- **Fixed — finding 3:** All routes configure `nosniff`, strict-origin referrers, denied framing, and disabled camera/microphone/geolocation permissions. No Content-Security-Policy added.
- **Deferred — findings 4 and 5:** Database validation and public query limits remain unchanged.

## Review coverage and evidence

Reviewed 1 November 2026 at `6b8ff58`: project source/configuration, local environment files, all 22 commits available through Git refs/reflogs (non-shallow repository), and `npm audit`. Live Supabase policies/Auth settings, account ownership, and deployed response headers were not verified. No code, schema, or configuration changed.

- **Admin gating:** every entry below calls `requireAdmin()` as its first operation. None relies solely on the proxy. `lib/auth.ts:8–10` uses `auth.getUser()` and database `is_admin()`; no `getSession()` calls exist in application code. Admin database operations use the signed-in client's publishable key.
- **Complete page/layout inventory** (locations identify guard calls):
  - `app/admin/layout.tsx:11`; `app/admin/page.tsx:7`.
  - `app/admin/categories/page.tsx:13`; `app/admin/categories/new/page.tsx:9`; `app/admin/categories/[id]/edit/page.tsx:9`; `app/admin/categories/[id]/delete/page.tsx:12`; `app/admin/categories/not-found.tsx:5`.
  - `app/admin/jobs/page.tsx:17`; `app/admin/jobs/new/page.tsx:10`; `app/admin/jobs/[id]/edit/page.tsx:9`; `app/admin/jobs/[id]/delete/page.tsx:11`; `app/admin/jobs/not-found.tsx:7`.
- **Complete admin action inventory:** `app/admin/actions.ts:7` (`signOut`); `app/admin/categories/actions.ts:33,43,57,72` (`createCategory`, `updateCategory`, `setCategoryStatus`, `deleteCategory`); `app/admin/jobs/actions.ts:35,47,63,80` (`createJob`, `updateJob`, `setJobStatus`, `deleteJob`). No route handlers exist. Login's `signIn` intentionally authenticates before `requireAdmin()` (`app/login/actions.ts:14–16`); requiring admin first would prevent login.
- **Secrets:** no service-role, `sb_secret`, other secret credential, or legacy anon JWT detected in working files or history. Sensitive keyword matches were documentation only. Local `.env.local` contains only public configuration and is ignored. No populated environment file appeared in history; the blank `.env.example` template was committed. The only `NEXT_PUBLIC_` variables used are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Database:** both tables have RLS (`supabase/schema.sql:70–71`); anon lacks write grants (`:75–78`); all six write policies require `is_admin()` (`:102–126`). Public policies hide draft categories, draft jobs, and jobs with draft parents (`:80–92`). No authorization-policy gap found in the SQL.
- **Inputs/output:** admin mutations trim and validate submitted fields, UUIDs, statuses and confirmations. Job saves validate HTTP(S) URLs (`app/admin/jobs/validation.ts:18–38`). Login trims email, preserving password whitespace intentionally; sign-out has no input. No `dangerouslySetInnerHTML` usage exists; content uses escaped React text. User-facing errors are fixed messages, with database details logged server-side.
- **Redirects/links:** `lib/auth.ts:18–24` restricts `next` to normalized same-origin admin paths; 16 redirect cases passed. All external links use `rel="noopener noreferrer"`. Admin/login are noindex (`app/admin/layout.tsx:8`, `app/login/page.tsx:9`). `npm audit` returned zero vulnerabilities, including zero high/critical.
