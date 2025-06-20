
-- First, set all category_id and subcategory_id references to NULL in reports table
UPDATE public.reports SET category_id = NULL WHERE category_id IS NOT NULL;
UPDATE public.reports SET subcategory_id = NULL WHERE subcategory_id IS NOT NULL;

-- Now we can safely delete subcategories and categories
DELETE FROM public.subcategories;
DELETE FROM public.categories;

-- Insert new categories with appropriate types
INSERT INTO public.categories (name, type) VALUES 
('Aviation', 'emergency'),
('Fire', 'emergency'),
('Electricity', 'emergency'),
('Transportation', 'non_emergency'),
('Infrastructure', 'non_emergency'),
('Public Services', 'non_emergency'),
('Others', 'non_emergency');
