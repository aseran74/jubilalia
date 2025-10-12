-- Agregar campo para indicar si quiere vivir con compañero
ALTER TABLE profiles ADD COLUMN wants_to_live_with_roommate BOOLEAN DEFAULT false;

-- Agregar comentario
COMMENT ON COLUMN profiles.wants_to_live_with_roommate IS 'Indica si la persona está interesada en vivir con un compañero de habitación';

-- Crear índice para búsquedas eficientes
CREATE INDEX idx_profiles_wants_roommate ON profiles(wants_to_live_with_roommate) WHERE wants_to_live_with_roommate = true;

-- Actualizar RLS para permitir lectura del campo
-- El campo ya debería estar incluido en las políticas existentes, pero lo verificamos
