create table if not exists public.investo_runtime_controls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  runtime_name text not null default 'investment-research',
  status text not null default 'stopped'
    check (status in ('running', 'paused', 'stopped')),
  last_started_at timestamptz,
  last_paused_at timestamptz,
  last_stopped_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, runtime_name)
);

create table if not exists public.investo_agent_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_name text not null,
  run_type text not null default 'company-research',
  subject text,
  status text not null
    check (status in ('running', 'completed', 'failed', 'blocked')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists investo_agent_activity_user_created_idx
  on public.investo_agent_activity (user_id, created_at desc);

create index if not exists investo_agent_activity_agent_created_idx
  on public.investo_agent_activity (user_id, agent_name, created_at desc);

alter table public.investo_runtime_controls enable row level security;
alter table public.investo_agent_activity enable row level security;

drop policy if exists investo_runtime_controls_select_own
  on public.investo_runtime_controls;

create policy investo_runtime_controls_select_own
  on public.investo_runtime_controls
  for select
  using (auth.uid() = user_id);

drop policy if exists investo_runtime_controls_insert_own
  on public.investo_runtime_controls;

create policy investo_runtime_controls_insert_own
  on public.investo_runtime_controls
  for insert
  with check (auth.uid() = user_id);

drop policy if exists investo_runtime_controls_update_own
  on public.investo_runtime_controls;

create policy investo_runtime_controls_update_own
  on public.investo_runtime_controls
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists investo_agent_activity_select_own
  on public.investo_agent_activity;

create policy investo_agent_activity_select_own
  on public.investo_agent_activity
  for select
  using (auth.uid() = user_id);

drop policy if exists investo_agent_activity_insert_own
  on public.investo_agent_activity;

create policy investo_agent_activity_insert_own
  on public.investo_agent_activity
  for insert
  with check (auth.uid() = user_id);

drop policy if exists investo_agent_activity_update_own
  on public.investo_agent_activity;

create policy investo_agent_activity_update_own
  on public.investo_agent_activity
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
