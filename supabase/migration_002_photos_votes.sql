-- Migración 002: fotos en visitas + votos en places
-- Ejecutar en: Supabase Dashboard → SQL Editor

-- 1. Foto por visita
ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS photo_url text;

-- 2. Votos de la wishlist (quién quiere ir)
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS want_me boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS want_her boolean DEFAULT false;

-- 3. Bucket de fotos (ejecutar desde Supabase Dashboard → Storage → New bucket)
-- Nombre: visit-photos
-- Public: true
-- Crear la siguiente policy para permitir subida a usuarios autenticados:
--
-- INSERT policy:
--   Name: "authenticated upload"
--   Target roles: authenticated
--   WITH CHECK: true
--
-- SELECT policy:
--   Name: "public read"
--   Target roles: anon, authenticated
--   USING: true
