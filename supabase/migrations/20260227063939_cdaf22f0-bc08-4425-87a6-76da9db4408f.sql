
-- Migrate from single file_url to multiple file_urls
ALTER TABLE public.bulletins ADD COLUMN file_urls text[] DEFAULT '{}';

-- Copy existing file_url data into array
UPDATE public.bulletins SET file_urls = ARRAY[file_url] WHERE file_url IS NOT NULL;

-- Drop old column
ALTER TABLE public.bulletins DROP COLUMN file_url;
