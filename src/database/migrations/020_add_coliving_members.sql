-- Crear tabla para miembros de comunidades coliving
CREATE TABLE IF NOT EXISTS coliving_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, profile_id)
);

-- Añadir campo para hacer pública la lista de miembros
ALTER TABLE coliving_requirements 
ADD COLUMN IF NOT EXISTS show_members_publicly BOOLEAN DEFAULT false;

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_coliving_members_listing_id ON coliving_members(listing_id);
CREATE INDEX IF NOT EXISTS idx_coliving_members_profile_id ON coliving_members(profile_id);

-- Habilitar RLS
ALTER TABLE coliving_members ENABLE ROW LEVEL SECURITY;

-- Política para lectura: solo si show_members_publicly es true o si eres el propietario
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'coliving_members' 
    AND policyname = 'Coliving members are viewable based on privacy settings'
  ) THEN
    CREATE POLICY "Coliving members are viewable based on privacy settings"
      ON coliving_members FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM coliving_requirements cr
          JOIN property_listings pl ON cr.listing_id = pl.id
          WHERE cr.listing_id = coliving_members.listing_id
          AND (
            cr.show_members_publicly = true
            OR pl.profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
          )
        )
      );
  END IF;
END $$;

-- Política para inserción (solo el propietario)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'coliving_members' 
    AND policyname = 'Property owners can add coliving members'
  ) THEN
    CREATE POLICY "Property owners can add coliving members"
      ON coliving_members FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM property_listings
          WHERE property_listings.id = listing_id
          AND property_listings.profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        )
      );
  END IF;
END $$;

-- Política para actualización (solo el propietario)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'coliving_members' 
    AND policyname = 'Property owners can update coliving members'
  ) THEN
    CREATE POLICY "Property owners can update coliving members"
      ON coliving_members FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM property_listings
          WHERE property_listings.id = listing_id
          AND property_listings.profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        )
      );
  END IF;
END $$;

-- Política para eliminación (solo el propietario)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'coliving_members' 
    AND policyname = 'Property owners can delete coliving members'
  ) THEN
    CREATE POLICY "Property owners can delete coliving members"
      ON coliving_members FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM property_listings
          WHERE property_listings.id = listing_id
          AND property_listings.profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        )
      );
  END IF;
END $$;

-- Comentarios
COMMENT ON TABLE coliving_members IS 'Miembros que viven en una comunidad coliving';
COMMENT ON COLUMN coliving_members.listing_id IS 'ID de la propiedad coliving';
COMMENT ON COLUMN coliving_members.profile_id IS 'ID del usuario que es miembro';
COMMENT ON COLUMN coliving_members.joined_at IS 'Fecha en que se unió a la comunidad';
COMMENT ON COLUMN coliving_members.status IS 'Estado del miembro: active, inactive, pending';
COMMENT ON COLUMN coliving_requirements.show_members_publicly IS 'Si se muestra públicamente la lista de miembros';
