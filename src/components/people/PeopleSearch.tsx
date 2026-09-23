import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { MapPin } from 'lucide-react';
import LocationSelector from './LocationSelector';
import PeopleSearchFilters from './PeopleSearchFilters';
import PeopleSearchResults from './PeopleSearchResults';
import PeopleSearchMap from './PeopleSearchMap';
import Modal from '../common/Modal';
import MapViewControls, { MapOverlayHeader, NearbyButton, detectNearbyLocation } from '../common/MapViewControls';
import type { LocationSearchResult, SearchFilters } from '../../types/supabase';
import { formatDistanceLabel, isUnlimitedDistance } from '../../utils/geo';

const PeopleSearch: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [nearbyActive, setNearbyActive] = useState(false);
  const [detectingNearby, setDetectingNearby] = useState(false);

  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '');
    if (path.endsWith('/users') || path.endsWith('/users/map')) {
      setViewMode('map');
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
        if (isUnlimitedDistance(filters.maxDistance)) {
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
          // Usar coordenadas guardadas en la base de datos
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

          // Procesar perfiles usando coordenadas guardadas
          const profilesWithDistance = [];
          let successCount = 0;
          let failCount = 0;

          for (const profile of data) {
            // Construir dirección completa
            let fullAddress = '';
            if (profile.address) fullAddress += profile.address;
            if (profile.city) fullAddress += (fullAddress ? ', ' : '') + profile.city;
            if (profile.state) fullAddress += (fullAddress ? ', ' : '') + profile.state;
            if (profile.postal_code) fullAddress += (fullAddress ? ' ' : '') + profile.postal_code;
            if (profile.country) fullAddress += (fullAddress ? ', ' : '') + profile.country;

            let distance_km = 999999;
            let geocoded = false;
            
            // Usar coordenadas guardadas en la base de datos
            if (profile.latitude && profile.longitude) {
              distance_km = calculateDistance(searchLat, searchLng, profile.latitude, profile.longitude);
              geocoded = true;
              successCount++;
              console.log(`✅ ${profile.full_name}: ${distance_km.toFixed(2)} km (coordenadas guardadas)`);
            } else if (profile.city) {
              // Si no hay coordenadas pero hay ciudad, intentar geocodificar la ciudad
              try {
                const geocoder = new window.google.maps.Geocoder();
                const cityAddress = `${profile.city}, ${profile.country || 'España'}`;
                
                const result = await new Promise<any>((resolve, reject) => {
                  geocoder.geocode({ address: cityAddress }, (results: any, status: any) => {
                    if (status === 'OK' && results[0]) {
                      resolve(results[0]);
                    } else {
                      reject(status);
                    }
                  });
                });

                if (result) {
                  const cityLat = result.geometry.location.lat();
                  const cityLng = result.geometry.location.lng();
                  distance_km = calculateDistance(searchLat, searchLng, cityLat, cityLng);
                  geocoded = true;
                  successCount++;
                  console.log(`✅ ${profile.full_name}: ${distance_km.toFixed(2)} km (geocodificado desde ciudad: ${profile.city})`);
                }
              } catch (geocodeError) {
                console.log(`⚠️ ${profile.full_name}: No se pudo geocodificar ciudad ${profile.city}`);
                // Incluir de todas formas, pero sin distancia calculada
                geocoded = false;
                failCount++;
              }
            } else {
              console.log(`⚠️ ${profile.full_name}: Sin coordenadas ni ciudad`);
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

          console.log(`📊 Perfiles con coordenadas: ${successCount}, sin coordenadas: ${failCount} de ${data.length} total`);

          // Filtrar por distancia máxima
          // Incluir usuarios con coordenadas dentro del rango Y usuarios sin coordenadas (para que no se pierdan)
          const filteredByDistance = profilesWithDistance.filter(
            profile => {
              // Si tiene coordenadas, verificar que esté dentro del rango
              if (profile.geocoded) {
                return profile.distance_km <= filters.maxDistance;
              }
              // Si no tiene coordenadas, incluirlo de todas formas (no excluir por falta de datos)
              return true;
            }
          );

          console.log(`✅ Perfiles dentro de ${filters.maxDistance} km o sin coordenadas: ${filteredByDistance.length} de ${profilesWithDistance.length}`);
          console.log(`📍 Perfiles con coordenadas dentro del rango: ${filteredByDistance.filter(p => p.geocoded).length}`);
          console.log(`📍 Perfiles sin coordenadas (incluidos): ${filteredByDistance.filter(p => !p.geocoded).length}`);

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

  // Buscar cuando cambie la ubicación O la distancia máxima
  useEffect(() => {
    if (searchLocation) {
      searchPeople();
    }
  }, [searchLocation, filters.maxDistance]);

  const handleLocationSelect = (location: any) => {
    setSearchLocation(location);
  };

  const handleDetectNearby = async () => {
    if (nearbyActive) {
      setNearbyActive(false);
      loadInitialUsers();
      return;
    }

    setDetectingNearby(true);
    const locationResult = await detectNearbyLocation();
    if (locationResult) {
      setSearchLocation({
        formatted_address: locationResult.formattedAddress || locationResult.city || 'Tu ubicación',
        geometry: {
          location: {
            lat: locationResult.lat,
            lng: locationResult.lng,
          },
        },
      });
      setNearbyActive(true);
    } else if (searchLocation) {
      setNearbyActive(true);
    }
    setDetectingNearby(false);
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

  const activeFilterCount =
    filters.interests.length +
    (filters.gender ? 1 : 0) +
    (filters.occupation ? 1 : 0) +
    (filters.has_room_to_share ? 1 : 0) +
    (filters.wants_to_find_roommate ? 1 : 0);

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-slate-50">
      {viewMode === 'list' && (
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 pl-[4.5rem] md:pl-4 pt-[calc(var(--safe-top)+12px)]">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-stone-900">Buscar personas</h1>
          {searchLocation && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-stone-500">
              <MapPin className="h-4 w-4 shrink-0" />
              {searchLocation.formatted_address}
              {' · '}
              {formatDistanceLabel(filters.maxDistance)}
            </p>
          )}
        </div>

        {searchResults.length > 0 && (
          <span className="text-sm font-medium text-stone-600">
            {filteredResults.length} de {searchResults.length}
          </span>
        )}
        <NearbyButton active={nearbyActive} loading={detectingNearby} onClick={handleDetectNearby} />
      </div>
      )}

      <div className="relative min-h-0 flex-1">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <div className="text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-700" />
              <p className="text-stone-600">Buscando personas...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!error && viewMode === 'map' && (
          <div className="relative h-[100dvh] min-h-[22rem] w-full">
            <PeopleSearchMap
              searchResults={filteredResults}
              onPersonSelect={handlePersonSelect}
              compact
              className="h-full"
            />
            <MapOverlayHeader
              title="Miembros"
              subtitle={
                searchLocation
                  ? `${searchLocation.formatted_address} · ${formatDistanceLabel(filters.maxDistance)}`
                  : filteredResults.length
                    ? `${filteredResults.length} personas`
                    : undefined
              }
              action={<NearbyButton active={nearbyActive} loading={detectingNearby} onClick={handleDetectNearby} />}
            />
          </div>
        )}

        {!loading && !error && viewMode === 'list' && searchResults.length > 0 && (
          <div className="p-4 pb-32">
            <PeopleSearchResults
              results={filteredResults}
              loading={loading}
              onPersonClick={handlePersonClick}
              onPersonSelect={handlePersonSelect}
            />
          </div>
        )}

        {!loading && !error && viewMode === 'list' && searchResults.length === 0 && searchLocation && (
          <div className="p-8 text-center text-stone-600">No se encontraron personas en esta ubicación</div>
        )}

        {!loading && !error && !searchLocation && viewMode === 'list' && (
          <div className="p-8 text-center text-stone-600">Elige una ubicación en Filtros para comenzar</div>
        )}
      </div>

      <MapViewControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFiltersClick={() => setShowFilters(true)}
        filterCount={activeFilterCount + (nearbyActive ? 1 : 0)}
      />

      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filtros" size="lg">
        <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={handleDetectNearby}
            className={`flex w-full min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
              nearbyActive ? 'bg-emerald-700 text-white' : 'border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <MapPin className="h-5 w-5" />
            {nearbyActive ? 'Mostrando los más cercanos' : 'Detectar más cercanos'}
          </button>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-stone-800">¿Dónde quieres buscar?</h3>
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              placeholder={searchLocation ? 'Cambiar ubicación...' : 'Buscar ciudad, dirección o lugar...'}
            />
            {searchLocation && (
              <p className="mt-2 flex items-center gap-1 text-sm text-stone-500">
                <MapPin className="h-4 w-4 shrink-0" />
                {searchLocation.formatted_address}
              </p>
            )}
          </div>
          <PeopleSearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            embedded
          />
          <button
            type="button"
            onClick={() => setShowFilters(false)}
            className="w-full rounded-xl bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800"
          >
            Ver resultados
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PeopleSearch;
