-- Verificar si existe la tabla group_post_comments y sus políticas
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si existe la tabla
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'group_post_comments' 
ORDER BY ordinal_position;

-- 2. Verificar las políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'group_post_comments';

-- 3. Verificar si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'group_post_comments';

-- 4. Verificar la estructura de la tabla
\d group_post_comments;
