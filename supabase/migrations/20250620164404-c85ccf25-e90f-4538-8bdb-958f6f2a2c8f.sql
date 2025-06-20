
-- Create users table for prototype (no auth)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('emergency', 'non_emergency'))
);

-- Create subcategories table
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE
);

-- Create officers table
CREATE TABLE public.officers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  contact TEXT
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  subcategory_id UUID REFERENCES public.subcategories(id),
  type TEXT NOT NULL CHECK (type IN ('emergency', 'non_emergency')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  location_lat DECIMAL,
  location_lng DECIMAL,
  location_address TEXT,
  image_url TEXT,
  assigned_officer_id UUID REFERENCES public.officers(id),
  resolution_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert sample categories
INSERT INTO public.categories (name, type) VALUES 
('Medical Emergency', 'emergency'),
('Fire Emergency', 'emergency'),
('Crime/Safety', 'emergency'),
('Road Issues', 'non_emergency'),
('Waste Management', 'non_emergency'),
('Public Facilities', 'non_emergency');

-- Insert sample subcategories
INSERT INTO public.subcategories (name, category_id) VALUES 
('Heart Attack', (SELECT id FROM public.categories WHERE name = 'Medical Emergency')),
('Accident', (SELECT id FROM public.categories WHERE name = 'Medical Emergency')),
('Building Fire', (SELECT id FROM public.categories WHERE name = 'Fire Emergency')),
('Vehicle Fire', (SELECT id FROM public.categories WHERE name = 'Fire Emergency')),
('Theft', (SELECT id FROM public.categories WHERE name = 'Crime/Safety')),
('Assault', (SELECT id FROM public.categories WHERE name = 'Crime/Safety')),
('Pothole', (SELECT id FROM public.categories WHERE name = 'Road Issues')),
('Broken Traffic Light', (SELECT id FROM public.categories WHERE name = 'Road Issues')),
('Garbage Collection', (SELECT id FROM public.categories WHERE name = 'Waste Management')),
('Illegal Dumping', (SELECT id FROM public.categories WHERE name = 'Waste Management')),
('Park Maintenance', (SELECT id FROM public.categories WHERE name = 'Public Facilities')),
('Streetlight Repair', (SELECT id FROM public.categories WHERE name = 'Public Facilities'));

-- Insert sample officers
INSERT INTO public.officers (name, department, contact) VALUES 
('Officer Smith', 'Police', '+1-555-0101'),
('Officer Johnson', 'Police', '+1-555-0102'),
('Captain Davis', 'Fire Department', '+1-555-0201'),
('Chief Wilson', 'Fire Department', '+1-555-0202'),
('Manager Brown', 'Public Works', '+1-555-0301');

-- Insert admin user
INSERT INTO public.users (name, email, password, role) VALUES 
('Admin User', 'admin@gmail.com', '123456', 'admin');
