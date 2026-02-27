
-- Create sermons table
CREATE TABLE public.sermons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  speaker TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  audio_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published sermons"
  ON public.sermons FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage sermons"
  ON public.sermons FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_sermons_updated_at
  BEFORE UPDATE ON public.sermons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for sermon audio
INSERT INTO storage.buckets (id, name, public) VALUES ('sermons', 'sermons', true);

CREATE POLICY "Anyone can view sermon files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sermons');

CREATE POLICY "Admins can upload sermon files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sermons' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sermon files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'sermons' AND public.has_role(auth.uid(), 'admin'::app_role));
