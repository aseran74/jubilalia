-- Migración para crear la tabla property_listings
-- Fecha: 2024-01-XX
-- Descripción: Crear tabla principal para listados de propiedades (venta y alquiler)

-- Crear la tabla property_listings
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

-- Crear política RLS (Row Level Security)
ALTER TABLE property_listings ENABLE ROW LEVEL SECURITY;

-- Política para permitir que los usuarios vean todos los listados disponibles
CREATE POLICY "Property listings are viewable by everyone" ON property_listings
    FOR SELECT USING (is_available = true);

-- Política para permitir que los usuarios inserten sus propios listados
CREATE POLICY "Users can insert their own property listings" ON property_listings
    FOR INSERT WITH CHECK (auth.uid()::text = profile_id::text);

-- Política para permitir que los usuarios actualicen sus propios listados
CREATE POLICY "Users can update their own property listings" ON property_listings
    FOR UPDATE USING (auth.uid()::text = profile_id::text);

-- Política para permitir que los usuarios eliminen sus propios listados
CREATE POLICY "Users can delete their own property listings" ON property_listings
    FOR DELETE USING (auth.uid()::text = profile_id::text);

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_property_listings_updated_at 
    BEFORE UPDATE ON property_listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentar la tabla
COMMENT ON TABLE property_listings IS 'Listados principales de propiedades para venta y alquiler';
COMMENT ON COLUMN property_listings.profile_id IS 'ID del perfil del usuario que crea el listado';
COMMENT ON COLUMN property_listings.listing_type IS 'Tipo de listado: property_purchase, property_rental, room_rental';
COMMENT ON COLUMN property_listings.title IS 'Título del listado de la propiedad';
COMMENT ON COLUMN property_listings.description IS 'Descripción detallada de la propiedad';
COMMENT ON COLUMN property_listings.price IS 'Precio de la propiedad (venta) o alquiler mensual';
COMMENT ON COLUMN property_listings.address IS 'Dirección completa de la propiedad';
COMMENT ON COLUMN property_listings.city IS 'Ciudad donde se encuentra la propiedad';
COMMENT ON COLUMN property_listings.country IS 'País donde se encuentra la propiedad';
COMMENT ON COLUMN property_listings.available_from IS 'Fecha desde cuando está disponible';
COMMENT ON COLUMN property_listings.is_available IS 'Indica si el listado está activo y disponible';
COMMENT ON COLUMN property_listings.property_type IS 'Tipo de propiedad: Apartamento, Casa, Estudio, Loft, Duplex, Villa';
COMMENT ON COLUMN property_listings.bedrooms IS 'Número de habitaciones';
COMMENT ON COLUMN property_listings.bathrooms IS 'Número de baños';
COMMENT ON COLUMN property_listings.total_area IS 'Superficie total en metros cuadrados';
COMMENT ON COLUMN property_listings.land_area IS 'Superficie del terreno en metros cuadrados';
COMMENT ON COLUMN property_listings.construction_year IS 'Año de construcción';
COMMENT ON COLUMN property_listings.property_condition IS 'Estado de la propiedad';
COMMENT ON COLUMN property_listings.parking_spaces IS 'Número de plazas de parking';
COMMENT ON COLUMN property_listings.created_at IS 'Fecha de creación del listado';
COMMENT ON COLUMN property_listings.updated_at IS 'Fecha de última actualización del listado';

