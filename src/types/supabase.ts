

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      post_categories: {
        Row: {
          id: string
          name: string
          color: string | null
          icon: string | null
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
          icon?: string | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
          icon?: string | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string | null
          category_id: string
          profile_id: string
          featured_image_url: string | null
          is_published: boolean | null
          is_featured: boolean | null
          tags: string[] | null
          published_at: string | null
          view_count: number | null
          like_count: number | null
          comment_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string | null
          category_id: string
          profile_id: string
          featured_image_url?: string | null
          is_published?: boolean | null
          is_featured?: boolean | null
          tags?: string[] | null
          published_at?: string | null
          view_count?: number | null
          like_count?: number | null
          comment_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string | null
          category_id?: string
          profile_id?: string
          featured_image_url?: string | null
          is_published?: boolean | null
          is_featured?: boolean | null
          tags?: string[] | null
          published_at?: string | null
          view_count?: number | null
          like_count?: number | null
          comment_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          profile_id: string
          content: string
          parent_comment_id: string | null
          is_approved: boolean | null
          like_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          profile_id: string
          content: string
          parent_comment_id?: string | null
          is_approved?: boolean | null
          like_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          profile_id?: string
          content?: string
          parent_comment_id?: string | null
          is_approved?: boolean | null
          like_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          profile_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          profile_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          profile_id?: string
          created_at?: string | null
        }
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          profile_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          comment_id: string
          profile_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          comment_id?: string
          profile_id?: string
          created_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          firebase_uid: string
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          occupation: string | null
          interests: string[] | null
          wants_to_live_with_roommate: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          firebase_uid: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          occupation?: string | null
          interests?: string[] | null
          wants_to_live_with_roommate?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          firebase_uid?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          occupation?: string | null
          interests?: string[] | null
          wants_to_live_with_roommate?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      activities: {
        Row: {
          id: string
          title: string
          description: string
          activity_type: string
          date: string
          time: string
          location: string
          city: string
          address: string | null
          max_participants: number
          current_participants: number | null
          price: number | null
          is_free: boolean | null
          difficulty_level: string | null
          duration: number
          age_min: number | null
          age_max: number | null
          contact_email: string | null
          contact_phone: string | null
          website: string | null
          tags: string[] | null
          profile_id: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          activity_type: string
          date: string
          time: string
          location: string
          city: string
          address?: string | null
          max_participants: number
          current_participants?: number | null
          price?: number | null
          is_free?: boolean | null
          difficulty_level?: string | null
          duration: number
          age_min?: number | null
          age_max?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          website?: string | null
          tags?: string[] | null
          profile_id: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          activity_type?: string
          date?: string
          time?: string
          location?: string
          city?: string
          address?: string | null
          max_participants?: number
          current_participants?: number | null
          price?: number | null
          is_free?: boolean | null
          difficulty_level?: string | null
          duration?: number
          age_min?: number | null
          age_max?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          website?: string | null
          tags?: string[] | null
          profile_id?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      activity_images: {
        Row: {
          id: string
          activity_id: string
          image_url: string
          image_order: number
          is_primary: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          activity_id: string
          image_url: string
          image_order?: number
          is_primary?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          activity_id?: string
          image_url?: string
          image_order?: number
          is_primary?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      property_listings: {
        Row: {
          id: string
          title: string
          description: string | null
          listing_type: string
          property_type: string
          address: string
          city: string
          country: string | null
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          price: number | null
          price_type: string | null
          currency: string | null
          bedrooms: number | null
          bathrooms: number | null
          total_area: number | null
          land_area: number | null
          construction_year: number | null
          property_condition: string | null
          parking_spaces: number | null
          max_occupants: number | null
          available_from: string | null
          available_until: string | null
          is_available: boolean | null
          profile_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          listing_type: string
          property_type: string
          address: string
          city: string
          country?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          price?: number | null
          price_type?: string | null
          currency?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          total_area?: number | null
          land_area?: number | null
          construction_year?: number | null
          property_condition?: string | null
          parking_spaces?: number | null
          max_occupants?: number | null
          available_from?: string | null
          available_until?: string | null
          is_available?: boolean | null
          profile_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          listing_type?: string
          property_type?: string
          address?: string
          city?: string
          country?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          price?: number | null
          price_type?: string | null
          currency?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          total_area?: number | null
          land_area?: number | null
          construction_year?: number | null
          property_condition?: string | null
          parking_spaces?: number | null
          max_occupants?: number | null
          available_from?: string | null
          available_until?: string | null
          is_available?: boolean | null
          profile_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      // Tablas de alojamientos
      accommodations: {
        Row: {
          id: string
          title: string
          description: string | null
          address: string
          city: string
          country: string | null
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          price_per_month: number
          price_per_person: number | null
          property_type: string
          total_rooms: number
          available_rooms: number
          total_bathrooms: number | null
          square_meters: number | null
          amenities: string[] | null
          images: string[] | null
          is_active: boolean | null
          owner_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          address: string
          city: string
          country?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          price_per_month: number
          price_per_person?: number | null
          property_type: string
          total_rooms: number
          available_rooms: number
          total_bathrooms?: number | null
          square_meters?: number | null
          amenities?: string[] | null
          images?: string[] | null
          is_active?: boolean | null
          owner_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          address?: string
          city?: string
          country?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          price_per_month?: number
          price_per_person?: number | null
          property_type?: string
          total_rooms?: number
          available_rooms?: number
          total_bathrooms?: number | null
          square_meters?: number | null
          amenities?: string[] | null
          images?: string[] | null
          is_active?: boolean | null
          owner_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      accommodation_requests: {
        Row: {
          id: string
          accommodation_id: string | null
          requester_id: string | null
          requested_rooms: number | null
          message: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          accommodation_id?: string | null
          requester_id?: string | null
          requested_rooms?: number | null
          message?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          accommodation_id?: string | null
          requester_id?: string | null
          requested_rooms?: number | null
          message?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      accommodation_reviews: {
        Row: {
          id: string
          accommodation_id: string | null
          reviewer_id: string | null
          rating: number
          comment: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          accommodation_id?: string | null
          reviewer_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          accommodation_id?: string | null
          reviewer_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string | null
        }
      }
      accommodation_favorites: {
        Row: {
          id: string
          accommodation_id: string | null
          user_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          accommodation_id?: string | null
          user_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          accommodation_id?: string | null
          user_id?: string | null
          created_at?: string | null
        }
      }
      // Tablas de propiedades
      property_amenities: {
        Row: {
          id: string
          listing_id: string | null
          amenity_type: string
          amenity_name: string
          is_available: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          listing_id?: string | null
          amenity_type: string
          amenity_name: string
          is_available?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          listing_id?: string | null
          amenity_type?: string
          amenity_name?: string
          is_available?: boolean | null
          created_at?: string | null
        }
      }
      property_images: {
        Row: {
          id: string
          listing_id: string | null
          image_url: string
          image_order: number | null
          is_primary: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          listing_id?: string | null
          image_url: string
          image_order?: number | null
          is_primary?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          listing_id?: string | null
          image_url?: string
          image_order?: number | null
          is_primary?: boolean | null
          created_at?: string | null
        }
      }
      property_rental_requirements: {
        Row: {
          id: string
          listing_id: string | null
          max_tenants: number
          preferred_tenants: string[]
          shared_expenses: boolean
          utilities_included: boolean
          internet_included: boolean
          parking_available: boolean
          accessibility_features: string[] | null
          other_requirements: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          listing_id?: string | null
          max_tenants: number
          preferred_tenants: string[]
          shared_expenses: boolean
          utilities_included: boolean
          internet_included: boolean
          parking_available: boolean
          accessibility_features?: string[] | null
          other_requirements?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          listing_id?: string | null
          max_tenants?: number
          preferred_tenants?: string[]
          shared_expenses?: boolean
          utilities_included?: boolean
          internet_included?: boolean
          parking_available?: boolean
          accessibility_features?: string[] | null
          other_requirements?: string | null
          created_at?: string | null
        }
      }
      property_purchase_requirements: {
        Row: {
          id: string
          listing_id: string | null
          total_price: number | null
          shares_available: number
          price_per_share: number | null
          min_shares_per_person: number
          max_shares_per_person: number | null
          property_management_type: string | null
          legal_structure: string | null
          other_requirements: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          listing_id?: string | null
          total_price?: number | null
          shares_available: number
          price_per_share?: number | null
          min_shares_per_person: number
          max_shares_per_person?: number | null
          property_management_type?: string | null
          legal_structure?: string | null
          other_requirements?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          listing_id?: string | null
          total_price?: number | null
          shares_available?: number
          price_per_share?: number | null
          min_shares_per_person?: number
          max_shares_per_person?: number | null
          property_management_type?: string | null
          legal_structure?: string | null
          other_requirements?: string | null
          created_at?: string | null
        }
      }
      room_rental_requirements: {
        Row: {
          id: string
          listing_id: string
          bed_type: string
          room_area: number
          private_bathroom: boolean
          shared_bathroom: boolean
          has_balcony: boolean
          preferred_gender: string
          preferred_age_min: number
          preferred_age_max: number
          smoking_allowed: boolean
          pets_allowed: boolean
          pet_types: string[]
          tenant_age_min: number | null
          tenant_age_max: number | null
          tenant_gender_preference: string | null
          tenant_pets_allowed: boolean | null
          tenant_smoker: boolean | null
          other_requirements: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          listing_id: string
          bed_type: string
          room_area: number
          private_bathroom: boolean
          shared_bathroom: boolean
          has_balcony: boolean
          preferred_gender: string
          preferred_age_min: number
          preferred_age_max: number
          smoking_allowed: boolean
          pets_allowed: boolean
          pet_types: string[]
          tenant_age_min?: number | null
          tenant_age_max?: number | null
          tenant_gender_preference?: string | null
          tenant_pets_allowed?: boolean | null
          tenant_smoker?: boolean | null
          other_requirements?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          listing_id?: string
          bed_type?: string
          room_area?: number
          private_bathroom?: boolean
          shared_bathroom?: boolean
          has_balcony?: boolean
          preferred_gender?: string
          preferred_age_min?: number
          preferred_age_max?: number
          smoking_allowed?: boolean
          pets_allowed?: boolean
          pet_types?: string[]
          tenant_age_min?: number | null
          tenant_age_max?: number | null
          tenant_gender_preference?: string | null
          tenant_pets_allowed?: boolean | null
          tenant_smoker?: boolean | null
          other_requirements?: string | null
          updated_at?: string | null
        }
      }
      seasonal_rental_requirements: {
        Row: {
          id: string
          listing_id: string | null
          season_start: string
          season_end: string
          min_stay_days: number
          max_stay_days: number | null
          beach_distance_meters: number | null
          beach_access_type: string | null
          seasonal_amenities: string[] | null
          off_season_discount: number | null
          other_requirements: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          listing_id?: string | null
          season_start: string
          season_end: string
          min_stay_days: number
          max_stay_days?: number | null
          beach_distance_meters?: number | null
          beach_access_type?: string | null
          seasonal_amenities?: string[] | null
          off_season_discount?: number | null
          other_requirements?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          listing_id?: string | null
          season_start?: string
          season_end?: string
          min_stay_days?: number
          max_stay_days?: number | null
          beach_distance_meters?: number | null
          beach_access_type?: string | null
          seasonal_amenities?: string[] | null
          off_season_discount?: number | null
          other_requirements?: string | null
          created_at?: string | null
        }
      }
      property_inquiries: {
        Row: {
          id: string
          listing_id: string | null
          interested_user_id: string | null
          interested_profile_id: string | null
          inquiry_type: string
          message: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          listing_id?: string | null
          interested_user_id?: string | null
          interested_profile_id?: string | null
          inquiry_type: string
          message?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          listing_id?: string | null
          interested_user_id?: string | null
          interested_profile_id?: string | null
          inquiry_type?: string
          message?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      // Tablas de mensajes
      conversations: {
        Row: {
          id: string
          participant1_id: string
          participant2_id: string
          listing_id: string | null
          last_message_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          participant1_id: string
          participant2_id: string
          listing_id?: string | null
          last_message_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          participant1_id?: string
          participant2_id?: string
          listing_id?: string | null
          last_message_at?: string | null
          created_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string | null
          sender_id: string
          recipient_id: string
          listing_id: string | null
          subject: string | null
          message_text: string
          is_read: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          sender_id: string
          recipient_id: string
          listing_id?: string | null
          subject?: string | null
          message_text: string
          is_read?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string | null
          sender_id?: string
          recipient_id?: string
          listing_id?: string | null
          subject?: string | null
          message_text?: string
          is_read?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      // Tablas de usuarios
      user_sessions: {
        Row: {
          id: string
          profile_id: string | null
          session_token: string
          expires_at: string
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id?: string | null
          session_token: string
          expires_at: string
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string | null
          session_token?: string
          expires_at?: string
          created_at?: string | null
        }
      }
      user_settings: {
        Row: {
          id: string
          profile_id: string | null
          theme: string | null
          language: string | null
          notifications_enabled: boolean | null
          email_notifications: boolean | null
          push_notifications: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id?: string | null
          theme?: string | null
          language?: string | null
          notifications_enabled?: boolean | null
          email_notifications?: boolean | null
          push_notifications?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string | null
          theme?: string | null
          language?: string | null
          notifications_enabled?: boolean | null
          email_notifications?: boolean | null
          push_notifications?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface UserProfile {
  id: string;
  auth_user_id: string; // Identificador del usuario en Supabase Auth
  firebase_uid?: string; // Campo obsoleto, mantener para compatibilidad
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  occupation: string | null;
  interests: string[] | null;
  is_admin: boolean; // Campo para identificar administradores
  is_public: boolean | null; // Campo para controlar visibilidad del perfil
  share_contact_info: boolean | null; // Campo para controlar si compartir información de contacto
  created_at: string | null;
  updated_at: string | null;
  
  // Campos de ubicación
  location?: any; // JSONB con información completa de Google Places
  coordinates?: [number, number] | null; // [longitude, latitude] como POINT
  formatted_address?: string | null; // Dirección formateada por Google Places
  location_city?: string | null; // Ciudad de la ubicación
  location_country?: string | null; // País de la ubicación
  location_postal_code?: string | null; // Código postal de la ubicación
  location_public?: boolean | null; // Si la ubicación es visible públicamente
  search_radius_km?: number | null; // Radio de búsqueda en kilómetros
  location_updated_at?: string | null; // Última actualización de la ubicación
}

// Interfaz para filtros de búsqueda
export interface SearchFilters {
  maxDistance: number;
  interests: string[];
  ageRange: [number, number];
  gender: string | null;
  occupation: string | null;
}

// Interfaz para resultados de búsqueda por ubicación
export interface LocationSearchResult {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  formatted_address: string | null;
  location_city: string | null;
  location_country: string | null;
  distance_km: number;
  bio: string | null;
  interests: string[] | null;
  occupation: string | null;
}

// Interfaz para información de ubicación de Google Places
export interface GooglePlacesLocation {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  name?: string;
  types?: string[];
}

// Interfaz para configuración de ubicación del usuario
export interface UserLocationSettings {
  location_public: boolean;
  search_radius_km: number;
  coordinates?: [number, number];
  formatted_address?: string;
  location_city?: string;
  location_country?: string;
  location_postal_code?: string;
}

// Interfaz para mensajes de chat
export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

// Interfaz para conversaciones de chat
export interface ChatConversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_id?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  other_user_id?: string;
  other_user_name?: string;
  other_user_avatar?: string;
  last_message_content?: string;
  unread_count?: number;
}

// Interfaz para crear un nuevo mensaje
export interface CreateChatMessage {
  receiver_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'file';
}

// Interfaz para respuesta de conversaciones del usuario
export interface UserConversation {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string | null;
  other_user_avatar: string | null;
  last_message_content: string | null;
  last_message_at: string;
  unread_count: number;
}

// Tipos para propiedades
export interface CreatePropertyListing {
  property_type: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  total_area: number;
  available_until: string;
}

export interface CreateRoomRentalRequirements {
  bed_type: 'single' | 'double';
  room_area: number;
  private_bathroom: boolean;
  shared_bathroom: boolean;
  has_balcony: boolean;
  preferred_gender: 'any' | 'male' | 'female';
  preferred_age_min: number;
  preferred_age_max: number;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  pet_types: string[];
  other_requirements: string;
}

export interface CreatePropertyListingComplete {
  listing: CreatePropertyListing;
  roomRequirements: CreateRoomRentalRequirements;
  images: string[];
  amenities?: string[];
}
