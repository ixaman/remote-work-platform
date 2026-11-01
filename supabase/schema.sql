-- Run once in a fresh Supabase project's SQL Editor as the project owner.
-- Everything is transactional: an error leaves the database unchanged.
begin;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name ~ '[^[:space:]]'),
  slug text not null unique check (slug ~ '[^[:space:]]'),
  description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null check (title ~ '[^[:space:]]'),
  company_source text not null check (company_source ~ '[^[:space:]]'),
  description text not null check (description ~ '[^[:space:]]'),
  location_eligibility text not null check (location_eligibility ~ '[^[:space:]]'),
  application_url text not null check (application_url ~ '^https?://[^[:space:]]+$'),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_status_created_at_idx on public.categories (status, created_at desc);
create index jobs_category_id_idx on public.jobs (category_id);
create index jobs_status_created_at_idx on public.jobs (status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

create trigger categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

-- Before launch, replace this UUID with Marissa's auth.users.id using
-- CREATE OR REPLACE FUNCTION public.is_admin(); keep the UUID only here.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid()) = 'bfd2f5f9-6a96-4b70-8b4a-a405b94c8412'::uuid;
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.categories enable row level security;
alter table public.jobs enable row level security;

-- Remove Supabase's default grants, including anon writes and operations
-- such as TRUNCATE that RLS does not protect. Restore only what is needed.
revoke all on table public.categories, public.jobs from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on table public.categories, public.jobs to anon, authenticated;
grant insert, update, delete on table public.categories, public.jobs to authenticated;

create policy categories_public_select on public.categories
for select to anon, authenticated
using (status = 'published');

create policy jobs_public_select on public.jobs
for select to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1 from public.categories as category
    where category.id = jobs.category_id and category.status = 'published'
  )
);

create policy categories_admin_select on public.categories
for select to authenticated
using ((select public.is_admin()));

create policy jobs_admin_select on public.jobs
for select to authenticated
using ((select public.is_admin()));

create policy categories_admin_insert on public.categories
for insert to authenticated
with check ((select public.is_admin()));

create policy jobs_admin_insert on public.jobs
for insert to authenticated
with check ((select public.is_admin()));

create policy categories_admin_update on public.categories
for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy jobs_admin_update on public.jobs
for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy categories_admin_delete on public.categories
for delete to authenticated
using ((select public.is_admin()));

create policy jobs_admin_delete on public.jobs
for delete to authenticated
using ((select public.is_admin()));

-- =====================================================================
-- SAMPLE SEED DATA (development only; remove this section before launch)
-- Exact published content from lib/fixtures.ts, plus draft visibility rows.
-- All jobs are fictional, and every application link is a placeholder.
-- The sample-empty category deliberately has no jobs.
-- =====================================================================

insert into public.categories (name, slug, description, status, sort_order)
values
  ('International Remote Jobs', 'international', 'Check eligible countries or states before applying. Confirm required time-zone overlap, right-to-work rules, and how the employer pays international workers.', 'published', 0),
  ('Non-Phone & Low-Phone Jobs', 'non-phone', 'Explore data entry, document processing, email/chat, claims review, and content review. “Truly no-phone” means no calls; “minimal-phone” may still require occasional calls.', 'published', 1),
  ('1099 / Contract Opportunities', 'contract', 'Independent contractors may have variable hours and must plan for taxes. Benefits may not be included, and equipment or internet costs may be yours.', 'published', 2),
  ('Side Hustles / Flexible Extra Income', 'flexible-income', 'Consider part-time gigs, project work, weekend work, and freelance tasks. Compare pay structure, time commitment, and any expenses first.', 'published', 3),
  ('Sample: More Remote Opportunities', 'sample-empty', 'Sample category for previewing the empty state. No jobs have been added here yet.', 'published', 4),
  ('Sample: Draft Category', 'sample-draft', 'Fake sample category for checking that drafts stay private.', 'draft', 5);

