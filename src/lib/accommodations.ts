import { supabase } from './supabase';
import type { 
  AccommodationRequest, 
  AccommodationReview, 
  AccommodationFavorite,
  AccommodationSearchParams
} from '../types/accommodations';

export interface Accommodation {
  id: string;
  title: string;
  description?: string;
  property_type: string;
  price_per_month: number;
  total_rooms: number;
  available_rooms: number;
  city: string;
  address: string;
  postal_code: string;
  amenities: string[];
  images: string[];
  owner_id: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// FUNCIONES PARA ALOJAMIENTOS
// =====================================================

// Obtener todos los alojamientos activos
export const getAccommodations = async (): Promise<Accommodation[]> => {
  try {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accommodations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    return [];
  }
};

// Obtener alojamiento por ID
export const getAccommodationById = async (id: string): Promise<Accommodation | null> => {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching accommodation:', error);
    return null;
  }

  return data;
};

// Buscar alojamientos con filtros
export const searchAccommodations = async (params: AccommodationSearchParams): Promise<{
  data: Accommodation[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  let query = supabase
    .from('accommodations')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  // Aplicar filtros
  if (params.filters.city) {
    query = query.ilike('city', `%${params.filters.city}%`);
  }

  if (params.filters.min_price !== undefined) {
    query = query.gte('price_per_month', params.filters.min_price);
  }

  if (params.filters.max_price !== undefined) {
    query = query.lte('price_per_month', params.filters.max_price);
  }

  if (params.filters.property_type && params.filters.property_type.length > 0) {
    query = query.in('property_type', params.filters.property_type);
  }

  if (params.filters.min_rooms !== undefined) {
    query = query.gte('total_rooms', params.filters.min_rooms);
  }

  if (params.filters.max_rooms !== undefined) {
    query = query.lte('total_rooms', params.filters.max_rooms);
  }

  // Aplicar ordenamiento
  if (params.sort_by) {
    query = query.order(params.sort_by, { ascending: params.sort_order === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Aplicar paginación
  const offset = (params.page - 1) * params.limit;
  query = query.range(offset, offset + params.limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error searching accommodations:', error);
    return { data: [], total: 0, page: params.page, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / params.limit);

  return {
    data: data || [],
    total,
    page: params.page,
    totalPages
  };
};

// Crear nuevo alojamiento
export const createAccommodation = async (accommodation: Omit<Accommodation, 'id' | 'created_at' | 'updated_at'>): Promise<Accommodation | null> => {
  const { data, error } = await supabase
    .from('accommodations')
    .insert(accommodation)
    .select()
    .single();

  if (error) {
    console.error('Error creating accommodation:', error);
    return null;
  }

  return data;
};

// Actualizar alojamiento
export const updateAccommodation = async (id: string, updates: Partial<Accommodation>): Promise<Accommodation | null> => {
  const { data, error } = await supabase
    .from('accommodations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating accommodation:', error);
    return null;
  }

  return data;
};

// Eliminar alojamiento (marcar como inactivo)
export const deleteAccommodation = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('accommodations')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error deleting accommodation:', error);
    return false;
  }

  return true;
};

// =====================================================
// FUNCIONES PARA SOLICITUDES
// =====================================================

// Crear solicitud de alojamiento
export const createAccommodationRequest = async (request: Omit<AccommodationRequest, 'id' | 'created_at' | 'updated_at'>): Promise<AccommodationRequest | null> => {
  const { data, error } = await supabase
    .from('accommodation_requests')
    .insert(request)
    .select()
    .single();

  if (error) {
    console.error('Error creating accommodation request:', error);
    return null;
  }

  return data;
};

// Obtener solicitudes de un usuario
export const getUserRequests = async (userId: string): Promise<AccommodationRequest[]> => {
  const { data, error } = await supabase
    .from('accommodation_requests')
    .select('*')
    .eq('requester_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user requests:', error);
    return [];
  }

  return data || [];
};

// Obtener solicitudes para un alojamiento
export const getAccommodationRequests = async (accommodationId: string): Promise<AccommodationRequest[]> => {
  const { data, error } = await supabase
    .from('accommodation_requests')
    .select('*')
    .eq('accommodation_id', accommodationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching accommodation requests:', error);
    return [];
  }

  return data || [];
};

// Actualizar estado de solicitud
export const updateRequestStatus = async (id: string, status: AccommodationRequest['status']): Promise<AccommodationRequest | null> => {
  const { data, error } = await supabase
    .from('accommodation_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating request status:', error);
    return null;
  }

  return data;
};

// =====================================================
// FUNCIONES PARA RESEÑAS
// =====================================================

// Crear reseña
export const createReview = async (review: Omit<AccommodationReview, 'id' | 'created_at'>): Promise<AccommodationReview | null> => {
  const { data, error } = await supabase
    .from('accommodation_reviews')
    .insert(review)
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    return null;
  }

  return data;
};

// Obtener reseñas de un alojamiento
export const getAccommodationReviews = async (accommodationId: string): Promise<AccommodationReview[]> => {
  const { data, error } = await supabase
    .from('accommodation_reviews')
    .select('*')
    .eq('accommodation_id', accommodationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching accommodation reviews:', error);
    return [];
  }

  return data || [];
};

// =====================================================
// FUNCIONES PARA FAVORITOS
// =====================================================

// Agregar a favoritos
export const addToFavorites = async (accommodationId: string, userId: string): Promise<AccommodationFavorite | null> => {
  const { data, error } = await supabase
    .from('accommodation_favorites')
    .insert({ accommodation_id: accommodationId, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error('Error adding to favorites:', error);
    return null;
  }

  return data;
};

// Remover de favoritos
export const removeFromFavorites = async (accommodationId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('accommodation_favorites')
    .delete()
    .eq('accommodation_id', accommodationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }

  return true;
};

// Obtener favoritos de un usuario
export const getUserFavorites = async (userId: string): Promise<AccommodationFavorite[]> => {
  const { data, error } = await supabase
    .from('accommodation_favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }

  return data || [];
};

// Verificar si un alojamiento está en favoritos
export const isFavorite = async (accommodationId: string, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('accommodation_favorites')
    .select('id')
    .eq('accommodation_id', accommodationId)
    .eq('user_id', userId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
};
