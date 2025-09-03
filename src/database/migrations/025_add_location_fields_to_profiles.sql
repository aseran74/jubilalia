-- Agregar campos de ubicación y configuración de privacidad a profiles
-- Permitir a los usuarios compartir su ubicación para búsquedas

-- 1. Agregar campos de ubicación
DO $$
BEGIN
  -- Agregar campo de ubicación si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location JSONB;
  END IF;
  
  -- Agregar campo de coordenadas si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'coordinates'
  ) THEN
    ALTER TABLE profiles ADD COLUMN coordinates POINT;
  END IF;
  
  -- Agregar campo de dirección formateada si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'formatted_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN formatted_address TEXT;
  END IF;
  
  -- Agregar campo de ciudad de ubicación si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location_city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_city TEXT;
  END IF;
  
  -- Agregar campo de país de ubicación si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location_country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_country TEXT;
  END IF;
  
  -- Agregar campo de código postal de ubicación si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location_postal_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_postal_code TEXT;
  END IF;
  
  -- Agregar campo de configuración de privacidad de ubicación si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location_public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_public BOOLEAN DEFAULT false;
  END IF;
  
  -- Agregar campo de radio de búsqueda si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'search_radius_km'
  ) THEN
    ALTER TABLE profiles ADD COLUMN search_radius_km INTEGER DEFAULT 50;
  END IF;
  
  -- Agregar campo de última actualización de ubicación si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location_updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_updated_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 2. Crear índices para mejorar el rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_profiles_location_public ON profiles(location_public) WHERE location_public = true;
CREATE INDEX IF NOT EXISTS idx_profiles_coordinates ON profiles USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_profiles_location_city ON profiles(location_city);
CREATE INDEX IF NOT EXISTS idx_profiles_location_country ON profiles(location_country);
CREATE INDEX IF NOT EXISTS idx_profiles_search_radius ON profiles(search_radius_km);

-- 3. Crear función para calcular distancia entre dos puntos
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
  -- Fórmula de Haversine para calcular distancia en kilómetros
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Crear función para buscar perfiles por proximidad
CREATE OR REPLACE FUNCTION search_profiles_by_location(
  search_lat DOUBLE PRECISION,
  search_lon DOUBLE PRECISION,
  max_distance_km INTEGER DEFAULT 50,
  limit_results INTEGER DEFAULT 100
) RETURNS TABLE(
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  formatted_address TEXT,
  location_city TEXT,
  location_country TEXT,
  distance_km DOUBLE PRECISION,
  bio TEXT,
  interests TEXT[],
  occupation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.formatted_address,
    p.location_city,
    p.location_country,
    calculate_distance(
      search_lat, 
      search_lon, 
      (p.coordinates[0])::DOUBLE PRECISION, 
      (p.coordinates[1])::DOUBLE PRECISION
    ) as distance_km,
    p.bio,
    p.interests,
    p.occupation
  FROM profiles p
  WHERE 
    p.location_public = true 
    AND p.coordinates IS NOT NULL
    AND calculate_distance(
      search_lat, 
      search_lon, 
      (p.coordinates[0])::DOUBLE PRECISION, 
      (p.coordinates[1])::DOUBLE PRECISION
    ) <= max_distance_km
  ORDER BY distance_km ASC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Crear función para actualizar ubicación del usuario
CREATE OR REPLACE FUNCTION update_user_location(
  user_id UUID,
  new_lat DOUBLE PRECISION,
  new_lon DOUBLE PRECISION,
  new_address TEXT,
  new_city TEXT,
  new_country TEXT,
  new_postal_code TEXT,
  new_location_public BOOLEAN DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles 
  SET 
    coordinates = POINT(new_lon, new_lat),
    formatted_address = new_address,
    location_city = new_city,
    location_country = new_country,
    location_postal_code = new_postal_code,
    location_updated_at = NOW(),
    location_public = COALESCE(new_location_public, location_public)
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 6. Comentarios sobre los nuevos campos
COMMENT ON COLUMN profiles.location IS 'Información completa de ubicación en formato JSON';
COMMENT ON COLUMN profiles.coordinates IS 'Coordenadas geográficas (POINT) para cálculos de distancia';
COMMENT ON COLUMN profiles.formatted_address IS 'Dirección formateada por Google Places';
COMMENT ON COLUMN profiles.location_city IS 'Ciudad de la ubicación';
COMMENT ON COLUMN profiles.location_country IS 'País de la ubicación';
COMMENT ON COLUMN profiles.location_postal_code IS 'Código postal de la ubicación';
COMMENT ON COLUMN profiles.location_public IS 'Si la ubicación es visible públicamente';
COMMENT ON COLUMN profiles.search_radius_km IS 'Radio de búsqueda en kilómetros';
COMMENT ON COLUMN profiles.location_updated_at IS 'Última actualización de la ubicación';

COMMENT ON FUNCTION calculate_distance IS 'Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine';
COMMENT ON FUNCTION search_profiles_by_location IS 'Busca perfiles por proximidad geográfica';
COMMENT ON FUNCTION update_user_location IS 'Actualiza la ubicación de un usuario';
