/**
 * Complete Supabase / PostgreSQL schema definition for Dhaka Art Nook
 * Includes tables, relationships, indexes, Row Level Security (RLS) policies, and seed data.
 */

export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- DHAKA ART NOOK — SUPABASE & POSTGRESQL PRODUCTION DATABASE SCHEMA
-- E-commerce store based in Dhaka, Bangladesh
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast product search

-- --------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image TEXT NOT NULL,
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for category slug lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- --------------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(10, 2) CHECK (discount_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    badge VARCHAR(100),
    craft_type VARCHAR(100),
    specifications JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for product search, filtering, and sorting
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin (name gin_trgm_ops);

-- --------------------------------------------------------------------
-- 4. PRODUCT IMAGES TABLE (Multiple images support)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- --------------------------------------------------------------------
-- 5. ORDERS & ORDER ITEMS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_address TEXT NOT NULL,
    delivery_area VARCHAR(50) NOT NULL CHECK (delivery_area IN ('inside_dhaka', 'outside_dhaka')),
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_charge NUMERIC(10, 2) NOT NULL,
    grand_total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'whatsapp' 
        CHECK (payment_method IN ('whatsapp', 'cod')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT NOT NULL,
    product_slug VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- --------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Public can READ categories, products, and product images
CREATE POLICY "Public categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Public products are viewable by everyone" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Public product images are viewable by everyone" 
ON public.product_images FOR SELECT USING (true);

-- Authenticated admins can INSERT, UPDATE, DELETE categories & products
CREATE POLICY "Admins have full access to categories" 
ON public.categories FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to products" 
ON public.products FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to product images" 
ON public.product_images FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated');

-- Public can CREATE orders (Customers placing order)
CREATE POLICY "Anyone can create orders" 
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert order items" 
ON public.order_items FOR INSERT WITH CHECK (true);

-- Admins can view and manage all orders
CREATE POLICY "Admins can view and manage all orders" 
ON public.orders FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated');

CREATE POLICY "Admins can view all order items" 
ON public.order_items FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated');

-- --------------------------------------------------------------------
-- 7. INITIAL SEED DATA
-- --------------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, description, image) VALUES
('b28c8942-8869-42b7-a89e-213c49fb4191', 'Resin Art Supplies', 'resin-art-supplies', 'High-clarity epoxy resins, vibrant mica powders, silicone geode molds, and heat gun tools.', '/src/assets/images/product_resin_art_kit_1793820211674.jpg'),
('358fb962-d27f-47cf-b0d6-c9569ba8c894', 'Block Printing', 'block-printing', 'Hand-carved seasoned sheesham wood blocks, textile pigment pastes, and felt printing pads.', '/src/assets/images/product_block_print_set_1793820211690.jpg'),
('6b92f768-3e4b-468f-9a3d-4c31154c1bb2', 'Paints & Pigments', 'paints-and-pigments', 'Artist-grade acrylics, rich jelly gouache cups, oil paint tubes, and watercolor pigments.', '/src/assets/images/product_oil_gouache_paints_1793820213139.jpg'),
('f52b61cd-5872-466d-92a5-420da905a5dc', 'Wax & Candle Craft', 'wax-and-candle-craft', '100% natural organic soy wax flakes, golden honeycomb beeswax, braided cotton wicks, and scents.', '/src/assets/images/product_soap_candle_wax_1793820212032.jpg')
ON CONFLICT (slug) DO NOTHING;
`;
