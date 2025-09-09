-- Script completo para arreglar grupos y comentarios
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si existe la tabla group_post_comments
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'group_post_comments' 
ORDER BY ordinal_position;

-- 2. Crear tabla group_post_comments si no existe
CREATE TABLE IF NOT EXISTS group_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Añadir foreign keys si no existen
DO $$ 
BEGIN
  -- Foreign key para post_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'group_post_comments_post_id_fkey'
  ) THEN
    ALTER TABLE group_post_comments 
    ADD CONSTRAINT group_post_comments_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES group_posts(id) ON DELETE CASCADE;
  END IF;

  -- Foreign key para author_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'group_post_comments_author_id_fkey'
  ) THEN
    ALTER TABLE group_post_comments 
    ADD CONSTRAINT group_post_comments_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Habilitar RLS
ALTER TABLE group_post_comments ENABLE ROW LEVEL SECURITY;

-- 5. Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view comments of posts in their groups" ON group_post_comments;
DROP POLICY IF EXISTS "Users can create comments in their groups" ON group_post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON group_post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON group_post_comments;

-- 6. Crear políticas RLS

-- Política para leer comentarios: cualquier usuario autenticado puede ver comentarios de posts de grupos donde es miembro
CREATE POLICY "Users can view comments of posts in their groups" ON group_post_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_posts gp
    JOIN group_members gm ON gp.group_id = gm.group_id
    WHERE gp.id = group_post_comments.post_id
    AND gm.profile_id = auth.uid()
  )
);

-- Política para crear comentarios: usuarios autenticados pueden comentar en posts de grupos donde son miembros
CREATE POLICY "Users can create comments in their groups" ON group_post_comments
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
  AND author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM group_posts gp
    JOIN group_members gm ON gp.group_id = gm.group_id
    WHERE gp.id = group_post_comments.post_id
    AND gm.profile_id = auth.uid()
  )
);

-- Política para actualizar comentarios: solo el autor puede editar sus comentarios
CREATE POLICY "Users can update their own comments" ON group_post_comments
FOR UPDATE USING (
  auth.uid() IS NOT NULL
  AND author_id = auth.uid()
);

-- Política para eliminar comentarios: solo el autor puede eliminar sus comentarios
CREATE POLICY "Users can delete their own comments" ON group_post_comments
FOR DELETE USING (
  auth.uid() IS NOT NULL
  AND author_id = auth.uid()
);

-- 7. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_group_post_comments_post_id ON group_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_author_id ON group_post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_created_at ON group_post_comments(created_at);

-- 8. Verificar que todo se creó correctamente
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'group_post_comments' 
ORDER BY ordinal_position;

-- 9. Verificar las políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'group_post_comments';

-- 10. Verificar foreign keys
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'group_post_comments';
