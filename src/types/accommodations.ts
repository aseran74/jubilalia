export interface Accommodation {
  id: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  price_per_month: number;
  price_per_person?: number;
  total_rooms: number;
  available_rooms: number;
  total_bathrooms: number;
  square_meters?: number;
  property_type: 'casa' | 'piso' | 'residencia' | 'chalet' | 'duplex';
  amenities: string[];
  images: string[];
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccommodationRequest {
  id: string;
  accommodation_id: string;
  requester_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message?: string;
  requested_rooms: number;
  created_at: string;
  updated_at: string;
}

export interface AccommodationReview {
  id: string;
  accommodation_id: string;
  reviewer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface AccommodationFavorite {
  id: string;
  accommodation_id: string;
  user_id: string;
  created_at: string;
}

import type { Database } from './supabase';

export interface AccommodationFilters {
  city?: string;
  min_price?: number;
  max_price?: number;
  property_type?: string[];
  min_rooms?: number;
  max_rooms?: number;
  amenities?: string[];
}

export interface AccommodationSearchParams {
  query?: string;
  filters: AccommodationFilters;
  page: number;
  limit: number;
  sort_by?: 'price' | 'created_at' | 'rating';
  sort_order?: 'asc' | 'desc';
}

// Tipos para la base de datos de Supabase
export type AccommodationRow = Database['public']['Tables']['accommodations']['Row'];
export type AccommodationInsert = Database['public']['Tables']['accommodations']['Insert'];
export type AccommodationUpdate = Database['public']['Tables']['accommodations']['Update'];

export type AccommodationRequestRow = Database['public']['Tables']['accommodation_requests']['Row'];
export type AccommodationRequestInsert = Database['public']['Tables']['accommodation_requests']['Insert'];
export type AccommodationRequestUpdate = Database['public']['Tables']['accommodation_requests']['Update'];

export type AccommodationReviewRow = Database['public']['Tables']['accommodation_reviews']['Row'];
export type AccommodationReviewInsert = Database['public']['Tables']['accommodation_reviews']['Insert'];
export type AccommodationReviewUpdate = Database['public']['Tables']['accommodation_reviews']['Update'];

export type AccommodationFavoriteRow = Database['public']['Tables']['accommodation_favorites']['Row'];
export type AccommodationFavoriteInsert = Database['public']['Tables']['accommodation_favorites']['Insert'];
export type AccommodationFavoriteUpdate = Database['public']['Tables']['accommodation_favorites']['Update'];
