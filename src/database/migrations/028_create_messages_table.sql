-- Crear tabla de mensajes para el sistema de mensajería
-- Sistema simple de mensajes entre usuarios

-- 1. Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- 3. Crear tabla de conversaciones para agrupar mensajes
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id)
);

-- 4. Crear índices para conversaciones
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);

-- 5. Crear función para obtener o crear conversación
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  user1_id UUID,
  user2_id UUID
) RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
  smaller_id UUID;
  larger_id UUID;
BEGIN
  -- Ordenar IDs para mantener consistencia
  IF user1_id < user2_id THEN
    smaller_id := user1_id;
    larger_id := user2_id;
  ELSE
    smaller_id := user2_id;
    larger_id := user1_id;
  END IF;

  -- Buscar conversación existente
  SELECT id INTO conversation_id
  FROM conversations
  WHERE participant1_id = smaller_id AND participant2_id = larger_id;

  -- Si no existe, crearla
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (participant1_id, participant2_id)
    VALUES (smaller_id, larger_id)
    RETURNING id INTO conversation_id;
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear función para enviar mensaje
CREATE OR REPLACE FUNCTION send_message(
  sender_id UUID,
  receiver_id UUID,
  message_content TEXT,
  message_type VARCHAR(20) DEFAULT 'text'
) RETURNS UUID AS $$
DECLARE
  message_id UUID;
  conversation_id UUID;
BEGIN
  -- Obtener o crear conversación
  conversation_id := get_or_create_conversation(sender_id, receiver_id);

  -- Insertar mensaje
  INSERT INTO messages (sender_id, receiver_id, content, message_type)
  VALUES (sender_id, receiver_id, message_content, message_type)
  RETURNING id INTO message_id;

  -- Actualizar conversación con último mensaje
  UPDATE conversations
  SET last_message_id = message_id, last_message_at = NOW(), updated_at = NOW()
  WHERE id = conversation_id;

  RETURN message_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear función para marcar mensajes como leídos
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  user_id UUID,
  other_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE messages
  SET is_read = true, updated_at = NOW()
  WHERE receiver_id = user_id AND sender_id = other_user_id AND is_read = false;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear función para obtener conversaciones de un usuario
CREATE OR REPLACE FUNCTION get_user_conversations(user_id UUID)
RETURNS TABLE(
  conversation_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  other_user_avatar TEXT,
  last_message_content TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    CASE 
      WHEN c.participant1_id = user_id THEN c.participant2_id
      ELSE c.participant1_id
    END as other_user_id,
    CASE 
      WHEN c.participant1_id = user_id THEN p2.full_name
      ELSE p1.full_name
    END as other_user_name,
    CASE 
      WHEN c.participant1_id = user_id THEN p2.avatar_url
      ELSE p1.avatar_url
    END as other_user_avatar,
    m.content as last_message_content,
    c.last_message_at,
    COALESCE(unread.unread_count, 0) as unread_count
  FROM conversations c
  LEFT JOIN profiles p1 ON c.participant1_id = p1.id
  LEFT JOIN profiles p2 ON c.participant2_id = p2.id
  LEFT JOIN messages m ON c.last_message_id = m.id
  LEFT JOIN (
    SELECT 
      CASE 
        WHEN sender_id = user_id THEN receiver_id
        ELSE sender_id
      END as other_user,
      COUNT(*) as unread_count
    FROM messages
    WHERE receiver_id = user_id AND is_read = false
    GROUP BY other_user
  ) unread ON (
    CASE 
      WHEN c.participant1_id = user_id THEN c.participant2_id
      ELSE c.participant1_id
    END = unread.other_user
  )
  WHERE c.participant1_id = user_id OR c.participant2_id = user_id
  ORDER BY c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear función para obtener mensajes de una conversación
CREATE OR REPLACE FUNCTION get_conversation_messages(
  user1_id UUID,
  user2_id UUID,
  limit_count INTEGER DEFAULT 50
) RETURNS TABLE(
  message_id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  message_type VARCHAR(20),
  is_read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  sender_name TEXT,
  sender_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.message_type,
    m.is_read,
    m.created_at,
    p.full_name as sender_name,
    p.avatar_url as sender_avatar
  FROM messages m
  JOIN profiles p ON m.sender_id = p.id
  WHERE (m.sender_id = user1_id AND m.receiver_id = user2_id)
     OR (m.sender_id = user2_id AND m.receiver_id = user1_id)
  ORDER BY m.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Habilitar RLS en las tablas
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 11. Crear políticas RLS para messages
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT TO authenticated
  USING (auth.uid()::text = (
    SELECT auth_user_id FROM profiles WHERE id = sender_id
  ) OR auth.uid()::text = (
    SELECT auth_user_id FROM profiles WHERE id = receiver_id
  ));

CREATE POLICY "Users can insert messages they send" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = (
    SELECT auth_user_id FROM profiles WHERE id = sender_id
  ));

CREATE POLICY "Users can update messages they sent" ON messages
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = (
    SELECT auth_user_id FROM profiles WHERE id = sender_id
  ));

-- 12. Crear políticas RLS para conversations
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT TO authenticated
  USING (auth.uid()::text = (
    SELECT auth_user_id FROM profiles WHERE id = participant1_id
  ) OR auth.uid()::text = (
    SELECT auth_user_id FROM profiles WHERE id = participant2_id
  ));

CREATE POLICY "Users can insert conversations they participate in" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = (
    SELECT auth_user_id FROM profiles WHERE id = participant1_id
  ) OR auth.uid()::text = (
    SELECT auth_user_id FROM profiles WHERE id = participant2_id
  ));

-- 13. Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Comentarios sobre la estructura
COMMENT ON TABLE messages IS 'Tabla para almacenar mensajes entre usuarios';
COMMENT ON TABLE conversations IS 'Tabla para agrupar conversaciones entre usuarios';
COMMENT ON FUNCTION get_or_create_conversation IS 'Obtiene una conversación existente o crea una nueva';
COMMENT ON FUNCTION send_message IS 'Envía un mensaje y actualiza la conversación';
COMMENT ON FUNCTION mark_messages_as_read IS 'Marca mensajes como leídos';
COMMENT ON FUNCTION get_user_conversations IS 'Obtiene todas las conversaciones de un usuario';
COMMENT ON FUNCTION get_conversation_messages IS 'Obtiene mensajes de una conversación específica';

-- 15. Verificar que la migración se completó
DO $$
BEGIN
  RAISE NOTICE 'Sistema de mensajería creado exitosamente:';
  RAISE NOTICE '- Tabla messages creada con RLS';
  RAISE NOTICE '- Tabla conversations creada con RLS';
  RAISE NOTICE '- Funciones de mensajería implementadas';
  RAISE NOTICE '- Políticas RLS configuradas';
END $$;