insert into public.jobs (
  category_id, title, company_source, description, location_eligibility,
  application_url, status, created_at
)
values
  (
    (select id from public.categories where slug = 'international'),
    'Sample: Remote Community Assistant', 'Fictional Fern Community (fake employer)',
    'Fake sample role supporting community questions. Illustrative full-time employment at $20/hour, Monday–Friday, 12–8 pm UTC; occasional calls. Own computer and reliable internet required.',
    'Sample eligibility: Canada and United Kingdom; UTC overlap.',
    'https://example.com/apply', 'published', '2026-11-01T06:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'international'),
    'Sample: International Support Coordinator', 'Imaginary Harbor Team (fake employer)',
    'Fake sample role coordinating support requests. Illustrative part-time employment at €18/hour, weekdays, 9 am–1 pm UTC; phone-based. Employer equipment and home internet required.',
    'Sample eligibility: Ireland; local right to work required.',
    'https://example.com/apply', 'published', '2026-11-01T05:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'non-phone'),
    'Sample: Email Support Assistant', 'Pretend Paper Studio (fake employer)',
    'Fake sample role answering email questions with no calls. Illustrative full-time employment at $19/hour, weekdays, 9 am–5 pm ET. Employer computer and reliable home internet required.',
    'Sample eligibility: United States; Eastern time zone.',
    'https://example.com/apply', 'published', '2026-11-01T04:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'non-phone'),
    'Sample: Document Processing Clerk', 'Fictional Meadow Records (fake employer)',
    'Fake sample role organizing documents with no calls. Illustrative part-time employment at $17/hour, weekdays, 10 am–2 pm CT. Employer equipment and home internet required.',
    'Sample eligibility: United States; Texas only.',
    'https://example.com/apply', 'published', '2026-11-01T03:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'contract'),
    'Sample: Contract Content Reviewer', 'Imaginary Ink Projects (fake employer)',
    'Fake sample role reviewing text. Illustrative 1099 contract at $25/hour for 10 hours/week with flexible timing; occasional project calls. Own computer and internet required; taxes and expenses are the contractor’s responsibility.',
    'Sample eligibility: United States; independent contractors.',
    'https://example.com/apply', 'published', '2026-11-01T02:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'flexible-income'),
    'Sample: Weekend Research Helper', 'Pretend Pine Research (fake employer)',
    'Fake sample role collecting public research. Illustrative freelance project at £80/project, around four weekend hours; no calls. Own computer and internet required; project availability varies.',
    'Sample eligibility: United Kingdom; local work eligibility required.',
    'https://example.com/apply', 'published', '2026-11-01T01:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'international'),
    'Sample: Remote Scheduling Assistant', 'Fictional Sample Team (fake employer)',
    'Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.',
    'Sample eligibility: confirm country and time-zone requirements.',
    'https://example.com/apply', 'published', '2026-10-31T06:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'non-phone'),
    'Sample: Community Email Coordinator', 'Fictional Sample Team (fake employer)',
    'Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.',
    'Sample eligibility: confirm country and time-zone requirements.',
    'https://example.com/apply', 'published', '2026-10-30T06:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'contract'),
    'Sample: Contract Proofreader', 'Fictional Sample Team (fake employer)',
    'Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.',
    'Sample eligibility: confirm country and time-zone requirements.',
    'https://example.com/apply', 'published', '2026-10-29T06:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'flexible-income'),
    'Sample: Weekend Data Assistant', 'Fictional Sample Team (fake employer)',
    'Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.',
    'Sample eligibility: confirm country and time-zone requirements.',
    'https://example.com/apply', 'published', '2026-10-28T06:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'international'),
    'Sample: International Research Assistant', 'Fictional Sample Team (fake employer)',
    'Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.',
    'Sample eligibility: confirm country and time-zone requirements.',
    'https://example.com/apply', 'published', '2026-10-27T06:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'non-phone'),
    'Sample: Records Review Assistant', 'Fictional Sample Team (fake employer)',
    'Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.',
    'Sample eligibility: confirm country and time-zone requirements.',
    'https://example.com/apply', 'published', '2026-10-26T06:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'contract'),
    'Sample: Contract Project Assistant', 'Fictional Sample Team (fake employer)',
    'Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.',
    'Sample eligibility: confirm country and time-zone requirements.',
    'https://example.com/apply', 'published', '2026-10-25T06:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'flexible-income'),
    'Sample: Flexible Content Assistant', 'Fictional Sample Team (fake employer)',
    'Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.',
    'Sample eligibility: confirm country and time-zone requirements.',
    'https://example.com/apply', 'published', '2026-10-24T06:00:00Z'
  ),
  (
    (select id from public.categories where slug = 'international'),
    'Sample: Draft Remote Assistant', 'Fictional Sample Team (fake employer)',
    'Fake draft role for testing visibility. This is not an active opening.',
    'Sample eligibility: confirm country and time-zone requirements.',
    'https://example.com/apply', 'draft', '2026-11-01T07:00:00Z'
  );

-- END SAMPLE SEED DATA
commit;
