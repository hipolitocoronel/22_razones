ALTER TABLE visits ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT ARRAY[]::text[];

UPDATE visits SET photo_urls = ARRAY[photo_url] WHERE photo_url IS NOT NULL AND photo_url != '';
