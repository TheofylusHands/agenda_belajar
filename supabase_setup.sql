-- Study Nest — jalankan di Supabase SQL Editor sebagai pemilik proyek.
-- Tabel data privat: setiap akun hanya bisa membaca dan mengubah baris miliknya.
create table if not exists public.study_nest_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  account_name text not null,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.study_nest_data enable row level security;
drop policy if exists "Study Nest select own data" on public.study_nest_data;
create policy "Study Nest select own data" on public.study_nest_data for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Study Nest insert own data" on public.study_nest_data;
create policy "Study Nest insert own data" on public.study_nest_data for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Study Nest update own data" on public.study_nest_data;
create policy "Study Nest update own data" on public.study_nest_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Peringkat XP antar pengguna: hanya profil yang sudah login boleh membaca.
create table if not exists public.study_nest_scores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  xp integer not null default 0 check (xp >= 0),
  updated_at timestamptz not null default now()
);

alter table public.study_nest_scores enable row level security;
drop policy if exists "Study Nest leaderboard read" on public.study_nest_scores;
create policy "Study Nest leaderboard read" on public.study_nest_scores for select to authenticated using (true);
drop policy if exists "Study Nest scores insert own" on public.study_nest_scores;
create policy "Study Nest scores insert own" on public.study_nest_scores for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Study Nest scores update own" on public.study_nest_scores;
create policy "Study Nest scores update own" on public.study_nest_scores for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Catatan: Supabase Auth perlu dikonfigurasi (Email provider).
-- Jangan letakkan service_role key di file HTML/browser.
