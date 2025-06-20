
-- Create a storage bucket for report images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-images',
  'report-images', 
  true,
  52428800, -- 50MB limit
  '{"image/jpeg","image/jpg","image/png","image/webp","image/gif"}'
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for report images
CREATE POLICY IF NOT EXISTS "Anyone can view report images"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-images');

CREATE POLICY IF NOT EXISTS "Anyone can upload report images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-images');

CREATE POLICY IF NOT EXISTS "Anyone can update report images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'report-images');

CREATE POLICY IF NOT EXISTS "Anyone can delete report images"
ON storage.objects FOR DELETE
USING (bucket_id = 'report-images');
