create table public.design_themes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  prompt text not null,
  sort_order integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.design_themes enable row level security;

create policy "Users can view own themes" on public.design_themes for select using (auth.uid() = user_id);
create policy "Users can insert own themes" on public.design_themes for insert with check (auth.uid() = user_id);
create policy "Users can update own themes" on public.design_themes for update using (auth.uid() = user_id);
create policy "Users can delete own themes" on public.design_themes for delete using (auth.uid() = user_id);

create index idx_design_themes_user_id on public.design_themes(user_id);
