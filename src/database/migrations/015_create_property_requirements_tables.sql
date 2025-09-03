-- Migración para crear las tablas de requisitos específicos de propiedades
-- Fecha: 2024-01-XX
-- Descripción: Crear tablas para requisitos específicos de compra y alquiler de propiedades

-- Crear la tabla property_purchase_requirements
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

-- Crear la tabla property_rental_requirements
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

-- Crear la tabla property_amenities
CREATE TABLE IF NOT EXISTS property_amenities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    amenity_type VARCHAR(50) NOT NULL DEFAULT 'basic',
    amenity_name VARCHAR(100) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear la tabla property_images
CREATE TABLE IF NOT EXISTS property_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_order INTEGER NOT NULL DEFAULT 1,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_property_purchase_requirements_listing_id ON property_purchase_requirements(listing_id);
CREATE INDEX IF NOT EXISTS idx_property_rental_requirements_listing_id ON property_rental_requirements(listing_id);
CREATE INDEX IF NOT EXISTS idx_property_amenities_listing_id ON property_amenities(listing_id);
CREATE INDEX IF NOT EXISTS idx_property_images_listing_id ON property_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_property_images_order ON property_images(listing_id, image_order);

-- Crear políticas RLS (Row Level Security)
ALTER TABLE property_purchase_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_rental_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

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

-- Crear triggers para actualizar updated_at automáticamente
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

-- Comentarios para documentar las tablas
COMMENT ON TABLE property_purchase_requirements IS 'Requisitos específicos para compra de propiedades';
COMMENT ON TABLE property_rental_requirements IS 'Requisitos específicos para alquiler de propiedades';
COMMENT ON TABLE property_amenities IS 'Amenidades disponibles en las propiedades';
COMMENT ON TABLE property_images IS 'Imágenes de las propiedades';

