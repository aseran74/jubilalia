-- =====================================================
-- MIGRACIONES PARA LA BASE DE DATOS DE JUBILALIA
-- =====================================================

-- 1. TABLA DE ALOJAMIENTOS
CREATE TABLE IF NOT EXISTS accommodations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'España',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price_per_month DECIMAL(10, 2) NOT NULL,
  price_per_person DECIMAL(10, 2),
  total_rooms INTEGER NOT NULL,
  available_rooms INTEGER NOT NULL,
  total_bathrooms INTEGER DEFAULT 1,
  square_meters INTEGER,
  property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('casa', 'piso', 'residencia', 'chalet', 'duplex')),
  amenities TEXT[], -- Array de comodidades
  images TEXT[], -- Array de URLs de imágenes
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE SOLICITUDES DE ALOJAMIENTO
CREATE TABLE IF NOT EXISTS accommodation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message TEXT,
  requested_rooms INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(accommodation_id, requester_id)
);

-- 3. TABLA DE RESEÑAS Y VALORACIONES
CREATE TABLE IF NOT EXISTS accommodation_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(accommodation_id, reviewer_id)
);

-- 4. TABLA DE FAVORITOS
CREATE TABLE IF NOT EXISTS accommodation_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(accommodation_id, user_id)
);

-- =====================================================
-- ÍNDICES PARA BÚSQUEDAS EFICIENTES
-- =====================================================

-- Índices para alojamientos
CREATE INDEX IF NOT EXISTS idx_accommodations_city ON accommodations(city);
CREATE INDEX IF NOT EXISTS idx_accommodations_price ON accommodations(price_per_month);
CREATE INDEX IF NOT EXISTS idx_accommodations_type ON accommodations(property_type);
CREATE INDEX IF NOT EXISTS idx_accommodations_owner ON accommodations(owner_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_active ON accommodations(is_active);
CREATE INDEX IF NOT EXISTS idx_accommodations_location ON accommodations(latitude, longitude);

-- Índices para solicitudes
CREATE INDEX IF NOT EXISTS idx_requests_accommodation ON accommodation_requests(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON accommodation_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON accommodation_requests(status);

-- Índices para reseñas
CREATE INDEX IF NOT EXISTS idx_reviews_accommodation ON accommodation_reviews(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON accommodation_reviews(rating);

-- Índices para favoritos
CREATE INDEX IF NOT EXISTS idx_favorites_user ON accommodation_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_accommodation ON accommodation_favorites(accommodation_id);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_accommodations_updated_at 
  BEFORE UPDATE ON accommodations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at 
  BEFORE UPDATE ON accommodation_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS DE PRUEBA
-- =====================================================

-- Insertar alojamientos de ejemplo (solo si no existen)
INSERT INTO accommodations (title, description, address, city, postal_code, price_per_month, price_per_person, total_rooms, available_rooms, total_bathrooms, square_meters, property_type, amenities, images) VALUES
(
  'Casa Rural en la Sierra de Madrid',
  'Hermosa casa rural con vistas panorámicas, ideal para personas que buscan tranquilidad y naturaleza. Amplio jardín y terraza.',
  'Calle Sierra 123, Monte del Pilar',
  'Madrid',
  '28001',
  1200.00,
  400.00,
  4,
  2,
  3,
  180,
  'casa',
  ARRAY['jardín', 'terraza', 'chimenea', 'cocina equipada', 'parking'],
  ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800']
),
(
  'Piso Céntrico en Barcelona',
  'Apartamento moderno en el corazón de Barcelona, cerca de transporte público y servicios. Perfecto para personas activas.',
  'Carrer de Gràcia 456, Gràcia',
  'Barcelona',
  '08012',
  1500.00,
  500.00,
  3,
  1,
  2,
  120,
  'piso',
  ARRAY['ascensor', 'balcón', 'aire acondicionado', 'calefacción', 'internet'],
  ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']
),
(
  'Residencia de Lujo en Marbella',
  'Exclusiva residencia con servicios premium, piscina comunitaria y actividades sociales. Ideal para personas que buscan lujo y comodidad.',
  'Avenida del Mar 789, Marbella',
  'Málaga',
  '29600',
  2500.00,
  625.00,
  5,
  3,
  4,
  250,
  'residencia',
  ARRAY['piscina', 'gimnasio', 'restaurante', 'servicio de limpieza', 'seguridad 24h'],
  ARRAY['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800']
),
(
  'Chalet Familiar en Valencia',
  'Espacioso chalet con jardín privado y huerta. Perfecto para personas que disfrutan de la jardinería y la vida al aire libre.',
  'Calle Huerta 321, Paterna',
  'Valencia',
  '46980',
  1800.00,
  450.00,
  6,
  4,
  3,
  200,
  'chalet',
  ARRAY['jardín privado', 'huerta', 'barbacoa', 'garaje', 'trastero'],
  ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800']
),
(
  'Duplex Moderno en Bilbao',
  'Elegante dúplex con diseño contemporáneo y acabados de alta calidad. Ubicado en zona residencial tranquila.',
  'Calle Gran Vía 654, Abando',
  'Bilbao',
  '48001',
  2000.00,
  500.00,
  4,
  2,
  3,
  160,
  'duplex',
  ARRAY['terraza', 'parking subterráneo', 'portero físico', 'ascensor', 'trastero'],
  ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para alojamientos (lectura pública, escritura solo para propietarios)
CREATE POLICY "Accommodations are viewable by everyone" ON accommodations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can insert their own accommodations" ON accommodations
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can update their own accommodations" ON accommodations
  FOR UPDATE USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can delete their own accommodations" ON accommodations
  FOR DELETE USING (auth.uid()::text = owner_id::text);

-- Políticas para solicitudes
CREATE POLICY "Users can view requests for their accommodations" ON accommodation_requests
  FOR SELECT USING (
    auth.uid()::text = requester_id::text OR 
    auth.uid()::text IN (
      SELECT owner_id::text FROM accommodations WHERE id = accommodation_id
    )
  );

CREATE POLICY "Users can insert their own requests" ON accommodation_requests
  FOR INSERT WITH CHECK (auth.uid()::text = requester_id::text);

CREATE POLICY "Users can update their own requests" ON accommodation_requests
  FOR UPDATE USING (auth.uid()::text = requester_id::text);

-- Políticas para reseñas
CREATE POLICY "Reviews are viewable by everyone" ON accommodation_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON accommodation_reviews
  FOR INSERT WITH CHECK (auth.uid()::text = reviewer_id::text);

CREATE POLICY "Users can update their own reviews" ON accommodation_reviews
  FOR UPDATE USING (auth.uid()::text = reviewer_id::text);

-- Políticas para favoritos
CREATE POLICY "Users can view their own favorites" ON accommodation_favorites
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own favorites" ON accommodation_favorites
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own favorites" ON accommodation_favorites
  FOR DELETE USING (auth.uid()::text = user_id::text);
