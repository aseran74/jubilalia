-- Corregir conflicto en políticas RLS para la tabla profiles
-- Asegurar que las políticas usen auth_user_id consistentemente

-- 1. Eliminar todas las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view basic profile info" ON profiles;

-- 2. Crear políticas corregidas usando auth_user_id
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

-- 3. Verificar que la tabla profiles tenga la estructura correcta
DO $$
BEGIN
  -- Verificar que auth_user_id existe y es NOT NULL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'auth_user_id' AND is_nullable = 'NO'
  ) THEN
    RAISE EXCEPTION 'La columna auth_user_id no existe o no es NOT NULL en la tabla profiles';
  END IF;
  
  -- Verificar que firebase_uid existe (para compatibilidad)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'firebase_uid'
  ) THEN
    RAISE EXCEPTION 'La columna firebase_uid no existe en la tabla profiles';
  END IF;
  
  RAISE NOTICE 'Estructura de la tabla profiles verificada correctamente';
END $$;

-- 4. Crear función para migrar usuarios existentes sin perfiles
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear perfil si no existe
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE auth_user_id = NEW.id
  ) THEN
    INSERT INTO profiles (
      auth_user_id,
      firebase_uid,
      email,
      full_name,
      avatar_url,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
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

-- 5. Crear trigger para crear perfil automáticamente al registrarse
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION ensure_user_profile();

-- 6. Comentarios sobre las políticas
COMMENT ON POLICY "Users can insert own profile" ON profiles IS
'Permite a usuarios autenticados crear su perfil con auth_user_id = auth.uid()';

COMMENT ON POLICY "Users can update own profile" ON profiles IS
'Permite a usuarios autenticados actualizar su perfil con auth_user_id = auth.uid()';

COMMENT ON POLICY "Users can view own profile" ON profiles IS
'Permite a usuarios autenticados ver su propio perfil completo';

COMMENT ON POLICY "Users can view public profiles" ON profiles IS
'Permite a usuarios autenticados ver perfiles con ubicación pública para búsquedas';

COMMENT ON POLICY "Users can view basic profile info" ON profiles IS
'Permite a usuarios autenticados ver información básica de otros perfiles';

-- 7. Verificar que las políticas se crearon correctamente
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS corregidas para profiles:';
  RAISE NOTICE '- Users can insert own profile (usando auth_user_id)';
  RAISE NOTICE '- Users can update own profile (usando auth_user_id)';
  RAISE NOTICE '- Users can view own profile (usando auth_user_id)';
  RAISE NOTICE '- Users can view public profiles';
  RAISE NOTICE '- Users can view basic profile info';
  RAISE NOTICE '- Trigger on_auth_user_created creado para crear perfiles automáticamente';
END $$;
