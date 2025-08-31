-- Migración para agregar campos faltantes en room_rental_requirements
-- Fecha: 2024-01-XX
-- Descripción: Agregar campos para baño compartido, fumador, tipo de sexo, mascotas y rango de edad

-- Agregar campos faltantes a la tabla room_rental_requirements
ALTER TABLE room_rental_requirements 
ADD COLUMN IF NOT EXISTS shared_bathroom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tenant_smoker BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tenant_gender_preference VARCHAR(20) DEFAULT 'any' CHECK (tenant_gender_preference IN ('any', 'female', 'male')),
ADD COLUMN IF NOT EXISTS tenant_age_min INTEGER DEFAULT 55 CHECK (tenant_age_min >= 55),
ADD COLUMN IF NOT EXISTS tenant_age_max INTEGER DEFAULT 100 CHECK (tenant_age_max <= 100),
ADD COLUMN IF NOT EXISTS tenant_pets_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tenant_pet_types TEXT[] DEFAULT '{}';

-- Agregar comentarios para documentar los nuevos campos
COMMENT ON COLUMN room_rental_requirements.shared_bathroom IS 'Indica si el inquilino debe compartir baño con otros';
COMMENT ON COLUMN room_rental_requirements.tenant_smoker IS 'Indica si se permite que el inquilino sea fumador';
COMMENT ON COLUMN room_rental_requirements.tenant_gender_preference IS 'Preferencia de género del inquilino: any, female, male';
COMMENT ON COLUMN room_rental_requirements.tenant_age_min IS 'Edad mínima del inquilino (mínimo 55)';
COMMENT ON COLUMN room_rental_requirements.tenant_age_max IS 'Edad máxima del inquilino (máximo 100)';
COMMENT ON COLUMN room_rental_requirements.tenant_pets_allowed IS 'Indica si se permiten mascotas al inquilino';
COMMENT ON COLUMN room_rental_requirements.tenant_pet_types IS 'Tipos de mascotas permitidas para el inquilino';

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_room_requirements_tenant_gender ON room_rental_requirements(tenant_gender_preference);
CREATE INDEX IF NOT EXISTS idx_room_requirements_tenant_age_range ON room_rental_requirements(tenant_age_min, tenant_age_max);
CREATE INDEX IF NOT EXISTS idx_room_requirements_tenant_pets ON room_rental_requirements(tenant_pets_allowed);

-- Actualizar las políticas RLS si es necesario
-- (Las políticas existentes deberían seguir funcionando con los nuevos campos)

-- Verificar que la migración se aplicó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'room_rental_requirements' 
AND table_schema = 'public'
ORDER BY ordinal_position;
