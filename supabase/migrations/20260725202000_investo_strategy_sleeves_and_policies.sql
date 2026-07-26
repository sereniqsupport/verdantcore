begin;

create table if not exists public.investo_strategy_sleeves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null
    references public.investo_portfolios(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint investo_strategy_sleeves_code_check
    check (code in ('protective', 'enterprising', 'swing', 'reserve')),

  constraint investo_strategy_sleeves_name_check
    check (length(trim(name)) between 1 and 100),

  constraint investo_strategy_sleeves_display_order_check
    check (display_order between 0 and 100),

  constraint investo_strategy_sleeves_unique
    unique (user_id, portfolio_id, code)
);

create table if not exists public.investo_strategy_policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null
    references public.investo_portfolios(id) on delete cascade,
  strategy_sleeve_id uuid not null
    references public.investo_strategy_sleeves(id) on delete cascade,

  target_allocation_percent numeric(7,4) not null default 0,
  maximum_allocation_percent numeric(7,4) not null default 100,
  maximum_position_percent numeric(7,4) not null default 10,
  minimum_cash_reserve_percent numeric(7,4) not null default 0,

  expected_holding_period text not null default 'Long term',
  review_cadence text not null default 'Quarterly',
  minimum_margin_of_safety_percent numeric(7,4) not null default 0,

  human_approval_required boolean not null default true,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint investo_strategy_policy_target_check
    check (
      target_allocation_percent >= 0
      and target_allocation_percent <= 100
    ),

  constraint investo_strategy_policy_maximum_check
    check (
      maximum_allocation_percent >= 0
      and maximum_allocation_percent <= 100
    ),

  constraint investo_strategy_policy_position_check
    check (
      maximum_position_percent >= 0
      and maximum_position_percent <= 100
    ),

  constraint investo_strategy_policy_cash_check
    check (
      minimum_cash_reserve_percent >= 0
      and minimum_cash_reserve_percent <= 100
    ),

  constraint investo_strategy_policy_margin_check
    check (
      minimum_margin_of_safety_percent >= 0
      and minimum_margin_of_safety_percent <= 100
    ),

  constraint investo_strategy_policy_allocation_order_check
    check (target_allocation_percent <= maximum_allocation_percent),

  constraint investo_strategy_policy_human_approval_check
    check (human_approval_required = true),

  constraint investo_strategy_policy_unique
    unique (user_id, portfolio_id, strategy_sleeve_id)
);

create index if not exists investo_strategy_sleeves_portfolio_idx
  on public.investo_strategy_sleeves(user_id, portfolio_id, display_order);

create index if not exists investo_strategy_policies_portfolio_idx
  on public.investo_strategy_policies(user_id, portfolio_id);

create index if not exists investo_strategy_policies_sleeve_idx
  on public.investo_strategy_policies(strategy_sleeve_id);

drop trigger if exists investo_strategy_sleeves_updated_at
  on public.investo_strategy_sleeves;

create trigger investo_strategy_sleeves_updated_at
before update on public.investo_strategy_sleeves
for each row execute function public.investo_set_updated_at();

drop trigger if exists investo_strategy_policies_updated_at
  on public.investo_strategy_policies;

create trigger investo_strategy_policies_updated_at
before update on public.investo_strategy_policies
for each row execute function public.investo_set_updated_at();

create or replace function public.investo_validate_strategy_sleeve_scope()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  selected_portfolio public.investo_portfolios%rowtype;
begin
  select *
  into selected_portfolio
  from public.investo_portfolios
  where id = new.portfolio_id;

  if not found then
    raise exception 'Portfolio does not exist.';
  end if;

  if selected_portfolio.user_id <> new.user_id then
    raise exception 'Strategy sleeve ownership does not match portfolio ownership.';
  end if;

  return new;
end;
$$;

drop trigger if exists investo_strategy_sleeves_validate_scope
  on public.investo_strategy_sleeves;

create trigger investo_strategy_sleeves_validate_scope
before insert or update on public.investo_strategy_sleeves
for each row execute function public.investo_validate_strategy_sleeve_scope();

create or replace function public.investo_validate_strategy_policy_scope()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  selected_portfolio public.investo_portfolios%rowtype;
  selected_sleeve public.investo_strategy_sleeves%rowtype;
begin
  select *
  into selected_portfolio
  from public.investo_portfolios
  where id = new.portfolio_id;

  if not found then
    raise exception 'Portfolio does not exist.';
  end if;

  select *
  into selected_sleeve
  from public.investo_strategy_sleeves
  where id = new.strategy_sleeve_id;

  if not found then
    raise exception 'Strategy sleeve does not exist.';
  end if;

  if selected_portfolio.user_id <> new.user_id then
    raise exception 'Strategy policy ownership does not match portfolio ownership.';
  end if;

  if selected_sleeve.user_id <> new.user_id
     or selected_sleeve.portfolio_id <> new.portfolio_id then
    raise exception 'Strategy policy does not match the selected sleeve.';
  end if;

  return new;
