# Rules for Codex
- Read SPEC.md, PLAN.md and DECISIONS.md only. Don't scan the whole repo.
- The Canva design is the visual source of truth. Don't redesign or invent sections.
- A server-only Supabase secret key is allowed only in lib/supabase/admin.ts and app/admin/users/actions.ts; never in client code, never in a NEXT_PUBLIC_ variable, never committed or logged.
- RLS on every table. No public write access.
- No Express/Render. Next.js talks to Supabase directly.
- No new dependencies, deploys, purchases, or messages to anyone without my approval.
- Touch only the files the task needs. No refactors, no extra features.
- Keep replies under 5 lines: what changed, how to test, what's next.
