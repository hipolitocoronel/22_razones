-- Migración 001: unificar places + wishlist en un solo flujo
-- Ejecutar en: Supabase Dashboard → SQL Editor

-- 1. Agregar columna status a places
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS status text
  NOT NULL DEFAULT 'por_ir'
  CHECK (status IN ('visitado', 'por_ir'));

-- 2. Marcar como visitado todos los lugares que ya tienen visitas
UPDATE places
SET status = 'visitado'
WHERE id IN (SELECT DISTINCT place_id FROM visits);

-- 3. Migrar wishlist a places (si hay filas)
INSERT INTO places (name, address, status)
SELECT name, address, 'por_ir'
FROM wishlist
ON CONFLICT DO NOTHING;

-- 4. Eliminar wishlist
DROP TABLE IF EXISTS wishlist;

-- 5. Eliminar tags (no se usa por ahora)
DROP TABLE IF EXISTS tags;
