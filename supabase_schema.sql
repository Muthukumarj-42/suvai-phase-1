-- 1. Create the food type enum
CREATE TYPE food_type_enum AS ENUM (
  'idli_dosa',
  'kothu',
  'parotta',
  'pani_puri',
  'juice',
  'others'
);

-- 2. Create the vendors table
CREATE TABLE vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stall_name TEXT NOT NULL,
  stall_name_en TEXT NOT NULL,
  food_type food_type_enum NOT NULL,
  phone TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  photo_url TEXT,
  rating NUMERIC(3, 2) DEFAULT NULL,
  review_count INTEGER DEFAULT 0,
  suvai_certified BOOLEAN DEFAULT false,
  established_year INTEGER,
  is_open BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  favourites_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the specialty_items table (menu items)
CREATE TABLE specialty_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);

-- 4. Create the reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  reviewer_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Seed initial mock data from wireframes
-- Add Vendors
INSERT INTO vendors (
  stall_name,
  stall_name_en,
  food_type,
  phone,
  lat,
  lng,
  rating,
  review_count,
  suvai_certified,
  established_year,
  is_open,
  views_count,
  favourites_count
) VALUES 
('முருகன் இட்லி கடை', 'Murugan Idli Kadai', 'idli_dosa', '9876543210', 11.5037, 77.2452, 4.8, 312, true, 1994, true, 47, 28),
('செல்வா கொத்து சென்டர்', 'Selva Kothu Center', 'kothu', '9876543211', 11.5054, 77.2494, 4.6, 188, true, 2005, true, 120, 42),
('ராஜா பானி பூரி', 'Raja Pani Puri', 'pani_puri', '9876543212', 11.5004, 77.2394, 4.2, 94, false, 2012, true, 35, 12),
('அம்மா பரோட்டா ஸ்டால்', 'Amma Parotta Stall', 'parotta', '9876543213', 11.4954, 77.2344, 4.5, 140, false, 2000, true, 80, 20);

-- Add Specialty Items (Menu Items) for Murugan Idli Kadai
INSERT INTO specialty_items (vendor_id, name, name_en, price)
SELECT id, 'இட்லி', 'Idli', 20.00 FROM vendors WHERE stall_name_en = 'Murugan Idli Kadai' UNION ALL
SELECT id, 'வடை', 'Vada', 25.00 FROM vendors WHERE stall_name_en = 'Murugan Idli Kadai' UNION ALL
SELECT id, 'பொங்கல்', 'Pongal', 30.00 FROM vendors WHERE stall_name_en = 'Murugan Idli Kadai' UNION ALL
SELECT id, 'சாம்பார் இட்லி', 'Sambar Idli', 35.00 FROM vendors WHERE stall_name_en = 'Murugan Idli Kadai';

-- Add Specialty Items (Menu Items) for Selva Kothu Center
INSERT INTO specialty_items (vendor_id, name, name_en, price)
SELECT id, 'முட்டை கொத்து', 'Egg Kothu', 80.00 FROM vendors WHERE stall_name_en = 'Selva Kothu Center' UNION ALL
SELECT id, 'சிக்கன் கொத்து', 'Chicken Kothu', 100.00 FROM vendors WHERE stall_name_en = 'Selva Kothu Center';

-- Add Specialty Items (Menu Items) for Raja Pani Puri
INSERT INTO specialty_items (vendor_id, name, name_en, price)
SELECT id, 'பானி பூரி', 'Pani Puri', 30.00 FROM vendors WHERE stall_name_en = 'Raja Pani Puri' UNION ALL
SELECT id, 'மசாலா பூரி', 'Masala Puri', 30.00 FROM vendors WHERE stall_name_en = 'Raja Pani Puri';

-- Add Specialty Items (Menu Items) for Amma Parotta Stall
INSERT INTO specialty_items (vendor_id, name, name_en, price)
SELECT id, 'பரோட்டா', 'Parotta', 15.00 FROM vendors WHERE stall_name_en = 'Amma Parotta Stall' UNION ALL
SELECT id, 'முட்டை வீச்சு', 'Egg Veechu', 40.00 FROM vendors WHERE stall_name_en = 'Amma Parotta Stall';

-- Add Reviews for Murugan Idli Kadai
INSERT INTO reviews (vendor_id, reviewer_name, comment)
SELECT id, 'Karthik R', 'Best idli in Coimbatore. Very clean and hygienic stall.' FROM vendors WHERE stall_name_en = 'Murugan Idli Kadai' UNION ALL
SELECT id, 'Priya M', 'Sambar is amazing. Long queue every morning but totally worth it.' FROM vendors WHERE stall_name_en = 'Murugan Idli Kadai';

-- Add Reviews for Selva Kothu Center
INSERT INTO reviews (vendor_id, reviewer_name, comment)
SELECT id, 'Venkatesh S', 'Great spices and quick preparation. Must try their chicken kothu!' FROM vendors WHERE stall_name_en = 'Selva Kothu Center';

-- 6. Disable Row Level Security (RLS) for testing simplicity
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE specialty_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

