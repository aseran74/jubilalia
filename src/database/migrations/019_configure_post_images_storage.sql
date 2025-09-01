-- Configurar políticas de storage para el bucket post-images
-- Permitir subidas, actualizaciones y eliminaciones desde usuarios autenticados

-- Crear política para INSERT (subida de imágenes de posts)
CREATE POLICY "Allow authenticated users to upload post images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'post-images' AND 
  auth.uid() IS NOT NULL
);

-- Crear política para UPDATE (actualización de imágenes de posts)
CREATE POLICY "Allow users to update their post images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'post-images' AND 
  auth.uid() IS NOT NULL
)
WITH CHECK (
  bucket_id = 'post-images' AND 
  auth.uid() IS NOT NULL
);

-- Crear política para DELETE (eliminación de imágenes de posts)
CREATE POLICY "Allow users to delete their post images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'post-images' AND 
  auth.uid() IS NOT NULL
);

-- Crear política para SELECT (visualización pública de imágenes de posts)
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'post-images');

-- Comentario: Las políticas anteriores asumen que ya existe una política general
-- para visualización pública. Si no existe, se debe crear primero.
