-- =====================================================================
-- Hucha Familiar · esquema de base de datos (Supabase / PostgreSQL)
-- Pega todo este archivo en Supabase → SQL Editor → New query → Run.
-- =====================================================================

-- 1. Quién puede usar la app. Solo los emails de esta tabla ven y tocan datos.
create table if not exists public.family_members (
  email text primary key
);

-- 👇 CAMBIA estos emails por los vuestros y vuelve a ejecutar si añades a alguien.
insert into public.family_members (email) values
  ('tu-email@ejemplo.com'),
  ('otro-email@ejemplo.com')
on conflict do nothing;

create or replace function public.is_family_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.family_members
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- 2. Nombre visible de cada persona ("Ana", "Luis"...).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30)
);

-- 3. Movimientos de dinero.
create table if not exists public.movements (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  kind text not null check (kind in ('rent', 'expense_ec', 'transfer', 'expense_es', 'adjust_ec', 'adjust_es')),
  amount_usd numeric(12, 2),
  amount_eur numeric(12, 2),
  flat text check (flat in ('piso1', 'piso2', 'piso3', 'local')),
  concept text not null check (char_length(concept) between 1 and 140),
  created_by uuid not null default auth.uid() references auth.users (id),
  created_by_name text not null,
  created_at timestamptz not null default now(),

  -- Cada tipo lleva las cantidades que le tocan.
  constraint amounts_match_kind check (
    case kind
      when 'rent'       then amount_usd > 0 and amount_eur is null and flat is not null
      when 'expense_ec' then amount_usd > 0 and amount_eur is null
      when 'transfer'   then amount_usd > 0 and amount_eur > 0 and flat is null
      when 'expense_es' then amount_eur > 0 and amount_usd is null and flat is null
      when 'adjust_ec'  then amount_usd is not null and amount_eur is null and flat is null
      when 'adjust_es'  then amount_eur is not null and amount_usd is null and flat is null
    end
  )
);

create index if not exists movements_date_idx on public.movements (date desc);

-- 4. Seguridad: Row Level Security. Sin esto, cualquiera con la anon key podría leer.
alter table public.family_members enable row level security;
alter table public.profiles enable row level security;
alter table public.movements enable row level security;

drop policy if exists "family reads profiles" on public.profiles;
create policy "family reads profiles" on public.profiles
  for select to authenticated using (public.is_family_member());

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all to authenticated
  using (id = auth.uid() and public.is_family_member())
  with check (id = auth.uid() and public.is_family_member());

drop policy if exists "family manages movements" on public.movements;
create policy "family manages movements" on public.movements
  for all to authenticated
  using (public.is_family_member())
  with check (public.is_family_member());

-- 4b. Permisos de tabla. Algunos proyectos de Supabase no los dan por defecto;
-- sin ellos, "authenticated" no puede leer ni escribir aunque las políticas lo permitan.
-- family_members no se toca desde la app: solo la lee is_family_member().
revoke all on public.family_members from anon, authenticated;
revoke all on public.profiles, public.movements from anon;
grant select, insert, update, delete on public.profiles, public.movements to authenticated;

-- 5. Tiempo real: que los cambios de una se vean al momento en el móvil de la otra.
do $$
begin
  alter publication supabase_realtime add table public.movements;
exception when duplicate_object then null;
end $$;
