-- =====================================================
-- MIGRACIONES CONSOLIDADAS PARA SISTEMA DE PROPIEDADES
-- =====================================================
-- Fecha: 2024-01-XX
-- Descripción: Crear todas las tablas necesarias para el sistema de propiedades

-- =====================================================
-- 1. CREAR TABLA PRINCIPAL property_listings
-- =====================================================

CREATE TABLE IF NOT EXISTS property_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_type VARCHAR(50) NOT NULL CHECK (listing_type IN ('property_purchase', 'property_rental', 'room_rental')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'España',
    available_from DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('Apartamento', 'Casa', 'Estudio', 'Loft', 'Duplex', 'Villa')),
    bedrooms INTEGER,
    bathrooms INTEGER,
    total_area DECIMAL(8, 2),
    land_area DECIMAL(8, 2),
    construction_year INTEGER,
    property_condition VARCHAR(50),
    parking_spaces INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_property_listings_profile_id ON property_listings(profile_id);
CREATE INDEX IF NOT EXISTS idx_property_listings_listing_type ON property_listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_property_listings_city ON property_listings(city);
CREATE INDEX IF NOT EXISTS idx_property_listings_property_type ON property_listings(property_type);
CREATE INDEX IF NOT EXISTS idx_property_listings_price ON property_listings(price);
CREATE INDEX IF NOT EXISTS idx_property_listings_available_from ON property_listings(available_from);
CREATE INDEX IF NOT EXISTS idx_property_listings_is_available ON property_listings(is_available);

-- =====================================================
-- 2. CREAR TABLAS DE REQUISITOS ESPECÍFICOS
-- =====================================================

-- Tabla para requisitos de compra
CREATE TABLE IF NOT EXISTS property_purchase_requirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    total_area DECIMAL(8, 2) NOT NULL,
    land_area DECIMAL(8, 2),
    construction_year INTEGER NOT NULL,
    property_condition VARCHAR(50) NOT NULL,
    parking_spaces INTEGER DEFAULT 0,
    property_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para requisitos de alquiler
CREATE TABLE IF NOT EXISTS property_rental_requirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    max_tenants INTEGER DEFAULT 1,
    min_rental_period INTEGER DEFAULT 12, -- meses
    pets_allowed BOOLEAN DEFAULT false,
    smoking_allowed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREAR TABLAS DE AMENIDADES E IMÁGENES
-- =====================================================

-- Tabla para amenidades
CREATE TABLE IF NOT EXISTS property_amenities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    amenity_type VARCHAR(50) NOT NULL DEFAULT 'basic',
    amenity_name VARCHAR(100) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para imágenes
CREATE TABLE IF NOT EXISTS property_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_order INTEGER NOT NULL DEFAULT 1,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para las tablas relacionadas
CREATE INDEX IF NOT EXISTS idx_property_purchase_requirements_listing_id ON property_purchase_requirements(listing_id);
CREATE INDEX IF NOT EXISTS idx_property_rental_requirements_listing_id ON property_rental_requirements(listing_id);
CREATE INDEX IF NOT EXISTS idx_property_amenities_listing_id ON property_amenities(listing_id);
CREATE INDEX IF NOT EXISTS idx_property_images_listing_id ON property_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_property_images_order ON property_images(listing_id, image_order);

-- =====================================================
-- 4. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_purchase_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_rental_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREAR POLÍTICAS RLS
-- =====================================================

-- Políticas para property_listings
CREATE POLICY "Property listings are viewable by everyone" ON property_listings
    FOR SELECT USING (is_available = true);

CREATE POLICY "Users can insert their own property listings" ON property_listings
    FOR INSERT WITH CHECK (auth.uid()::text = profile_id::text);

CREATE POLICY "Users can update their own property listings" ON property_listings
    FOR UPDATE USING (auth.uid()::text = profile_id::text);

CREATE POLICY "Users can delete their own property listings" ON property_listings
    FOR DELETE USING (auth.uid()::text = profile_id::text);

