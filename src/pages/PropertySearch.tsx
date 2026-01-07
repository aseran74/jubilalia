import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { 
  MagnifyingGlassIcon as SearchIcon, 
  MapPinIcon, 
  HomeIcon,
  CurrencyEuroIcon,
  Squares2X2Icon,
  FunnelIcon,
  XMarkIcon,
  MapIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import PropertyCard from '../components/landing/PropertyCard';
import RoomCard from '../components/landing/RoomCard';
import UnifiedPropertyFilter from '../components/common/UnifiedPropertyFilter';
import AmenitiesFilter from '../components/common/AmenitiesFilter';

type SearchType = 'all' | 'rental' | 'sale' | 'rooms';
type ViewMode = 'list' | 'map';

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  address: string;
  city: string;
  country?: string;
  postal_code?: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  listing_type: 'property_rental' | 'property_purchase' | 'room_rental';
  images: string[];
  price_per_person?: number;
  latitude?: number | null;
  longitude?: number | null;
}

declare global {
  namespace google.maps {
    interface Map {}
    interface Marker {
      setMap(map: Map | null): void;
      getPosition(): LatLng | null;
    }
    interface LatLng {
      lat(): number;
      lng(): number;
    }
  }
}

const PropertySearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchType, setSearchType] = useState<SearchType>(
    (searchParams.get('type') as SearchType) || 'all'
  );
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState({ 
    min: searchParams.get('price_min') ? parseInt(searchParams.get('price_min')!) : 0, 
    max: searchParams.get('price_max') ? parseInt(searchParams.get('price_max')!) : 1000000 
  });
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : 0);
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : 0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mapa
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 }); // Madrid por defecto
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  const { isLoaded: mapsLoaded, isLoading: mapsLoading } = useGoogleMaps();
  
  // Obtener ciudades y tipos únicos
  const cities = [...new Set(properties.map(p => p.city).filter(Boolean))].sort();
  const propertyTypes = [...new Set(properties.map(p => p.property_type).filter(Boolean))].sort();

  useEffect(() => {
    fetchProperties();
  }, [searchType]);

  useEffect(() => {
    // Aplicar filtros
    const filtered = properties.filter(property => {
      const matchesSearch = !searchTerm || 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCity = !selectedCity || property.city === selectedCity;
      
      const matchesPropertyType = !propertyType || property.property_type === propertyType;
      
      const matchesPrice = property.price >= priceRange.min && property.price <= priceRange.max;
      
      const matchesBedrooms = bedrooms === 0 || (property.bedrooms && property.bedrooms >= bedrooms);
      
      const matchesBathrooms = bathrooms === 0 || (property.bathrooms && property.bathrooms >= bathrooms);
      
      return matchesSearch && matchesCity && matchesPropertyType && matchesPrice && matchesBedrooms && matchesBathrooms;
    });
    
    setFilteredProperties(filtered);
  }, [properties, searchTerm, selectedCity, propertyType, priceRange, bedrooms, bathrooms]);

  useEffect(() => {
    if (viewMode === 'map' && mapRef.current && !map && mapsLoaded) {
      initializeMap();
    }
  }, [viewMode, map, mapsLoaded]);

  useEffect(() => {
    if (viewMode === 'map' && map && mapsLoaded) {
      updateMarkers();
    }
  }, [filteredProperties, map, mapsLoaded, viewMode]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determinar qué tipos de listings buscar
      let listingTypes: string[] = [];
      if (searchType === 'all') {
        listingTypes = ['property_rental', 'property_purchase', 'room_rental'];
      } else if (searchType === 'rental') {
        listingTypes = ['property_rental'];
      } else if (searchType === 'sale') {
        listingTypes = ['property_purchase'];
      } else if (searchType === 'rooms') {
        listingTypes = ['room_rental'];
      }

      let query = supabase
        .from('property_listings')
        .select(`
          id,
          title,
          description,
          property_type,
          address,
          city,
          country,
          postal_code,
          price,
          bedrooms,
          bathrooms,
          listing_type,
          latitude,
          longitude,
          price_per_person,
          is_available
        `)
        .in('listing_type', listingTypes)
        .eq('is_available', true);

      const { data: listingsData, error: listingsError } = await query
        .order('created_at', { ascending: false })
        .limit(200);

      if (listingsError) throw listingsError;

      // Obtener imágenes para cada listing
      const listingsWithImages = await Promise.all(
        (listingsData || []).map(async (listing) => {
          const { data: imagesData } = await supabase
            .from('property_images')
            .select('image_url')
            .eq('listing_id', listing.id)
            .order('order_index', { ascending: true })
            .limit(1);

          // Asignar coordenadas por defecto si no existen
          let lat = listing.latitude;
          let lng = listing.longitude;
          
          if (!lat || !lng) {
            const defaultCoords = getDefaultCoordinates(listing.city);
            lat = defaultCoords.lat;
            lng = defaultCoords.lng;
          }

          return {
            ...listing,
            images: imagesData?.map(img => img.image_url) || [],
            latitude: lat,
            longitude: lng
          };
        })
      );

      setProperties(listingsWithImages as Property[]);
      
      // Calcular centro del mapa
      if (listingsWithImages.length > 0) {
        const coords = listingsWithImages.filter(p => p.latitude && p.longitude);
        if (coords.length > 0) {
          const avgLat = coords.reduce((sum, p) => sum + (p.latitude || 0), 0) / coords.length;
          const avgLng = coords.reduce((sum, p) => sum + (p.longitude || 0), 0) / coords.length;
          setMapCenter({ lat: avgLat, lng: avgLng });
        }
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError(err.message || 'Error al cargar las propiedades');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCoordinates = (city: string) => {
    const cityCoords: { [key: string]: { lat: number; lng: number } } = {
      'Madrid': { lat: 40.4168, lng: -3.7038 },
      'Barcelona': { lat: 41.3851, lng: 2.1734 },
      'Valencia': { lat: 39.4699, lng: -0.3763 },
      'Sevilla': { lat: 37.3891, lng: -5.9845 },
      'Bilbao': { lat: 43.2627, lng: -2.9253 },
      'Málaga': { lat: 36.7213, lng: -4.4214 },
      'Zaragoza': { lat: 41.6488, lng: -0.8891 },
      'Murcia': { lat: 37.9922, lng: -1.1307 },
      'Palma': { lat: 39.5696, lng: 2.6502 },
      'Las Palmas': { lat: 28.1248, lng: -15.4300 }
    };
    
    return cityCoords[city] || { lat: 40.4168, lng: -3.7038 };
  };

  const initializeMap = () => {
    if (!window.google || !window.google.maps || !mapRef.current) {
      console.log('⚠️ No se puede inicializar el mapa:', {
        hasGoogle: !!window.google,
        hasMaps: !!(window.google && window.google.maps),
        hasRef: !!mapRef.current
      });
      return;
    }

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 10,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);
      console.log('✅ Mapa inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar el mapa:', error);
    }
  };

  const updateMarkers = () => {
    if (!map || !window.google || !window.google.maps) {
      console.log('⚠️ No se pueden actualizar marcadores:', {
        hasMap: !!map,
        hasGoogle: !!window.google,
        hasMaps: !!(window.google && window.google.maps)
      });
      return;
    }

    try {
      // Limpiar marcadores anteriores
      markers.forEach(marker => marker.setMap(null));

      const newMarkers: google.maps.Marker[] = [];

      filteredProperties.forEach(property => {
        if (property.latitude && property.longitude) {
          const markerColors: { [key: string]: string } = {
            'property_rental': '#3B82F6',
            'property_purchase': '#10B981',
            'room_rental': '#F59E0B'
          };
          const markerColor = markerColors[property.listing_type] || '#3B82F6';
          
          const marker = new window.google.maps.Marker({
            position: { lat: property.latitude, lng: property.longitude },
            map: map,
            title: property.title,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: markerColor,
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2
            }
          });

          marker.addListener('click', () => {
            setSelectedProperty(property);
          });

          newMarkers.push(marker);
        }
      });

      setMarkers(newMarkers);

      // Ajustar vista del mapa para mostrar todos los marcadores
      if (newMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        newMarkers.forEach(marker => {
          const pos = marker.getPosition();
          if (pos) bounds.extend(pos);
        });
        map.fitBounds(bounds);
      } else {
        // Si no hay marcadores, centrar en el centro por defecto
        map.setCenter(mapCenter);
        map.setZoom(10);
      }
    } catch (error) {
      console.error('❌ Error al actualizar marcadores:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURLParams();
  };

  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (searchType !== 'all') params.set('type', searchType);
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCity) params.set('city', selectedCity);
    if (priceRange.min > 0) params.set('price_min', priceRange.min.toString());
    if (priceRange.max < 1000000) params.set('price_max', priceRange.max.toString());
    if (bedrooms > 0) params.set('bedrooms', bedrooms.toString());
    if (bathrooms > 0) params.set('bathrooms', bathrooms.toString());
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setPropertyType('');
    setPriceRange({ min: 0, max: 1000000 });
    setBedrooms(0);
    setBathrooms(0);
    setSelectedAmenities([]);
    setSearchParams({});
  };

  const getPropertyPath = (property: Property) => {
    if (property.listing_type === 'room_rental') {
      return `/rooms/${property.id}`;
    } else if (property.listing_type === 'property_rental') {
      return `/properties/rental/${property.id}`;
    } else {
      return `/properties/sale/${property.id}`;
    }
  };

  const maxPrice = searchType === 'sale' ? 1000000 : 5000;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Buscar Propiedades
            </h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              Volver al inicio
            </button>
          </div>

          {/* Tipo de búsqueda */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSearchType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSearchType('rental')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'rental'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Alquiler
            </button>
            <button
              onClick={() => setSearchType('sale')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'sale'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Venta
            </button>
            <button
              onClick={() => setSearchType('rooms')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'rooms'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Habitaciones
            </button>
          </div>

          {/* Filtros unificados */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filtros avanzados</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Limpiar filtros
                </button>
              </div>
              <UnifiedPropertyFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                selectedPropertyType={propertyType}
                setSelectedPropertyType={setPropertyType}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                bedrooms={bedrooms}
                setBedrooms={setBedrooms}
                bathrooms={bathrooms}
                setBathrooms={setBathrooms}
                selectedAmenities={selectedAmenities}
                cities={cities}
                propertyTypes={propertyTypes}
                maxPrice={maxPrice}
              />
              {selectedAmenities.length > 0 && (
                <div className="mt-4">
                  <AmenitiesFilter
                    selectedAmenities={selectedAmenities}
                    onChange={setSelectedAmenities}
                  />
                </div>
              )}
            </div>
          )}

          {/* Barra de búsqueda y controles */}
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-5 h-5" />
            </button>
            <div className="flex-1"></div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  viewMode === 'list'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  viewMode === 'map'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MapIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Buscando propiedades...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar tus filtros de búsqueda
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : viewMode === 'map' ? (
          <div className="relative">
            {mapsLoading ? (
              <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando mapa...</p>
                </div>
              </div>
            ) : !mapsLoaded ? (
              <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Error al cargar Google Maps</p>
                  <p className="text-sm text-gray-500">Por favor, recarga la página</p>
                </div>
              </div>
            ) : (
              <>
                <div ref={mapRef} className="h-[600px] w-full rounded-lg border border-gray-200" />
                {selectedProperty && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-md z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{selectedProperty.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{selectedProperty.address}, {selectedProperty.city}</p>
                        <p className="text-lg font-bold text-green-600">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(selectedProperty.price)}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setSelectedProperty(null)}
                          className="px-2 py-1 text-gray-500 hover:text-gray-700"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(getPropertyPath(selectedProperty))}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Se encontraron <span className="font-semibold text-gray-900">{filteredProperties.length}</span> propiedades
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => {
                if (property.listing_type === 'room_rental') {
                  return (
                    <RoomCard
                      key={property.id}
                      room={{
                        id: property.id,
                        title: property.title,
                        description: property.description,
                        address: property.address,
                        city: property.city,
                        price: property.price,
                        images: property.images
                      }}
                    />
                  );
                } else {
                  return (
                    <PropertyCard
                      key={property.id}
                      property={{
                        id: property.id,
                        title: property.title,
                        description: property.description,
                        property_type: property.property_type,
                        address: property.address,
                        city: property.city,
                        price: property.price,
                        bedrooms: property.bedrooms,
                        bathrooms: property.bathrooms,
                        listing_type: property.listing_type as 'property_rental' | 'property_purchase',
                        images: property.images,
                        price_per_person: property.price_per_person
                      }}
                    />
                  );
                }
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertySearch;
