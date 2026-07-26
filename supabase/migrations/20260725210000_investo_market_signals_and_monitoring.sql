begin;

create table if not exists public.investo_market_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid
    references public.investo_portfolios(id) on delete cascade,
  strategy_sleeve_id uuid
    references public.investo_strategy_sleeves(id) on delete cascade,
  holding_id uuid
    references public.investo_holdings(id) on delete cascade,

  symbol text,
  signal_type text not null,
  title text not null,
  summary text not null,

  direction text not null default 'neutral',
  severity integer not null default 3,
  confidence numeric(7,4),

  observed_value numeric(24,8),
  reference_value numeric(24,8),

  source_name text,
  evidence_reference text,

  status text not null default 'active',
  requires_review boolean not null default true,
  requires_human_approval boolean not null default true,

  detected_at timestamptz not null default now(),
  reviewed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),

  constraint investo_market_signal_type_check
    check (
      signal_type in (
        'valuation',
        'price',
        'earnings',
        'financial_strength',
        'credit',
        'dividend',
        'concentration',
        'liquidity',
        'volatility',
        'sector',
        'macro',
        'thesis_change',
        'risk'
      )
    ),

  constraint investo_market_signal_direction_check
    check (direction in ('positive', 'negative', 'neutral')),

  constraint investo_market_signal_severity_check
    check (severity between 1 and 5),

  constraint investo_market_signal_confidence_check
    check (
      confidence is null
      or (
        confidence >= 0
        and confidence <= 100
      )
    ),

  constraint investo_market_signal_status_check
    check (
      status in (
        'active',
        'reviewed',
        'dismissed',
        'expired',
        'resolved'
      )
    ),

  constraint investo_market_signal_symbol_check
    check (
      symbol is null
      or symbol ~ '^[A-Z0-9.-]{1,15}$'
    ),

  constraint investo_market_signal_human_check
    check (requires_human_approval = true)
);

create table if not exists public.investo_portfolio_monitoring_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null
    references public.investo_portfolios(id) on delete cascade,

  monitoring_enabled boolean not null default true,
  valuation_review_enabled boolean not null default true,
  concentration_review_enabled boolean not null default true,
  thesis_change_review_enabled boolean not null default true,
  liquidity_review_enabled boolean not null default true,

  minimum_signal_severity integer not null default 3,
  review_cadence text not null default 'Daily',
  human_approval_required boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint investo_monitoring_severity_check
    check (minimum_signal_severity between 1 and 5),

  constraint investo_monitoring_human_check
    check (human_approval_required = true),

  constraint investo_monitoring_unique
    unique (user_id, portfolio_id)
);

create index if not exists investo_market_signals_portfolio_idx
  on public.investo_market_signals(
    user_id,
    portfolio_id,
    status,
    severity desc,
    detected_at desc
  );

create index if not exists investo_market_signals_symbol_idx
  on public.investo_market_signals(user_id, symbol, detected_at desc)
  where symbol is not null;

create index if not exists investo_market_signals_sleeve_idx
  on public.investo_market_signals(
    strategy_sleeve_id,
    status,
    detected_at desc
  )
  where strategy_sleeve_id is not null;

drop trigger if exists investo_portfolio_monitoring_updated_at
  on public.investo_portfolio_monitoring_settings;

create trigger investo_portfolio_monitoring_updated_at
before update on public.investo_portfolio_monitoring_settings
for each row execute function public.investo_set_updated_at();

create or replace function public.investo_validate_market_signal_scope()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  selected_portfolio public.investo_portfolios%rowtype;
  selected_sleeve public.investo_strategy_sleeves%rowtype;
  selected_holding public.investo_holdings%rowtype;
begin
  if new.portfolio_id is not null then
    select *
    into selected_portfolio
    from public.investo_portfolios
    where id = new.portfolio_id;

    if not found then
      raise exception 'Portfolio does not exist.';
    end if;

    if selected_portfolio.user_id <> new.user_id then
      raise exception 'Market signal does not match portfolio ownership.';
    end if;
  end if;

  if new.strategy_sleeve_id is not null then
    select *
    into selected_sleeve
    from public.investo_strategy_sleeves
    where id = new.strategy_sleeve_id;

    if not found then
      raise exception 'Strategy sleeve does not exist.';
    end if;

    if selected_sleeve.user_id <> new.user_id then
      raise exception 'Market signal does not match strategy ownership.';
    end if;

    if new.portfolio_id is not null
       and selected_sleeve.portfolio_id <> new.portfolio_id then
      raise exception 'Market signal strategy does not match portfolio.';
    end if;
  end if;

  if new.holding_id is not null then
    select *
    into selected_holding
    from public.investo_holdings
    where id = new.holding_id;

    if not found then
      raise exception 'Holding does not exist.';
    end if;

    if selected_holding.user_id <> new.user_id then
      raise exception 'Market signal does not match holding ownership.';
    end if;

    if new.portfolio_id is not null
       and selected_holding.portfolio_id <> new.portfolio_id then
      raise exception 'Market signal holding does not match portfolio.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists investo_market_signals_validate_scope
  on public.investo_market_signals;

create trigger investo_market_signals_validate_scope
before insert or update on public.investo_market_signals
for each row execute function public.investo_validate_market_signal_scope();

alter table public.investo_market_signals enable row level security;
alter table public.investo_portfolio_monitoring_settings
enable row level security;

create policy investo_market_signals_select_own
on public.investo_market_signals
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy investo_market_signals_insert_own
on public.investo_market_signals
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and requires_human_approval = true
);

create policy investo_market_signals_update_own
on public.investo_market_signals
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and requires_human_approval = true
);

create policy investo_market_signals_delete_own
on public.investo_market_signals
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy investo_monitoring_settings_select_own
on public.investo_portfolio_monitoring_settings
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy investo_monitoring_settings_insert_own
on public.investo_portfolio_monitoring_settings
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and human_approval_required = true
);

create policy investo_monitoring_settings_update_own
on public.investo_portfolio_monitoring_settings
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and human_approval_required = true
);

create policy investo_monitoring_settings_delete_own
on public.investo_portfolio_monitoring_settings
for delete
to authenticated
using ((select auth.uid()) = user_id);

comment on table public.investo_market_signals is
  'Evidence-backed portfolio and market signals prepared for human review.';

comment on table public.investo_portfolio_monitoring_settings is
  'User-owned monitoring settings that never authorize autonomous trading.';

commit;
