# Rules for Codex
- Read SPEC.md, PLAN.md and DECISIONS.md only. Don't scan the whole repo.
- The Canva design is the visual source of truth. Don't redesign or invent sections.
- Never expose a Supabase service-role key in client code, the repo, or NEXT_PUBLIC_ variables. Keep .env.local out of git.
- RLS on every table. No public write access.
- No Express/Render. Next.js talks to Supabase directly.
- No new dependencies, deploys, purchases, or messages to anyone without my approval.
- Touch only the files the task needs. No refactors, no extra features.
- Keep replies under 5 lines: what changed, how to test, what's next.
