-- Corregir completamente la estructura de la tabla posts
-- Esta migración unifica la estructura para que coincida con los tipos de TypeScript

-- 1. Eliminar campos obsoletos si existen
DO $$ 
BEGIN
  -- Eliminar campo author_id si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'author_id'
  ) THEN
    ALTER TABLE posts DROP COLUMN author_id;
  END IF;
  
  -- Eliminar campo status si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'status'
  ) THEN
    ALTER TABLE posts DROP COLUMN status;
  END IF;
  
  -- Eliminar campo likes_count si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE posts DROP COLUMN likes_count;
  END IF;
  
  -- Eliminar campo views_count si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'views_count'
  ) THEN
    ALTER TABLE posts DROP COLUMN views_count;
  END IF;
END $$;

-- 2. Agregar campos faltantes
DO $$ 
BEGIN
  -- Agregar campo images si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'images'
  ) THEN
    ALTER TABLE posts ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
  
  -- Agregar campo profile_id si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Agregar campo excerpt si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'excerpt'
  ) THEN
    ALTER TABLE posts ADD COLUMN excerpt TEXT;
  END IF;
  
  -- Agregar campo featured_image_url si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'featured_image_url'
  ) THEN
    ALTER TABLE posts ADD COLUMN featured_image_url TEXT;
  END IF;
  
  -- Agregar campo is_published si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE posts ADD COLUMN is_published BOOLEAN DEFAULT false;
  END IF;
  
  -- Agregar campo is_featured si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE posts ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
  
  -- Agregar campo published_at si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE posts ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Agregar campo view_count si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
  
  -- Agregar campo like_count si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'like_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN like_count INTEGER DEFAULT 0;
  END IF;
  
  -- Agregar campo comment_count si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'comment_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN comment_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_posts_images ON posts USING GIN(images);
CREATE INDEX IF NOT EXISTS idx_posts_profile_id ON posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON posts(is_published);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- 4. Corregir políticas RLS para usar profile_id en lugar de author_id
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Crear nuevas políticas usando profile_id
CREATE POLICY "Users can insert their own posts" ON posts
  FOR INSERT WITH CHECK (
    auth.uid()::text IN (
      SELECT firebase_uid FROM profiles WHERE id = profile_id
    )
  );

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (
    auth.uid()::text IN (
      SELECT firebase_uid FROM profiles WHERE id = profile_id
    )
  );

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (
    auth.uid()::text IN (
      SELECT firebase_uid FROM profiles WHERE id = profile_id
    )
  );

-- Corregir política de visualización para usar is_published
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (is_published = true);

-- 5. Actualizar posts existentes para establecer valores por defecto
UPDATE posts SET 
  is_published = true,
  published_at = created_at
WHERE is_published IS NULL;

-- 6. Crear trigger para actualizar published_at cuando se publique
CREATE OR REPLACE FUNCTION update_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND OLD.is_published = false THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_posts_published_at ON posts;
CREATE TRIGGER update_posts_published_at 
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_published_at();
