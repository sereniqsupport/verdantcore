begin;

alter table public.investo_decisions
  add column if not exists portfolio_id uuid,
  add column if not exists account_id uuid,
  add column if not exists holding_id uuid;

alter table public.investo_portfolio_actions
  add column if not exists account_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'investo_decisions_portfolio_id_fkey'
      and conrelid = 'public.investo_decisions'::regclass
  ) then
    alter table public.investo_decisions
      add constraint investo_decisions_portfolio_id_fkey
      foreign key (portfolio_id)
      references public.investo_portfolios(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'investo_decisions_account_id_fkey'
      and conrelid = 'public.investo_decisions'::regclass
  ) then
    alter table public.investo_decisions
      add constraint investo_decisions_account_id_fkey
      foreign key (account_id)
      references public.investo_accounts(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'investo_decisions_holding_id_fkey'
      and conrelid = 'public.investo_decisions'::regclass
  ) then
    alter table public.investo_decisions
      add constraint investo_decisions_holding_id_fkey
      foreign key (holding_id)
      references public.investo_holdings(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'investo_portfolio_actions_account_id_fkey'
      and conrelid = 'public.investo_portfolio_actions'::regclass
  ) then
    alter table public.investo_portfolio_actions
      add constraint investo_portfolio_actions_account_id_fkey
      foreign key (account_id)
      references public.investo_accounts(id)
      on delete set null;
  end if;
end
$$;

create index if not exists investo_decisions_portfolio_idx
  on public.investo_decisions(portfolio_id);

create index if not exists investo_decisions_account_idx
  on public.investo_decisions(account_id);

create index if not exists investo_decisions_holding_idx
  on public.investo_decisions(holding_id);

create index if not exists investo_portfolio_actions_account_idx
  on public.investo_portfolio_actions(account_id);

create unique index if not exists investo_portfolio_actions_one_execution_per_decision
  on public.investo_portfolio_actions(decision_id)
  where decision_id is not null;

create or replace function public.investo_validate_decision_execution_scope()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  selected_portfolio public.investo_portfolios%rowtype;
  selected_account public.investo_accounts%rowtype;
  selected_holding public.investo_holdings%rowtype;
begin
  if new.portfolio_id is not null then
    select *
    into selected_portfolio
    from public.investo_portfolios
    where id = new.portfolio_id;

    if not found then
      raise exception 'Selected portfolio does not exist.';
    end if;

    if selected_portfolio.user_id <> new.user_id then
      raise exception 'Selected portfolio does not belong to the decision owner.';
    end if;
  end if;

  if new.account_id is not null then
    select *
    into selected_account
    from public.investo_accounts
    where id = new.account_id;

    if not found then
      raise exception 'Selected account does not exist.';
    end if;

    if selected_account.user_id <> new.user_id then
      raise exception 'Selected account does not belong to the decision owner.';
    end if;

    if new.portfolio_id is not null
       and selected_account.portfolio_id <> new.portfolio_id then
      raise exception 'Selected account does not belong to the selected portfolio.';
    end if;
  end if;

  if new.holding_id is not null then
    select *
    into selected_holding
    from public.investo_holdings
    where id = new.holding_id;

    if not found then
      raise exception 'Selected holding does not exist.';
    end if;

    if selected_holding.user_id <> new.user_id then
      raise exception 'Selected holding does not belong to the decision owner.';
    end if;

    if new.portfolio_id is not null
       and selected_holding.portfolio_id <> new.portfolio_id then
      raise exception 'Selected holding does not belong to the selected portfolio.';
    end if;

    if new.account_id is not null
       and selected_holding.account_id is distinct from new.account_id then
      raise exception 'Selected holding does not belong to the selected account.';
    end if;

    if upper(selected_holding.symbol) <> upper(new.symbol) then
      raise exception 'Selected holding symbol does not match the decision symbol.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists investo_decisions_validate_execution_scope
  on public.investo_decisions;

