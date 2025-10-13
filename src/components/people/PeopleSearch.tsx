import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LocationSelector from './LocationSelector';
import PeopleSearchFilters from './PeopleSearchFilters';
import PeopleSearchResults from './PeopleSearchResults';
import PeopleSearchMap from './PeopleSearchMap';
import type { LocationSearchResult, SearchFilters } from '../../types/supabase';

const PeopleSearch: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<LocationSearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    maxDistance: 50,
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
        .limit(50);

      if (error) {
        console.error('❌ Error cargando usuarios iniciales:', error);
        return;
      }

      console.log('✅ Usuarios iniciales cargados:', data);
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
            age: null,
            gender: null,
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
          .select('id, full_name, email, avatar_url, bio, address, city, state, postal_code, country, occupation, interests, created_at')
          .limit(20);

        if (error) {
          console.error('❌ Error en consulta directa:', error);
          throw error;
        }

        console.log('✅ Resultados de consulta directa:', data);
        console.log('🔍 Datos de búsqueda con avatares:', data?.map(p => ({ name: p.full_name, avatar: p.avatar_url })));
        
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
            age: null, // No tenemos edad en profiles
            gender: null, // No tenemos género en profiles
            distance_km: 0
          };
        }) || [];

        setSearchResults(formattedResults);
        setFilteredResults(formattedResults);
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          ¿Dónde quieres buscar?
        </h2>
        <LocationSelector
          onLocationSelect={handleLocationSelect}
          placeholder="Buscar ciudad, dirección o lugar..."
          className="max-w-md"
        />
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
