-- Arreglar políticas RLS para la tabla de mensajes (chat_messages)

-- 1. Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;

-- 2. Habilitar RLS en la tabla
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para SELECT (ver mensajes)
-- Los usuarios pueden ver mensajes donde son el remitente O el destinatario
CREATE POLICY "Users can view their conversations"
ON chat_messages
FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- 4. Crear política para INSERT (enviar mensajes)
-- Los usuarios solo pueden enviar mensajes como ellos mismos
CREATE POLICY "Users can send messages as themselves"
ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
);

-- 5. Crear política para UPDATE (actualizar mensajes)
-- Los usuarios pueden actualizar sus propios mensajes O marcar como leídos los mensajes que reciben
CREATE POLICY "Users can update their messages or mark received as read"
ON chat_messages
FOR UPDATE
TO authenticated
USING (
  auth.uid() = sender_id OR 
  (auth.uid() = receiver_id AND is_read = false)
)
WITH CHECK (
  auth.uid() = sender_id OR 
  (auth.uid() = receiver_id AND is_read = true)
);

-- 6. Crear política para DELETE (eliminar mensajes)
-- Los usuarios solo pueden eliminar sus propios mensajes enviados
CREATE POLICY "Users can delete their sent messages"
ON chat_messages
FOR DELETE
TO authenticated
USING (
  auth.uid() = sender_id
);

-- 7. Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'chat_messages';

