# Remote Work Platform: SPEC

## Goal
A simple remote jobs website. Visitors browse remote job opportunities by category. Marissa Kawala manages all content herself through a private admin dashboard, without editing code. This is a portfolio-based first version (MVP), kept simple.

## Design
The visual reference is Marissa's Canva design:
- Published preview: https://canva.link/99y74i9slpokyti
- Editable: https://www.canva.com/design/DAHZmR23jnI/KLb7atDdwxOA0xUWh9-Euw/edit
Match its layout, colors, typography, spacing, sections, buttons, navigation and responsive behavior. Don't redesign it and don't invent sections or features that aren't in the design. If a Figma file is provided later, Figma becomes the source of truth.

## Stack
Next.js (App Router, React, TypeScript) on Vercel. Supabase for Postgres, Auth, Storage and Row Level Security. GitHub for source control and auto-deploy. No Express server, no Render. Server-side logic, if needed, goes in Next.js route handlers or server actions.

## Public site
- Homepage matching the design; job categories; job listings.
- Filter/browse by category if it fits the design.
- Job fields: title, category, company/source, description, location/eligibility, application URL, optional image, status (draft/published).
- Apply buttons open the external application link.
- Responsive for desktop, tablet and mobile. Accessible.

## Admin dashboard (private)
- Secure sign-in (Supabase Auth); dashboard routes redirect to login when signed out.
- Add/edit/delete categories. Add/edit/delete jobs. Edit application URLs.
- Optional image upload. Draft/published toggle controlling public visibility.
- Clean and simple; it doesn't need to match the public design.

## Security
- RLS on every table. Public can only read published categories and published jobs.
- Only the authorized admin (Marissa's specific account) can create, update or delete. No public write access.
- Never expose a Supabase service-role/secret key in browser code, the repo, or NEXT_PUBLIC_ variables. Only the public/publishable key is used client-side.

## Out of scope for v1
Job-seeker accounts, messaging, payments, job matching, employer accounts, multiple admins, search, advanced filters, email notifications, analytics, custom domain.

## Free tier
Keep v1 within free tiers. Don't purchase anything. List the free-tier limitations of Vercel and Supabase before production use.
