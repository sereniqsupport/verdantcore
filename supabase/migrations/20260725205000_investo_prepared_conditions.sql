begin;

create table if not exists public.investo_prepared_conditions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null
    references public.investo_portfolios(id) on delete cascade,
  strategy_sleeve_id uuid not null
    references public.investo_strategy_sleeves(id) on delete cascade,
  holding_id uuid
    references public.investo_holdings(id) on delete cascade,

  symbol text,
  condition_type text not null,
  title text not null,
  condition_description text not null,

  target_price numeric(24,8),
  trigger_value numeric(24,8),
  review_date date,
  expires_at timestamptz,

  status text not null default 'prepared',
  priority integer not null default 3,
  source text not null default 'human',

  requires_human_approval boolean not null default true,
  approved_at timestamptz,
  resolved_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint investo_prepared_condition_type_check
    check (
      condition_type in (
        'entry',
        'add',
        'review',
        'reduce',
        'exit'
      )
    ),

  constraint investo_prepared_condition_status_check
    check (
      status in (
        'prepared',
        'active',
        'met',
        'approved',
        'declined',
        'expired',
        'resolved'
      )
    ),

  constraint investo_prepared_condition_source_check
    check (
      source in (
        'human',
        'research',
        'portfolio_review',
        'market_signal'
      )
    ),

  constraint investo_prepared_condition_priority_check
    check (priority between 1 and 5),

  constraint investo_prepared_condition_symbol_check
    check (
      symbol is null
      or symbol ~ '^[A-Z0-9.-]{1,15}$'
    ),

  constraint investo_prepared_condition_price_check
    check (target_price is null or target_price >= 0),

  constraint investo_prepared_condition_trigger_check
    check (trigger_value is null or trigger_value >= 0),

  constraint investo_prepared_condition_human_check
    check (requires_human_approval = true)
);

create index if not exists investo_prepared_conditions_portfolio_idx
  on public.investo_prepared_conditions(
    user_id,
    portfolio_id,
    status,
    priority,
    created_at desc
  );

create index if not exists investo_prepared_conditions_sleeve_idx
  on public.investo_prepared_conditions(
    strategy_sleeve_id,
    condition_type,
    status
  );

create index if not exists investo_prepared_conditions_holding_idx
  on public.investo_prepared_conditions(holding_id)
  where holding_id is not null;

drop trigger if exists investo_prepared_conditions_updated_at
  on public.investo_prepared_conditions;

create trigger investo_prepared_conditions_updated_at
before update on public.investo_prepared_conditions
for each row execute function public.investo_set_updated_at();

create or replace function public.investo_validate_prepared_condition_scope()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  selected_sleeve public.investo_strategy_sleeves%rowtype;
  selected_holding public.investo_holdings%rowtype;
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
    raise exception 'Prepared condition does not match strategy ownership.';
  end if;

  if new.holding_id is not null then
    select *
    into selected_holding
    from public.investo_holdings
    where id = new.holding_id;

    if not found then
      raise exception 'Holding does not exist.';
    end if;

    if selected_holding.user_id <> new.user_id
       or selected_holding.portfolio_id <> new.portfolio_id then
      raise exception 'Prepared condition does not match holding ownership.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists investo_prepared_conditions_validate_scope
  on public.investo_prepared_conditions;

create trigger investo_prepared_conditions_validate_scope
before insert or update on public.investo_prepared_conditions
for each row execute function public.investo_validate_prepared_condition_scope();

alter table public.investo_prepared_conditions enable row level security;

create policy investo_prepared_conditions_select_own
on public.investo_prepared_conditions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy investo_prepared_conditions_insert_own
on public.investo_prepared_conditions
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and requires_human_approval = true
);

create policy investo_prepared_conditions_update_own
on public.investo_prepared_conditions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and requires_human_approval = true
);

create policy investo_prepared_conditions_delete_own
on public.investo_prepared_conditions
for delete
to authenticated
using ((select auth.uid()) = user_id);

comment on table public.investo_prepared_conditions is
  'Prepared entry, add, review, reduce, and exit conditions requiring human approval.';

commit;
