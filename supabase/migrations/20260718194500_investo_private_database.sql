begin;

create extension if not exists pgcrypto;

create type public.investo_asset_class as enum (
  'equity',
  'etf',
  'mutual_fund',
  'bond',
  'treasury',
  'commodity',
  'cash',
  'real_asset',
  'private_asset'
);

create type public.investo_opportunity_stage as enum (
  'discovered',
  'screening',
  'research',
  'valuation',
  'watch',
  'buy_zone',
  'owned',
  'rejected',
  'archived'
);

create type public.investo_action as enum (
  'watch',
  'research',
  'buy',
  'add',
  'hold',
  'trim',
  'sell',
  'rebalance',
  'reject'
);

create type public.investo_conviction as enum (
  'low',
  'moderate',
  'high',
  'exceptional'
);

create type public.investo_decision_status as enum (
  'prepared',
  'approved',
  'declined',
  'executed',
  'expired',
  'cancelled'
);

create type public.investo_run_status as enum (
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled'
);

create or replace function public.investo_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.investo_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  base_currency text not null default 'USD',
  target_annual_return numeric(7,4),
  maximum_drawdown numeric(7,4),
  minimum_cash_reserve numeric(7,4) not null default 0.10,
  investment_horizon_years integer not null default 10
    check (investment_horizon_years between 1 and 100),
  investment_policy jsonb not null default '{
    "execution_mode": "human_approved",
    "allow_margin": false,
    "allow_options": false,
    "allow_short_selling": false,
    "minimum_margin_of_safety": 0.20,
    "maximum_single_position_weight": 0.15
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.investo_portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  base_currency text not null default 'USD',
  benchmark_symbol text not null default 'SPY',
  is_primary boolean not null default false,
  target_cash_weight numeric(7,4) not null default 0.10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create unique index investo_one_primary_portfolio_per_user
  on public.investo_portfolios(user_id)
  where is_primary = true;

create table public.investo_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null
    references public.investo_portfolios(id) on delete cascade,
  name text not null,
  institution_name text,
  account_type text,
  tax_treatment text,
  is_active boolean not null default true,
  last_imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (portfolio_id, name)
);

create table public.investo_securities (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  exchange text not null default '',
  company_name text,
  asset_class public.investo_asset_class not null default 'equity',
  sector text,
  industry text,
  currency text not null default 'USD',
  country_code text,
  isin text,
  cik text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (symbol, exchange)
);

create table public.investo_holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null
    references public.investo_portfolios(id) on delete cascade,
  account_id uuid
    references public.investo_accounts(id) on delete set null,
  security_id uuid
    references public.investo_securities(id) on delete restrict,
  symbol text not null,
  asset_name text,
  asset_class public.investo_asset_class not null default 'equity',
  quantity numeric(24,8) not null check (quantity >= 0),
  average_cost numeric(20,6),
  current_price numeric(20,6),
  market_value numeric(22,4),
  unrealized_gain numeric(22,4),
  unrealized_gain_percent numeric(9,6),
  portfolio_weight numeric(9,6),
  currency text not null default 'USD',
  investment_thesis text,
  thesis_break_conditions jsonb not null default '[]'::jsonb,
  conviction public.investo_conviction,
  last_market_update_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index investo_holdings_unique_position
  on public.investo_holdings(
    portfolio_id,
    coalesce(account_id, '00000000-0000-0000-0000-000000000000'::uuid),
    symbol
  );

create table public.investo_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null
    references public.investo_portfolios(id) on delete cascade,
  account_id uuid
    references public.investo_accounts(id) on delete set null,
  symbol text not null,
  transaction_type text not null
    check (
      transaction_type in (
        'buy',
        'sell',
        'dividend',
        'interest',
        'deposit',
        'withdrawal',
        'fee',
        'transfer',
        'split',
        'other'
      )
    ),
  quantity numeric(24,8),
  price numeric(20,6),
  gross_amount numeric(22,4),
  fees numeric(18,4) not null default 0,
  net_amount numeric(22,4),
  currency text not null default 'USD',
  trade_date date not null,
  settlement_date date,
  external_reference text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.investo_watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  company_name text,
  asset_class public.investo_asset_class not null default 'equity',
  stage public.investo_opportunity_stage not null default 'discovered',
  priority integer not null default 3 check (priority between 1 and 5),
  investment_theme text,
  shovel_category text,
  discovery_reason text,
  research_notes text,
  target_entry_price numeric(20,6),
  strong_buy_price numeric(20,6),
  fair_value numeric(20,6),
  reject_above_price numeric(20,6),
  desired_weight numeric(9,6),
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, symbol)
);