create trigger investo_decisions_validate_execution_scope
before insert or update of
  user_id,
  portfolio_id,
  account_id,
  holding_id,
  symbol
on public.investo_decisions
for each row
execute function public.investo_validate_decision_execution_scope();

create or replace function public.investo_validate_portfolio_action_scope()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  selected_portfolio public.investo_portfolios%rowtype;
  selected_account public.investo_accounts%rowtype;
  selected_holding public.investo_holdings%rowtype;
  selected_decision public.investo_decisions%rowtype;
begin
  select *
  into selected_portfolio
  from public.investo_portfolios
  where id = new.portfolio_id;

  if not found then
    raise exception 'Selected portfolio does not exist.';
  end if;

  if selected_portfolio.user_id <> new.user_id then
    raise exception 'Selected portfolio does not belong to the action owner.';
  end if;

  if new.account_id is not null then
    select *
    into selected_account
    from public.investo_accounts
    where id = new.account_id;

    if not found then
      raise exception 'Selected account does not exist.';
    end if;

    if selected_account.user_id <> new.user_id
       or selected_account.portfolio_id <> new.portfolio_id then
      raise exception 'Selected account does not belong to the action portfolio.';
    end if;
  end if;

  if new.holding_id is not null then
    select *
    into selected_holding
    from public.investo_holdings
    where id = new.holding_id;

    if not found then
      raise exception 'Selected holding does not exist.';
    end if;

    if selected_holding.user_id <> new.user_id
       or selected_holding.portfolio_id <> new.portfolio_id then
      raise exception 'Selected holding does not belong to the action portfolio.';
    end if;

    if new.account_id is not null
       and selected_holding.account_id is distinct from new.account_id then
      raise exception 'Selected holding does not belong to the action account.';
    end if;

    if upper(selected_holding.symbol) <> upper(new.symbol) then
      raise exception 'Selected holding symbol does not match the action symbol.';
    end if;
  end if;

  if new.decision_id is not null then
    select *
    into selected_decision
    from public.investo_decisions
    where id = new.decision_id;

    if not found then
      raise exception 'Selected decision does not exist.';
    end if;

    if selected_decision.user_id <> new.user_id then
      raise exception 'Selected decision does not belong to the action owner.';
    end if;

    if selected_decision.status <> 'approved' then
      raise exception 'Only approved decisions may create execution records.';
    end if;

    if upper(selected_decision.symbol) <> upper(new.symbol) then
      raise exception 'Decision symbol does not match the action symbol.';
    end if;

    if selected_decision.portfolio_id is not null
       and selected_decision.portfolio_id <> new.portfolio_id then
      raise exception 'Decision portfolio does not match the action portfolio.';
    end if;

    if selected_decision.account_id is not null
       and selected_decision.account_id is distinct from new.account_id then
      raise exception 'Decision account does not match the action account.';
    end if;

    if selected_decision.holding_id is not null
       and selected_decision.holding_id is distinct from new.holding_id then
      raise exception 'Decision holding does not match the action holding.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists investo_portfolio_actions_validate_scope
  on public.investo_portfolio_actions;

create trigger investo_portfolio_actions_validate_scope
before insert or update of
  user_id,
  portfolio_id,
  account_id,
  holding_id,
  decision_id,
  symbol
on public.investo_portfolio_actions
for each row
execute function public.investo_validate_portfolio_action_scope();

comment on column public.investo_decisions.portfolio_id is
  'Portfolio selected by the user for an approved investment decision.';

comment on column public.investo_decisions.account_id is
  'Account selected by the user for deterministic execution reconciliation.';

comment on column public.investo_decisions.holding_id is
  'Existing holding selected for add, trim, sell, or exit reconciliation.';

comment on column public.investo_portfolio_actions.account_id is
  'Account associated with the manually recorded execution.';

comment on index public.investo_portfolio_actions_one_execution_per_decision is
  'Prevents a decision from generating more than one execution record.';

commit;
