-- =====================================================
-- AGREGAR TIPO COLIVING A PROPERTY LISTINGS
-- =====================================================
-- Fecha: 2024-10-01
-- Descripción: Agregar 'coliving' como nuevo tipo de listing

-- Eliminar el constraint existente
ALTER TABLE property_listings 
DROP CONSTRAINT IF EXISTS property_listings_listing_type_check;

-- Agregar el nuevo constraint con 'coliving'
ALTER TABLE property_listings 
ADD CONSTRAINT property_listings_listing_type_check 
CHECK (listing_type IN ('property_purchase', 'property_rental', 'room_rental', 'coliving'));

-- Comentario explicativo
COMMENT ON COLUMN property_listings.listing_type IS 'Tipo de listado: property_purchase (venta), property_rental (alquiler), room_rental (habitación), coliving (proyectos coliving)';