create table public.investo_financial_snapshots (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  period_type text not null
    check (period_type in ('annual', 'quarterly', 'ttm')),
  period_end date not null,
  revenue numeric,
  operating_income numeric,
  net_income numeric,
  operating_cash_flow numeric,
  capital_expenditures numeric,
  free_cash_flow numeric,
  total_assets numeric,
  total_debt numeric,
  shareholders_equity numeric,
  cash_and_equivalents numeric,
  diluted_shares numeric,
  return_on_equity numeric(12,8),
  return_on_invested_capital numeric(12,8),
  debt_to_equity numeric(12,8),
  gross_margin numeric(12,8),
  operating_margin numeric(12,8),
  free_cash_flow_margin numeric(12,8),
  source_name text,
  source_url text,
  data_as_of timestamptz not null,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (symbol, period_type, period_end, source_name)
);

create table public.investo_market_prices (
  id bigint generated always as identity primary key,
  symbol text not null,
  price numeric(20,6) not null,
  previous_close numeric(20,6),
  market_cap numeric,
  pe_ratio numeric(16,6),
  forward_pe_ratio numeric(16,6),
  price_to_free_cash_flow numeric(16,6),
  dividend_yield numeric(12,8),
  fifty_two_week_high numeric(20,6),
  fifty_two_week_low numeric(20,6),
  currency text not null default 'USD',
  market_status text,
  source_name text not null,
  observed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index investo_market_prices_symbol_observed_idx
  on public.investo_market_prices(symbol, observed_at desc);

create table public.investo_research_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  report_type text not null,
  title text not null,
  executive_summary text,
  business_description text,
  moat_analysis text,
  management_analysis text,
  capital_allocation_analysis text,
  financial_strength_analysis text,
  valuation_analysis text,
  downside_analysis text,
  catalysts jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  business_quality_score numeric(5,2),
  moat_score numeric(5,2),
  balance_sheet_score numeric(5,2),
  management_score numeric(5,2),
  capital_allocation_score numeric(5,2),
  valuation_score numeric(5,2),
  shovel_score numeric(5,2),
  overall_score numeric(5,2),
  data_as_of timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.investo_valuations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  valuation_method text not null,
  current_price numeric(20,6),
  conservative_value numeric(20,6),
  base_value numeric(20,6),
  optimistic_value numeric(20,6),
  buy_below numeric(20,6),
  strong_buy_below numeric(20,6),
  trim_above numeric(20,6),
  margin_of_safety numeric(9,6),
  expected_five_year_cagr numeric(9,6),
  terminal_growth_rate numeric(9,6),
  discount_rate numeric(9,6),
  assumptions jsonb not null default '{}'::jsonb,
  data_as_of timestamptz,
  created_at timestamptz not null default now()
);

create table public.investo_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid
    references public.investo_portfolios(id) on delete cascade,
  research_report_id uuid
    references public.investo_research_reports(id) on delete set null,
  valuation_id uuid
    references public.investo_valuations(id) on delete set null,
  symbol text not null,
  action public.investo_action not null,
  conviction public.investo_conviction not null,
  priority integer not null default 3 check (priority between 1 and 5),
  current_price numeric(20,6),
  recommended_price numeric(20,6),
  recommended_quantity numeric(24,8),
  recommended_weight numeric(9,6),
  rationale text not null,
  key_risks jsonb not null default '[]'::jsonb,
  thesis_break_conditions jsonb not null default '[]'::jsonb,
  supporting_evidence jsonb not null default '[]'::jsonb,
  requires_human_approval boolean not null default true
    check (requires_human_approval = true),
  data_as_of timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.investo_decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_id uuid
    references public.investo_recommendations(id) on delete set null,
  symbol text not null,
  action public.investo_action not null,
  status public.investo_decision_status not null default 'prepared',
  requested_quantity numeric(24,8),
  approved_quantity numeric(24,8),
  requested_price numeric(20,6),
  approved_price numeric(20,6),
  decision_note text,
  approved_at timestamptz,
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.investo_market_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  title text not null,
  executive_summary text,
  severity integer not null default 3 check (severity between 1 and 5),
  affected_symbols text[] not null default '{}',
  affected_sectors text[] not null default '{}',
  affected_countries text[] not null default '{}',
  investment_implications jsonb not null default '[]'::jsonb,
  source_name text,
  source_url text,
  published_at timestamptz,
  collected_at timestamptz not null default now(),
  raw_data jsonb not null default '{}'::jsonb
);

create table public.investo_agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  agent_name text not null,
  run_type text not null,
  status public.investo_run_status not null default 'queued',
  input_summary text,
  output_summary text,
  evidence jsonb not null default '[]'::jsonb,
  model_name text,
  prompt_version text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.investo_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid
    references public.investo_portfolios(id) on delete cascade,
  symbol text,
  alert_type text not null,
  priority integer not null default 3 check (priority between 1 and 5),
  title text not null,
  message text not null,
  recommended_action public.investo_action,
  supporting_data jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create trigger investo_profiles_updated_at
