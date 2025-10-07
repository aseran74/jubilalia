import { supabase } from './supabase';
import type {
  PropertyListing,
  PropertyListingWithDetails,
  CreatePropertyListingComplete,
  PropertySearchFilters,
  PropertyStats,
  ListingType
} from '../types/properties';

// Función para crear un listado completo de propiedad
export const createPropertyListing = async (data: CreatePropertyListingComplete) => {
  try {
    // 1. Crear el listado principal
    const { data: listing, error: listingError } = await supabase
      .from('property_listings')
      .insert(data.listing)
      .select()
      .single();

    if (listingError) throw listingError;

    const listingId = listing.id;

    // 2. Crear los requisitos específicos según el tipo
    if (data.listing.listing_type === 'room_rental' && data.roomRequirements) {
      const roomRequirementsData = {
        listing_id: listingId,
        bed_type: data.roomRequirements.bed_type,
        room_area: data.roomRequirements.room_area,
        private_bathroom: data.roomRequirements.private_bathroom,
        shared_bathroom: data.roomRequirements.shared_bathroom,
        has_balcony: data.roomRequirements.has_balcony,
        preferred_gender: data.roomRequirements.preferred_gender,
        preferred_age_min: data.roomRequirements.preferred_age_min,
        preferred_age_max: data.roomRequirements.preferred_age_max,
        smoking_allowed: data.roomRequirements.smoking_allowed,
        pets_allowed: data.roomRequirements.pets_allowed,
        pet_types: data.roomRequirements.pet_types || [],
        other_requirements: data.roomRequirements.other_requirements || ''
      };
      
      await supabase
        .from('room_rental_requirements')
        .insert(roomRequirementsData);
    }

    if (data.listing.listing_type === 'property_rental' && data.propertyRentalRequirements) {
      await supabase
        .from('property_rental_requirements')
        .insert({ ...data.propertyRentalRequirements, listing_id: listingId });
    }

    if (data.listing.listing_type === 'property_purchase' && data.propertyPurchaseRequirements) {
      await supabase
        .from('property_purchase_requirements')
        .insert({ ...data.propertyPurchaseRequirements, listing_id: listingId });
    }

    if (data.listing.listing_type === 'seasonal_rental' && data.seasonalRentalRequirements) {
      await supabase
        .from('seasonal_rental_requirements')
        .insert({ ...data.seasonalRentalRequirements, listing_id: listingId });
    }

    // 3. Crear las amenidades
    if (data.amenities && data.amenities.length > 0) {
      const amenitiesData = data.amenities.map(amenityName => ({
        listing_id: listingId,
        amenity_type: 'basic', // Por defecto, se puede cambiar después
        amenity_name: amenityName,
        is_available: true
      }));

      await supabase
        .from('property_amenities')
        .insert(amenitiesData);
    }

    // 4. Crear las imágenes
    if (data.images && data.images.length > 0) {
      const imagesData = data.images.map((imageUrl, index) => ({
        listing_id: listingId,
        image_url: imageUrl,
        image_order: index + 1,
        is_primary: index === 0 // La primera imagen es la principal
      }));

      await supabase
        .from('property_images')
        .insert(imagesData);
    }

    return { success: true, listing };
  } catch (error) {
    console.error('Error creating property listing:', error);
    return { success: false, error };
  }
};

// Función para obtener todos los listados
export const getPropertyListings = async (filters?: PropertySearchFilters) => {
  try {
    let query = supabase
      .from('property_listings')
      .select(`
        *,
        room_rental_requirements (*),
        property_rental_requirements (*),
        property_purchase_requirements (*),
        seasonal_rental_requirements (*),
        property_images (*),
        property_amenities (*),
        profiles!property_listings_profile_id_fkey (*)
      `)
      .eq('is_available', true);

    // Aplicar filtros
    if (filters?.listing_type && filters.listing_type.length > 0) {
      query = query.in('listing_type', filters.listing_type);
    }

    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters?.price_min) {
      query = query.gte('price', filters.price_min);
    }

    if (filters?.price_max) {
      query = query.lte('price', filters.price_max);
    }

    if (filters?.bedrooms_min) {
      query = query.gte('bedrooms', filters.bedrooms_min);
    }

    if (filters?.bathrooms_min) {
      query = query.gte('bathrooms', filters.bathrooms_min);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data as PropertyListingWithDetails[] };
  } catch (error) {
    console.error('Error fetching property listings:', error);
    return { success: false, error };
  }
};

// Función para obtener un listado específico por ID
export const getPropertyListingById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('property_listings')
      .select(`
        *,
        room_rental_requirements (*),
        property_rental_requirements (*),
        property_purchase_requirements (*),
        seasonal_rental_requirements (*),
        property_images (*),
        property_amenities (*),
        profiles!property_listings_profile_id_fkey (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return { success: true, data: data as PropertyListingWithDetails };
  } catch (error) {
    console.error('Error fetching property listing:', error);
    return { success: false, error };
  }
};

// Función para obtener listados por tipo
export const getPropertyListingsByType = async (type: ListingType) => {
  try {
    const { data, error } = await supabase
      .from('property_listings')
      .select(`
        *,
        room_rental_requirements (*),
        property_rental_requirements (*),
        property_purchase_requirements (*),
        seasonal_rental_requirements (*),
        property_images (*),
        property_amenities (*),
        profiles!property_listings_profile_id_fkey (*)
      `)
      .eq('listing_type', type)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data as PropertyListingWithDetails[] };
  } catch (error) {
    console.error('Error fetching property listings by type:', error);
    return { success: false, error };
  }
};

// Función para obtener listados del usuario actual
export const getUserPropertyListings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('property_listings')
      .select(`
        *,
        room_rental_requirements (*),
        property_rental_requirements (*),
        property_purchase_requirements (*),
        seasonal_rental_requirements (*),
        property_images (*),
        property_amenities (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data as PropertyListingWithDetails[] };
  } catch (error) {
    console.error('Error fetching user property listings:', error);
    return { success: false, error };
  }
};

