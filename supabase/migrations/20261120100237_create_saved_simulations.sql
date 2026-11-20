create table if not exists public.saved_simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  asset_name text not null,
  snapshot jsonb not null,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists saved_simulations_user_created_idx
  on public.saved_simulations (user_id, created_at desc);
alter table public.saved_simulations enable row level security;
create policy "Users can read their own saved simulations"
  on public.saved_simulations for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can insert their own saved simulations"
  on public.saved_simulations for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can update their own saved simulations"
  on public.saved_simulations for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete their own saved simulations"
  on public.saved_simulations for delete to authenticated
  using ((select auth.uid()) = user_id);
revoke all on public.saved_simulations from anon;
grant select, insert, update, delete on public.saved_simulations to authenticated;
