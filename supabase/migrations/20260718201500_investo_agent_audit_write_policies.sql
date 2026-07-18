begin;

drop policy if exists
  "Users create their own agent runs"
on public.investo_agent_runs;

create policy
  "Users create their own agent runs"
on public.investo_agent_runs
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);

drop policy if exists
  "Users update their own agent runs"
on public.investo_agent_runs;

create policy
  "Users update their own agent runs"
on public.investo_agent_runs
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);

comment on table public.investo_agent_runs is
  'Private audit history for authenticated Investo model activity.';

commit;
