-- Corregir políticas RLS para la tabla profiles
-- Permitir que los usuarios puedan insertar y actualizar sus perfiles correctamente

-- 1. Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- 2. Crear políticas corregidas para Supabase Auth

-- Política para INSERT: Permitir que cualquier usuario autenticado cree su perfil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = firebase_uid);

-- Política para UPDATE: Permitir que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = firebase_uid);

-- Política para SELECT: Permitir que los usuarios vean su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid()::text = firebase_uid);

-- 3. Política adicional para permitir que los usuarios vean perfiles públicos
-- (necesario para la búsqueda de personas)
CREATE POLICY "Users can view public profiles" ON profiles
  FOR SELECT TO authenticated
  USING (location_public = true);

-- 4. Política para permitir que los usuarios vean perfiles básicos de otros usuarios
-- (para funcionalidades sociales básicas)
CREATE POLICY "Users can view basic profile info" ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- 5. Verificar que las políticas se crearon correctamente
-- (esto es solo para verificación, no afecta la funcionalidad)
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS creadas para profiles:';
  RAISE NOTICE '- Users can insert own profile';
  RAISE NOTICE '- Users can update own profile';
  RAISE NOTICE '- Users can view own profile';
  RAISE NOTICE '- Users can view public profiles';
  RAISE NOTICE '- Users can view basic profile info';
END $$;

-- 6. Comentarios sobre las políticas
COMMENT ON POLICY "Users can insert own profile" ON profiles IS
'Permite a usuarios autenticados crear su perfil con firebase_uid = auth.uid()';

COMMENT ON POLICY "Users can update own profile" ON profiles IS
'Permite a usuarios autenticados actualizar su perfil con firebase_uid = auth.uid()';

COMMENT ON POLICY "Users can view own profile" ON profiles IS
'Permite a usuarios autenticados ver su propio perfil completo';

COMMENT ON POLICY "Users can view public profiles" ON profiles IS
'Permite a usuarios autenticados ver perfiles con ubicación pública para búsquedas';

COMMENT ON POLICY "Users can view basic profile info" ON profiles IS
'Permite a usuarios autenticados ver información básica de otros perfiles';