end;
$$;

drop trigger if exists investo_strategy_policies_validate_scope
  on public.investo_strategy_policies;

create trigger investo_strategy_policies_validate_scope
before insert or update on public.investo_strategy_policies
for each row execute function public.investo_validate_strategy_policy_scope();

alter table public.investo_strategy_sleeves enable row level security;
alter table public.investo_strategy_policies enable row level security;

create policy investo_strategy_sleeves_select_own
on public.investo_strategy_sleeves
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy investo_strategy_sleeves_insert_own
on public.investo_strategy_sleeves
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy investo_strategy_sleeves_update_own
on public.investo_strategy_sleeves
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy investo_strategy_sleeves_delete_own
on public.investo_strategy_sleeves
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy investo_strategy_policies_select_own
on public.investo_strategy_policies
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy investo_strategy_policies_insert_own
on public.investo_strategy_policies
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and human_approval_required = true
);

create policy investo_strategy_policies_update_own
on public.investo_strategy_policies
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and human_approval_required = true
);

create policy investo_strategy_policies_delete_own
on public.investo_strategy_policies
for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.investo_bootstrap_strategy_sleeves(
  selected_portfolio_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  acting_user_id uuid := auth.uid();
begin
  if acting_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.investo_portfolios
    where id = selected_portfolio_id
      and user_id = acting_user_id
  ) then
    raise exception 'Portfolio is unavailable.';
  end if;

  insert into public.investo_strategy_sleeves (
    user_id,
    portfolio_id,
    code,
    name,
    description,
    display_order
  )
  values
    (
      acting_user_id,
      selected_portfolio_id,
      'protective',
      'Protective Investing',
      'Long-term capital protection, durable income, and measured compounding.',
      10
    ),
    (
      acting_user_id,
      selected_portfolio_id,
      'enterprising',
      'Enterprising Investing',
      'Long-term researched opportunities purchased with a margin of safety.',
      20
    ),
    (
      acting_user_id,
      selected_portfolio_id,
      'swing',
      'Swing Opportunities',
      'Controlled medium-term opportunities with defined entry and exit rules.',
      30
    ),
    (
      acting_user_id,
      selected_portfolio_id,
      'reserve',
      'Reserve Capital',
      'Cash and short-duration reserves maintained for protection and opportunity.',
      40
    )
  on conflict (user_id, portfolio_id, code)
  do update set
    name = excluded.name,
    description = excluded.description,
    display_order = excluded.display_order,
    is_active = true;

  insert into public.investo_strategy_policies (
    user_id,
    portfolio_id,
    strategy_sleeve_id,
    target_allocation_percent,
    maximum_allocation_percent,
    maximum_position_percent,
    minimum_cash_reserve_percent,
    expected_holding_period,
    review_cadence,
    minimum_margin_of_safety_percent,
    human_approval_required
  )
  select
    sleeve.user_id,
    sleeve.portfolio_id,
    sleeve.id,
    case sleeve.code
      when 'protective' then 50
      when 'enterprising' then 25
      when 'swing' then 10
      when 'reserve' then 15
    end,
    case sleeve.code
      when 'protective' then 70
      when 'enterprising' then 40
      when 'swing' then 15
      when 'reserve' then 35
    end,
    case sleeve.code
      when 'protective' then 10
      when 'enterprising' then 8
      when 'swing' then 5
      when 'reserve' then 100
    end,
    case sleeve.code
      when 'reserve' then 15
      else 0
    end,
    case sleeve.code
      when 'protective' then 'Five years or longer'
      when 'enterprising' then 'Three years or longer'
      when 'swing' then 'Weeks to months'
      when 'reserve' then 'Available capital'
    end,
    case sleeve.code
      when 'protective' then 'Quarterly'
      when 'enterprising' then 'Monthly'
      when 'swing' then 'Weekly'
      when 'reserve' then 'Monthly'
    end,
    case sleeve.code
      when 'protective' then 15
      when 'enterprising' then 25
      when 'swing' then 10
      when 'reserve' then 0
    end,
    true
  from public.investo_strategy_sleeves sleeve
  where sleeve.user_id = acting_user_id
    and sleeve.portfolio_id = selected_portfolio_id
  on conflict (user_id, portfolio_id, strategy_sleeve_id)
  do nothing;
end;
$$;

revoke all on function public.investo_bootstrap_strategy_sleeves(uuid)
from public;

grant execute on function public.investo_bootstrap_strategy_sleeves(uuid)
to authenticated;

comment on table public.investo_strategy_sleeves is
  'Additive capital strategy classifications for each Investo portfolio.';

comment on table public.investo_strategy_policies is
  'Human-approved allocation and review policies for Investo strategy sleeves.';

commit;
