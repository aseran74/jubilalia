-- Crear tabla de amigos/amistades
-- Ejecutar este script en Supabase SQL Editor

-- Crear tabla de amistades (friendships)
CREATE TABLE IF NOT EXISTS friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Crear índice compuesto para búsquedas de amistades mutuas
CREATE INDEX IF NOT EXISTS idx_friendships_user_friend ON friendships(user_id, friend_id, status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias amistades
CREATE POLICY "Users can view their own friendships"
    ON friendships FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Política: Los usuarios pueden crear solicitudes de amistad
CREATE POLICY "Users can create friendship requests"
    ON friendships FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propias amistades
CREATE POLICY "Users can update their own friendships"
    ON friendships FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Política: Los usuarios pueden eliminar sus propias amistades
CREATE POLICY "Users can delete their own friendships"
    ON friendships FOR DELETE
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Función para obtener amigos aceptados de un usuario
CREATE OR REPLACE FUNCTION get_user_friends(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    avatar_url TEXT,
    city TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        p.id,
        p.full_name,
        p.avatar_url,
        p.city,
        f.created_at
    FROM friendships f
    JOIN profiles p ON (
        CASE 
            WHEN f.user_id = user_uuid THEN p.id = f.friend_id
            ELSE p.id = f.user_id
        END
    )
    WHERE (f.user_id = user_uuid OR f.friend_id = user_uuid)
    AND f.status = 'accepted'
    ORDER BY f.created_at DESC;
$$;

-- Comentarios
COMMENT ON TABLE friendships IS 'Tabla de amistades entre usuarios';
COMMENT ON COLUMN friendships.status IS 'Estado de la amistad: pending (pendiente), accepted (aceptada), blocked (bloqueada)';
