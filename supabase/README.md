# Database setup

In your Supabase project, open **SQL Editor → New query**, paste the complete
contents of `supabase/schema.sql`, and click **Run** as the project owner.
Run it once against a fresh database; existing tables cause the transaction to
fail without changing them. No CLI, dependencies, keys, or app changes are needed.

The clearly marked sample seed section creates six categories (five published,
one draft) and fifteen fictional jobs (fourteen published, one draft). Published
content matches `lib/fixtures.ts`; `sample-empty` has no jobs. Remove the entire
sample section before using this setup for production.

Before launch, replace the UUID in `public.is_admin()` with Marissa's UUID from
**Authentication → Users** by rerunning the complete `create or replace function
public.is_admin()` definition with the new value. Do not rerun the table creation
statements or copy the UUID into individual policies. Disable public signups in
the project's Auth settings. The UUID identifies the one authorized account;
credentials and keys do not belong in SQL files or Git.

# Six RLS checks

The SQL Editor normally bypasses RLS as the owner. To test a visitor, wrap each
read check in this transaction, placing its queries before `rollback`:

```sql
begin;
set local role anon;
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{}';
-- Put the read queries here.
rollback;
```

1. **Public reads:** `select count(*) from public.categories;` returns **5**;
   `select count(*) from public.jobs;` returns **14**. The category with slug
   `sample-empty` is visible and has zero jobs.
2. **Private drafts:** filtering categories by `slug = 'sample-draft'` returns
   zero rows; filtering jobs by `title = 'Sample: Draft Remote Assistant'` also
   returns zero rows. Filtering either table by `status = 'draft'` returns none,
   including when requesting a draft's exact ID copied from the owner view.
3. **Hidden parent:** as the owner, run `begin;` and
   `update public.categories set status = 'draft' where slug = 'international';`
   then switch to `anon` and clear the claims as above. Jobs now total **10**;
   even `Sample: Remote Community Assistant` is invisible despite being published.
   Finish with `rollback;` to restore the category and timestamps.
4. **Anon writes fail:** using the anon wrapper, try each statement below
   **separately**. Each must raise `permission denied for table ...`, even when
   updating/deleting a visible row. After each error run `rollback;` separately
   if the editor leaves the transaction open. Neither table should change.

   ```sql
   insert into public.categories (name, slug) values ('Sample: Denied', 'sample-denied');
   update public.categories set name = 'Sample: Denied' where slug = 'international';
   delete from public.categories where slug = 'sample-empty';
   insert into public.jobs (category_id, title, company_source, description,
     location_eligibility, application_url)
   select id, 'Sample: Denied', 'Fake source', 'Fake role', 'Sample location',
     'https://example.com/apply' from public.categories where slug = 'international';
   update public.jobs set title = 'Sample: Denied' where title = 'Sample: Remote Community Assistant';
   delete from public.jobs where title = 'Sample: Remote Community Assistant';
   ```

5. **Other authenticated user:** repeat the reads and writes with
   `set local role authenticated;`, setting both `request.jwt.claim.sub` and
   `request.jwt.claims` (`{"sub":"OTHER_USER_UUID"}`) to another Auth user's UUID.
   Reads still return **5 categories / 14 jobs**, inserts fail RLS, and updates
   and deletes affect **0 rows**. Run failed inserts in separate transactions.
6. **Admin:** repeat with Marissa's configured UUID and role `authenticated`.
   `select public.is_admin();` returns true; reads return **6 categories / 15 jobs**,
   including both drafts. In rollback-only transactions, confirm inserts, updates,
   and deletes work on both tables. Check updates refresh `updated_at` (including
   when a client submits an old timestamp), and deleting a category with jobs
   fails its foreign key. Use the owner-provisioned test identity until the
   placeholder UUID is replaced; the owner role alone does not test admin RLS.

The policies use separate grants and RLS checks, with cached identity expressions
as described in [Supabase's RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security).
