-- Corregir la estructura de la tabla posts para asegurar que tenga el campo images
-- Esta migración corrige cualquier discrepancia entre la migración original y los tipos de TypeScript

-- Verificar si el campo images existe, si no, crearlo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'images'
  ) THEN
    ALTER TABLE posts ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Verificar si el campo featured_image_url existe, si no, crearlo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'featured_image_url'
  ) THEN
    ALTER TABLE posts ADD COLUMN featured_image_url TEXT;
  END IF;
END $$;

-- Verificar si el campo profile_id existe, si no, crearlo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Verificar si el campo excerpt existe, si no, crearlo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'excerpt'
  ) THEN
    ALTER TABLE posts ADD COLUMN excerpt TEXT;
  END IF;
END $$;

-- Verificar si el campo is_published existe, si no, crearlo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE posts ADD COLUMN is_published BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Verificar si el campo is_featured existe, si no, crearlo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE posts ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Verificar si el campo published_at existe, si no, crearlo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE posts ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Verificar si el campo view_count existe, si no, crearlo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Verificar si el campo like_count existe, si no, crearlo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'like_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN like_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Verificar si el campo comment_count existe, si no, crearlo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'comment_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN comment_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_posts_images ON posts USING GIN(images);
CREATE INDEX IF NOT EXISTS idx_posts_profile_id ON posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON posts(is_published);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
