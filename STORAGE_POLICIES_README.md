# 🚨 Políticas Temporales de Storage y Base de Datos - SOLO PARA DESARROLLO

## ⚠️ IMPORTANTE: POLÍTICAS TEMPORALES

**ESTAS POLÍTICAS SON TEMPORALES Y SOLO DEBEN USARSE EN DESARROLLO.**
**NO IMPLEMENTAR EN PRODUCCIÓN.**

## 📋 Resumen de Políticas Configuradas

### 🗄️ **Tablas de Base de Datos**

#### Tabla: `activities`
- ✅ **Política de Lectura**: `Activities are viewable by everyone`
  - Operación: `SELECT`
  - Roles: `public` (todos)
  - Condición: `is_active = true`

- ✅ **Política Temporal de Desarrollo**: `Temporary development policy for activities`
  - Operación: `ALL` (INSERT, UPDATE, DELETE, SELECT)
  - Roles: `public` (todos)
  - Condición: `true` (sin restricciones)

- ⚠️ **Políticas Restrictivas Originales** (deshabilitadas temporalmente):
  - `Users can insert their own activities` - Requiere `auth.uid() = profile_id`
  - `Users can update their own activities` - Requiere `auth.uid() = profile_id`
  - `Users can delete their own activities` - Requiere `auth.uid() = profile_id`

#### Tabla: `activity_images`
- ✅ **Política de Lectura**: `Activity images are viewable by everyone`
  - Operación: `SELECT`
  - Roles: `public` (todos)
  - Condición: `true`

- ✅ **Política Temporal de Desarrollo**: `Temporary development policy for activity_images`
  - Operación: `ALL` (INSERT, UPDATE, DELETE, SELECT)
  - Roles: `public` (todos)
  - Condición: `true` (sin restricciones)

- ⚠️ **Política Restrictiva Original** (deshabilitada temporalmente):
  - `Users can manage images for their activities` - Requiere que el usuario sea propietario de la actividad

### 🗂️ **Buckets de Storage**

#### Bucket: `activity-photos`
- ✅ **Política de Lectura**: `Anyone can view activity photos`
  - Operación: `SELECT`
  - Roles: `public` (todos)
  - Condición: `bucket_id = 'activity-photos'`

- ✅ **Política Temporal de Todas las Operaciones**: `Temporary allow all operations for activity-photos`
  - Operación: `ALL` (INSERT, UPDATE, DELETE, SELECT)
  - Roles: `public` (todos)
  - Condición: `bucket_id = 'activity-photos'`

#### Bucket: `property-images`
- ✅ **Política de Lectura**: `Anyone can view property images`
- ✅ **Política Temporal de Todas las Operaciones**: `Temporary allow all operations for property-images`
- ✅ **Política de Subida**: `Users can upload property images`
- ✅ **Política de Eliminación**: `Users can delete their own property images`

#### Bucket: `room-images`
- ✅ **Política de Lectura**: `Anyone can view images`
- ✅ **Política Temporal de Todas las Operaciones**: `Temporary allow all operations for room-images`

## 🔒 Configuración de Seguridad

### Estado Actual (DESARROLLO)
- **RLS**: Habilitado en todas las tablas relevantes
- **Acceso**: Público para todas las operaciones
- **Operaciones**: Todas permitidas temporalmente
- **Sin Restricciones**: No hay validación de propiedad o permisos

### Estado Deseado (PRODUCCIÓN)
- **RLS**: Habilitado con políticas restrictivas
- **Acceso**: Solo usuarios autenticados para operaciones de escritura
- **Operaciones**: 
  - `SELECT`: Público para datos activos
  - `INSERT`: Solo usuarios autenticados
  - `UPDATE`: Solo propietarios del recurso
  - `DELETE`: Solo propietarios del recurso

## 🚀 Cómo Funciona Actualmente

1. **Base de Datos**: Cualquier usuario puede crear, leer, actualizar y eliminar actividades e imágenes
2. **Storage**: Cualquier usuario puede subir, ver, modificar y eliminar imágenes
3. **Sin Restricciones**: No hay validación de propiedad o permisos
4. **Desarrollo Ágil**: Enfoque en funcionalidad, no en seguridad

