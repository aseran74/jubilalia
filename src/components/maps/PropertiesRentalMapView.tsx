import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, HomeIcon, CurrencyEuroIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

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
  created_at: string;
}

const PropertiesRentalMapView: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 }); // Madrid por defecto
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  
  const { isLoaded: mapsLoaded, isLoading: mapsLoading, error: mapsError } = useGoogleMaps();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    // Aplicar filtros
    const filtered = properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCity = !selectedCity || property.city === selectedCity;
      
      const matchesPrice = !property.price || (property.price >= priceRange.min && property.price <= priceRange.max);
      
      return matchesSearch && matchesCity && matchesPrice;
    });
    
    setFilteredProperties(filtered);
  }, [properties, searchTerm, selectedCity, priceRange]);

  useEffect(() => {
    if (filteredProperties.length > 0 && mapRef.current && !map && mapsLoaded) {
      initializeMap();
    }
  }, [filteredProperties, map, mapsLoaded]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_listings')
        .select('*')
        .eq('listing_type', 'property_rental')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }

      // Asignar coordenadas por defecto si no existen
      const propertiesWithCoords = data?.map(property => {
        if (!property.latitude || !property.longitude) {
          // Coordenadas por defecto basadas en la ciudad
          const defaultCoords = getDefaultCoordinates(property.city);
          return {
            ...property,
            latitude: defaultCoords.lat,
            longitude: defaultCoords.lng
          };
        }
        return property;
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

    // Limpiar marcadores anteriores
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    filteredProperties.forEach(property => {
      if (property.latitude && property.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: property.latitude, lng: property.longitude },
          map: mapInstance,
          title: property.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
                <path d="M12 12h8v8h-8z" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-xs">
              <h3 class="font-semibold text-lg mb-2">${property.title}</h3>
              <p class="text-gray-600 text-sm mb-2">${property.address}, ${property.city}</p>
              <div class="flex items-center gap-4 text-sm">
                ${property.price ? `<span class="text-blue-600 font-semibold">${property.price.toLocaleString()} €/mes</span>` : ''}
                ${property.bedrooms ? `<span class="flex items-center gap-1"><HomeIcon class="w-4 h-4"/> ${property.bedrooms}</span>` : ''}
                ${property.bathrooms ? `<span class="flex items-center gap-1">🚿 ${property.bathrooms}</span>` : ''}
              </div>
              <button onclick="window.selectProperty('${property.id}')" class="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                Ver detalles
              </button>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
          setSelectedProperty(property);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);

    // Ajustar zoom para mostrar todos los marcadores
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()!));
      mapInstance.fitBounds(bounds);
    }
  };

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return 'Precio no disponible';
    return `${price.toLocaleString()} ${currency}/mes`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              <h1 className="text-2xl font-bold text-gray-900">Mapa de Propiedades en Alquiler</h1>
              <p className="text-gray-600 mt-1">
                Explora propiedades en alquiler disponibles en el mapa
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {filteredProperties.length} de {properties.length} propiedades
              </div>
              <Link
                to="/properties/rental"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Vista Lista
              </Link>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar propiedades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las ciudades</option>
              {[...new Set(properties.map(p => p.city))].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Precio min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Precio max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Mapa */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />
          
          {/* Controles del mapa */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Propiedades en alquiler</span>
            </div>
          </div>
        </div>

        {/* Panel lateral con lista de propiedades */}
        <div className="w-96 bg-white shadow-lg overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Propiedades en Alquiler</h2>
            <p className="text-sm text-gray-600">Haz clic en un marcador para ver detalles</p>
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Script para manejar clics en info windows */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.selectProperty = function(propertyId) {
              const property = ${JSON.stringify(properties)}.find(p => p.id === propertyId);
              if (property) {
                // Aquí podrías abrir un modal o navegar a la página de detalles
                console.log('Selected property:', property);
              }
            };
          `
        }}
      />
    </div>
  );
};

export default PropertiesRentalMapView;
