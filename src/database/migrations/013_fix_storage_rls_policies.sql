-- Corregir políticas RLS para el bucket room-images
-- Permitir subidas desde usuarios autenticados (incluyendo Firebase)

-- Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Crear nueva política para INSERT (subida de imágenes)
CREATE POLICY "Allow authenticated users to upload room images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'room-images' AND 
  auth.uid() IS NOT NULL
);

-- Crear nueva política para UPDATE (actualización de imágenes)
CREATE POLICY "Allow users to update their room images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'room-images' AND 
  auth.uid() IS NOT NULL
)
WITH CHECK (
  bucket_id = 'room-images' AND 
  auth.uid() IS NOT NULL
);

-- Crear nueva política para DELETE (eliminación de imágenes)
CREATE POLICY "Allow users to delete their room images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'room-images' AND 
  auth.uid() IS NOT NULL
);

-- Mantener la política de SELECT existente para visualización pública
-- (ya existe: "Anyone can view images")
