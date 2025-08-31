# Migraciones para Sistema de Propiedades

## Descripción
Este archivo contiene las instrucciones para aplicar las migraciones necesarias para crear el sistema de propiedades en Jubilalia.

## Archivos de Migración

### 1. 014_create_property_listings_table.sql
- Crea la tabla principal `property_listings`
- Incluye todos los campos básicos de una propiedad
- Configura políticas RLS para seguridad
- Crea índices para optimizar consultas

### 2. 015_create_property_requirements_tables.sql
- Crea `property_purchase_requirements` para requisitos de compra
- Crea `property_rental_requirements` para requisitos de alquiler
- Crea `property_amenities` para amenidades
- Crea `property_images` para imágenes
- Configura políticas RLS y relaciones

## Cómo Aplicar las Migraciones

### Opción 1: Usando Supabase CLI
```bash
# Navegar al directorio del proyecto
cd dashboard

# Aplicar las migraciones
supabase db push
```

### Opción 2: Manualmente en Supabase Dashboard
1. Ir a tu proyecto en Supabase Dashboard
2. Navegar a SQL Editor
3. Ejecutar cada archivo de migración en orden:
   - Primero: `014_create_property_listings_table.sql`
   - Segundo: `015_create_property_requirements_tables.sql`

### Opción 3: Usando el archivo consolidado
Si prefieres, puedes copiar y pegar todo el contenido en un solo archivo SQL y ejecutarlo.

## Estructura de las Tablas

### property_listings (Tabla Principal)
- `id`: UUID único
- `profile_id`: Referencia al perfil del usuario
- `listing_type`: Tipo de listado (property_purchase, property_rental, room_rental)
- `title`, `description`: Información básica
- `price`: Precio de venta o alquiler
- `address`, `city`, `country`: Ubicación
- `property_type`: Tipo de propiedad (Apartamento, Casa, Estudio, etc.)
- `bedrooms`, `bathrooms`: Características básicas
- `total_area`, `land_area`: Superficies
- `construction_year`, `property_condition`: Estado de la propiedad
- `parking_spaces`: Plazas de parking
- `available_from`: Fecha de disponibilidad
- `is_available`: Estado activo/inactivo

### property_purchase_requirements
- Requisitos específicos para compra
- Incluye todos los campos de la tabla principal para duplicación

### property_rental_requirements
- Requisitos específicos para alquiler
- Incluye campos como max_tenants, min_rental_period, etc.

### property_amenities
- Lista de amenidades disponibles
- Cada amenidad está vinculada a un listado

### property_images
- Imágenes de la propiedad
- Incluye orden y imagen principal

## Políticas de Seguridad (RLS)

Todas las tablas tienen políticas RLS configuradas:
- **Lectura**: Pública para listados disponibles
- **Escritura**: Solo para propietarios del listado
- **Actualización**: Solo para propietarios del listado
- **Eliminación**: Solo para propietarios del listado

## Verificación

Después de aplicar las migraciones, puedes verificar que todo esté funcionando:

1. Verificar que las tablas se crearon correctamente
2. Probar la inserción de un listado de prueba
3. Verificar que las políticas RLS funcionen
4. Comprobar que los tipos de TypeScript estén actualizados

## Solución de Problemas

### Error: "null value in column property_type violates not-null constraint"
- **Causa**: El campo `property_type` no se está enviando en la inserción
- **Solución**: Asegúrate de que el formulario envíe este campo
- **Verificación**: Revisa que `PropertySaleForm.tsx` incluya `property_type` en la inserción

### Error: "relation property_listings does not exist"
- **Causa**: Las migraciones no se han aplicado
- **Solución**: Aplica las migraciones siguiendo las instrucciones anteriores

### Error: "function update_updated_at_column() does not exist"
- **Causa**: La función trigger no existe
- **Solución**: Asegúrate de que la migración `database_migrations.sql` se haya ejecutado primero

## Notas Importantes

- Las migraciones deben ejecutarse en orden
- Asegúrate de tener permisos de administrador en la base de datos
- Hacer backup antes de aplicar cambios en producción
- Verificar que no haya conflictos con tablas existentes

