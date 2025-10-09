import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPinIcon, HomeIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import PropertiesRentalMapFilters, { PropertyRentalFilters } from './PropertiesRentalMapFilters';

// Declarar tipos de Google Maps localmente
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

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  price: number | null;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  total_area: number | null;
  property_type: string;
  property_condition: string | null;
  construction_year: number | null;
  available_from: string | null;
  available_until: string | null;
  listing_type: string;
  created_at: string;
  primary_image_url?: string;
}

const PropertiesRentalMapView: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 }); // Madrid por defecto
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros consolidados
  const [filters, setFilters] = useState<PropertyRentalFilters>({
    searchTerm: '',
    selectedCity: '',
    selectedListingType: '',
    selectedPropertyType: '',
    minPrice: 0,
    maxPrice: 5000,
    bedrooms: 0,
    bathrooms: 0
  });
  
  const { isLoaded: mapsLoaded, isLoading: mapsLoading, error: mapsError } = useGoogleMaps();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    // Aplicar filtros
    const filtered = properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           property.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           property.address.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesCity = !filters.selectedCity || property.city === filters.selectedCity;
      
      const matchesListingType = !filters.selectedListingType || property.listing_type === filters.selectedListingType;
      
      const matchesPropertyType = !filters.selectedPropertyType || property.property_type === filters.selectedPropertyType;
      
      const matchesPrice = !property.price || 
                          (property.price >= filters.minPrice && property.price <= filters.maxPrice);
      
      const matchesBedrooms = filters.bedrooms === 0 || (property.bedrooms && property.bedrooms >= filters.bedrooms);
      
      const matchesBathrooms = filters.bathrooms === 0 || (property.bathrooms && property.bathrooms >= filters.bathrooms);
      
      return matchesSearch && matchesCity && matchesListingType && matchesPropertyType && matchesPrice && matchesBedrooms && matchesBathrooms;
    });
    
    setFilteredProperties(filtered);
  }, [properties, filters]);

  useEffect(() => {
    if (mapRef.current && !map && mapsLoaded && properties.length > 0) {
      initializeMap();
    }
  }, [map, mapsLoaded, properties]);

  useEffect(() => {
    if (map && mapsLoaded) {
      updateMarkers();
    }
  }, [filteredProperties, map, mapsLoaded]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // Obtener todas las propiedades (sin filtrar por tipo inicialmente)
      const { data: propertiesData, error } = await supabase
        .from('property_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }

      console.log('🔍 Datos brutos de propiedades:', propertiesData);

      // Obtener las imágenes por separado (mismo método que la vista de lista)
      const propertyIds = propertiesData?.map(property => property.id) || [];
      console.log('🆔 IDs de propiedades encontrados:', propertyIds);
      
      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('listing_id, image_url, is_primary')
        .in('listing_id', propertyIds);

      console.log('🖼️ Datos de imágenes obtenidos:', {
        count: imagesData?.length || 0,
        data: imagesData,
        error: imagesError
      });

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
        return;
      }

      // Crear un mapa de imágenes por listing_id
      const imagesMap = new Map();
      imagesData?.forEach(img => {
        if (!imagesMap.has(img.listing_id)) {
          imagesMap.set(img.listing_id, []);
        }
        imagesMap.get(img.listing_id).push(img);
      });

      // Asignar coordenadas por defecto si no existen y extraer imagen principal
      const propertiesWithCoords = propertiesData?.map(property => {
        // Obtener imágenes de esta propiedad
        const propertyImages = imagesMap.get(property.id) || [];
        const primaryImage = propertyImages.find((img: any) => img.is_primary) || propertyImages[0];
        const primaryImageUrl = primaryImage?.image_url;
        
        console.log(`🏠 Propiedad: ${property.title}`, {
          hasImages: propertyImages.length > 0,
          imagesCount: propertyImages.length,
          primaryImageUrl: primaryImageUrl,
          allImages: propertyImages
        });
        
        if (!property.latitude || !property.longitude) {
          // Coordenadas por defecto basadas en la ciudad
          const defaultCoords = getDefaultCoordinates(property.city);
          return {
            ...property,
            latitude: defaultCoords.lat,
            longitude: defaultCoords.lng,
            primary_image_url: primaryImageUrl
          };
        }
        return {
          ...property,
          primary_image_url: primaryImageUrl
        };
      }) || [];

      setProperties(propertiesWithCoords);

      // Calcular centro del mapa basado en las propiedades
      if (propertiesWithCoords.length > 0) {
        const avgLat = propertiesWithCoords.reduce((sum, p) => sum + p.latitude, 0) / propertiesWithCoords.length;
        const avgLng = propertiesWithCoords.reduce((sum, p) => sum + p.longitude, 0) / propertiesWithCoords.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
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
    
    return cityCoords[city] || { lat: 40.4168, lng: -3.7038 }; // Madrid por defecto
  };

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

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
  };

  const updateMarkers = () => {
    if (!map || !window.google) return;

    // Limpiar marcadores anteriores
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    filteredProperties.forEach(property => {
      if (property.latitude && property.longitude) {
        // Determinar el color del marcador según el tipo de propiedad
        const markerColors: { [key: string]: string } = {
          'property_rental': '#3B82F6',    // Azul para alquiler
          'property_purchase': '#10B981',  // Verde para venta
          'coliving': '#8B5CF6',           // Púrpura para coliving
          'room_rental': '#F59E0B'         // Amarillo para habitaciones
        };
        const markerColor = markerColors[property.listing_type] || '#3B82F6';
        
        const marker = new window.google.maps.Marker({
          position: { lat: property.latitude, lng: property.longitude },
          map: map,
          title: property.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="${markerColor}" stroke="#ffffff" stroke-width="2"/>
                <path d="M12 12h8v8h-8z" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16)
          }
        });

        console.log(`📸 Creando InfoWindow para: ${property.title}`, {
          hasImage: !!property.primary_image_url,
          imageUrl: property.primary_image_url
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 300px; font-family: system-ui, -apple-system, sans-serif;">
              ${property.primary_image_url ? `
                <div style="margin-bottom: 12px;">
                  <img src="${property.primary_image_url}" alt="${property.title}" style="width: 100%; height: 128px; object-fit: cover; border-radius: 8px;" onerror="console.log('Error cargando imagen:', this.src)">
                </div>
              ` : '<div style="margin-bottom: 12px; height: 128px; background-color: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">Sin imagen</div>'}
              <h3 style="font-weight: 600; font-size: 18px; margin-bottom: 8px; color: #111827;">${property.title}</h3>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${property.address}, ${property.city}</p>
              <div style="display: flex; align-items: center; gap: 16px; font-size: 14px;">
                ${property.price ? `<span style="color: #2563eb; font-weight: 600;">${property.price.toLocaleString()} €/mes</span>` : ''}
                ${property.bedrooms ? `<span style="display: flex; align-items: center; gap: 4px;">🏠 ${property.bedrooms}</span>` : ''}
                ${property.bathrooms ? `<span style="display: flex; align-items: center; gap: 4px;">🚿 ${property.bathrooms}</span>` : ''}
              </div>
              <button id="details-btn-${property.id}" style="margin-top: 8px; padding: 6px 12px; background-color: #2563eb; color: white; font-size: 12px; border-radius: 4px; border: none; cursor: pointer; hover: background-color: #1d4ed8;">
                Ver detalles
              </button>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          setSelectedProperty(property);
          
          // Agregar event listener para el botón de detalles después de que se abra el InfoWindow
          setTimeout(() => {
            const detailsButton = document.getElementById(`details-btn-${property.id}`);
            if (detailsButton) {
              detailsButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔗 Navegando a detalles de propiedad:', property.title);
                navigate(`/dashboard/properties/rental/${property.id}`);
              });
            }
          }, 100);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);

    // Ajustar zoom para mostrar todos los marcadores
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()!));
      map.fitBounds(bounds);
    }
  };

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return 'Precio no disponible';
    return `${price.toLocaleString()} ${currency}/mes`;
  };


  const formatAvailability = (from: string | null, until: string | null) => {
    if (!from) return 'Disponible';
    const fromDate = new Date(from).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    if (!until) return `Desde ${fromDate}`;
    const untilDate = new Date(until).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    return `${fromDate} - ${untilDate}`;
  };

  if (loading || mapsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Cargando propiedades...' : 'Cargando Google Maps...'}
          </p>
          {mapsError && (
            <p className="text-red-600 text-sm mt-2">Error: {mapsError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mapa de Propiedades</h1>
              <p className="text-gray-600 mt-1">
                Explora propiedades de alquiler, venta y proyectos coliving en el mapa
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {filteredProperties.length} de {properties.length} propiedades
              </div>
              <Link
                to="/dashboard/properties/rental"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Vista Lista
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Mapa */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />
          
          {/* Controles del mapa - Leyenda */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Tipos de Propiedad</h3>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Alquiler</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Venta</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Coliving</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Habitaciones</span>
              </div>
            </div>
          </div>
          
          {/* Botón flotante arriba en el centro para móvil */}
          <div className="lg:hidden absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-white rounded-full shadow-xl border border-gray-200 flex items-center divide-x divide-gray-200">
              {/* Botón filtros */}
              <button
                onClick={() => {
                  setShowFilters(!showFilters);
                  setShowPropertyList(false);
                }}
                className="px-5 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-l-full"
              >
                <FunnelIcon className="w-5 h-5 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Filtros</span>
              </button>
              
              {/* Botón lista con contador */}
              <button
                onClick={() => {
                  setShowPropertyList(!showPropertyList);
                  setShowFilters(false);
                }}
                className="px-5 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-r-full"
              >
                <HomeIcon className="w-5 h-5 text-blue-600" />
                <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[28px] text-center">{filteredProperties.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Panel lateral con lista de propiedades */}
        <div className={`${showPropertyList ? 'block' : 'hidden'} lg:block lg:w-96 bg-white shadow-lg overflow-y-auto ${showPropertyList ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : ''}`}>
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Propiedades Disponibles</h2>
              <p className="text-sm text-gray-600">Haz clic en un marcador para ver detalles</p>
            </div>
            {/* Botón cerrar en móvil */}
            <button
              onClick={() => setShowPropertyList(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedProperty?.id === property.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => setSelectedProperty(property)}
              >
                <div className="flex items-start space-x-3">
                  {/* Imagen de la propiedad */}
                  <div className="flex-shrink-0">
                    {property.primary_image_url ? (
                      <img 
                        src={property.primary_image_url} 
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          console.log('Error cargando imagen en card:', e.currentTarget.src);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <HomeIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{property.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {property.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{property.address}, {property.city}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-blue-600 font-semibold">
                        {formatPrice(property.price, property.currency)}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {property.bedrooms && (
                          <div className="flex items-center space-x-1">
                            <HomeIcon className="w-4 h-4" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center space-x-1">
                            <span>🚿</span>
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      {formatAvailability(property.available_from, property.available_until)}
                    </div>
                    
                    <div className="mt-3">
                      <Link
                        to={`/dashboard/properties/rental/${property.id}`}
                        className="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Componente de Filtros Modal */}
      <PropertiesRentalMapFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowFilters(false)}
        isOpen={showFilters}
        cities={[...new Set(properties.map(p => p.city))]}
        propertyTypes={['Comunidad Coliving', 'Apartamento', 'Casa', 'Estudio', 'Loft', 'Duplex', 'Villa', 'Chalet', 'Casa rural']}
      />
    </div>
  );
};

export default PropertiesRentalMapView;
