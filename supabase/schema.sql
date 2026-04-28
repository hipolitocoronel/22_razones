-- Lugares
create table places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat numeric,
  lng numeric,
  type text check (type in ('cafe', 'confiteria', 'bar', 'panaderia', 'otro')),
  maps_url text,
  instagram_url text,
  has_parking boolean default false,
  pet_friendly boolean default false,
  vegan_options boolean default false,
  noise_level text check (noise_level in ('tranquilo', 'moderado', 'ruidoso')),
  schedule text,
  accepts_reservation boolean default false,
  created_at timestamptz default now()
);

-- Visitas
create table visits (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references places(id) on delete cascade not null,
  date date not null,
  score integer check (score between 1 and 5),
  ordered text,
  price integer,
  notes text,
  come_back text check (come_back in ('si', 'no', 'tal_vez')),
  special_moment boolean default false,
  suggested_by text,
  mood text,
  weather text,
  created_at timestamptz default now()
);

-- Wishlist
create table wishlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  source text,
  votes integer default 0,
  created_at timestamptz default now()
);

-- Tags
create table tags (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references places(id) on delete cascade not null,
  label text not null
);

-- RLS: solo usuarios autenticados
alter table places enable row level security;
alter table visits enable row level security;
alter table wishlist enable row level security;
alter table tags enable row level security;

create policy "authenticated only" on places for all to authenticated using (true) with check (true);
create policy "authenticated only" on visits for all to authenticated using (true) with check (true);
create policy "authenticated only" on wishlist for all to authenticated using (true) with check (true);
create policy "authenticated only" on tags for all to authenticated using (true) with check (true);
