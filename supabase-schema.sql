-- Запусти этот SQL в Supabase SQL Editor (Dashboard → SQL Editor → New query)

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000001',
  title text not null,
  description text not null default '',
  status text not null default 'pending' check (status in ('pending','in_progress','reported','completed','partial','overdue')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  deadline timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  report text,
  ai_verdict text,
  category text not null default 'general',
  estimated_minutes int,
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000001',
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists user_settings (
  user_id uuid primary key default '00000000-0000-0000-0000-000000000001',
  ai_mode text not null default 'companion' check (ai_mode in ('companion','boss')),
  model_id text not null default 'accounts/fireworks/models/glm-5p1',
  pin_hash text not null default '7579',
  updated_at timestamptz not null default now()
);

-- RLS: разрешаем доступ только по ключу (anon key = один пользователь)
alter table tasks enable row level security;
alter table chat_messages enable row level security;
alter table user_settings enable row level security;

create policy "Allow all for anon" on tasks for all using (true) with check (true);
create policy "Allow all for anon" on chat_messages for all using (true) with check (true);
create policy "Allow all for anon" on user_settings for all using (true) with check (true);

-- Индексы
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_created on tasks(created_at desc);
create index if not exists idx_chat_created on chat_messages(created_at desc);
