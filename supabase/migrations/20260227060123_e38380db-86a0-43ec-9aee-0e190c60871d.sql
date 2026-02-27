
-- Albums table
CREATE TABLE public.albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  event_date DATE,
  published BOOLEAN NOT NULL DEFAULT true,
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published albums"
  ON public.albums FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage albums"
  ON public.albums FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON public.albums
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Photos table
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos in published albums"
  ON public.photos FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.albums WHERE id = album_id AND published = true));

CREATE POLICY "Admins can manage photos"
  ON public.photos FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit) VALUES ('gallery', 'gallery', true, 10485760);

CREATE POLICY "Anyone can view gallery files"
  ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete gallery files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'::app_role));
