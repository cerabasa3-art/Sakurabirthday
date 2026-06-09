-- Jalankan semua di Supabase > SQL Editor > New query > Run

create table if not exists site_data (
  id bigint primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table site_data enable row level security;

drop policy if exists "public read site data" on site_data;
create policy "public read site data"
on site_data for select
using (true);

drop policy if exists "public insert site data" on site_data;
create policy "public insert site data"
on site_data for insert
with check (true);

drop policy if exists "public update site data" on site_data;
create policy "public update site data"
on site_data for update
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('music', 'music', true)
on conflict (id) do update set public = true;

-- Policy storage supaya admin web bisa upload pakai anon key.
-- Ini simple buat project romantis. Jangan pakai pola ini buat data penting/rahasia.

drop policy if exists "public read photos" on storage.objects;
create policy "public read photos"
on storage.objects for select
using (bucket_id = 'photos');

drop policy if exists "public upload photos" on storage.objects;
create policy "public upload photos"
on storage.objects for insert
with check (bucket_id = 'photos');

drop policy if exists "public read music" on storage.objects;
create policy "public read music"
on storage.objects for select
using (bucket_id = 'music');

drop policy if exists "public upload music" on storage.objects;
create policy "public upload music"
on storage.objects for insert
with check (bucket_id = 'music');