before update on public.investo_profiles
for each row execute function public.investo_set_updated_at();

create trigger investo_portfolios_updated_at
before update on public.investo_portfolios
for each row execute function public.investo_set_updated_at();

create trigger investo_accounts_updated_at
before update on public.investo_accounts
for each row execute function public.investo_set_updated_at();

create trigger investo_securities_updated_at
before update on public.investo_securities
for each row execute function public.investo_set_updated_at();

create trigger investo_holdings_updated_at
before update on public.investo_holdings
for each row execute function public.investo_set_updated_at();

create trigger investo_watchlist_updated_at
before update on public.investo_watchlist
for each row execute function public.investo_set_updated_at();

create trigger investo_research_reports_updated_at
before update on public.investo_research_reports
for each row execute function public.investo_set_updated_at();

create trigger investo_decisions_updated_at
before update on public.investo_decisions
for each row execute function public.investo_set_updated_at();

alter table public.investo_profiles enable row level security;
alter table public.investo_portfolios enable row level security;
alter table public.investo_accounts enable row level security;
alter table public.investo_securities enable row level security;
alter table public.investo_holdings enable row level security;
alter table public.investo_transactions enable row level security;
alter table public.investo_watchlist enable row level security;
alter table public.investo_financial_snapshots enable row level security;
alter table public.investo_market_prices enable row level security;
alter table public.investo_research_reports enable row level security;
alter table public.investo_valuations enable row level security;
alter table public.investo_recommendations enable row level security;
alter table public.investo_decisions enable row level security;
alter table public.investo_market_events enable row level security;
alter table public.investo_agent_runs enable row level security;
alter table public.investo_alerts enable row level security;

create policy "Users manage their own Investo profile"
on public.investo_profiles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own portfolios"
on public.investo_portfolios
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own accounts"
on public.investo_accounts
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Authenticated users may read securities"
on public.investo_securities
for select
to authenticated
using (true);

create policy "Users manage their own holdings"
on public.investo_holdings
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own transactions"
on public.investo_transactions
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own watchlist"
on public.investo_watchlist
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Authenticated users may read financial snapshots"
on public.investo_financial_snapshots
for select
to authenticated
using (true);

create policy "Authenticated users may read market prices"
on public.investo_market_prices
for select
to authenticated
using (true);

create policy "Users manage their own research"
on public.investo_research_reports
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own valuations"
on public.investo_valuations
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own recommendations"
on public.investo_recommendations
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own decisions"
on public.investo_decisions
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Authenticated users may read market events"
on public.investo_market_events
for select
to authenticated
using (true);

create policy "Users read their own agent runs"
on public.investo_agent_runs
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users manage their own alerts"
on public.investo_alerts
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index investo_portfolios_user_idx
  on public.investo_portfolios(user_id);

create index investo_accounts_portfolio_idx
  on public.investo_accounts(portfolio_id);

create index investo_holdings_user_portfolio_idx
  on public.investo_holdings(user_id, portfolio_id);

create index investo_transactions_portfolio_date_idx
  on public.investo_transactions(portfolio_id, trade_date desc);

create index investo_watchlist_user_stage_idx
  on public.investo_watchlist(user_id, stage);

create index investo_financial_snapshots_symbol_period_idx
  on public.investo_financial_snapshots(symbol, period_end desc);

create index investo_research_user_symbol_idx
  on public.investo_research_reports(user_id, symbol, created_at desc);

create index investo_valuations_user_symbol_idx
  on public.investo_valuations(user_id, symbol, created_at desc);

create index investo_recommendations_user_priority_idx
  on public.investo_recommendations(user_id, priority, created_at desc);

create index investo_decisions_user_status_idx
  on public.investo_decisions(user_id, status, created_at desc);

create index investo_market_events_published_idx
  on public.investo_market_events(published_at desc);

create index investo_agent_runs_user_created_idx
  on public.investo_agent_runs(user_id, created_at desc);

create index investo_alerts_user_open_idx
  on public.investo_alerts(user_id, is_resolved, priority, created_at desc);

comment on table public.investo_profiles is
  'Private investment policy and risk settings for each authenticated user.';

comment on table public.investo_recommendations is
  'Prepared investment recommendations. Every record requires human approval.';

comment on table public.investo_decisions is
  'Human decisions made in response to prepared investment recommendations.';

comment on column public.investo_recommendations.requires_human_approval is
  'Hard control preventing autonomous execution recommendations.';

commit;
