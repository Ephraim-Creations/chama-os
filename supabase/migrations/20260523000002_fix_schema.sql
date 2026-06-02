-- Add missing columns to chamas table
ALTER TABLE public.chamas ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.chamas ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.chamas ADD COLUMN IF NOT EXISTS rules text;
ALTER TABLE public.chamas ADD COLUMN IF NOT EXISTS invite_code text unique default gen_random_uuid()::text;

-- Create missing tables
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  chama_id uuid not null references public.chamas(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.loan_guarantors (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  guarantor_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_guarantors ENABLE ROW LEVEL SECURITY;
