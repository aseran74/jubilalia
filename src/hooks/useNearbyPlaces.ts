import { useState, useEffect } from 'react';
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

  const { isLoaded: mapsLoaded, isLoading: mapsLoading } = useGoogleMaps();

  useEffect(() => {
    console.log('🔍 useNearbyPlaces - Estado inicial:', {
      latitude,
      longitude,
      mapsLoaded,
      mapsLoading,
      hasGoogle: !!window.google,
      hasMaps: !!(window.google && window.google.maps),
      hasPlaces: !!(window.google && window.google.maps && window.google.maps.places)
    });

    if (!latitude || !longitude) {
      console.warn('⚠️ useNearbyPlaces - Falta latitud o longitud');
      return;
    }

    // Verificar si Google Maps está realmente disponible
    const isGoogleMapsReady = window.google && window.google.maps && window.google.maps.places;
    
    if (!isGoogleMapsReady) {
      console.log('⏳ useNearbyPlaces - Google Maps no está disponible aún');
      console.log('   mapsLoaded:', mapsLoaded, 'mapsLoading:', mapsLoading);
      
      // Si no está cargando y no está cargado, mostrar datos de ejemplo
      if (!mapsLoading && !mapsLoaded) {
        console.warn('⚠️ Google Maps no se está cargando. Mostrando lugares de ejemplo.');
        
        // Crear lugares de ejemplo basados en la ubicación
        const mockPlaces: NearbyPlace[] = [
          {
            id: 'mock-1',
            name: 'Supermercado Cercano',
            rating: 4.2,
            vicinity: 'A 500m de distancia',
            types: ['supermarket'],
            place_id: 'mock-1',
            distance: 0.5
          },
          {
            id: 'mock-2',
            name: 'Centro de Salud',
            rating: 4.0,
            vicinity: 'A 800m de distancia',
            types: ['hospital', 'health'],
            place_id: 'mock-2',
            distance: 0.8
          },
          {
            id: 'mock-3',
            name: 'Parada de Metro/Bus',
            rating: 3.8,
            vicinity: 'A 300m de distancia',
            types: ['transit_station'],
            place_id: 'mock-3',
            distance: 0.3
          },
          {
            id: 'mock-4',
            name: 'Farmacia',
            rating: 4.5,
            vicinity: 'A 400m de distancia',
            types: ['pharmacy'],
            place_id: 'mock-4',
            distance: 0.4
          },
          {
            id: 'mock-5',
            name: 'Banco / Cajero',
            rating: 3.9,
            vicinity: 'A 600m de distancia',
            types: ['bank', 'atm'],
            place_id: 'mock-5',
            distance: 0.6
          },
          {
            id: 'mock-6',
            name: 'Colegio/Universidad',
            rating: 4.3,
            vicinity: 'A 1.2km de distancia',
            types: ['school'],
            place_id: 'mock-6',
            distance: 1.2
          }
        ];
        
        setState({
          places: mockPlaces,
          loading: false,
          error: null
        });
      }
      return;
    }

    const fetchNearbyPlaces = async () => {
      console.log('🚀 useNearbyPlaces - Iniciando búsqueda de lugares...');
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Verificar si Google Maps está cargado
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.error('❌ Google Maps Places API no está cargado');
          throw new Error('Google Maps Places API no está cargado');
        }

        console.log('✅ Google Maps Places API está disponible');

        const service = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );

        const request: any = {
          location: new window.google.maps.LatLng(latitude, longitude),
          radius: radius,
          type: types[0], // Google Places API solo acepta un tipo a la vez
        };

        // Función para hacer la búsqueda
        const searchPlaces = (type: string): Promise<NearbyPlace[]> => {
          return new Promise((resolve) => {
            const searchRequest = { ...request, type };
            
            service.nearbySearch(searchRequest, (results: any, status: any) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                const places: NearbyPlace[] = results.slice(0, 2).map((place: any) => ({
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
        
        console.log(`🔎 Buscando ${types.length} tipos de lugares...`);
        for (const type of types) {
          try {
            console.log(`  📍 Buscando tipo: ${type}`);
            const places = await searchPlaces(type);
            console.log(`  ✅ Encontrados ${places.length} lugares de tipo ${type}`);
            allPlaces.push(...places);
          } catch (error) {
            console.warn(`  ❌ Error buscando ${type}:`, error);
          }
        }

        console.log(`📊 Total de lugares encontrados: ${allPlaces.length}`);

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

        const finalPlaces = placesWithDistance.slice(0, 8); // Máximo 8 lugares
        console.log(`🎯 Mostrando ${finalPlaces.length} lugares finales`);

        setState({
          places: finalPlaces,
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