-- Políticas para property_purchase_requirements
CREATE POLICY "Property purchase requirements are viewable by everyone" ON property_purchase_requirements
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own property purchase requirements" ON property_purchase_requirements
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT profile_id::text FROM property_listings WHERE id = listing_id
        )
    );

CREATE POLICY "Users can update their own property purchase requirements" ON property_purchase_requirements
    FOR UPDATE USING (
        auth.uid()::text IN (
            SELECT profile_id::text FROM property_listings WHERE id = listing_id
        )
    );

CREATE POLICY "Users can delete their own property purchase requirements" ON property_purchase_requirements
    FOR DELETE USING (
        auth.uid()::text IN (
            SELECT profile_id::text FROM property_listings WHERE id = listing_id
        )
    );

-- Políticas para property_rental_requirements
CREATE POLICY "Property rental requirements are viewable by everyone" ON property_rental_requirements
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own property rental requirements" ON property_rental_requirements
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT profile_id::text FROM property_listings WHERE id = listing_id
        )
    );

CREATE POLICY "Users can update their own property rental requirements" ON property_rental_requirements
    FOR UPDATE USING (
        auth.uid()::text IN (
            SELECT profile_id::text FROM property_listings WHERE id = listing_id
        )
    );

CREATE POLICY "Users can delete their own property rental requirements" ON property_rental_requirements
    FOR DELETE USING (
        auth.uid()::text IN (
            SELECT profile_id::text FROM property_listings WHERE id = listing_id
        )
    );

-- Políticas para property_amenities
CREATE POLICY "Property amenities are viewable by everyone" ON property_amenities
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own property amenities" ON property_amenities
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT profile_id::text FROM property_listings WHERE id = listing_id
        )
    );

CREATE POLICY "Users can update their own property amenities" ON property_amenities
    FOR UPDATE USING (
        auth.uid()::text IN (
            SELECT profile_id::text FROM property_listings WHERE id = listing_id
        )
    );

CREATE POLICY "Users can delete their own property amenities" ON property_amenities
    FOR DELETE USING (
        auth.uid()::text IN (
            SELECT profile_id::text FROM property_listings WHERE id = listing_id
        )
    );

-- Políticas para property_images
CREATE POLICY "Property images are viewable by everyone" ON property_images
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own property images" ON property_images
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT profile_id::text FROM property_listings WHERE id = listing_id
        )
    );

CREATE POLICY "Users can update their own property images" ON property_images
    FOR UPDATE USING (
        auth.uid()::text IN (
            SELECT profile_id::text FROM property_listings WHERE id = listing_id
        )
    );

CREATE POLICY "Users can delete their own property images" ON property_images
    FOR DELETE USING (
        auth.uid()::text IN (
            SELECT profile_id::text FROM property_listings WHERE id = listing_id
        )
    );

-- =====================================================
-- 6. CREAR TRIGGERS PARA updated_at
-- =====================================================

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_property_listings_updated_at 
    BEFORE UPDATE ON property_listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_purchase_requirements_updated_at 
    BEFORE UPDATE ON property_purchase_requirements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_rental_requirements_updated_at 
    BEFORE UPDATE ON property_rental_requirements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_amenities_updated_at 
    BEFORE UPDATE ON property_amenities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_images_updated_at 
    BEFORE UPDATE ON property_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

-- Comentarios para documentar las tablas
COMMENT ON TABLE property_listings IS 'Listados principales de propiedades para venta y alquiler';
COMMENT ON TABLE property_purchase_requirements IS 'Requisitos específicos para compra de propiedades';
COMMENT ON TABLE property_rental_requirements IS 'Requisitos específicos para alquiler de propiedades';
COMMENT ON TABLE property_amenities IS 'Amenidades disponibles en las propiedades';
COMMENT ON TABLE property_images IS 'Imágenes de las propiedades';

-- =====================================================
-- MIGRACIÓN COMPLETADA
-- =====================================================
-- 
-- Para verificar que todo funcionó correctamente:
-- 1. Verificar que las tablas se crearon: \dt property_*
-- 2. Verificar que las políticas RLS están activas
-- 3. Probar la inserción de un listado de prueba
-- 4. Verificar que los tipos de TypeScript estén actualizados

