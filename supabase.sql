-- WAG1 anonim istek sistemi için Supabase SQL kurulumu.
-- Bu SQL'i Supabase Dashboard > SQL Editor bölümünde çalıştır.
-- Aşağıdaki ADMIN_EMAIL değerini kendi yönetici hesabının e-postasıyla değiştir.

create extension if not exists pgcrypto;

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  class_name text not null check (char_length(class_name) between 1 and 30),
  message text not null check (char_length(message) between 3 and 1000),
  created_at timestamptz not null default now()
);

alter table public.requests enable row level security;

-- Ziyaretçiler yalnızca yeni istek ekleyebilir.
drop policy if exists "public can submit anonymous requests" on public.requests;
create policy "public can submit anonymous requests"
on public.requests
for insert
to anon
with check (
  char_length(class_name) between 1 and 30
  and char_length(message) between 3 and 1000
);

-- Listeleme ve silme yalnızca belirlediğin admin e-postasına sahip authenticated oturum için açık.
-- Supabase Authentication'da self-signup'ı kapalı tut.
create or replace function public.wag1_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('ADMIN_EMAIL');
$$;

drop policy if exists "authenticated admin can view requests" on public.requests;
create policy "authenticated admin can view requests"
on public.requests
for select
to authenticated
using (public.wag1_is_admin());

drop policy if exists "authenticated admin can delete requests" on public.requests;
create policy "authenticated admin can delete requests"
on public.requests
for delete
to authenticated
using (public.wag1_is_admin());

-- Anonim kullanıcıların kendi başına okuma/güncelleme/silme yetkisi yoktur.
revoke select, update, delete on public.requests from anon;
grant insert on public.requests to anon;
grant select, delete on public.requests to authenticated;
