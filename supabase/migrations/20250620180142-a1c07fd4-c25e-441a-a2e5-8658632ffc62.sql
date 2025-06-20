
-- First, drop ALL existing policies for storage objects related to report-images
DROP POLICY IF EXISTS "Public can view report images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload report images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update report images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete report images" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous can upload to report images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view report images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload report images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update report images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete report images" ON storage.objects;

-- Ensure the bucket is properly configured
UPDATE storage.buckets 
SET public = true, 
    file_size_limit = 52428800, 
    allowed_mime_types = '{"image/jpeg","image/jpg","image/png","image/webp","image/gif"}'
WHERE id = 'report-images';

-- Create new comprehensive storage policies
CREATE POLICY "report_images_select_policy"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-images');

CREATE POLICY "report_images_insert_policy"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-images');

CREATE POLICY "report_images_update_policy"
ON storage.objects FOR UPDATE
USING (bucket_id = 'report-images');

CREATE POLICY "report_images_delete_policy"
ON storage.objects FOR DELETE
USING (bucket_id = 'report-images');

-- Ensure reports table has proper RLS policies
DROP POLICY IF EXISTS "Public can view reports" ON public.reports;
DROP POLICY IF EXISTS "Public can create reports" ON public.reports;
DROP POLICY IF EXISTS "Public can update reports" ON public.reports;

-- Create permissive policies for reports
CREATE POLICY "reports_select_policy"
ON public.reports FOR SELECT
USING (true);

CREATE POLICY "reports_insert_policy"
ON public.reports FOR INSERT
WITH CHECK (true);

CREATE POLICY "reports_update_policy"
ON public.reports FOR UPDATE
USING (true);
