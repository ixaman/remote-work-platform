# Remote Work Platform: PLAN

Planning baseline: 1 November 2026. This document proposes future work; it does not authorize installations, account setup, deployment, purchases, or contacting anyone.

## 1. Current folder and design findings

### What exists
- Top-level inspection found SPEC.md, AGENTS.md, .gitignore, and .git/. No application, package.json, lockfile, PLAN.md, or DECISIONS.md existed before this task. No recursive repository scan was performed.
- Node is installed: v22.18.0. npm is installed: 10.9.3. Choose and pin a supported Next.js version and verify its Node compatibility when dependency installation is approved.
- Git was initialized on main and the initial three files were pushed to git@github.com:ixaman/remote-work-platform.git in the preceding task. This plan does not change or push Git history.

### What Canva shows
Reference: [published preview](https://canva.link/99y74i9slpokyti), titled “Remote-work community website.” The preview loaded in the browser, including accessible content inside a Canva Code embed. The [editable link](https://www.canva.com/design/DAHZmR23jnI/KLb7atDdwxOA0xUWh9-Euw/edit) presents a sign-up/sign-in gate; editing details were not accessible.

The rendered website is a long page with anchor navigation, rather than six confirmed separate routes:

| Area | Observed content and controls |
| --- | --- |
| Header | Text brand “Real Work From Home Jobs / Advice, Tips & Fresh Leads”; Home, Job Categories, Job Listings, Resources, Success Stories, Newsletter links; Menu toggle. |
| Home / hero | “A CLEARER PATH TO REMOTE WORK”; “Find Real Work From Home Opportunities.”; community introduction; Browse Job Categories and Join Job Alerts buttons; “Free resources. Clear requirements. No invented openings.”; illustrated computer graphic. |
| Categories | “Find the guidance that fits.”; All guidance, International, Non-phone, 1099 / Contract, Flexible income filters; four guidance cards; “View WFH jobs list” and “View guidance” links. The copy explicitly calls these informational guides, not live results. |
| Role shortcuts | Data Entry, Customer Service, Healthcare, Technical Support, Administrative, Email & Chat chips. Copy says these highlight guidance and do not search active openings. |
| Listings | “How to read a legitimate lead” verification checklist and quote; a “Job listing template” marked “Template only — no active opening shown”; Copy template button. No real job openings or working Apply buttons were verified. |
| Resources | “Tools for the search, not just the scroll.”; accordions for Resume guidance, Interview preparation, Job-search tips, Scam-checking checklist, International work eligibility guidance. Resume guidance is initially expanded. |
| Success Stories | “A place for real member stories.”; two explicitly labelled testimonial placeholders; instruction to publish only with member permission. |
| Newsletter | “Job alerts are coming.”; explicit statement that email signup is unavailable; Explore job guidance link. No functioning subscription form. |
| Footer | Brand, lead-verification/no-guarantee disclaimer, quote, and the six navigation quick links. |

The four main guidance cards are International Remote Jobs; Non-Phone & Low-Phone Jobs; 1099 / Contract Opportunities; Side Hustles / Flexible Extra Income. These differ from the six role-area chips; do not silently turn both into database categories or add complex filters.

Visual observations: pale mint hero/backgrounds, off-white header, dark teal text and primary pill button, outlined secondary pill button, bold serif hero heading, sans-serif body/navigation, generous spacing, rounded illustration panel. Exact font names, color values, spacing measurements, assets and breakpoint rules remain unverified. The narrow preview showed crowded/wrapped branding and navigation with a partly clipped Menu control; that is a responsive issue to clarify, not an approved layout specification.

### Unclear or unfinished
- Canva's viewer reports five pages. The first embedded site was readable; page 2 initially retained the same content, and pages 3–5 rendered dark/empty in this session. Do not interpret these as four additional confirmed website pages. Obtain a reliable export or walkthrough before claiming the full design is covered.
- The preview emphasizes guidance and placeholders, whereas SPEC.md requires actual published jobs and external application links. Confirm how real listings should replace or accompany the template without inventing a section.
- Newsletter functionality conflicts with the v1 exclusion of email notifications. Preserve the observed inactive message if approved; do not build signup, subscriber storage or email delivery.
- Resources and stories are present in the design, but their editing workflow is absent from SPEC.md. Confirm whether these stay as supplied static content or whether additional admin editing is required. Do not add CMS tables until scope is agreed.
- The listing template includes pay/rate, schedule/time zone, employment type, phone and equipment/internet requirements, which are not separate fields in SPEC.md. Initially these can live in the description; structured fields need confirmation.
- Link destinations, expanded accordion contents, filter behavior, illustration rights, final copy, desktop/tablet/mobile layouts and any additional designs remain to be confirmed. A later Figma file becomes the visual source of truth.

## 2. Pages and components needed

Proposed minimal route structure, subject to the design questions above:
- `/`: public homepage with the verified design sections and published categories/jobs. Use anchor navigation to the observed section IDs. Category browsing can update the listing area on this page; no search or advanced filters.
- `/login`: private admin sign-in entry point; no public registration.
- `/admin`: redirect to the jobs manager or a simple management landing screen.
- `/admin/jobs`, `/admin/jobs/new`, `/admin/jobs/[id]/edit`.
- `/admin/categories`, `/admin/categories/new`, `/admin/categories/[id]/edit`.
- Auth callback/recovery handling only as needed by the selected sign-in method. No public job-detail or category-detail routes unless the confirmed design needs them.

Public components: SiteHeader, AnchorNavigation, MobileMenu, Hero, CategoryGrid, CategoryCard, simple CategorySelector, JobList, JobCard with external ApplyLink, Footer, and accessible empty/loading/error states. Preserve the observed guidance chips, lead checklist, template/copy control, ResourceAccordion, story placeholders and inactive alerts section only according to the agreed scope; do not invent content or activate excluded features.

Admin components: protected layout/navigation, SignInForm, SignOutButton, JobsTable, JobForm, CategoriesTable, CategoryForm, PublishToggle, ImageUpload, inline validation and delete confirmation. Avoid an unnecessary UI framework. Use semantic HTML, visible focus states, labelled forms, keyboard navigation, adequate contrast and reduced-motion support.

## 3. Database schema and RLS approach

Use Supabase Postgres/Auth/Storage directly from Next.js. No Express or Render. Server-side validation belongs in server actions or route handlers when needed. Use the public/publishable key with the visitor's or admin's session; no service-role key is needed in application code.

### Tables

| Table | Proposed columns and constraints |
| --- | --- |
| `categories` | `id uuid primary key`, `name text not null`, `slug text unique not null`, `description text`, `status text not null default 'draft' check (status in ('draft','published'))`, `sort_order integer not null default 0`, `created_at timestamptz`, `updated_at timestamptz`. |
| `jobs` | `id uuid primary key`, `category_id uuid not null references categories(id) on delete restrict`, `title text not null`, `company_source text not null`, `description text not null`, `location_eligibility text not null`, `application_url text not null`, nullable `image_path text` and `image_alt text`, `status text not null default 'draft' check (status in ('draft','published'))`, `created_at timestamptz`, `updated_at timestamptz`. |

One category per job is the minimal assumption; confirm before implementation. Index the category foreign key and public listing predicates/order. Validate required lengths and HTTP(S) application URLs on the server; reject executable URL schemes. Render descriptions as plain text unless a later approved format is safely handled. Block category deletion while it has jobs, with a clear reassignment/delete instruction. Maintain updated_at consistently.

### Only Marissa can write
- Provision Marissa's one Supabase Auth user through the project owner, verify her identity/email, and obtain her immutable `auth.users.id` UUID. Disable public signup. There is no registration, role assignment or admin-management UI.
- Put that exact UUID in each admin policy: authenticated role AND `(select auth.uid()) = '<Marissa UUID>'::uuid`. Until the real UUID is configured, allow no admin writes. A UUID is an authorization identifier, not a secret; an attacker cannot obtain her signed session by knowing it.
- Use the same identity check in server-side route/action authorization. Never infer admin status merely from being signed in, from a submitted email, client-side flags, or user-editable metadata. Email changes do not transfer privileges; account replacement requires an owner-controlled policy migration.
- Enable RLS on every application table before exposing it. Grant only necessary operations; do not leave broad default permissive policies.
- Public SELECT for anon and ordinary authenticated users: categories require `status = 'published'`; jobs require their own published status AND a published parent category. Draft categories hide their jobs too.
- Separate admin SELECT policy permits Marissa to see drafts. INSERT requires her UUID in WITH CHECK; UPDATE requires it in both USING and WITH CHECK; DELETE requires it in USING. Ordinary signed-in users gain no write permissions.
- RLS remains the enforcement boundary even when API calls bypass the admin UI. Test anon, a second authenticated test user and Marissa directly against the API, including guessed row IDs, draft reads, category changes and deletes.

This follows [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security). No extra admin table or user-controlled role claims are needed for a single administrator.

### Optional images
Use one private `job-images` bucket. Restrict uploads to Marissa, a job-specific path, approved raster MIME types and a small application limit (proposed 2 MB). Store object paths, not expiring URLs, in jobs. Apply RLS policies to `storage.objects`: Marissa alone can insert/update/delete and inspect drafts; anonymous/ordinary users can read only objects referenced by a published job in a published category. Do not make the bucket public, since that would expose draft images by URL. Fetch through authorized Storage access with the publishable key; avoid long-lived public signed links or caches that outlive unpublishing. Keep cleanup and replacement explicit so draft uploads are manageable and deleted jobs do not accumulate unused files. [Storage access-control reference](https://supabase.com/docs/guides/storage/security/access-control).

## 4. Admin dashboard structure

- Sign-in: email/password is the simplest proposal; select the final method with Marissa. Signed-out dashboard requests redirect to login; a signed-in account with the wrong UUID is denied. Verify the session server-side on protected pages and on every mutation; include sign-out and safe expiry handling.
- Jobs screen: title, category, company/source, draft/published status, edit and delete actions, Add job button. Form contains exactly the agreed fields, optional image/alt text, application URL, and publish toggle. Validate before saving and make unsaved changes/errors clear.
- Categories screen: name, description, order, status, edit/delete and Add category. Explain that hiding a category hides its jobs and that deletion is blocked while jobs reference it.
- A successful save must update public visibility promptly; avoid serving admin data from shared caches. Publish/unpublish should invalidate relevant public content. Never expose draft records in public HTML or payloads.
- No analytics, subscriber list, messaging, extra accounts, employer workflow or multiple-admin controls.
- If “all content” includes hero/resources/stories/footer, revise this plan with explicitly approved fields and editing screens before implementing those additions.

## 5. Seven small implementation slices

Dependency installation and project creation require explicit approval under AGENTS.md. Deployment requires separate approval. All slices below are future work; only PLAN.md is created now. Do not use unverified/fabricated listings or testimonials as public content.

1. **Runnable foundation.** After dependency approval, create the minimal Next.js App Router/TypeScript project, scripts and environment handling. Preserve existing documentation and ignored local secrets. End: `npm run dev` serves a minimal page; `npm run build` passes. Confirm the agreed Node version works.
2. **Design shell.** Once the design/scope questions are resolved, implement the header, anchor/mobile navigation, hero and footer with approved assets/copy. End: run locally and compare against the confirmed desktop/tablet/mobile reference; test keyboard focus and menu behavior.
3. **Public layout and browsing with local fixtures.** Add the approved category and listing layout, external Apply links, minimal category selection and agreed static guidance sections. Keep fixtures development-only and clearly labelled. End: locally test category changes, no-results state, link targets, accordions/copy control where retained, and narrow-screen layout.
4. **Secured database and real public reads.** After the project owner provides an approved Supabase development project, add schema/policies and replace fixtures with published data. Provision the one admin UUID and a non-admin test identity. End: run the site plus direct API checks proving draft/hidden-category protection and denied anon/non-admin writes; run the build. Supabase dashboard or approved SQL tooling can apply migrations without adding a CLI dependency.
5. **Private sign-in and category management.** Add session validation, protected dashboard and category forms/actions. End: run locally; test signed-out redirects, wrong-account denial, category create/edit/publish/unpublish/delete, validation and restricted deletion with referenced jobs.
6. **Job management and optional images.** Add job forms, external URL editing, publishing/deletion and the private image workflow. End: run locally; create a draft, upload/replace an image, publish, apply externally, unpublish and delete; verify public/API/storage access changes and non-admin upload denial.
7. **Acceptance and production-readiness checks.** Complete visual comparison, accessibility checks, session expiry, failed saves, missing images, empty states and the three-identity RLS matrix. End: `npm run build` and `npm run start` succeed locally; Marissa can rehearse managing real content. Produce a reviewed launch checklist including quotas, recovery and account ownership. Deploy only after explicit approval and resolution of Vercel Hobby eligibility; then verify the approved deployment. No purchase or automatic plan upgrade.

## 6. Questions and missing information for Marissa

1. Which Canva page/version is final? Can she provide exports/screenshots for all intended desktop/tablet/mobile states, font names, color values, illustration/logo files and permission to use them? Are viewer pages 3–5 unfinished or not loading? Is Figma forthcoming?
2. Should v1 keep Resources, Success Stories, the listing template and inactive Newsletter section exactly as shown? Where should actual job cards and Apply buttons appear? Obtain an approved visual for this change rather than inventing one.
3. Which are the real job categories: the four guidance types, the six role areas, or another agreed list? Can a job belong to more than one? Should guidance filters remain separate from job browsing?
4. Supply final copy, resource content, approved testimonial quotes/consent if any, initial verified jobs, images/alt text, eligibility descriptions and direct application URLs. Who checks stale/expired links, and should stale jobs be unpublished manually?
5. Are pay, schedule, employment type, phone and equipment requirements structured fields or description content? Confirm category ordering and handling of empty categories.
6. Does “manages all content herself” include hero/navigation/resources/stories/footer, or just jobs/categories? Additional content editing needs an explicit scope decision.
7. What email belongs to Marissa's admin account? Who owns the Supabase and Vercel projects, provisions her account and confirms its UUID? Agree on password recovery and secure handoff without putting credentials in Git or chat.
8. Is the website strictly a personal, non-commercial portfolio? Vercel Hobby eligibility is a launch gate; a business/community job service may conflict even without payments. If ineligible, obtain approval for a revised hosting/budget decision; do not purchase or silently change the stack.
9. Confirm acceptance of free-tier inactivity pauses, limited recovery, quota-related downtime and a manual backup/export process. Confirm the intended audience and estimated job/image volume.

## 7. Free-tier limits and risks

Checked against official sources on 1 November 2026; recheck live plan terms and project dashboards before production. Quotas are not promises of a particular visitor capacity.

### Vercel Hobby
- Restricted to personal, non-commercial use. Resolve eligibility before connecting this site for production. [Pricing](https://vercel.com/pricing).
- Published Hobby allowances include 4 active CPU hours, 360 GB-hours provisioned memory and 1 million function invocations; request, transfer and image-optimization quotas also apply. The Hobby page lists 1 million Edge Requests, 1,000 image source optimizations and 6,000 build minutes. Avoid repeated rendering/image work. When a limit is exceeded, features may remain unavailable until the allowance resets, often after 30 days. [Hobby plan](https://vercel.com/docs/plans/hobby).
- Operational limits include one concurrent build, 100 deployments/day and 45 minutes per build. Free operation still needs usage review and bounded workloads. No upgrade or deployment is authorized by this plan. [Platform limits](https://vercel.com/docs/limits).

### Supabase Free
- Two active free projects, 500 MB database per project, 1 GB file storage, 50,000 monthly active users, 5 GB egress and a separate 5 GB cached egress allowance. Shared CPU/500 MB RAM means limited capacity; unlimited API request count does not mean unlimited compute or bandwidth. [Pricing](https://supabase.com/pricing), [billing guide](https://supabase.com/docs/guides/platform/billing-on-supabase).
- Free projects can pause after a week of inactivity, interrupting listings and admin access until restored. Automatic backups and point-in-time recovery are not included; arrange manual database and image exports outside the repository. Free support is community-based. [Pricing](https://supabase.com/pricing).
- Storage image transformations are unavailable on Free. Limit/compress uploads and avoid fetching more data/images than the page needs; images can exhaust storage and egress before job text does. [Billing guide](https://supabase.com/docs/guides/platform/billing-on-supabase).
- Default Auth email delivery is for testing, restricted to project-team addresses and currently limited to two messages/hour; production recovery/invite delivery may need custom SMTP. Confirm a suitable approved arrangement before relying on email flows; do not add a mail provider or cost silently. [Auth SMTP guidance](https://supabase.com/docs/guides/auth/auth-smtp).

Keep usage checks manual for this MVP (no new analytics or notification features). If free allowances or eligibility do not fit, pause the affected launch decision and request an explicit scope/hosting/budget decision. Never expose a Supabase secret/service-role key, commit .env.local, enable public writes, or start paid trials to bypass these constraints.
