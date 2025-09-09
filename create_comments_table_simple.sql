-- Script simple para crear la tabla de comentarios
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla group_post_comments
CREATE TABLE IF NOT EXISTS group_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Añadir foreign keys
ALTER TABLE group_post_comments 
ADD CONSTRAINT group_post_comments_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES group_posts(id) ON DELETE CASCADE;

ALTER TABLE group_post_comments 
ADD CONSTRAINT group_post_comments_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Habilitar RLS
ALTER TABLE group_post_comments ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas RLS
CREATE POLICY "Users can view comments of posts in their groups" ON group_post_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_posts gp
    JOIN group_members gm ON gp.group_id = gm.group_id
    WHERE gp.id = group_post_comments.post_id
    AND gm.profile_id = auth.uid()
  )
);

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

CREATE POLICY "Users can update their own comments" ON group_post_comments
FOR UPDATE USING (
  auth.uid() IS NOT NULL
  AND author_id = auth.uid()
);

CREATE POLICY "Users can delete their own comments" ON group_post_comments
FOR DELETE USING (
  auth.uid() IS NOT NULL
  AND author_id = auth.uid()
);

-- 5. Crear índices
CREATE INDEX IF NOT EXISTS idx_group_post_comments_post_id ON group_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_author_id ON group_post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_created_at ON group_post_comments(created_at);
