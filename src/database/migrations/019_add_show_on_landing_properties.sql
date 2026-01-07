-- Migración para agregar campo show_on_landing a property_listings
-- Fecha: 2025-01-XX
-- Descripción: Agregar campo para mostrar propiedades en la landing page

-- Agregar columna para mostrar en landing page
ALTER TABLE property_listings
ADD COLUMN IF NOT EXISTS show_on_landing BOOLEAN DEFAULT false;

-- Agregar comentario a la columna
COMMENT ON COLUMN property_listings.show_on_landing IS 'Indica si la propiedad debe mostrarse en la landing page';

-- Crear índice para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_property_listings_show_on_landing ON property_listings(show_on_landing) WHERE show_on_landing = true;


