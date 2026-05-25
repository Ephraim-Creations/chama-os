-- Initial Chama-OS Schema Setup
-- This creates all base tables, enums, and functions

-- 1. Create app_role enum type
create type public.app_role as enum ('chairperson', 'treasurer', 'secretary', 'member');

-- 2. Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Create chamas table
create table public.chamas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text,
  location text,
  rules text,
  invite_code text unique default gen_random_uuid()::text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Create memberships table
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chama_id uuid not null references public.chamas(id) on delete cascade,
  role public.app_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique(user_id, chama_id)
);

-- 5. Create contributions table
create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  chama_id uuid not null references public.chamas(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  amount decimal not null,
  contributed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 6. Create investments table
create table public.investments (
  id uuid primary key default gen_random_uuid(),
  chama_id uuid not null references public.chamas(id) on delete cascade,
  name text not null,
  description text,
  amount decimal not null,
  status text default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Create loans table
create table public.loans (
  id uuid primary key default gen_random_uuid(),
  chama_id uuid not null references public.chamas(id) on delete cascade,
  borrower_id uuid not null references public.profiles(id),
  amount decimal not null,
  interest_rate decimal,
  status text default 'active',
  disbursed_at timestamptz,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

-- 8. Create loan_repayments table
create table public.loan_repayments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  amount decimal not null,
  repaid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 9. Create feed_posts table
create table public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  chama_id uuid not null references public.chamas(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. Create loan_guarantors table
create table public.loan_guarantors (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  guarantor_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.chamas enable row level security;
alter table public.memberships enable row level security;
alter table public.contributions enable row level security;
alter table public.investments enable row level security;
alter table public.loans enable row level security;
alter table public.loan_repayments enable row level security;
alter table public.feed_posts enable row level security;
alter table public.loan_guarantors enable row level security;

-- Helper functions for RLS policies
create or replace function public.is_member_of(chama_id uuid, user_id uuid) 
returns boolean as $$
  select exists (
    select 1 from public.memberships
    where memberships.chama_id = is_member_of.chama_id
      and memberships.user_id = is_member_of.user_id
  );
$$ language sql security definer;

create or replace function public.has_chama_role(chama_id uuid, user_id uuid, role public.app_role) 
returns boolean as $$
  select exists (
    select 1 from public.memberships
    where memberships.chama_id = has_chama_role.chama_id
      and memberships.user_id = has_chama_role.user_id
      and memberships.role = has_chama_role.role
  );
$$ language sql security definer;

-- Basic RLS Policies

-- Profiles: Users can read their own profile and profiles of chama members
create policy "profiles read own"
  on public.profiles for select
  using (auth.uid() = id);

-- Chamas: Members can read their chama
create policy "chamas read by members"
  on public.chamas for select
  using (public.is_member_of(id, auth.uid()));

-- Memberships: Members can read memberships in their chama
create policy "memberships read by chama members"
  on public.memberships for select
  using (public.is_member_of(chama_id, auth.uid()));

-- Contributions: Members can read contributions in their chama
create policy "contributions read by chama members"
  on public.contributions for select
  using (public.is_member_of(chama_id, auth.uid()));

-- Investments: Members can read investments in their chama
create policy "investments read by chama members"
  on public.investments for select
  using (public.is_member_of(chama_id, auth.uid()));

-- Loans: Members can read loans in their chama
create policy "loans read by chama members"
  on public.loans for select
  using (public.is_member_of(chama_id, auth.uid()));

-- Loan repayments: Members can read repayments in their chama
create policy "loan_repayments read by chama members"
  on public.loan_repayments for select
  using (
    public.is_member_of(
      (select chama_id from public.loans where id = loan_id),
      auth.uid()
    )
  );

-- Feed posts: Members can read posts in their chama
create policy "feed posts read by chama members"
  on public.feed_posts for select
  using (public.is_member_of(chama_id, auth.uid()));

-- Loan guarantors: Members can read guarantors in their chama
create policy "loan_guarantors read by chama members"
  on public.loan_guarantors for select
  using (
    public.is_member_of(
      (select chama_id from public.loans where id = loan_id),
      auth.uid()
    )
  );
