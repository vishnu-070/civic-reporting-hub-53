
-- Create a storage bucket for report images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-images',
  'report-images', 
  true,
  52428800, -- 50MB limit
  '{"image/jpeg","image/jpg","image/png","image/webp","image/gif"}'
);

-- Create storage policies for report images
CREATE POLICY "Anyone can view report images"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-images');

CREATE POLICY "Authenticated users can upload report images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'report-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own report images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'report-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own report images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'report-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
