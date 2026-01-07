import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { 
  MapPinIcon, 
  HomeIcon,
  CurrencyEuroIcon,
  Squares2X2Icon,
  FunnelIcon,
  XMarkIcon,
  MapIcon,
  ListBulletIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import UnifiedPropertyFilter from '../components/common/UnifiedPropertyFilter';
import AmenitiesFilter from '../components/common/AmenitiesFilter';
import PublicNavbar from '../components/common/PublicNavbar';
import PublicFooter from '../components/common/PublicFooter';

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

  // Cargar propiedades solo cuando cambia el tipo de búsqueda
  useEffect(() => {
    fetchProperties();
  }, [searchType]); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchType !== 'all') params.set('type', searchType);
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCity) params.set('city', selectedCity);
    if (priceRange.min > 0) params.set('price_min', priceRange.min.toString());
    if (priceRange.max < 1000000) params.set('price_max', priceRange.max.toString());
    if (bedrooms > 0) params.set('bedrooms', bedrooms.toString());
    if (bathrooms > 0) params.set('bathrooms', bathrooms.toString());
    setSearchParams(params);
  }, [searchType, searchTerm, selectedCity, priceRange, bedrooms, bathrooms, setSearchParams]);

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
      <PublicNavbar isTransparent={false} />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Buscar Propiedades
            </h1>
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
                    onAmenitiesChange={setSelectedAmenities}
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
                  <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 max-w-md z-10 overflow-hidden">
                    {/* Imagen */}
                    <div className="h-40 bg-gray-200 relative">
                      {selectedProperty.images && selectedProperty.images.length > 0 ? (
                        <img
                          src={selectedProperty.images[0]}
                          alt={selectedProperty.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <HomeIcon className="w-12 h-12" />
                        </div>
                      )}
                      {/* Badge de tipo */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          selectedProperty.listing_type === 'room_rental' 
                            ? 'bg-purple-100 text-purple-800'
                            : selectedProperty.listing_type === 'property_rental'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        } shadow-sm`}>
                          {selectedProperty.listing_type === 'room_rental' 
                            ? 'Habitación'
                            : selectedProperty.listing_type === 'property_rental'
                            ? 'Alquiler'
                            : 'Venta'}
                        </span>
                      </div>
                      {/* Botón cerrar */}
                      <button
                        onClick={() => setSelectedProperty(null)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-sm"
                      >
                        <XMarkIcon className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    
                    {/* Contenido */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{selectedProperty.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1 text-green-600" />
                        {selectedProperty.city}
                      </p>
                      {(selectedProperty.bedrooms || selectedProperty.bathrooms) && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          {selectedProperty.bedrooms && (
                            <div className="flex items-center gap-1">
                              <HomeIcon className="w-4 h-4 text-gray-400" />
                              <span>{selectedProperty.bedrooms} hab.</span>
                            </div>
                          )}
                          {selectedProperty.bathrooms && (
                            <div className="flex items-center gap-1">
                              <Squares2X2Icon className="w-4 h-4 text-gray-400" />
                              <span>{selectedProperty.bathrooms} baños</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-green-600">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(selectedProperty.price)}
                          </p>
                          {selectedProperty.listing_type === 'property_rental' && selectedProperty.price_per_person && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(selectedProperty.price_per_person)}/mes por persona
                            </p>
                          )}
                          {selectedProperty.listing_type === 'room_rental' && (
                            <p className="text-xs text-gray-500 mt-1">/mes</p>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(getPropertyPath(selectedProperty))}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
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
                const formatPrice = (price: number) => {
                  return new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                  }).format(price);
                };

                const getListingTypeLabel = () => {
                  if (property.listing_type === 'room_rental') return 'Habitación';
                  return property.listing_type === 'property_rental' ? 'Alquiler' : 'Venta';
                };

                const getListingTypeColor = () => {
                  if (property.listing_type === 'room_rental') return 'bg-purple-100 text-purple-800';
                  return property.listing_type === 'property_rental' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800';
                };

                return (
                  <Link
                    key={property.id}
                    to={getPropertyPath(property)}
                    className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    {/* Imagen */}
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <HomeIcon className="w-12 h-12" />
                        </div>
                      )}
                      
                      {/* Badge de tipo */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getListingTypeColor()} shadow-sm`}>
                          {getListingTypeLabel()}
                        </span>
                      </div>

                      {/* Badge de tipo de propiedad */}
                      {property.property_type && (
                        <div className="absolute top-3 left-3 mt-10">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-gray-800 shadow-sm backdrop-blur-sm">
                            {property.property_type}
                          </span>
                        </div>
                      )}

                      {/* Botón de favorito (placeholder) */}
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-sm hover:scale-110"
                      >
                        <HeartIcon className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                      </button>
                    </div>

                    {/* Contenido */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {property.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {property.description}
                      </p>

                      {/* Ubicación */}
                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <MapPinIcon className="w-4 h-4 mr-1.5 text-green-600" />
                        <span className="font-medium">{property.city}</span>
                      </div>

                      {/* Características */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <HomeIcon className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Squares2X2Icon className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{property.bathrooms}</span>
                          </div>
                        )}
                      </div>

                      {/* Precio y botón */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatPrice(property.price)}
                          </div>
                          {property.listing_type === 'property_rental' && property.price_per_person && (
                            <div className="text-xs text-gray-500 mt-1">
                              {formatPrice(property.price_per_person)}/mes por persona
                            </div>
                          )}
                          {property.listing_type === 'room_rental' && (
                            <div className="text-xs text-gray-500 mt-1">
                              /mes
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-green-600">
                          <CurrencyEuroIcon className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      <PublicFooter />
    </div>
  );
};

export default PropertySearch;
