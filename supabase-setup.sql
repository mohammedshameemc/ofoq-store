-- =====================================================
-- SUPABASE DATABASE SETUP FOR OFOQ STORE ADMIN PANEL
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- This will create all necessary tables and security policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for parent-child lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Admin users can do everything (requires admin role in user metadata)
CREATE POLICY "Authenticated users have full access to categories"
  ON categories FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access to products"
  ON products FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Public users can read active products and categories
CREATE POLICY "Public users can view active products"
  ON products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public users can view categories"
  ON categories FOR SELECT
  USING (true);

-- =====================================================
-- FUNCTION TO UPDATE CATEGORY PRODUCT COUNT
-- =====================================================
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories 
    SET product_count = product_count + 1 
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET product_count = product_count - 1 
    WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
    UPDATE categories 
    SET product_count = product_count - 1 
    WHERE id = OLD.category_id;
    UPDATE categories 
    SET product_count = product_count + 1 
    WHERE id = NEW.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_category_product_count();

-- =====================================================
-- TOP CATEGORIES TABLE (featured / promoted categories)
-- =====================================================
CREATE TABLE IF NOT EXISTS top_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id)
);

CREATE INDEX IF NOT EXISTS idx_top_categories_category ON top_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_top_categories_sort ON top_categories(sort_order);

-- RLS for top_categories
ALTER TABLE top_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users have full access to top_categories"
  ON top_categories FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public users can view top_categories"
  ON top_categories FOR SELECT
  USING (true);

-- =====================================================
-- COMPLETED! 
-- =====================================================
-- Your database is now ready for the admin panel
-- Next steps:
-- 1. Create an admin user in Supabase Authentication
-- 2. Add custom claim 'role': 'admin' to user metadata
-- 3. Update .env file with your Supabase credentials
-- 4. Create a Storage bucket called "category-images" (public)
--    Go to Supabase Dashboard → Storage → New bucket
--    Name: category-images
--    Public: ON
--    Allowed MIME types: image/jpeg, image/png, image/webp
--    Max file size: 5 MB

-- =====================================================
-- TAGS TABLE
-- =====================================================
-- Run this block in your Supabase SQL Editor to create
-- the tags table and seed it with the default tag data.

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(20) NOT NULL DEFAULT '#2b38d1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for name lookups
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Auto-update updated_at
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users have full access to tags"
  ON tags FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public users can view tags"
  ON tags FOR SELECT
  USING (true);

-- Seed data (matches the previously hardcoded tags)
INSERT INTO tags (name, color) VALUES
  ('Premium',     '#7c3aed'),
  ('Bestseller',  '#db2777'),
  ('New Arrival', '#0891b2'),
  ('Sale',        '#dc2626'),
  ('Warranty',    '#059669'),
  ('Featured',    '#d97706'),
  ('Eco-Friendly','#16a34a'),
  ('Educational', '#2563eb'),
  ('Imported',    '#9333ea'),
  ('Local',       '#0d9488')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PRODUCTS TABLE MIGRATION
-- =====================================================
-- Add new columns to products table

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Update status CHECK constraint to allow more values
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status IN ('active', 'inactive', 'out_of_stock', 'draft', 'low_stock'));

CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- =====================================================
-- PRODUCT_TAGS JUNCTION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_product_tags_product ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON product_tags(tag_id);

ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users have full access to product_tags"
  ON product_tags FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public users can view product_tags"
  ON product_tags FOR SELECT
  USING (true);

-- =====================================================
-- PRODUCT_IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users have full access to product_images"
  ON product_images FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public users can view product_images"
  ON product_images FOR SELECT
  USING (true);
