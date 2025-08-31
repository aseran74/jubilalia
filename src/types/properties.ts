// Tipos para el sistema de propiedades de Jubilalia

export type ListingType = 'room_rental' | 'property_rental' | 'property_purchase' | 'seasonal_rental';
export type PriceType = 'monthly' | 'total' | 'per_person';
export type GenderPreference = 'any' | 'male' | 'female';
export type PropertyManagementType = 'self_managed' | 'professional' | 'cooperative';
export type InquiryType = 'viewing' | 'application' | 'question' | 'offer';
export type InquiryStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

// Tabla principal de listados de propiedades
export interface PropertyListing {
  id: string;
  profile_id: string;
  listing_type: ListingType;
  title: string;
  description?: string;
  property_type: string;
  address: string;
  city: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  price_type: PriceType;
  currency: string;
  bedrooms?: number;
  bathrooms?: number;
  total_area?: number;
  available_from?: string;
  available_until?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Requisitos para alquiler de habitación
export interface RoomRentalRequirements {
  id: string;
  listing_id: string;
  bed_type: 'single' | 'double'; // Cama individual o doble
  room_area: number; // Metros cuadrados de la habitación
  private_bathroom: boolean; // Si tiene cuarto de baño propio
  shared_bathroom: boolean; // Si debe compartir baño con otros
  has_balcony: boolean; // Si tiene balcón
  preferred_gender: GenderPreference; // Solo mujeres, solo hombres o indiferente
  preferred_age_min: number; // Edad mínima (65+)
  preferred_age_max: number; // Edad máxima (ej: 80)
  smoking_allowed: boolean; // Si admite fumadores
  tenant_smoker: boolean; // Si se permite que el inquilino sea fumador
  pets_allowed: boolean; // Si admite mascotas
  pet_types?: string[]; // Tipos de mascotas permitidas
  tenant_pets_allowed: boolean; // Si se permiten mascotas al inquilino
  tenant_pet_types?: string[]; // Tipos de mascotas permitidas para el inquilino
  tenant_gender_preference: GenderPreference; // Preferencia de género del inquilino
  tenant_age_min: number; // Edad mínima del inquilino
  tenant_age_max: number; // Edad máxima del inquilino
  other_requirements?: string; // Otros requisitos
  created_at: string;
}

// Requisitos para alquiler de propiedad completa
export interface PropertyRentalRequirements {
  id: string;
  listing_id: string;
  max_tenants: number;
  preferred_tenants: string[];
  shared_expenses: boolean;
  utilities_included: boolean;
  internet_included: boolean;
  parking_available: boolean;
  accessibility_features?: string[];
  other_requirements?: string;
  created_at: string;
}

// Requisitos para compra compartida
export interface PropertyPurchaseRequirements {
  id: string;
  listing_id: string;
  total_price?: number;
  shares_available: number;
  price_per_share?: number;
  min_shares_per_person: number;
  max_shares_per_person?: number;
  property_management_type?: PropertyManagementType;
  legal_structure?: string;
  other_requirements?: string;
  created_at: string;
}

// Requisitos para alquiler temporal (Holydeo.com)
export interface SeasonalRentalRequirements {
  id: string;
  listing_id: string;
  season_start: string;
  season_end: string;
  min_stay_days: number;
  max_stay_days?: number;
  beach_distance_meters?: number;
  beach_access_type?: string;
  seasonal_amenities?: string[];
  off_season_discount?: number;
  other_requirements?: string;
  created_at: string;
}

// Imágenes de propiedades
export interface PropertyImage {
  id: string;
  listing_id: string;
  image_url: string;
  image_order: number;
  is_primary: boolean;
  created_at: string;
}

// Amenidades de propiedades
export interface PropertyAmenity {
  id: string;
  listing_id: string;
  amenity_type: 'basic' | 'luxury' | 'accessibility' | 'outdoor';
  amenity_name: string;
  is_available: boolean;
  created_at: string;
}

// Solicitudes de interés
export interface PropertyInquiry {
  id: string;
  listing_id: string;
  interested_user_id: string;
  interested_profile_id: string;
  inquiry_type: InquiryType;
  message?: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

// Tipos para crear nuevos listados
export interface CreatePropertyListing {
  listing_type: ListingType;
  title: string;
  description?: string;
  property_type: string;
  address: string;
  city: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  price_type?: PriceType;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  total_area?: number;
  available_from?: string;
  available_until?: string;
}

export interface CreateRoomRentalRequirements {
  bed_type: 'single' | 'double'; // Cama individual o doble
  room_area: number; // Metros cuadrados de la habitación
  private_bathroom: boolean; // Si tiene cuarto de baño propio
  shared_bathroom: boolean; // Si debe compartir baño con otros
  has_balcony: boolean; // Si tiene balcón
  preferred_gender: GenderPreference; // Solo mujeres, solo hombres o indiferente
  preferred_age_min: number; // Edad mínima (65+)
  preferred_age_max: number; // Edad máxima (ej: 80)
  smoking_allowed: boolean; // Si admite fumadores
  tenant_smoker: boolean; // Si se permite que el inquilino sea fumador
  pets_allowed: boolean; // Si admite mascotas
  pet_types?: string[]; // Tipos de mascotas permitidas
  tenant_pets_allowed: boolean; // Si se permiten mascotas al inquilino
  tenant_pet_types?: string[]; // Tipos de mascotas permitidas para el inquilino
  tenant_gender_preference: GenderPreference; // Preferencia de género del inquilino
  tenant_age_min: number; // Edad mínima del inquilino
  tenant_age_max: number; // Edad máxima del inquilino
  other_requirements?: string; // Otros requisitos
}

export interface CreatePropertyRentalRequirements {
  max_tenants: number;
  preferred_tenants: string[];
  shared_expenses: boolean;
  utilities_included: boolean;
  internet_included: boolean;
  parking_available: boolean;
  accessibility_features?: string[];
  other_requirements?: string;
}

export interface CreatePropertyPurchaseRequirements {
  total_price?: number;
  shares_available: number;
  price_per_share?: number;
  min_shares_per_person: number;
  max_shares_per_person?: number;
  property_management_type?: PropertyManagementType;
  legal_structure?: string;
  other_requirements?: string;
}

export interface CreateSeasonalRentalRequirements {
  season_start: string;
  season_end: string;
  min_stay_days: number;
  max_stay_days?: number;
  beach_distance_meters?: number;
  beach_access_type?: string;
  seasonal_amenities?: string[];
  off_season_discount?: number;
  other_requirements?: string;
}

// Tipo completo para crear un listado con todos sus requisitos
export interface CreatePropertyListingComplete {
  listing: CreatePropertyListing;
  roomRequirements?: CreateRoomRentalRequirements;
  propertyRentalRequirements?: CreatePropertyRentalRequirements;
  propertyPurchaseRequirements?: CreatePropertyPurchaseRequirements;
  seasonalRentalRequirements?: CreateSeasonalRentalRequirements;
  amenities?: string[];
  images?: File[];
}

// Tipos para filtros de búsqueda
export interface PropertySearchFilters {
  listing_type?: ListingType[];
  city?: string;
  price_min?: number;
  price_max?: number;
  bedrooms_min?: number;
  bathrooms_min?: number;
  property_type?: string[];
  amenities?: string[];
  available_from?: string;
  available_until?: string;
  smoking_allowed?: boolean;
  pets_allowed?: boolean;
  accessibility_features?: string[];
}

// Tipos para respuestas de la API
export interface PropertyListingWithDetails extends PropertyListing {
  room_requirements?: RoomRentalRequirements;
  property_rental_requirements?: PropertyRentalRequirements;
  property_purchase_requirements?: PropertyPurchaseRequirements;
  seasonal_rental_requirements?: SeasonalRentalRequirements;
  images: PropertyImage[];
  amenities: PropertyAmenity[];
  user_profile?: any; // Perfil del usuario que creó el listado
}

// Tipos para estadísticas
export interface PropertyStats {
  total_listings: number;
  active_listings: number;
  listings_by_type: Record<ListingType, number>;
  average_price: number;
  cities_with_listings: string[];
  recent_listings: PropertyListing[];
}
