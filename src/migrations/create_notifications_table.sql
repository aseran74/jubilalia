-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('activity_nearby', 'new_message', 'group_post', 'friend_request', 'friend_accepted', 'group_invitation')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = notifications.user_id 
            AND p.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = notifications.user_id 
            AND p.auth_user_id = auth.uid()
        )
    );

-- Función para crear notificaciones (usada por triggers o funciones del sistema)
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_link_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link_url, metadata)
    VALUES (p_user_id, p_type, p_title, p_message, p_link_url, p_metadata)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
