-- Migración para agregar campos de anuncio externo a property_listings
-- Fecha: 2025-01-XX
-- Descripción: Agregar campos para link y plataforma de anuncios externos (Idealista, Fotocasa, etc.)

-- Agregar columna para el link del anuncio externo
ALTER TABLE property_listings 
ADD COLUMN IF NOT EXISTS external_listing_url TEXT;

-- Agregar columna para la plataforma del anuncio
ALTER TABLE property_listings 
ADD COLUMN IF NOT EXISTS external_platform VARCHAR(50);

-- Agregar comentarios a las columnas
COMMENT ON COLUMN property_listings.external_listing_url IS 'URL del anuncio en plataformas externas (Idealista, Fotocasa, Pisos.com, etc.)';
COMMENT ON COLUMN property_listings.external_platform IS 'Plataforma donde está publicado el anuncio (Idealista, Fotocasa, Pisos.com, Otros)';


