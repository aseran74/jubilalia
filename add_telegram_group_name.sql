-- Migración para añadir campo telegram_group_name a la tabla groups
-- Ejecutar en Supabase SQL Editor

-- Añadir campo telegram_group_name a la tabla groups
ALTER TABLE groups 
ADD COLUMN telegram_group_name TEXT;

-- Añadir comentario al campo
COMMENT ON COLUMN groups.telegram_group_name IS 'Nombre del grupo de Telegram vinculado (sin @)';

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_groups_telegram_group_name ON groups(telegram_group_name);

-- Añadir constraint para validar formato del nombre de Telegram
ALTER TABLE groups 
ADD CONSTRAINT check_telegram_group_name_format 
CHECK (telegram_group_name IS NULL OR telegram_group_name ~ '^[a-zA-Z0-9_]+$');

-- Verificar que la migración se aplicó correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'groups' 
AND column_name = 'telegram_group_name';
