import { useState, useEffect } from 'react';
import { environment } from '../config/environment';
import { useGoogleMaps } from './useGoogleMaps';

export interface NearbyPlace {
  id: string;
  name: string;
  rating: number;
  price_level?: number;
  vicinity: string;
  types: string[];
  distance?: number;
  icon?: string;
  place_id: string;
}

export interface NearbyPlacesState {
  places: NearbyPlace[];
  loading: boolean;
  error: string | null;
}

export const useNearbyPlaces = (
  latitude: number,
  longitude: number,
  radius: number = 1000,
  types: string[] = ['supermarket', 'hospital', 'transit_station', 'school']
) => {
  const [state, setState] = useState<NearbyPlacesState>({
    places: [],
    loading: false,
    error: null,
  });

  const { isLoaded: mapsLoaded, isLoading: mapsLoading, error: mapsError } = useGoogleMaps();

  console.log('🔍 useNearbyPlaces hook:', { 
    latitude, 
    longitude, 
    mapsLoaded, 
    mapsLoading, 
    mapsError 
  });

  useEffect(() => {
    console.log('🔍 useNearbyPlaces useEffect ejecutándose:', { 
      latitude, 
      longitude, 
      mapsLoaded, 
      mapsLoading 
    });
    
    if (!latitude || !longitude || !mapsLoaded || mapsLoading) {
      console.log('🔍 useNearbyPlaces: Condiciones no cumplidas, saliendo');
      return;
    }

    const fetchNearbyPlaces = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Verificar si Google Maps está cargado
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          throw new Error('Google Maps Places API no está cargado');
        }

        const service = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );

        const request: google.maps.places.PlaceSearchRequest = {
          location: new window.google.maps.LatLng(latitude, longitude),
          radius: radius,
          type: types[0], // Google Places API solo acepta un tipo a la vez
        };

        // Función para hacer la búsqueda
        const searchPlaces = (type: string): Promise<NearbyPlace[]> => {
          return new Promise((resolve, reject) => {
            const searchRequest = { ...request, type };
            
            service.nearbySearch(searchRequest, (results, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                const places: NearbyPlace[] = results.slice(0, 2).map((place) => ({
                  id: place.place_id || Math.random().toString(),
                  name: place.name || 'Sin nombre',
                  rating: place.rating || 0,
                  price_level: place.price_level,
                  vicinity: place.vicinity || 'Sin dirección',
                  types: place.types || [],
                  place_id: place.place_id || '',
                  icon: place.icon,
                }));
                resolve(places);
              } else {
                console.warn(`Error buscando ${type}:`, status);
                resolve([]);
              }
            });
          });
        };

        // Buscar cada tipo de lugar
        const allPlaces: NearbyPlace[] = [];
        
        for (const type of types) {
          try {
            const places = await searchPlaces(type);
            allPlaces.push(...places);
          } catch (error) {
            console.warn(`Error buscando ${type}:`, error);
          }
        }

        // Calcular distancias
        const placesWithDistance = allPlaces.map(place => {
          const distance = calculateDistance(
            latitude,
            longitude,
            place.types.includes('geometry') ? latitude : latitude, // Placeholder
            place.types.includes('geometry') ? longitude : longitude // Placeholder
          );
          return { ...place, distance };
        });

        // Ordenar por distancia
        placesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setState({
          places: placesWithDistance.slice(0, 8), // Máximo 8 lugares
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('Error fetching nearby places:', error);
        setState({
          places: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    };

    fetchNearbyPlaces();
  }, [latitude, longitude, radius, types.join(','), mapsLoaded, mapsLoading]);

  return state;
};

// Función para calcular distancia entre dos puntos
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Función para obtener el emoji del tipo de lugar
export const getPlaceEmoji = (types: string[]): string => {
  if (types.includes('supermarket') || types.includes('grocery_or_supermarket')) return '🏪';
  if (types.includes('hospital') || types.includes('health')) return '🏥';
  if (types.includes('transit_station') || types.includes('bus_station')) return '🚌';
  if (types.includes('school') || types.includes('university')) return '🎓';
  if (types.includes('restaurant') || types.includes('food')) return '🍽️';
  if (types.includes('pharmacy')) return '💊';
  if (types.includes('bank') || types.includes('atm')) return '🏦';
  if (types.includes('gas_station')) return '⛽';
  if (types.includes('park')) return '🌳';
  if (types.includes('gym')) return '💪';
  return '📍';
};

// Función para obtener el nombre del tipo de lugar
export const getPlaceTypeName = (types: string[]): string => {
  if (types.includes('supermarket') || types.includes('grocery_or_supermarket')) return 'Supermercado';
  if (types.includes('hospital') || types.includes('health')) return 'Centro de Salud';
  if (types.includes('transit_station') || types.includes('bus_station')) return 'Transporte Público';
  if (types.includes('school') || types.includes('university')) return 'Educación';
  if (types.includes('restaurant') || types.includes('food')) return 'Restaurante';
  if (types.includes('pharmacy')) return 'Farmacia';
  if (types.includes('bank') || types.includes('atm')) return 'Banco';
  if (types.includes('gas_station')) return 'Gasolinera';
  if (types.includes('park')) return 'Parque';
  if (types.includes('gym')) return 'Gimnasio';
  return 'Lugar de interés';
};
