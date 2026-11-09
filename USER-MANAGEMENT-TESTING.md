# User management verification

## Setup (project owner, manually)

1. Run `supabase/migrations/002_admins.sql` in the Supabase SQL Editor after the existing schema. It seeds Asad's existing Auth account and changes authorization to the admins table. The migration was not executed during implementation.
2. Set the server secret locally using the empty variable documented in `.env.example`. Keep the populated environment file ignored. No secret is required for building or testing signed-out redirects. Do not change the signup setting.
3. Run `npm run build` then `npm run start`. The existing Google Fonts build needs network access.

## Credential-free checks

- `npm run build` and `npm run typecheck` passed.
- `node --experimental-vm-modules --experimental-strip-types tests/admin-users.test.mjs` passed all 10 tests. These use mocks for Auth/database operations; they do not connect to Supabase. Coverage includes authorization before inputs, fixed roles, duplicate emails, rollback and failed cleanup, protected accounts, password validation, deletion confirmation, and generic API errors.
- Production HTTP requests without cookies returned `307` with `Location: /login` for `/admin/users`, `/admin/users/new`, and both password/removal routes using a syntactically valid UUID.
- Client assets in `.next/static` contained neither the server-secret variable identifier nor the secret-value prefix. Repository scans found only the intended identifier in server source, the empty environment template, and existing security documentation; no populated secrets were found. The privileged client is imported only by `app/admin/users/actions.ts`. No populated environment files are tracked.
- The live migration, authenticated UI, real Auth mutations, and live RLS require the manual setup above and were not verified against a configured account.

## Authenticated acceptance checks

1. Sign in as Asad. Check that Users appears in the top bar and shows Asad as the protected super admin, without password/removal links.
2. Add an admin using a mixed-case email. Verify lowercase storage, the role `admin`, and `created_by` equal to Asad's UUID. Check field errors for invalid names/emails, passwords outside 10–72 characters, and a password equal to the email. Password fields must be blank after errors.
3. Generate a password; check show/hide, save it privately, then create the admin. A duplicate email must show a friendly error. Check the table on desktop and as cards on mobile.
4. In a separate private browser, sign in as that admin. Verify full create/edit/publish/delete access to jobs and categories, no Users link, and server redirects from every `/admin/users` page to `/admin`. Forged user-action requests must also be denied; the mock tests cover all exported actions.
5. As Asad, set a new password for the admin, then check a fresh login with it. Visit Remove, cancel once, then confirm. Verify the Auth user and admins row disappear and a fresh login is denied. Forged requests targeting Asad or the current user must fail.
6. Check RLS with real signed-in sessions: admins may select only their own admins row; Asad may select all rows; neither session may directly insert/update/delete admins. Anonymous reads and writes must fail. Existing public published jobs/categories must remain readable and drafts hidden.

Files in this change: `.env.example`, `AGENTS.md`, `DECISIONS.md`, `USER-MANAGEMENT-TESTING.md`, `app/admin/layout.tsx`, `lib/auth.ts`, `lib/supabase/admin.ts`, `supabase/migrations/002_admins.sql`, `tests/admin-users.test.mjs`, and the users feature's actions, validation, data, form, list, new, password and removal pages under `app/admin/users`.
