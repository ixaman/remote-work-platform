-- Run manually in the Supabase SQL Editor as the project owner after schema.sql.
-- A failed statement rolls back the entire migration. No Auth settings change.
begin;

-- Roles are stored in a protected table, never in editable user metadata.
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  email text not null,
  role text not null check (role in ('super_admin', 'admin')),
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- A constant indexed only for super_admin permits at most one such row.
create unique index admins_single_super_admin_idx
  on public.admins ((true)) where role = 'super_admin';

alter table public.admins enable row level security;
-- Remove default grants (including operations RLS does not protect).
-- Authenticated users can SELECT only; all writes use the server secret key.
revoke all on table public.admins from public, anon, authenticated;
grant select on table public.admins to authenticated;
grant select, insert, update, delete on table public.admins to service_role;

-- Seed the existing account. Missing Auth user/email fails the transaction.
insert into public.admins (user_id, name, email, role)
values (
  'bfd2f5f9-6a96-4b70-8b4a-a405b94c8412'::uuid,
  'Asad',
  (select email from auth.users where id = 'bfd2f5f9-6a96-4b70-8b4a-a405b94c8412'::uuid),
  'super_admin'
);

-- SECURITY DEFINER is necessary to read admins without recursing through
-- its SELECT policy. Run as the owner; qualify every name and pin search_path.
-- Preserve is_admin()'s name/signature so existing job/category policies work.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins
    where user_id = (select auth.uid()) and role = 'super_admin'
  );
$$;

-- Only signed-in users may execute the authorization helpers.
revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.is_super_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;

-- Users can read their own role; the super admin can list everyone.
-- Intentionally no INSERT, UPDATE or DELETE policies for any role.
create policy admins_select on public.admins
for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_super_admin()));

-- Visitors can still evaluate policies that call is_admin(); it returns false for them.
grant execute on function public.is_admin() to anon;
commit;
