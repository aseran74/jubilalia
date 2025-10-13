import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { MapPin } from 'lucide-react';
import LocationSelector from './LocationSelector';
import PeopleSearchFilters from './PeopleSearchFilters';
import PeopleSearchResults from './PeopleSearchResults';
import PeopleSearchMap from './PeopleSearchMap';
import type { LocationSearchResult, SearchFilters } from '../../types/supabase';

const PeopleSearch: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [searchLocation, setSearchLocation] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<LocationSearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    maxDistance: 50, // 50 km por defecto
    interests: [],
    ageRange: [55, 100],
    gender: null,
    occupation: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Detectar si estamos en la ruta del mapa
  useEffect(() => {
    if (location.pathname === '/dashboard/users/map') {
      setViewMode('map');
    } else {
      setViewMode('list');
    }
  }, [location.pathname]);

  // Cargar dirección del perfil al inicio y geocodificarla
  useEffect(() => {
    const geocodeProfileAddress = async () => {
      if (profile && profile.address && profile.city && window.google?.maps) {
        const fullAddress = `${profile.address}, ${profile.city}${profile.state ? ', ' + profile.state : ''}${profile.postal_code ? ' ' + profile.postal_code : ''}`;
        
        console.log('🔍 Geocodificando dirección del perfil:', fullAddress);
        
        const geocoder = new window.google.maps.Geocoder();
        
        try {
          const result = await new Promise<any>((resolve, reject) => {
            geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
              if (status === 'OK' && results[0]) {
                resolve(results[0]);
              } else {
                reject(status);
              }
            });
          });

          const profileLocation = {
            formatted_address: result.formatted_address,
            address_components: result.address_components,
            geometry: {
              location: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
              }
            }
          };

          console.log('✅ Dirección del perfil geocodificada:', {
            address: profileLocation.formatted_address,
            lat: profileLocation.geometry.location.lat,
            lng: profileLocation.geometry.location.lng
          });

          setSearchLocation(profileLocation);
        } catch (error) {
          console.error('❌ Error geocodificando dirección del perfil:', error);
        }
      }
    };

    geocodeProfileAddress();
  }, [profile]);

  // Cargar usuarios iniciales
  useEffect(() => {
    loadInitialUsers();
  }, []);

  const loadInitialUsers = async () => {
    try {
      console.log('🔄 Cargando usuarios iniciales...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error cargando usuarios iniciales:', error);
        return;
      }

      console.log('✅ Usuarios iniciales cargados:', data?.length);
      console.log('📊 Primer usuario:', data?.[0]);
      console.log('🔍 Datos de perfiles con avatares:', data?.map(p => ({ name: p.full_name, avatar: p.avatar_url })));
      
        // Convertir a formato LocationSearchResult
        const formattedResults = data?.map(profile => {
          // Construir dirección completa
          let fullAddress = '';
          if (profile.address) fullAddress += profile.address;
          if (profile.city) fullAddress += (fullAddress ? ', ' : '') + profile.city;
          if (profile.state) fullAddress += (fullAddress ? ', ' : '') + profile.state;
          if (profile.postal_code) fullAddress += (fullAddress ? ' ' : '') + profile.postal_code;
          if (profile.country) fullAddress += (fullAddress ? ', ' : '') + profile.country;
          
          return {
            id: profile.id,
            full_name: profile.full_name || 'Usuario',
            email: profile.email || '',
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            formatted_address: fullAddress || 'Ubicación no especificada',
            location_city: profile.city,
            location_country: profile.country,
            occupation: profile.occupation || 'Sin ocupación',
            interests: profile.interests || [],
            city: profile.city,
            address: profile.address,
            state: profile.state,
            postal_code: profile.postal_code,
            date_of_birth: profile.date_of_birth,
            gender: profile.gender,
            phone: profile.phone,
            whatsapp: profile.whatsapp,
            has_room_to_share: profile.has_room_to_share,
            wants_to_find_roommate: profile.wants_to_find_roommate,
            age: undefined,
            distance_km: 0
          };
        }) || [];

      setSearchResults(formattedResults);
      setFilteredResults(formattedResults);
    } catch (err) {
      console.error('❌ Error cargando usuarios iniciales:', err);
    }
  };

  // Buscar personas por ubicación
  const searchPeople = async () => {
    if (!searchLocation) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 PeopleSearch: Iniciando búsqueda de personas...');
      console.log('📍 Ubicación seleccionada:', searchLocation);
      
      // Primero intentar la función RPC
      try {
        const { data, error } = await supabase.rpc('search_profiles_by_location', {
          search_lat: searchLocation.geometry.location.lat,
          search_lng: searchLocation.geometry.location.lng,
          max_distance_km: filters.maxDistance,
          min_age: filters.ageRange[0],
          max_age: filters.ageRange[1]
        });

        if (error) {
          console.log('⚠️ Función RPC no disponible, usando consulta directa:', error);
          throw error;
        }

        console.log('✅ Resultados de RPC:', data);
        setSearchResults(data || []);
        setFilteredResults(data || []);
      } catch (rpcError) {
        console.log('🔄 Usando consulta directa a la tabla profiles...');
        
        // Fallback: consulta directa a la tabla profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error en consulta directa:', error);
          throw error;
        }

        console.log('✅ Resultados de consulta directa:', data);
        console.log('🔍 Datos de búsqueda con avatares:', data?.map(p => ({ name: p.full_name, avatar: p.avatar_url })));
        
        // Si es "Sin límite", no geocodificar, solo formatear los datos
        if (filters.maxDistance === 999999) {
          console.log('🌍 Modo SIN LÍMITE: Mostrando todos los perfiles sin filtrar por distancia');
          
          const formattedResults = data.map(profile => {
            // Construir dirección completa
            let fullAddress = '';
            if (profile.address) fullAddress += profile.address;
            if (profile.city) fullAddress += (fullAddress ? ', ' : '') + profile.city;
            if (profile.state) fullAddress += (fullAddress ? ', ' : '') + profile.state;
            if (profile.postal_code) fullAddress += (fullAddress ? ' ' : '') + profile.postal_code;
            if (profile.country) fullAddress += (fullAddress ? ', ' : '') + profile.country;

            return {
              id: profile.id,
              full_name: profile.full_name || 'Usuario',
              email: profile.email || '',
              avatar_url: profile.avatar_url,
              bio: profile.bio,
              formatted_address: fullAddress || 'Ubicación no especificada',
              location_city: profile.city,
              location_country: profile.country,
              occupation: profile.occupation || 'Sin ocupación',
              interests: profile.interests || [],
              city: profile.city,
              address: profile.address,
              state: profile.state,
              postal_code: profile.postal_code,
              date_of_birth: profile.date_of_birth,
              gender: profile.gender,
              phone: profile.phone,
              whatsapp: profile.whatsapp,
              has_room_to_share: profile.has_room_to_share,
              wants_to_find_roommate: profile.wants_to_find_roommate,
              age: undefined,
              distance_km: 0
            };
          });

          console.log(`✅ Mostrando TODOS los perfiles: ${formattedResults.length}`);
          setSearchResults(formattedResults);
          setFilteredResults(formattedResults);
        } else {
          // Geocodificar y calcular distancias manualmente
          const geocoder = new window.google.maps.Geocoder();
          const searchLat = searchLocation.geometry.location.lat;
          const searchLng = searchLocation.geometry.location.lng;

          console.log('📍 Ubicación de búsqueda:', { lat: searchLat, lng: searchLng });

          // Función para calcular distancia usando fórmula de Haversine
          const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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

          // Procesar perfiles con geocoding (secuencial con delay)
          const profilesWithDistance = [];
          let successCount = 0;
          let failCount = 0;

          for (let i = 0; i < data.length; i++) {
            const profile = data[i];
            
            // Construir dirección completa
            let fullAddress = '';
            if (profile.address) fullAddress += profile.address;
            if (profile.city) fullAddress += (fullAddress ? ', ' : '') + profile.city;
            if (profile.state) fullAddress += (fullAddress ? ', ' : '') + profile.state;
            if (profile.postal_code) fullAddress += (fullAddress ? ' ' : '') + profile.postal_code;
            if (profile.country) fullAddress += (fullAddress ? ', ' : '') + profile.country;

            let distance_km = 999999; // Distancia muy alta por defecto
            let geocoded = false;
            
            // Intentar geocodificar con múltiples estrategias
            if (fullAddress && fullAddress !== 'Ubicación no especificada') {
              // Estrategia 1: Dirección completa
              try {
                const result = await new Promise<any>((resolve, reject) => {
                  geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
                    if (status === 'OK' && results[0]) {
                      resolve(results[0]);
                    } else {
                      reject(status);
                    }
                  });
                });

                const profileLat = result.geometry.location.lat();
                const profileLng = result.geometry.location.lng();
                distance_km = calculateDistance(searchLat, searchLng, profileLat, profileLng);
                console.log(`✅ ${profile.full_name}: ${distance_km.toFixed(2)} km`);
                geocoded = true;
                successCount++;
              } catch (geocodeError) {
                // Estrategia 2: Solo ciudad y estado
                if (profile.city) {
                  try {
                    const simpleAddress = `${profile.city}${profile.state ? ', ' + profile.state : ''}, España`;
                    const result = await new Promise<any>((resolve, reject) => {
                      geocoder.geocode({ address: simpleAddress }, (results: any, status: any) => {
                        if (status === 'OK' && results[0]) {
                          resolve(results[0]);
                        } else {
                          reject(status);
                        }
                      });
                    });

                    const profileLat = result.geometry.location.lat();
                    const profileLng = result.geometry.location.lng();
                    distance_km = calculateDistance(searchLat, searchLng, profileLat, profileLng);
                    console.log(`✅ ${profile.full_name} (ciudad): ${distance_km.toFixed(2)} km`);
                    geocoded = true;
                    successCount++;
                  } catch (cityError) {
                    console.log(`⚠️ No se pudo geocodificar: ${profile.full_name} - ${fullAddress}`);
                    failCount++;
                  }
                } else {
                  console.log(`⚠️ Sin ciudad: ${profile.full_name}`);
                  failCount++;
                }
              }

              // Pequeño delay para evitar límites de la API (solo cada 10 perfiles)
              if (i % 10 === 0 && i > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            } else {
              console.log(`⚠️ Sin dirección: ${profile.full_name}`);
              failCount++;
            }

            profilesWithDistance.push({
              id: profile.id,
              full_name: profile.full_name || 'Usuario',
              email: profile.email || '',
              avatar_url: profile.avatar_url,
              bio: profile.bio,
              formatted_address: fullAddress || 'Ubicación no especificada',
              location_city: profile.city,
              location_country: profile.country,
              occupation: profile.occupation || 'Sin ocupación',
              interests: profile.interests || [],
              city: profile.city,
              address: profile.address,
              state: profile.state,
              postal_code: profile.postal_code,
              date_of_birth: profile.date_of_birth,
              gender: profile.gender,
              phone: profile.phone,
              whatsapp: profile.whatsapp,
              has_room_to_share: profile.has_room_to_share,
              wants_to_find_roommate: profile.wants_to_find_roommate,
              age: undefined,
              distance_km: distance_km,
              geocoded: geocoded
            });
          }

          console.log(`📊 Geocoding: ${successCount} exitosos, ${failCount} fallidos de ${data.length} total`);

          // Filtrar por distancia máxima Y que hayan sido geocodificados exitosamente
          const filteredByDistance = profilesWithDistance.filter(
            profile => profile.geocoded && profile.distance_km <= filters.maxDistance
          );

          console.log(`✅ Perfiles dentro de ${filters.maxDistance} km: ${filteredByDistance.length} de ${profilesWithDistance.length}`);
          console.log(`📍 Perfiles geocodificados exitosamente: ${successCount}`);
          console.log(`❌ Perfiles excluidos (sin geocoding o fuera de rango): ${profilesWithDistance.length - filteredByDistance.length}`);

          setSearchResults(filteredByDistance);
          setFilteredResults(filteredByDistance);
        }
      }
    } catch (err) {
      console.error('❌ Error searching people:', err);
      setError('Error al buscar personas');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    let results = [...searchResults];

    // Filtro por edad
    if (filters.ageRange) {
      results = results.filter(() => {
        // Aquí deberías tener la edad del usuario, por ahora lo omitimos
        return true;
      });
    }

    // Filtro por género
    if (filters.gender) {
      results = results.filter(() => {
        // Aquí deberías tener el género del usuario, por ahora lo omitimos
        return true;
      });
    }

    // Filtro por intereses
    if (filters.interests.length > 0) {
      results = results.filter((result: LocationSearchResult) => 
        filters.interests.some(interest => 
          result.interests?.includes(interest)
        )
      );
    }

    // Filtro por tiene habitación disponible
    if (filters.has_room_to_share === true) {
      results = results.filter((result: any) => 
        result.has_room_to_share === true
      );
    }

    // Filtro por busca compañero
    if (filters.wants_to_find_roommate === true) {
      results = results.filter((result: any) => 
        result.wants_to_find_roommate === true
      );
    }

    setFilteredResults(results);
  };

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [filters, searchResults]);

  // Buscar cuando cambie la ubicación
  useEffect(() => {
    if (searchLocation) {
      searchPeople();
    }
  }, [searchLocation]);

  const handleLocationSelect = (location: any) => {
    setSearchLocation(location);
  };

  const handleFiltersChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePersonSelect = (person: LocationSearchResult) => {
    // Navegar al perfil de la persona
    console.log('🔗 PeopleSearch: Navegando a perfil de:', person.full_name, 'ID:', person.id);
    navigate(`/dashboard/users/${person.id}`);
  };

  const handlePersonClick = (person: LocationSearchResult) => {
    // Navegar al perfil de la persona
    console.log('🔗 PeopleSearch: Navegando a perfil de:', person.full_name, 'ID:', person.id);
    navigate(`/dashboard/users/${person.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Buscar Personas
        </h1>
        <p className="text-gray-600">
          Encuentra personas cerca de ti con intereses similares
        </p>
      </div>

      {/* Selector de ubicación */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              ¿Dónde quieres buscar?
            </h2>
            {searchLocation && (
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Buscando en: {searchLocation.formatted_address} ({filters.maxDistance === 999999 ? 'Sin límite' : `${filters.maxDistance} km`})
              </p>
            )}
          </div>
        </div>
        <LocationSelector
          onLocationSelect={handleLocationSelect}
          placeholder={searchLocation ? "Cambiar ubicación..." : "Buscar ciudad, dirección o lugar..."}
          className="max-w-md"
        />
        {searchLocation && (
          <p className="text-xs text-gray-500 mt-2">
            💡 Puedes cambiar la ubicación si estás de viaje
          </p>
        )}
      </div>

      {/* Filtros - ocultos en modo mapa móvil, siempre visibles en desktop o modo lista */}
      <div className={viewMode === 'map' ? 'hidden lg:block' : 'block'}>
        <PeopleSearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>
      
      {/* Filtros Modal para móvil en modo mapa */}
      {viewMode === 'map' && showFilters && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setShowFilters(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Filtros de Búsqueda</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <PeopleSearchFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controles de vista */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {searchResults.length > 0 && (
            <span>
              {filteredResults.length} de {searchResults.length} personas encontradas
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mapa
          </button>
        </div>
      </div>

      {/* Estado de carga y errores */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Buscando personas...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Resultados */}
      {!loading && !error && searchResults.length > 0 && (
        <>
          {viewMode === 'list' ? (
            <PeopleSearchResults
              results={filteredResults}
              loading={loading}
              onPersonClick={handlePersonClick}
              onPersonSelect={handlePersonSelect}
            />
          ) : (
            <div className="relative">
              <PeopleSearchMap
                searchResults={filteredResults}
                onPersonSelect={handlePersonSelect}
                className=""
              />
              
              {/* Botón flotante para filtros en modo mapa - solo móvil */}
              <div className="lg:hidden absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white rounded-full shadow-xl border border-gray-200 px-6 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Filtros</span>
                  {(filters.interests.length > 0 || filters.gender || filters.occupation) && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {(filters.interests.length || 0) + (filters.gender ? 1 : 0) + (filters.occupation ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Estado vacío */}
      {!loading && !error && searchResults.length === 0 && searchLocation && (
        <div className="text-center py-8">
          <p className="text-gray-600">No se encontraron personas en esta ubicación</p>
        </div>
      )}

      {/* Instrucciones iniciales */}
      {!loading && !error && !searchLocation && (
        <div className="text-center py-8">
          <p className="text-gray-600">Selecciona una ubicación para comenzar a buscar</p>
        </div>
      )}
    </div>
  );
};

export default PeopleSearch;