## ⚡ Ventajas para Desarrollo

- ✅ **Sin Errores de Permisos**: No hay bloqueos por políticas de seguridad
- ✅ **Pruebas Rápidas**: Se puede probar toda la funcionalidad sin configurar usuarios
- ✅ **Debugging Fácil**: No hay problemas de autenticación o autorización
- ✅ **Desarrollo Ágil**: Enfoque en funcionalidad, no en seguridad

## 🛡️ Políticas de Producción (FUTURO)

### Políticas para Tabla `activities`
```sql
-- Política de lectura pública
CREATE POLICY "Public read access for active activities" ON activities
FOR SELECT USING (is_active = true);

-- Política de inserción para usuarios autenticados
CREATE POLICY "Authenticated users can create activities" ON activities
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política de modificación para propietarios
CREATE POLICY "Users can update their own activities" ON activities
FOR UPDATE USING (auth.uid()::text = profile_id::text);

-- Política de eliminación para propietarios
CREATE POLICY "Users can delete their own activities" ON activities
FOR DELETE USING (auth.uid()::text = profile_id::text);
```

### Políticas para Tabla `activity_images`
```sql
-- Política de lectura pública
CREATE POLICY "Public read access for activity images" ON activity_images
FOR SELECT USING (true);

-- Política de gestión para propietarios de actividades
CREATE POLICY "Users can manage images for their activities" ON activity_images
FOR ALL USING (
    auth.uid()::text IN (
        SELECT profile_id::text 
        FROM activities 
        WHERE id = activity_images.activity_id
    )
);
```

### Políticas para Storage (ya documentadas anteriormente)
- Políticas de lectura pública para imágenes
- Políticas de subida para usuarios autenticados
- Políticas de modificación/eliminación para propietarios

## 🔄 Comandos para Cambiar a Producción

### 1. Eliminar Políticas Temporales de Base de Datos
```sql
-- Eliminar políticas temporales de activities
DROP POLICY "Temporary development policy for activities" ON activities;

-- Eliminar políticas temporales de activity_images
DROP POLICY "Temporary development policy for activity_images" ON activity_images;
```

### 2. Eliminar Políticas Temporales de Storage
```sql
-- Eliminar políticas temporales de activity-photos
DROP POLICY "Temporary allow all operations for activity-photos" ON storage.objects;

-- Eliminar políticas temporales de property-images
DROP POLICY "Temporary allow all operations for property-images" ON storage.objects;

-- Eliminar políticas temporales de room-images
DROP POLICY "Temporary allow all operations for room-images" ON storage.objects;
```

### 3. Aplicar Políticas de Producción
```sql
-- Aplicar las políticas de producción listadas arriba
-- (Ejecutar cada CREATE POLICY de la sección de producción)
```

## 📝 Notas de Desarrollo

- **Fecha de Configuración**: $(date)
- **Propósito**: Desarrollo y pruebas del sistema de actividades
- **Responsable**: Equipo de desarrollo
- **Revisión**: Antes de cada deploy a producción

## 🎯 Próximos Pasos

1. ✅ **Completado**: Configurar políticas temporales para desarrollo
2. ✅ **Completado**: Habilitar RLS en tabla activities
3. 🔄 **En Progreso**: Desarrollar funcionalidad de actividades
4. ⏳ **Pendiente**: Implementar políticas de producción
5. ⏳ **Pendiente**: Testing de seguridad
6. ⏳ **Pendiente**: Deploy a producción con políticas seguras

## 🚨 Problemas Resueltos

### Error: "new row violates row-level security policy for table activities"
- **Causa**: RLS habilitado con políticas restrictivas pero sin políticas permisivas
- **Solución**: Crear política temporal `Temporary development policy for activities`
- **Estado**: ✅ Resuelto

### Error: Políticas de Storage
- **Causa**: Bucket activity-photos sin políticas permisivas
- **Solución**: Crear políticas temporales para todas las operaciones
- **Estado**: ✅ Resuelto

---

**⚠️ RECORDATORIO: Estas políticas son TEMPORALES y NO SEGURAS para producción.**
**🔒 Implementar políticas de producción antes del deploy final.**
