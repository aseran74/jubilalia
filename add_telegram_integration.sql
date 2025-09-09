-- Migración para añadir integración con Telegram a los grupos
-- Ejecutar en Supabase SQL Editor

-- Añadir campo telegram_group_id a la tabla groups
ALTER TABLE groups 
ADD COLUMN telegram_group_id TEXT;

-- Añadir comentario al campo
COMMENT ON COLUMN groups.telegram_group_id IS 'ID del grupo de Telegram vinculado a este grupo de Jubilalia';

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_groups_telegram_group_id ON groups(telegram_group_id);

-- Añadir constraint para validar formato de ID de Telegram (debe ser numérico)
ALTER TABLE groups 
ADD CONSTRAINT check_telegram_group_id_format 
CHECK (telegram_group_id IS NULL OR telegram_group_id ~ '^-?[0-9]+$');

-- Actualizar RLS para permitir lectura del campo telegram_group_id
-- (ya debería estar cubierto por las políticas existentes, pero por si acaso)
-- Las políticas existentes ya permiten SELECT en groups, así que no necesitamos cambios adicionales

-- Crear función para obtener grupos con información de Telegram
CREATE OR REPLACE FUNCTION get_groups_with_telegram()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  telegram_group_id TEXT,
  current_members INTEGER,
  created_at TIMESTAMPTZ
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    g.id,
    g.name,
    g.description,
    g.telegram_group_id,
    g.current_members,
    g.created_at
  FROM groups g
  WHERE g.telegram_group_id IS NOT NULL
  ORDER BY g.created_at DESC;
$$;

-- Crear función para vincular un grupo con Telegram
CREATE OR REPLACE FUNCTION link_group_to_telegram(
  group_uuid UUID,
  telegram_group_id_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el grupo existe y el usuario tiene permisos
  IF NOT EXISTS (
    SELECT 1 FROM groups 
    WHERE id = group_uuid 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = group_uuid 
      AND profile_id = auth.uid() 
      AND role = 'admin'
    ))
  ) THEN
    RETURN FALSE;
  END IF;

  -- Actualizar el grupo con el ID de Telegram
  UPDATE groups 
  SET telegram_group_id = telegram_group_id_param
  WHERE id = group_uuid;

  RETURN TRUE;
END;
$$;

-- Crear función para desvincular un grupo de Telegram
CREATE OR REPLACE FUNCTION unlink_group_from_telegram(
  group_uuid UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el grupo existe y el usuario tiene permisos
  IF NOT EXISTS (
    SELECT 1 FROM groups 
    WHERE id = group_uuid 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = group_uuid 
      AND profile_id = auth.uid() 
      AND role = 'admin'
    ))
  ) THEN
    RETURN FALSE;
  END IF;

  -- Desvincular el grupo de Telegram
  UPDATE groups 
  SET telegram_group_id = NULL
  WHERE id = group_uuid;

  RETURN TRUE;
END;
$$;

-- Comentarios para documentación
COMMENT ON FUNCTION get_groups_with_telegram() IS 'Obtiene todos los grupos que tienen vinculación con Telegram';
COMMENT ON FUNCTION link_group_to_telegram(UUID, TEXT) IS 'Vincula un grupo de Jubilalia con un grupo de Telegram';
COMMENT ON FUNCTION unlink_group_from_telegram(UUID) IS 'Desvincula un grupo de Jubilalia de su grupo de Telegram';

-- Verificar que la migración se aplicó correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'groups' 
AND column_name = 'telegram_group_id';
