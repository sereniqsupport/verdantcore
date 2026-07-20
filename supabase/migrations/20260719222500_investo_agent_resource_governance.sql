begin;

alter table public.investo_agent_runs
  add column if not exists agent_version text,
  add column if not exists resource_profile text,
  add column if not exists model_calls integer not null default 0
    check (model_calls >= 0),
  add column if not exists input_tokens bigint not null default 0
    check (input_tokens >= 0),
  add column if not exists cached_input_tokens bigint not null default 0
    check (cached_input_tokens >= 0),
  add column if not exists output_tokens bigint not null default 0
    check (output_tokens >= 0),
  add column if not exists total_tokens bigint not null default 0
    check (total_tokens >= 0),
  add column if not exists duration_ms bigint not null default 0
    check (duration_ms >= 0),
  add column if not exists estimated_cost_usd numeric(18,8),
  add column if not exists usage_details jsonb
    not null default '{}'::jsonb;

create index if not exists
  investo_agent_runs_user_resource_idx
on public.investo_agent_runs(
  user_id,
  resource_profile,
  created_at desc
);

comment on column
  public.investo_agent_runs.resource_profile
is
  'Versioned resource policy assigned to the agent run.';

comment on column
  public.investo_agent_runs.usage_details
is
  'Per-model usage details for the audited agent run.';

commit;
