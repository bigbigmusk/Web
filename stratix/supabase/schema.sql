-- ════════════════════════════════════════════════════════════════
-- STRATIX — Supabase schema
-- AI Strategic Intelligence Workspace for Global Market Expansion
--
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Includes tables, enums, indexes, RLS policies, and seed pricing plans.
-- ════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ── Enums ───────────────────────────────────────────────────────
do $$ begin
  create type plan_id as enum ('free','starter','pro','business','agency');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('draft','active','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('New','Qualified','Contacted','Replied','Meeting Booked','Quoted','Won','Lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_priority as enum ('High','Medium','Low');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('Todo','In Progress','Done');
exception when duplicate_object then null; end $$;

-- ── users ───────────────────────────────────────────────────────
-- Mirrors auth.users; row id should equal auth.uid().
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text unique not null,
  company_name text,
  role text,
  plan plan_id not null default 'free',
  brand_voice text,
  preferred_markets text[],
  default_language text default 'English',
  created_at timestamptz not null default now()
);

-- ── projects ────────────────────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_name text not null,
  business_type text,
  business_goal text,
  product_category text,
  target_market text,
  status project_status not null default 'draft',
  export_readiness_score int,
  opportunity_score int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_projects_user on public.projects(user_id);

-- ── products ────────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  product_name text not null,
  category text,
  description text,
  cost_price numeric,
  target_price numeric,
  moq int,
  certifications text,
  current_channels text,
  selling_points text,
  images text[],
  oem_odm_support text,
  factory_background text,
  main_customer_type text,
  existing_website text,
  created_at timestamptz not null default now()
);
create index if not exists idx_products_project on public.products(project_id);

-- ── market_reports ──────────────────────────────────────────────
create table if not exists public.market_reports (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  export_readiness_score int,
  target_countries jsonb,
  opportunity_score int,
  competition_score int,
  pricing_insight text,
  channel_recommendation text,
  risk_notes text,
  certification_notes text,
  usp text,
  action_plan jsonb,
  diagnosis jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_market_reports_project on public.market_reports(project_id);

-- ── competitors ─────────────────────────────────────────────────
create table if not exists public.competitors (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  brand_name text not null,
  website_url text,
  platform_url text,
  price_range text,
  positioning text,
  target_audience text,
  key_message text,
  visual_style text,
  sales_angles jsonb,
  channel_strategy text,
  trust_signals jsonb,
  hero_product text,
  product_structure text,
  what_to_learn jsonb,
  what_to_avoid jsonb,
  differentiation_opportunity text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_competitors_project on public.competitors(project_id);

-- ── leads ───────────────────────────────────────────────────────
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  company_name text not null,
  country text,
  website text,
  customer_type text,
  contact_name text,
  email text,
  linkedin_url text,
  source text,
  priority lead_priority default 'Medium',
  status lead_status default 'New',
  fit_score int,
  last_contacted_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_leads_project on public.leads(project_id);

-- ── contents ────────────────────────────────────────────────────
create table if not exists public.contents (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  content_type text not null,
  title text,
  target_audience text,
  platform text,
  tone text,
  main_message text,
  body text,
  cta text,
  language text default 'English',
  created_at timestamptz not null default now()
);
create index if not exists idx_contents_project on public.contents(project_id);

-- ── reports ─────────────────────────────────────────────────────
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  report_type text not null,
  title text,
  summary text,
  content_json jsonb,
  status text default 'draft',
  export_url text,
  created_at timestamptz not null default now()
);
create index if not exists idx_reports_project on public.reports(project_id);

-- ── tasks ───────────────────────────────────────────────────────
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  task_name text not null,
  task_type text,
  day int,
  week int,
  due_date date,
  status task_status default 'Todo',
  owner text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_tasks_project on public.tasks(project_id);

-- ── pricing_plans ───────────────────────────────────────────────
create table if not exists public.pricing_plans (
  id plan_id primary key,
  name text not null,
  price_usd numeric not null,
  price_rmb numeric not null,
  features jsonb,
  limits jsonb,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════
-- Row Level Security — users only access their own data
-- ════════════════════════════════════════════════════════════════
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.products enable row level security;
alter table public.market_reports enable row level security;
alter table public.competitors enable row level security;
alter table public.leads enable row level security;
alter table public.contents enable row level security;
alter table public.reports enable row level security;
alter table public.tasks enable row level security;
alter table public.pricing_plans enable row level security;

-- Users can read/update their own row.
drop policy if exists "users self" on public.users;
create policy "users self" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Helper: a project belongs to the current user.
-- Each child table is scoped through its project's owner.
create or replace function public.owns_project(p uuid) returns boolean as $$
  select exists (
    select 1 from public.projects pr
    where pr.id = p and pr.user_id = auth.uid()
  );
$$ language sql stable security definer;

drop policy if exists "own projects" on public.projects;
create policy "own projects" on public.projects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Generic per-project policy for child tables.
do $$
declare t text;
begin
  foreach t in array array['products','market_reports','competitors','leads','contents','reports','tasks']
  loop
    execute format('drop policy if exists "own %1$s" on public.%1$s;', t);
    execute format(
      'create policy "own %1$s" on public.%1$s for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));',
      t
    );
  end loop;
end $$;

-- Pricing plans are public read-only.
drop policy if exists "plans public read" on public.pricing_plans;
create policy "plans public read" on public.pricing_plans for select using (true);

-- ════════════════════════════════════════════════════════════════
-- Seed pricing plans
-- ════════════════════════════════════════════════════════════════
insert into public.pricing_plans (id, name, price_usd, price_rmb, features, limits) values
  ('free','Free',0,0,
   '["3 STRATIX scans / month","Basic report","Basic content generation","Watermarked PDF"]',
   '{"scans":3,"competitors":1,"content":5}'),
  ('starter','Starter',29,199,
   '["20 export scans / month","10 competitor analyses","100 content generations","PDF export","Basic templates"]',
   '{"scans":20,"competitors":10,"content":100}'),
  ('pro','Pro',99,699,
   '["Lead Finder + CSV export","Advanced competitor analysis","Cold email sequences","LinkedIn content plan","Proposal Builder","No watermark"]',
   '{"scans":-1,"competitors":-1,"content":-1}'),
  ('business','Business',299,1999,
   '["Team workspace","CRM pipeline","Advanced reports","Custom templates","Monthly strategy report","Multi-project management"]',
   '{"scans":-1,"competitors":-1,"content":-1}'),
  ('agency','Agency',699,4999,
   '["White-label reports","Client workspaces","Batch project generation","Proposal templates","Team permissions","Premium support"]',
   '{"scans":-1,"competitors":-1,"content":-1}')
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════
-- Auto-provision a public.users row when an auth user signs up
-- ════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
