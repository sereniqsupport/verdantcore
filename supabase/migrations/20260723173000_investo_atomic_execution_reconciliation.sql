begin;

create or replace function public.investo_record_decision_execution(
  p_decision_id uuid,
  p_quantity numeric,
  p_execution_price numeric,
  p_execution_note text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  acting_user_id uuid := auth.uid();

  selected_decision public.investo_decisions%rowtype;
  selected_portfolio public.investo_portfolios%rowtype;
  selected_account public.investo_accounts%rowtype;
  selected_holding public.investo_holdings%rowtype;

  normalized_action text;
  transaction_type text;

  execution_quantity numeric(24,8);
  execution_price numeric(20,6);
  execution_value numeric(22,4);

  previous_quantity numeric(24,8);
  previous_average_cost numeric(20,6);
  resulting_quantity numeric(24,8);
  resulting_average_cost numeric(20,6);
  resulting_market_value numeric(22,4);

  resolved_holding_id uuid;
  transaction_id uuid;
  portfolio_action_id uuid;
begin
  if acting_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if p_decision_id is null then
    raise exception 'A decision is required.';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Execution quantity must be greater than zero.';
  end if;

  if p_execution_price is null or p_execution_price <= 0 then
    raise exception 'Execution price must be greater than zero.';
  end if;

  execution_quantity := round(p_quantity, 8);
  execution_price := round(p_execution_price, 6);
  execution_value := round(execution_quantity * execution_price, 4);

  select *
  into selected_decision
  from public.investo_decisions
  where id = p_decision_id
    and user_id = acting_user_id
  for update;

  if not found then
    raise exception 'The selected decision does not exist.';
  end if;

  if selected_decision.status <> 'approved' then
    raise exception 'Only approved decisions may be recorded as executed.';
  end if;

  if selected_decision.executed_at is not null then
    raise exception 'This decision has already been executed.';
  end if;

  if exists (
    select 1
    from public.investo_portfolio_actions
    where decision_id = selected_decision.id
  ) then
    raise exception 'This decision already has an execution record.';
  end if;

  if selected_decision.portfolio_id is null then
    raise exception 'Select a portfolio before recording execution.';
  end if;

  if selected_decision.account_id is null then
    raise exception 'Select an investment account before recording execution.';
  end if;

  select *
  into selected_portfolio
  from public.investo_portfolios
  where id = selected_decision.portfolio_id
    and user_id = acting_user_id;

  if not found then
    raise exception 'The selected portfolio is unavailable.';
  end if;

  select *
  into selected_account
  from public.investo_accounts
  where id = selected_decision.account_id
    and user_id = acting_user_id
    and portfolio_id = selected_decision.portfolio_id
    and is_active = true;

  if not found then
    raise exception 'The selected investment account is unavailable.';
  end if;

  normalized_action := lower(trim(selected_decision.action::text));

  if normalized_action not in (
    'buy',
    'add',
    'trim',
    'sell',
    'exit'
  ) then
    raise exception
      'The approved decision action cannot change portfolio holdings: %.',
      normalized_action;
  end if;

  if selected_decision.holding_id is not null then
    select *
    into selected_holding
    from public.investo_holdings
    where id = selected_decision.holding_id
      and user_id = acting_user_id
      and portfolio_id = selected_decision.portfolio_id
      and account_id = selected_decision.account_id
    for update;

    if not found then
      raise exception 'The selected holding is unavailable.';
    end if;

    if upper(selected_holding.symbol) <>
       upper(selected_decision.symbol) then
      raise exception
        'The selected holding does not match the decision symbol.';
    end if;

    resolved_holding_id := selected_holding.id;
  else
    select *
    into selected_holding
    from public.investo_holdings
    where user_id = acting_user_id
      and portfolio_id = selected_decision.portfolio_id
      and account_id = selected_decision.account_id
      and upper(symbol) = upper(selected_decision.symbol)
    for update;

    if found then
      resolved_holding_id := selected_holding.id;
    end if;
  end if;

  if normalized_action in ('buy', 'add') then
    transaction_type := 'buy';

    if resolved_holding_id is null then
      insert into public.investo_holdings (
        user_id,
        portfolio_id,
        account_id,
        symbol,
        asset_name,
        asset_class,
        quantity,
        average_cost,
        current_price,
        market_value,
        currency,
        last_market_update_at
      )
      values (
        acting_user_id,
        selected_decision.portfolio_id,
        selected_decision.account_id,
        upper(selected_decision.symbol),
        upper(selected_decision.symbol),
        'equity',
        execution_quantity,
        execution_price,
        execution_price,
        execution_value,
        selected_portfolio.base_currency,
        now()
      )
      returning id
      into resolved_holding_id;

      previous_quantity := 0;
      previous_average_cost := 0;
      resulting_quantity := execution_quantity;
      resulting_average_cost := execution_price;
      resulting_market_value := execution_value;
    else
      previous_quantity := selected_holding.quantity;

      previous_average_cost := coalesce(
        selected_holding.average_cost,
        execution_price
      );

      resulting_quantity :=
        round(previous_quantity + execution_quantity, 8);

      /*
       * Weighted-average cost:
       * existing position cost plus new execution cost,
       * divided by the resulting total quantity.
       */
      resulting_average_cost :=
        round(
          (
            (previous_quantity * previous_average_cost)
            + (execution_quantity * execution_price)
          )
          / resulting_quantity,
          6
        );

      resulting_market_value :=
        round(resulting_quantity * execution_price, 4);

      update public.investo_holdings
      set
        quantity = resulting_quantity,
        average_cost = resulting_average_cost,
        current_price = execution_price,
        market_value = resulting_market_value,
        last_market_update_at = now()
      where id = resolved_holding_id
        and user_id = acting_user_id;
    end if;
  else
    transaction_type := 'sell';

    if resolved_holding_id is null then
      raise exception
        'An existing holding is required for trim, sell, or exit.';
    end if;

    previous_quantity := selected_holding.quantity;
    previous_average_cost := selected_holding.average_cost;

    if normalized_action = 'exit'
       and execution_quantity <> previous_quantity then
      raise exception
        'Exit quantity must equal the full current holding quantity of %.',
        previous_quantity;
    end if;

    if execution_quantity > previous_quantity then
      raise exception
        'Execution quantity exceeds the current holding quantity of %.',
        previous_quantity;
    end if;

    resulting_quantity :=
      round(previous_quantity - execution_quantity, 8);

    if resulting_quantity < 0 then
      raise exception 'Execution would create a negative holding.';
    end if;

    resulting_average_cost := previous_average_cost;

    resulting_market_value :=
      round(resulting_quantity * execution_price, 4);

    update public.investo_holdings
    set
      quantity = resulting_quantity,
      average_cost = resulting_average_cost,
      current_price = execution_price,
      market_value = resulting_market_value,
      last_market_update_at = now()
    where id = resolved_holding_id
      and user_id = acting_user_id;
  end if;

  insert into public.investo_transactions (
    user_id,
    portfolio_id,
    account_id,
    symbol,
    transaction_type,
    quantity,
    price,
    gross_amount,
    fees,
    net_amount,
    currency,
    trade_date,
    external_reference,
    notes
  )
  values (
    acting_user_id,
    selected_decision.portfolio_id,
    selected_decision.account_id,
    upper(selected_decision.symbol),
    transaction_type,
    execution_quantity,
    execution_price,
    execution_value,
    0,
    case
      when transaction_type = 'buy'
        then -execution_value
      else execution_value
    end,
    selected_portfolio.base_currency,
    current_date,
    selected_decision.id::text,
    nullif(trim(p_execution_note), '')
  )
  returning id
  into transaction_id;

  insert into public.investo_portfolio_actions (
    user_id,
    portfolio_id,
    account_id,
    holding_id,
    decision_id,
    symbol,
    action_type,
    quantity,
    execution_price,
    total_value,
    execution_note,
    executed_at
  )
  values (
    acting_user_id,
    selected_decision.portfolio_id,
    selected_decision.account_id,
    resolved_holding_id,
    selected_decision.id,
    upper(selected_decision.symbol),
    normalized_action,
    execution_quantity,
    execution_price,
    execution_value,
    coalesce(
      nullif(trim(p_execution_note), ''),
      'Execution recorded manually.'
    ),
    now()
  )
  returning id
  into portfolio_action_id;

  update public.investo_decisions
  set
    holding_id = resolved_holding_id,
    status = 'executed',
    executed_at = now(),
    decision_note = coalesce(
      nullif(trim(p_execution_note), ''),
      decision_note,
      'Execution recorded manually.'
    )
  where id = selected_decision.id
    and user_id = acting_user_id;

  return jsonb_build_object(
    'decision_id',
    selected_decision.id,
    'portfolio_id',
    selected_decision.portfolio_id,
    'account_id',
    selected_decision.account_id,
    'holding_id',
    resolved_holding_id,
    'transaction_id',
    transaction_id,
    'portfolio_action_id',
    portfolio_action_id,
    'symbol',
    upper(selected_decision.symbol),
    'action',
    normalized_action,
    'quantity',
    execution_quantity,
    'execution_price',
    execution_price,
    'total_value',
    execution_value,
    'previous_quantity',
    coalesce(previous_quantity, 0),
    'resulting_quantity',
    resulting_quantity,
    'resulting_average_cost',
    resulting_average_cost,
    'resulting_market_value',
    resulting_market_value,
    'executed_at',
    now()
  );
end;
$$;

revoke all
on function public.investo_record_decision_execution(
  uuid,
  numeric,
  numeric,
  text
)
from public;

revoke all
on function public.investo_record_decision_execution(
  uuid,
  numeric,
  numeric,
  text
)
from anon;

grant execute
on function public.investo_record_decision_execution(
  uuid,
  numeric,
  numeric,
  text
)
to authenticated;

comment on function public.investo_record_decision_execution(
  uuid,
  numeric,
  numeric,
  text
) is
  'Atomically records a human-approved execution, reconciles the account-level holding, creates transaction and portfolio activity records, and closes the decision.';

commit;
