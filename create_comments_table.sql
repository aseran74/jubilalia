-- Crear tabla group_post_comments si no existe
-- Ejecutar en Supabase SQL Editor

-- Crear tabla group_post_comments
CREATE TABLE IF NOT EXISTS group_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE group_post_comments ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS

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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_group_post_comments_post_id ON group_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_author_id ON group_post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_created_at ON group_post_comments(created_at);

-- Verificar que la tabla se creó correctamente
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'group_post_comments' 
ORDER BY ordinal_position;
