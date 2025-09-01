-- Finalizar la estructura de la tabla profiles para Supabase Auth
-- Esta migración asegura que todos los campos necesarios estén presentes

-- 1. Verificar y corregir la estructura final de profiles
DO $$ 
BEGIN
  -- Asegurar que firebase_uid sea NOT NULL y tenga índice único
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'firebase_uid' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN firebase_uid SET NOT NULL;
  END IF;
  
  -- Agregar restricción única en firebase_uid si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_firebase_uid_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_firebase_uid_key UNIQUE (firebase_uid);
  END IF;
  
  -- Asegurar que email sea NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;
  END IF;
  
  -- Agregar restricción única en email si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_email_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- 2. Crear índices adicionales para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);

-- 3. Verificar que la tabla posts tenga la estructura correcta
DO $$ 
BEGIN
  -- Asegurar que profile_id sea NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'profile_id' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE posts ALTER COLUMN profile_id SET NOT NULL;
  END IF;
  
  -- Asegurar que is_published tenga valor por defecto
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'is_published' AND column_default IS NULL
  ) THEN
    ALTER TABLE posts ALTER COLUMN is_published SET DEFAULT false;
  END IF;
END $$;

-- 4. Crear función para migrar usuarios existentes sin perfiles
CREATE OR REPLACE FUNCTION migrate_existing_users()
RETURNS void AS $$
DECLARE
  auth_user RECORD;
BEGIN
  -- Para cada usuario en auth.users que no tenga perfil
  FOR auth_user IN 
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE id NOT IN (SELECT firebase_uid FROM profiles WHERE firebase_uid IS NOT NULL)
  LOOP
    -- Crear perfil automáticamente
    INSERT INTO profiles (
      firebase_uid,
      email,
      full_name,
      avatar_url,
      created_at,
      updated_at
    ) VALUES (
      auth_user.id::text,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data->>'full_name', auth_user.raw_user_meta_data->>'name', 'Usuario'),
      auth_user.raw_user_meta_data->>'avatar_url',
      NOW(),
      NOW()
    );
  END LOOP;
END;
$$ language 'plpgsql';

-- 5. Ejecutar migración de usuarios existentes
SELECT migrate_existing_users();

-- 6. Limpiar función temporal
DROP FUNCTION IF EXISTS migrate_existing_users();

-- 7. Comentarios finales
COMMENT ON TABLE profiles IS 
'Tabla de perfiles de usuario para Supabase Auth. Cada usuario autenticado debe tener un perfil.';

COMMENT ON COLUMN profiles.firebase_uid IS 
'Identificador único del usuario en Supabase Auth (auth.users.id).';

COMMENT ON COLUMN profiles.email IS 
'Email del usuario (debe coincidir con auth.users.email).';
