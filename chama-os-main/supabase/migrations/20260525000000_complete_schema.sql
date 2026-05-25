-- Complete Chama-OS Database Schema
-- This migration creates all necessary tables and functions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('chairperson', 'treasurer', 'secretary', 'member');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'revoked');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create chamas table
CREATE TABLE public.chamas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text,
  location text,
  rules text,
  invite_code text UNIQUE DEFAULT gen_random_uuid()::text,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Create memberships table
CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chama_id uuid NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, chama_id)
);

-- 5. Create profile_private table
CREATE TABLE public.profile_private (
  id uuid PRIMARY KEY,
  phone text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Create chama_invites table
CREATE TABLE public.chama_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id uuid NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'member',
  token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  status public.invite_status NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

-- 7. Create contributions table
CREATE TABLE public.contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id uuid NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  amount decimal NOT NULL,
  contributed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Create investments table
CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id uuid NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  amount decimal NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Create loans table
CREATE TABLE public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id uuid NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  borrower_id uuid NOT NULL REFERENCES public.profiles(id),
  amount decimal NOT NULL,
  interest_rate decimal,
  status text DEFAULT 'active',
  disbursed_at timestamptz,
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. Create loan_repayments table
CREATE TABLE public.loan_repayments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  amount decimal NOT NULL,
  repaid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 11. Create feed_posts table
CREATE TABLE public.feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id uuid NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 12. Create feed_comments table
CREATE TABLE public.feed_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 13. Create loan_guarantors table
CREATE TABLE public.loan_guarantors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  guarantor_id uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_private ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_guarantors ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_chama_invites_email ON public.chama_invites (lower(email));
CREATE INDEX idx_chama_invites_chama ON public.chama_invites (chama_id);

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_member_of(chama_id uuid, user_id uuid) 
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE memberships.chama_id = is_member_of.chama_id
      AND memberships.user_id = is_member_of.user_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_chama_role(chama_id uuid, user_id uuid, role public.app_role) 
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE memberships.chama_id = has_chama_role.chama_id
      AND memberships.user_id = has_chama_role.user_id
      AND memberships.role = has_chama_role.role
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies
-- Profiles
CREATE POLICY "profiles read own" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Chamas
REVOKE SELECT ON public.chamas FROM anon, authenticated;
GRANT SELECT (id, name, type, location, created_by, created_at, updated_at, rules) ON public.chamas TO anon, authenticated;
CREATE POLICY "chamas read by members" ON public.chamas FOR SELECT USING (public.is_member_of(id, auth.uid()));

-- Memberships
CREATE POLICY "memberships read by chama members" ON public.memberships FOR SELECT USING (public.is_member_of(chama_id, auth.uid()));
CREATE POLICY "memberships insert by chair or self-join" ON public.memberships FOR INSERT WITH CHECK (
  public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role)
  OR (auth.uid() = user_id AND role = 'member'::app_role)
);

-- Contributions
CREATE POLICY "contributions read by chama members" ON public.contributions FOR SELECT USING (public.is_member_of(chama_id, auth.uid()));
CREATE POLICY "contributions delete by treasurer or chair" ON public.contributions FOR DELETE USING (
  public.has_chama_role(chama_id, auth.uid(), 'treasurer'::app_role)
  OR public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role)
);

-- Investments
CREATE POLICY "investments read by chama members" ON public.investments FOR SELECT USING (public.is_member_of(chama_id, auth.uid()));
CREATE POLICY "investments delete by treasurer or chair" ON public.investments FOR DELETE USING (
  public.has_chama_role(chama_id, auth.uid(), 'treasurer'::app_role)
  OR public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role)
);

-- Loans
CREATE POLICY "loans read by chama members" ON public.loans FOR SELECT USING (public.is_member_of(chama_id, auth.uid()));

-- Loan repayments
CREATE POLICY "loan_repayments read by chama members" ON public.loan_repayments FOR SELECT USING (
  public.is_member_of((SELECT chama_id FROM public.loans WHERE id = loan_id), auth.uid())
);

-- Feed posts
CREATE POLICY "feed posts read by chama members" ON public.feed_posts FOR SELECT USING (public.is_member_of(chama_id, auth.uid()));
CREATE POLICY "feed update by author" ON public.feed_posts FOR UPDATE USING (auth.uid() = author_id AND public.is_member_of(chama_id, auth.uid()));

-- Feed comments
CREATE POLICY "comments delete by author or chair" ON public.feed_comments FOR DELETE USING (
  auth.uid() = author_id
  OR EXISTS (
    SELECT 1 FROM public.feed_posts p
    WHERE p.id = feed_comments.post_id
      AND public.has_chama_role(p.chama_id, auth.uid(), 'chairperson'::app_role)
  )
);

-- Chama invites
CREATE POLICY "invites read by chair or invitee" ON public.chama_invites FOR SELECT USING (
  public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role)
  OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);
CREATE POLICY "invites insert by chair" ON public.chama_invites FOR INSERT WITH CHECK (
  public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role) 
  AND invited_by = auth.uid()
);
CREATE POLICY "invites update by chair" ON public.chama_invites FOR UPDATE USING (
  public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role)
);
CREATE POLICY "invites update by invitee email" ON public.chama_invites FOR UPDATE USING (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

-- Profile private
CREATE POLICY "private self read" ON public.profile_private FOR SELECT USING (auth.uid() = id);
CREATE POLICY "private self insert" ON public.profile_private FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "private self update" ON public.profile_private FOR UPDATE USING (auth.uid() = id);

-- Loan guarantors
CREATE POLICY "guarantor insert by borrower" ON public.loan_guarantors FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.loans l
    WHERE l.id = loan_guarantors.loan_id
      AND l.borrower_id = auth.uid()
      AND public.is_member_of(l.chama_id, loan_guarantors.guarantor_id)
  )
);

-- Create function for invite codes
CREATE OR REPLACE FUNCTION public.get_chama_invite_code(_chama uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT invite_code
  FROM public.chamas
  WHERE id = _chama
    AND public.has_chama_role(_chama, auth.uid(), 'chairperson'::app_role);
$$;

REVOKE ALL ON FUNCTION public.get_chama_invite_code(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_chama_invite_code(uuid) TO authenticated;
