-- Corregir políticas de storage para el bucket post-images
-- Permitir acceso desde Firebase y usuarios autenticados

-- 1. Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "Allow authenticated users to upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their post images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view post images" ON storage.objects;

-- 2. Crear políticas temporales de desarrollo (permisivas)
-- NOTA: Estas políticas son para desarrollo, en producción deben ser más restrictivas

-- Política para INSERT (subida de imágenes de posts)
CREATE POLICY "Temporary allow all post image uploads"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'post-images');

-- Política para UPDATE (actualización de imágenes de posts)
CREATE POLICY "Temporary allow all post image updates"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'post-images')
WITH CHECK (bucket_id = 'post-images');

-- Política para DELETE (eliminación de imágenes de posts)
CREATE POLICY "Temporary allow all post image deletions"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'post-images');

-- Política para SELECT (visualización pública de imágenes de posts)
CREATE POLICY "Temporary allow all post image views"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'post-images');

-- 3. Comentario importante sobre seguridad
COMMENT ON POLICY "Temporary allow all post image uploads" ON storage.objects IS 
'POLÍTICA TEMPORAL DE DESARROLLO - NO USAR EN PRODUCCIÓN. Permite subidas públicas para desarrollo.';

COMMENT ON POLICY "Temporary allow all post image updates" ON storage.objects IS 
'POLÍTICA TEMPORAL DE DESARROLLO - NO USAR EN PRODUCCIÓN. Permite actualizaciones públicas para desarrollo.';

COMMENT ON POLICY "Temporary allow all post image deletions" ON storage.objects IS 
'POLÍTICA TEMPORAL DE DESARROLLO - NO USAR EN PRODUCCIÓN. Permite eliminaciones públicas para desarrollo.';

COMMENT ON POLICY "Temporary allow all post image views" ON storage.objects IS 
'POLÍTICA TEMPORAL DE DESARROLLO - NO USAR EN PRODUCCIÓN. Permite visualización pública para desarrollo.';
