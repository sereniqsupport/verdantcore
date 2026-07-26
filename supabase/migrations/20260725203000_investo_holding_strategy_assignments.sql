begin;

create table if not exists public.investo_holding_strategy_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null
    references public.investo_portfolios(id) on delete cascade,
  holding_id uuid not null
    references public.investo_holdings(id) on delete cascade,
  strategy_sleeve_id uuid not null
    references public.investo_strategy_sleeves(id) on delete cascade,

  assignment_reason text,
  assigned_by text not null default 'human',
  human_approved boolean not null default true,

  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint investo_holding_strategy_assigned_by_check
    check (assigned_by in ('human', 'prepared_recommendation')),

  constraint investo_holding_strategy_human_check
    check (human_approved = true),

  constraint investo_holding_strategy_unique
    unique (user_id, portfolio_id, holding_id)
);

create index if not exists investo_holding_strategy_portfolio_idx
  on public.investo_holding_strategy_assignments(
    user_id,
    portfolio_id,
    strategy_sleeve_id
  );

create index if not exists investo_holding_strategy_holding_idx
  on public.investo_holding_strategy_assignments(holding_id);

drop trigger if exists investo_holding_strategy_updated_at
  on public.investo_holding_strategy_assignments;

create trigger investo_holding_strategy_updated_at
before update on public.investo_holding_strategy_assignments
for each row execute function public.investo_set_updated_at();

create or replace function public.investo_validate_holding_strategy_scope()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  selected_holding public.investo_holdings%rowtype;
  selected_sleeve public.investo_strategy_sleeves%rowtype;
begin
  select *
  into selected_holding
  from public.investo_holdings
  where id = new.holding_id;

  if not found then
    raise exception 'Holding does not exist.';
  end if;

  select *
  into selected_sleeve
  from public.investo_strategy_sleeves
  where id = new.strategy_sleeve_id;

  if not found then
    raise exception 'Strategy sleeve does not exist.';
  end if;

  if selected_holding.user_id <> new.user_id
     or selected_holding.portfolio_id <> new.portfolio_id then
    raise exception 'Holding assignment does not match the selected portfolio.';
  end if;

  if selected_sleeve.user_id <> new.user_id
     or selected_sleeve.portfolio_id <> new.portfolio_id then
    raise exception 'Strategy sleeve does not match the selected portfolio.';
  end if;

  return new;
end;
$$;

drop trigger if exists investo_holding_strategy_validate_scope
  on public.investo_holding_strategy_assignments;

create trigger investo_holding_strategy_validate_scope
before insert or update on public.investo_holding_strategy_assignments
for each row execute function public.investo_validate_holding_strategy_scope();

alter table public.investo_holding_strategy_assignments
enable row level security;

create policy investo_holding_strategy_select_own
on public.investo_holding_strategy_assignments
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy investo_holding_strategy_insert_own
on public.investo_holding_strategy_assignments
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and human_approved = true
);

create policy investo_holding_strategy_update_own
on public.investo_holding_strategy_assignments
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and human_approved = true
);

create policy investo_holding_strategy_delete_own
on public.investo_holding_strategy_assignments
for delete
to authenticated
using ((select auth.uid()) = user_id);

comment on table public.investo_holding_strategy_assignments is
  'Additive strategy classification for holdings without changing holding records.';

commit;
