
-- Check current constraint and fix the type check constraint
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_type_check;

-- Add the correct constraint that allows 'non-emergency' and 'emergency'
ALTER TABLE public.reports ADD CONSTRAINT reports_type_check 
CHECK (type IN ('emergency', 'non-emergency'));

-- Remove subcategory references from reports table to clean up
ALTER TABLE public.reports DROP COLUMN IF EXISTS subcategory_id;
