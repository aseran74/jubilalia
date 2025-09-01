-- Corregir la relación entre profiles y posts
-- Asegurar que todos los usuarios tengan perfiles válidos
-- ADAPTADO PARA SUPABASE AUTH (no Firebase)

-- 1. Verificar y corregir la estructura de la tabla profiles
DO $$ 
BEGIN
  -- Agregar campo firebase_uid si no existe (mantener para compatibilidad)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'firebase_uid'
  ) THEN
    ALTER TABLE profiles ADD COLUMN firebase_uid TEXT;
  END IF;
  
  -- Agregar campo id si no existe (debe ser UUID)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
  END IF;
END $$;

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 3. Corregir políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Crear políticas para Supabase Auth
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = firebase_uid);

-- 4. Corregir políticas RLS para posts
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Crear políticas para posts usando profile_id
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

-- Política para visualización pública de posts
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (is_published = true);

-- 5. Función para crear perfil automáticamente si no existe
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar si ya existe un perfil para este usuario
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE firebase_uid = NEW.id::text
  ) THEN
    -- Crear perfil automáticamente
    INSERT INTO profiles (
      firebase_uid,
      email,
      full_name,
      avatar_url,
      created_at,
      updated_at
    ) VALUES (
      NEW.id::text,
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

-- 6. Crear trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS ensure_profile_trigger ON auth.users;
CREATE TRIGGER ensure_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION ensure_user_profile();

-- 7. Comentarios de seguridad
COMMENT ON POLICY "Users can view own profile" ON profiles IS 
'Permite a los usuarios ver solo su propio perfil usando Supabase Auth.';

COMMENT ON POLICY "Users can insert own profile" ON profiles IS 
'Permite a los usuarios crear solo su propio perfil usando Supabase Auth.';

COMMENT ON POLICY "Users can update own profile" ON profiles IS 
'Permite a los usuarios actualizar solo su propio perfil usando Supabase Auth.';

COMMENT ON POLICY "Users can insert their own posts" ON posts IS 
'Permite a los usuarios crear posts solo para su propio perfil usando Supabase Auth.';

COMMENT ON POLICY "Users can update their own posts" ON posts IS 
'Permite a los usuarios actualizar posts solo de su propio perfil usando Supabase Auth.';

COMMENT ON POLICY "Users can delete their own posts" ON posts IS 
'Permite a los usuarios eliminar posts solo de su propio perfil usando Supabase Auth.';

COMMENT ON FUNCTION ensure_user_profile() IS 
'Función que crea automáticamente un perfil cuando se registra un nuevo usuario en Supabase Auth.';
