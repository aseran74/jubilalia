-- Tabla para fotos del perfil de usuario
CREATE TABLE IF NOT EXISTS profile_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_profile_photos_profile_id ON profile_photos(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_photos_order ON profile_photos(profile_id, image_order);

-- Habilitar RLS
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;

-- Política RLS: Los usuarios pueden ver todas las fotos de perfil
CREATE POLICY "Users can view all profile photos"
    ON profile_photos
    FOR SELECT
    USING (true);

-- Política RLS: Los usuarios solo pueden insertar sus propias fotos
CREATE POLICY "Users can insert their own profile photos"
    ON profile_photos
    FOR INSERT
    WITH CHECK (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = profile_id));

-- Política RLS: Los usuarios solo pueden actualizar sus propias fotos
CREATE POLICY "Users can update their own profile photos"
    ON profile_photos
    FOR UPDATE
    USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = profile_id));

-- Política RLS: Los usuarios solo pueden eliminar sus propias fotos
CREATE POLICY "Users can delete their own profile photos"
    ON profile_photos
    FOR DELETE
    USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = profile_id));

