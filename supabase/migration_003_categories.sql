-- Migración 003: categoría de salida en visitas
-- Ejecutar en: Supabase Dashboard → SQL Editor

ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS category text
  NOT NULL DEFAULT 'merienda'
  CHECK (category IN ('merienda', 'cena', 'bar', 'brunch', 'almuerzo', 'otro'));
