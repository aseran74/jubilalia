-- Migración para crear la tabla profiles si no existe
-- Fecha: 2024-01-XX
-- Descripción: Crear tabla de perfiles de usuario para Jubilalia

-- Crear la tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    occupation TEXT,
    bio TEXT,
    city TEXT,
    country TEXT DEFAULT 'España',
    interests TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);

-- Crear política RLS (Row Level Security) para permitir acceso a perfiles propios
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que los usuarios vean su propio perfil
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = firebase_uid);

-- Política para permitir que los usuarios inserten su propio perfil
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = firebase_uid);

-- Política para permitir que los usuarios actualicen su propio perfil
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = firebase_uid);

-- Comentarios para documentar la tabla
COMMENT ON TABLE profiles IS 'Perfiles de usuario de Jubilalia';
COMMENT ON COLUMN profiles.firebase_uid IS 'ID único de Firebase del usuario';
COMMENT ON COLUMN profiles.email IS 'Email del usuario';
COMMENT ON COLUMN profiles.full_name IS 'Nombre completo del usuario';
COMMENT ON COLUMN profiles.avatar_url IS 'URL de la imagen de perfil';
COMMENT ON COLUMN profiles.phone IS 'Número de teléfono';
COMMENT ON COLUMN profiles.date_of_birth IS 'Fecha de nacimiento';
COMMENT ON COLUMN profiles.gender IS 'Género (male, female, other)';
COMMENT ON COLUMN profiles.occupation IS 'Ocupación o profesión';
COMMENT ON COLUMN profiles.bio IS 'Biografía o descripción personal';
COMMENT ON COLUMN profiles.city IS 'Ciudad de residencia';
COMMENT ON COLUMN profiles.country IS 'País de residencia';
COMMENT ON COLUMN profiles.interests IS 'Array de intereses del usuario';
COMMENT ON COLUMN profiles.created_at IS 'Fecha de creación del perfil';
COMMENT ON COLUMN profiles.updated_at IS 'Fecha de última actualización';
