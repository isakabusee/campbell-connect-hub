
-- Add file_url column to bulletins
ALTER TABLE public.bulletins ADD COLUMN file_url text;

-- Create storage bucket for bulletin attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('bulletins', 'bulletins', true);

-- Storage policies for bulletin attachments
CREATE POLICY "Anyone can view bulletin files"
ON storage.objects FOR SELECT
USING (bucket_id = 'bulletins');

CREATE POLICY "Admins can upload bulletin files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bulletins' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bulletin files"
ON storage.objects FOR DELETE
USING (bucket_id = 'bulletins' AND public.has_role(auth.uid(), 'admin'));
