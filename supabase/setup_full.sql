-- ============================================================
-- 22 Razones — Setup completo (proyecto nuevo en São Paulo)
-- Ejecutar todo de una vez en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. TABLAS
-- ──────────────────────────────────────────────

-- Lugares (visitados + por ir, unificados)
CREATE TABLE IF NOT EXISTS places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  lat numeric,
  lng numeric,
  type text CHECK (type IN ('cafe', 'confiteria', 'bar', 'panaderia', 'otro')),
  maps_url text,
  instagram_url text,
  has_parking boolean DEFAULT false,
  pet_friendly boolean DEFAULT false,
  vegan_options boolean DEFAULT false,
  noise_level text CHECK (noise_level IN ('tranquilo', 'moderado', 'ruidoso')),
  schedule text,
  accepts_reservation boolean DEFAULT false,
  status text NOT NULL DEFAULT 'por_ir' CHECK (status IN ('visitado', 'por_ir')),
  want_me boolean DEFAULT false,
  want_her boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Visitas
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid REFERENCES places(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  score integer CHECK (score BETWEEN 1 AND 5),
  ordered text,
  price integer,
  notes text,
  come_back text CHECK (come_back IN ('si', 'no', 'tal_vez')),
  special_moment boolean DEFAULT false,
  suggested_by text,
  mood text,
  weather text,
  category text NOT NULL DEFAULT 'merienda'
    CHECK (category IN ('merienda', 'cena', 'bar', 'brunch', 'almuerzo', 'otro')),
  photo_urls text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Índices para queries comunes
CREATE INDEX IF NOT EXISTS visits_place_id_idx ON visits(place_id);
CREATE INDEX IF NOT EXISTS visits_date_idx ON visits(date DESC);
CREATE INDEX IF NOT EXISTS places_status_idx ON places(status);

-- ──────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY
-- ──────────────────────────────────────────────

ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated only" ON places;
DROP POLICY IF EXISTS "authenticated only" ON visits;

CREATE POLICY "authenticated only" ON places
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "authenticated only" ON visits
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────
-- 3. STORAGE BUCKET (fotos de visitas)
-- ──────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('visit-photos', 'visit-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies del bucket
DROP POLICY IF EXISTS "public read visit-photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated upload visit-photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated update visit-photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated delete visit-photos" ON storage.objects;

-- Lectura pública (cualquiera puede ver las fotos por URL)
CREATE POLICY "public read visit-photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'visit-photos');

-- Subida solo autenticados
CREATE POLICY "authenticated upload visit-photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'visit-photos');

-- Update solo autenticados
CREATE POLICY "authenticated update visit-photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'visit-photos');

-- Delete solo autenticados
CREATE POLICY "authenticated delete visit-photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'visit-photos');

-- ============================================================
-- LISTO
-- Después de ejecutar esto, falta crear los dos usuarios desde
-- Authentication → Users → Add user (email + password con prefijo "el22_")
-- ============================================================
