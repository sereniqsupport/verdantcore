begin;

create table if not exists public.investo_position_sizing_controls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null
    references public.investo_portfolios(id) on delete cascade,
  strategy_sleeve_id uuid not null
    references public.investo_strategy_sleeves(id) on delete cascade,

  minimum_position_percent numeric(7,4) not null default 0,
  standard_position_percent numeric(7,4) not null default 3,
  maximum_position_percent numeric(7,4) not null default 10,
  maximum_sector_percent numeric(7,4) not null default 25,
  maximum_single_asset_risk_percent numeric(7,4) not null default 2,

  require_margin_of_safety boolean not null default true,
  require_diversification_review boolean not null default true,
  require_liquidity_review boolean not null default true,
  human_approval_required boolean not null default true,

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint investo_position_size_minimum_check
    check (
      minimum_position_percent >= 0
      and minimum_position_percent <= 100
    ),

  constraint investo_position_size_standard_check
    check (
      standard_position_percent >= 0
      and standard_position_percent <= 100
    ),

  constraint investo_position_size_maximum_check
    check (
      maximum_position_percent >= 0
      and maximum_position_percent <= 100
    ),

  constraint investo_position_size_sector_check
    check (
      maximum_sector_percent >= 0
      and maximum_sector_percent <= 100
    ),

  constraint investo_position_size_risk_check
    check (
      maximum_single_asset_risk_percent >= 0
      and maximum_single_asset_risk_percent <= 100
    ),

  constraint investo_position_size_order_check
    check (
      minimum_position_percent <= standard_position_percent
      and standard_position_percent <= maximum_position_percent
    ),

  constraint investo_position_size_human_check
    check (human_approval_required = true),

  constraint investo_position_size_unique
    unique (user_id, portfolio_id, strategy_sleeve_id)
);

create index if not exists investo_position_sizing_portfolio_idx
  on public.investo_position_sizing_controls(
    user_id,
    portfolio_id,
    strategy_sleeve_id
  );

drop trigger if exists investo_position_sizing_updated_at
  on public.investo_position_sizing_controls;

create trigger investo_position_sizing_updated_at
before update on public.investo_position_sizing_controls
for each row execute function public.investo_set_updated_at();

create or replace function public.investo_validate_position_sizing_scope()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  selected_sleeve public.investo_strategy_sleeves%rowtype;
begin
  select *
  into selected_sleeve
  from public.investo_strategy_sleeves
  where id = new.strategy_sleeve_id;

  if not found then
    raise exception 'Strategy sleeve does not exist.';
  end if;

  if selected_sleeve.user_id <> new.user_id
     or selected_sleeve.portfolio_id <> new.portfolio_id then
    raise exception 'Position sizing control does not match strategy ownership.';
  end if;

  return new;
end;
$$;

drop trigger if exists investo_position_sizing_validate_scope
  on public.investo_position_sizing_controls;

create trigger investo_position_sizing_validate_scope
before insert or update on public.investo_position_sizing_controls
for each row execute function public.investo_validate_position_sizing_scope();

alter table public.investo_position_sizing_controls
enable row level security;

create policy investo_position_sizing_select_own
on public.investo_position_sizing_controls
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy investo_position_sizing_insert_own
on public.investo_position_sizing_controls
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and human_approval_required = true
);

create policy investo_position_sizing_update_own
on public.investo_position_sizing_controls
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and human_approval_required = true
);

create policy investo_position_sizing_delete_own
on public.investo_position_sizing_controls
for delete
to authenticated
using ((select auth.uid()) = user_id);

comment on table public.investo_position_sizing_controls is
  'Human-approved portfolio concentration and position-sizing boundaries.';

commit;