// Función para actualizar un listado
export const updatePropertyListing = async (id: string, updates: Partial<PropertyListing>) => {
  try {
    const { data, error } = await supabase
      .from('property_listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error updating property listing:', error);
    return { success: false, error };
  }
};

// Función para eliminar un listado
export const deletePropertyListing = async (id: string) => {
  try {
    const { error } = await supabase
      .from('property_listings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting property listing:', error);
    return { success: false, error };
  }
};

// Función para buscar propiedades
export const searchPropertyListings = async (searchTerm: string, filters?: PropertySearchFilters) => {
  try {
    let query = supabase
      .from('property_listings')
      .select(`
        *,
        room_rental_requirements (*),
        property_rental_requirements (*),
        property_purchase_requirements (*),
        seasonal_rental_requirements (*),
        property_images (*),
        property_amenities (*),
        profiles!property_listings_profile_id_fkey (*)
      `)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
      .eq('is_available', true);

    // Aplicar filtros adicionales
    if (filters?.listing_type && filters.listing_type.length > 0) {
      query = query.in('listing_type', filters.listing_type);
    }

    if (filters?.price_min) {
      query = query.gte('price', filters.price_min);
    }

    if (filters?.price_max) {
      query = query.lte('price', filters.price_max);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data as PropertyListingWithDetails[] };
  } catch (error) {
    console.error('Error searching property listings:', error);
    return { success: false, error };
  }
};

// Función para obtener estadísticas de propiedades
export const getPropertyStats = async (): Promise<{ success: boolean; data?: PropertyStats; error?: any }> => {
  try {
    // Obtener conteo total
    const { count: totalListings } = await supabase
      .from('property_listings')
      .select('*', { count: 'exact', head: true });

    // Obtener listados activos
    const { count: activeListings } = await supabase
      .from('property_listings')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true);

    // Obtener listados por tipo
    const { data: listingsByType } = await supabase
      .from('property_listings')
      .select('listing_type')
      .eq('is_available', true);

    const typeCounts: Record<ListingType, number> = {
      room_rental: 0,
      property_rental: 0,
      property_purchase: 0,
      seasonal_rental: 0,
      coliving: 0
    };

    listingsByType?.forEach(listing => {
      typeCounts[listing.listing_type as ListingType]++;
    });

    // Obtener precio promedio
    const { data: priceData } = await supabase
      .from('property_listings')
      .select('price')
      .eq('is_available', true)
      .not('price', 'is', null);

    const averagePrice = priceData && priceData.length > 0
      ? priceData.reduce((sum, item) => sum + (item.price || 0), 0) / priceData.length
      : 0;

    // Obtener ciudades con listados
    const { data: cityData } = await supabase
      .from('property_listings')
      .select('city')
      .eq('is_available', true);

    const citiesWithListings = [...new Set(cityData?.map(item => item.city) || [])];

    // Obtener listados recientes
    const { data: recentListings } = await supabase
      .from('property_listings')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(5);

    const stats: PropertyStats = {
      total_listings: totalListings || 0,
      active_listings: activeListings || 0,
      listings_by_type: typeCounts,
      average_price: averagePrice,
      cities_with_listings: citiesWithListings,
      recent_listings: recentListings || []
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching property stats:', error);
    return { success: false, error };
  }
};

// Función para crear una solicitud de interés
export const createPropertyInquiry = async (listingId: string, inquiryType: string, message?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Obtener el profile_id del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('firebase_uid', user.id)
      .single();

    if (!profile) throw new Error('User profile not found');

    const { data, error } = await supabase
      .from('property_inquiries')
      .insert({
        listing_id: listingId,
        interested_user_id: user.id,
        interested_profile_id: profile.id,
        inquiry_type: inquiryType,
        message: message || ''
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error creating property inquiry:', error);
    return { success: false, error };
  }
};

// Función para obtener las solicitudes de interés de un usuario
export const getUserInquiries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('property_inquiries')
      .select(`
        *,
        property_listings (*)
      `)
      .eq('interested_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user inquiries:', error);
    return { success: false, error };
  }
};

// Función para obtener las solicitudes de interés para los listados del usuario
export const getListingInquiries = async (listingId: string) => {
  try {
    const { data, error } = await supabase
      .from('property_inquiries')
      .select(`
        *,
        profiles!property_inquiries_interested_profile_id_fkey (*)
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching listing inquiries:', error);
    return { success: false, error };
  }
};

// Función para actualizar el estado de una solicitud
export const updateInquiryStatus = async (inquiryId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('property_inquiries')
      .update({ status })
      .eq('id', inquiryId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return { success: false, error };
  }
};
