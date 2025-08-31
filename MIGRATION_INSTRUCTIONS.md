# Instrucciones para aplicar la migración en Supabase

## Archivo de migración: `004_add_missing_room_fields.sql`

Este archivo debe aplicarse en tu base de datos de Supabase para agregar los campos faltantes en la tabla `room_rental_requirements`.

### Pasos para aplicar la migración:

1. **Accede a tu proyecto de Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Inicia sesión y selecciona tu proyecto

2. **Ve a la sección SQL Editor**
   - En el menú lateral izquierdo, haz clic en "SQL Editor"
   - Haz clic en "New query"

3. **Copia y pega el siguiente SQL:**

```sql
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
```

4. **Ejecuta la migración**
   - Haz clic en "Run" o presiona Ctrl+Enter (Cmd+Enter en Mac)

5. **Verifica que se aplicó correctamente**
   - Ejecuta esta consulta para verificar:

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'room_rental_requirements' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Campos agregados:

| Campo | Tipo | Descripción | Valor por defecto |
|-------|------|-------------|-------------------|
| `shared_bathroom` | BOOLEAN | Si el inquilino debe compartir baño | false |
| `tenant_smoker` | BOOLEAN | Si se permite que el inquilino sea fumador | false |
| `tenant_gender_preference` | VARCHAR(20) | Preferencia de género del inquilino | 'any' |
| `tenant_age_min` | INTEGER | Edad mínima del inquilino | 55 |
| `tenant_age_max` | INTEGER | Edad máxima del inquilino | 100 |
| `tenant_pets_allowed` | BOOLEAN | Si se permiten mascotas al inquilino | false |
| `tenant_pet_types` | TEXT[] | Tipos de mascotas permitidas | [] |

### Restricciones agregadas:

- `tenant_gender_preference` solo puede ser 'any', 'female', o 'male'
- `tenant_age_min` debe ser >= 55
- `tenant_age_max` debe ser <= 100

### Índices creados:

- `idx_room_requirements_tenant_gender` - Para búsquedas por género
- `idx_room_requirements_tenant_age_range` - Para búsquedas por rango de edad
- `idx_room_requirements_tenant_pets` - Para búsquedas por permisos de mascotas

## Nota importante:

Después de aplicar esta migración, el formulario de Jubilalia incluirá todos los campos necesarios para:
- Configurar si la habitación tiene baño propio o compartido
- Especificar si se permiten fumadores
- Definir preferencias de género del inquilino
- Establecer rangos de edad para el inquilino
- Configurar permisos de mascotas para el inquilino
- Especificar tipos de mascotas permitidas

Todos estos campos ya están integrados en el formulario simplificado de un solo paso.
