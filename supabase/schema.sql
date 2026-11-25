-- =====================================================================
-- Intelligent Personal Health Record Management System
-- Database schema, matching the ERD in Chapter 3 (Figure 3.3) and the
-- Row-Level Security strategy in Section 3.5.3.2 / Figure 3.4.
--
-- HOW TO RUN THIS FILE:
--   Supabase Dashboard -> your project -> SQL Editor -> New query
--   -> paste this whole file -> Run.
--   (See README.md, Step 3, for the full walkthrough.)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. profiles  (the "users" entity from the ERD)
-- ---------------------------------------------------------------------
-- Supabase Auth already provides a secure, built-in auth.users table that
-- handles registration, login and password hashing for us (this is why
-- there is no password_hash column here - storing or re-hashing passwords
-- ourselves would be both redundant and less secure than what Supabase
-- Auth already does). This table simply extends that built-in user with
-- the extra profile fields the ERD's "users" entity calls for.
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null,
  email      text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Automatically create a profile row whenever someone registers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. health_records
-- ---------------------------------------------------------------------
create table if not exists public.health_records (
  record_id   uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  record_type text not null,          -- e.g. 'medication', 'allergy', 'history'
  title       text not null,
  description text,
  created_at  timestamptz not null default now()
);

create index if not exists health_records_user_id_idx on public.health_records (user_id);

alter table public.health_records enable row level security;

create policy "Users can view their own health records"
  on public.health_records for select
  using (auth.uid() = user_id);

create policy "Users can insert their own health records"
  on public.health_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own health records"
  on public.health_records for update
  using (auth.uid() = user_id);

create policy "Users can delete their own health records"
  on public.health_records for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 3. documents
-- ---------------------------------------------------------------------
create table if not exists public.documents (
  document_id uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  record_id   uuid references public.health_records (record_id) on delete set null,
  file_path   text not null,          -- path inside the 'documents' storage bucket
  file_name   text not null,
  ai_summary  text,
  category    text,
  upload_date timestamptz not null default now()
);

create index if not exists documents_user_id_idx on public.documents (user_id);

alter table public.documents enable row level security;

create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 4. ai_queries
-- ---------------------------------------------------------------------
create table if not exists public.ai_queries (
  query_id    uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  query_text  text not null,
  ai_response text,
  created_at  timestamptz not null default now()
);

create index if not exists ai_queries_user_id_idx on public.ai_queries (user_id);

alter table public.ai_queries enable row level security;

create policy "Users can view their own queries"
  on public.ai_queries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own queries"
  on public.ai_queries for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 5. health_insights
-- ---------------------------------------------------------------------
create table if not exists public.health_insights (
  insight_id   uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  insight_text text not null,
  generated_at timestamptz not null default now()
);

create index if not exists health_insights_user_id_idx on public.health_insights (user_id);

alter table public.health_insights enable row level security;

create policy "Users can view their own insights"
  on public.health_insights for select
  using (auth.uid() = user_id);

create policy "Users can insert their own insights"
  on public.health_insights for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 6. Storage bucket for uploaded medical documents
-- ---------------------------------------------------------------------
-- Creates a PRIVATE bucket named 'documents'. Files are stored under a
-- path of the form  <user_id>/<filename>  so the policies below can use
-- that first path segment to enforce the same one-user-one-record
-- isolation as the database tables (Section 3.5.2 / 3.5.3.2).
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Users can read their own files"
  on storage.objects for select
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload their own files"
  on storage.objects for insert
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own files"
  on storage.objects for delete
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
-- Done. Verify in the Table Editor that profiles, health_records,
-- documents, ai_queries and health_insights all show a small "RLS
-- enabled" badge before moving on to Step 4 of the README.
-- =====================================================================
