-- Añadir campos de precio por unidad a la tabla coliving_requirements
ALTER TABLE coliving_requirements 
ADD COLUMN IF NOT EXISTS price_per_apartment NUMERIC,
ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC;

-- Comentarios
COMMENT ON COLUMN coliving_requirements.price_per_apartment IS 'Precio por apartamento individual (para tipo individual_apartments)';
COMMENT ON COLUMN coliving_requirements.price_per_unit IS 'Precio por unidad/habitación (para tipo shared_house)';
