-- Migración para actualizar la tabla room_rental_requirements
-- Agregar nuevos campos específicos para habitaciones

-- Primero, eliminar la tabla existente si existe
DROP TABLE IF EXISTS room_rental_requirements CASCADE;

-- Crear la nueva tabla con todos los campos necesarios
CREATE TABLE room_rental_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  
  -- Características físicas de la habitación
  bed_type TEXT NOT NULL CHECK (bed_type IN ('single', 'double')),
  room_area DECIMAL(5,2) NOT NULL CHECK (room_area > 0),
  private_bathroom BOOLEAN NOT NULL DEFAULT false,
  has_balcony BOOLEAN NOT NULL DEFAULT false,
  
  -- Preferencias del propietario
  preferred_gender TEXT NOT NULL DEFAULT 'any' CHECK (preferred_gender IN ('any', 'male', 'female')),
  preferred_age_min INTEGER NOT NULL DEFAULT 65 CHECK (preferred_age_min >= 55),
  preferred_age_max INTEGER NOT NULL DEFAULT 80 CHECK (preferred_age_max >= 55),
  
  -- Políticas de la casa
  smoking_allowed BOOLEAN NOT NULL DEFAULT false,
  pets_allowed BOOLEAN NOT NULL DEFAULT false,
  pet_types TEXT[],
  
  -- Otros requisitos
  other_requirements TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_room_rental_requirements_listing_id ON room_rental_requirements(listing_id);
CREATE INDEX idx_room_rental_requirements_bed_type ON room_rental_requirements(bed_type);
CREATE INDEX idx_room_rental_requirements_room_area ON room_rental_requirements(room_area);
CREATE INDEX idx_room_rental_requirements_preferred_gender ON room_rental_requirements(preferred_gender);
CREATE INDEX idx_room_rental_requirements_preferred_age ON room_rental_requirements(preferred_age_min, preferred_age_max);
CREATE INDEX idx_room_rental_requirements_smoking ON room_rental_requirements(smoking_allowed);
CREATE INDEX idx_room_rental_requirements_pets ON room_rental_requirements(pets_allowed);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_room_rental_requirements_updated_at 
    BEFORE UPDATE ON room_rental_requirements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE room_rental_requirements ENABLE ROW LEVEL SECURITY;

-- Política RLS: los usuarios solo pueden ver los requisitos de habitaciones públicas
CREATE POLICY "Users can view room rental requirements for public listings" ON room_rental_requirements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM property_listings 
            WHERE property_listings.id = room_rental_requirements.listing_id 
            AND property_listings.is_available = true
        )
    );

-- Política RLS: los propietarios pueden editar sus propios requisitos
CREATE POLICY "Owners can edit their own room rental requirements" ON room_rental_requirements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM property_listings 
            WHERE property_listings.id = room_rental_requirements.listing_id 
            AND property_listings.user_id = auth.uid()
        )
    );

-- Comentarios para documentar la tabla
COMMENT ON TABLE room_rental_requirements IS 'Requisitos específicos para alquiler de habitaciones individuales';
COMMENT ON COLUMN room_rental_requirements.bed_type IS 'Tipo de cama: individual o doble';
COMMENT ON COLUMN room_rental_requirements.room_area IS 'Metros cuadrados de la habitación';
COMMENT ON COLUMN room_rental_requirements.private_bathroom IS 'Si la habitación tiene baño propio';
COMMENT ON COLUMN room_rental_requirements.has_balcony IS 'Si la habitación tiene balcón';
COMMENT ON COLUMN room_rental_requirements.preferred_gender IS 'Preferencia de género del inquilino';
COMMENT ON COLUMN room_rental_requirements.preferred_age_min IS 'Edad mínima preferida del inquilino';
COMMENT ON COLUMN room_rental_requirements.preferred_age_max IS 'Edad máxima preferida del inquilino';
COMMENT ON COLUMN room_rental_requirements.smoking_allowed IS 'Si se permiten fumadores';
COMMENT ON COLUMN room_rental_requirements.pets_allowed IS 'Si se permiten mascotas';
COMMENT ON COLUMN room_rental_requirements.pet_types IS 'Tipos de mascotas permitidas';
COMMENT ON COLUMN room_rental_requirements.other_requirements IS 'Otros requisitos o preferencias';
