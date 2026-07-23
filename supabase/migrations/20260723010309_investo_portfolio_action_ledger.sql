begin;

create table if not exists public.investo_portfolio_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null
    references public.investo_portfolios(id) on delete cascade,
  decision_id uuid
    references public.investo_decisions(id) on delete set null,
  holding_id uuid
    references public.investo_holdings(id) on delete set null,
  symbol text not null,
  action_type text not null,
  quantity numeric,
  execution_price numeric,
  total_value numeric,
  execution_note text,
  executed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint investo_portfolio_actions_symbol_check
    check (symbol ~ '^[A-Z0-9.-]{1,15}$'),

  constraint investo_portfolio_actions_action_check
    check (
      action_type in (
        'buy',
        'sell',
        'add',
        'trim',
        'exit',
        'hold',
        'watch',
        'no_action'
      )
    ),

  constraint investo_portfolio_actions_quantity_check
    check (quantity is null or quantity > 0),

  constraint investo_portfolio_actions_price_check
    check (execution_price is null or execution_price > 0),

  constraint investo_portfolio_actions_value_check
    check (total_value is null or total_value >= 0)
);

create index if not exists
  investo_portfolio_actions_user_created_idx
on public.investo_portfolio_actions (
  user_id,
  created_at desc
);

create index if not exists
  investo_portfolio_actions_portfolio_created_idx
on public.investo_portfolio_actions (
  portfolio_id,
  created_at desc
);

create index if not exists
  investo_portfolio_actions_decision_idx
on public.investo_portfolio_actions (
  decision_id
);

alter table public.investo_portfolio_actions enable row level security;

drop policy if exists
  "Users can read their portfolio actions"
on public.investo_portfolio_actions;

create policy
  "Users can read their portfolio actions"
on public.investo_portfolio_actions
for select
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists
  "Users can create their portfolio actions"
on public.investo_portfolio_actions;

create policy
  "Users can create their portfolio actions"
on public.investo_portfolio_actions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.investo_portfolios portfolio
    where portfolio.id = portfolio_id
      and portfolio.user_id = auth.uid()
  )
  and (
    decision_id is null
    or exists (
      select 1
      from public.investo_decisions decision
      where decision.id = decision_id
        and decision.user_id = auth.uid()
    )
  )
);

drop policy if exists
  "Users can update their portfolio actions"
on public.investo_portfolio_actions;

create policy
  "Users can update their portfolio actions"
on public.investo_portfolio_actions
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

drop policy if exists
  "Users can delete their portfolio actions"
on public.investo_portfolio_actions;

create policy
  "Users can delete their portfolio actions"
on public.investo_portfolio_actions
for delete
to authenticated
using (
  auth.uid() = user_id
);

grant select, insert, update, delete
on public.investo_portfolio_actions
to authenticated;

commit;
