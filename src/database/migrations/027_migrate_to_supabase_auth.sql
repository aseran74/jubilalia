-- Migrar completamente a Supabase Auth
-- Eliminar dependencia de firebase_uid y usar auth.uid() directamente

-- 1. Agregar columna auth_user_id para Supabase Auth
DO $$
BEGIN
  -- Agregar columna auth_user_id si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN auth_user_id UUID;
  END IF;
END $$;

-- 2. Migrar datos existentes de firebase_uid a auth_user_id
UPDATE profiles 
SET auth_user_id = firebase_uid::uuid 
WHERE firebase_uid IS NOT NULL AND auth_user_id IS NULL;

-- 3. Hacer auth_user_id NOT NULL y agregar restricción única
DO $$
BEGIN
  -- Hacer auth_user_id NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'auth_user_id' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN auth_user_id SET NOT NULL;
  END IF;

  -- Agregar restricción única en auth_user_id si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_auth_user_id_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_auth_user_id_key UNIQUE (auth_user_id);
  END IF;
END $$;

-- 4. Crear índice para auth_user_id
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);

-- 5. Eliminar políticas RLS existentes
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view basic profile info" ON profiles;

-- 6. Crear nuevas políticas RLS para Supabase Auth
-- Política para INSERT: Permitir que cualquier usuario autenticado cree su perfil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Política para UPDATE: Permitir que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id);

-- Política para SELECT: Permitir que los usuarios vean su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

-- Política para permitir que los usuarios vean perfiles públicos
CREATE POLICY "Users can view public profiles" ON profiles
  FOR SELECT TO authenticated
  USING (location_public = true);

-- Política para permitir que los usuarios vean perfiles básicos de otros usuarios
CREATE POLICY "Users can view basic profile info" ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- 7. Actualizar función ensure_user_profile para usar auth.uid()
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE auth_user_id = NEW.id
  ) THEN
    INSERT INTO profiles (
      auth_user_id,
      email,
      full_name,
      avatar_url,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuario'),
      NEW.raw_user_meta_data->>'avatar_url',
      NOW(),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Actualizar función search_profiles_by_location para usar auth_user_id
CREATE OR REPLACE FUNCTION search_profiles_by_location(
  search_lat DOUBLE PRECISION,
  search_lon DOUBLE PRECISION,
  max_distance_km INTEGER DEFAULT 50,
  limit_results INTEGER DEFAULT 100
) RETURNS TABLE(
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  formatted_address TEXT,
  location_city TEXT,
  location_country TEXT,
  distance_km DOUBLE PRECISION,
  bio TEXT,
  interests TEXT[],
  occupation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.formatted_address,
    p.location_city,
    p.location_country,
    calculate_distance(
      search_lat, 
      search_lon, 
      (p.coordinates[0])::DOUBLE PRECISION, 
      (p.coordinates[1])::DOUBLE PRECISION
    ) as distance_km,
    p.bio,
    p.interests,
    p.occupation
  FROM profiles p
  WHERE 
    p.location_public = true 
    AND p.coordinates IS NOT NULL
    AND calculate_distance(
      search_lat, 
      search_lon, 
      (p.coordinates[0])::DOUBLE PRECISION, 
      (p.coordinates[1])::DOUBLE PRECISION
    ) <= max_distance_km
  ORDER BY distance_km ASC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- 9. Actualizar función update_user_location para usar auth_user_id
CREATE OR REPLACE FUNCTION update_user_location(
  user_id UUID,
  new_lat DOUBLE PRECISION,
  new_lon DOUBLE PRECISION,
  new_address TEXT,
  new_city TEXT,
  new_country TEXT,
  new_postal_code TEXT,
  new_location_public BOOLEAN DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles 
  SET 
    coordinates = POINT(new_lon, new_lat),
    formatted_address = new_address,
    location_city = new_city,
    location_country = new_country,
    location_postal_code = new_postal_code,
    location_updated_at = NOW(),
    location_public = COALESCE(new_location_public, location_public)
  WHERE auth_user_id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 10. Comentarios sobre los cambios
COMMENT ON COLUMN profiles.auth_user_id IS
'Identificador único del usuario en Supabase Auth (auth.users.id). Reemplaza firebase_uid.';

COMMENT ON COLUMN profiles.firebase_uid IS
'Campo obsoleto - usar auth_user_id en su lugar. Se mantiene para compatibilidad temporal.';

-- 11. Verificar que la migración se completó
DO $$
BEGIN
  RAISE NOTICE 'Migración a Supabase Auth completada:';
  RAISE NOTICE '- Columna auth_user_id creada y poblada';
  RAISE NOTICE '- Políticas RLS actualizadas para usar auth.uid()';
  RAISE NOTICE '- Funciones actualizadas para usar auth_user_id';
  RAISE NOTICE '- firebase_uid marcado como obsoleto';
END $$;
