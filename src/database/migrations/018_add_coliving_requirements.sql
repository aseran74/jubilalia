-- Crear tabla para requisitos específicos de Coliving/Comunidad
CREATE TABLE IF NOT EXISTS coliving_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  total_spots INTEGER NOT NULL CHECK (total_spots > 0),
  available_spots INTEGER NOT NULL CHECK (available_spots >= 0 AND available_spots <= total_spots),
  community_description TEXT NOT NULL,
  housing_type VARCHAR(50) NOT NULL CHECK (housing_type IN ('individual_apartments', 'shared_house')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id)
);

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_coliving_requirements_listing_id ON coliving_requirements(listing_id);

-- Habilitar RLS
ALTER TABLE coliving_requirements ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública
CREATE POLICY "Coliving requirements are viewable by everyone"
  ON coliving_requirements FOR SELECT
  USING (true);

-- Política para inserción (solo el propietario)
CREATE POLICY "Users can insert their own coliving requirements"
  ON coliving_requirements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM property_listings
      WHERE property_listings.id = listing_id
      AND property_listings.profile_id = auth.uid()
    )
  );

-- Política para actualización (solo el propietario)
CREATE POLICY "Users can update their own coliving requirements"
  ON coliving_requirements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM property_listings
      WHERE property_listings.id = listing_id
      AND property_listings.profile_id = auth.uid()
    )
  );

-- Política para eliminación (solo el propietario)
CREATE POLICY "Users can delete their own coliving requirements"
  ON coliving_requirements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM property_listings
      WHERE property_listings.id = listing_id
      AND property_listings.profile_id = auth.uid()
    )
  );

-- Comentarios
COMMENT ON TABLE coliving_requirements IS 'Requisitos y configuración específica para propiedades tipo Coliving/Comunidad';
COMMENT ON COLUMN coliving_requirements.total_spots IS 'Número total de plazas en la comunidad';
COMMENT ON COLUMN coliving_requirements.available_spots IS 'Número de plazas disponibles actualmente';
COMMENT ON COLUMN coliving_requirements.community_description IS 'Descripción detallada de la comunidad y lo que incluye cada unidad';
COMMENT ON COLUMN coliving_requirements.housing_type IS 'Tipo de estructura: apartamentos individuales o casa compartida';
