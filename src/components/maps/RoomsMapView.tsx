import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPinIcon, HomeIcon, UsersIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import RoomsMapFilters, { RoomFilters } from './RoomsMapFilters';

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

interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  max_occupants: number;
  current_occupants: number;
  images?: string[];
  created_at: string;
  user_id: string;
  primary_image_url?: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  // Propiedades adicionales para filtros
  private_bathroom?: boolean;
  has_balcony?: boolean;
  smoking_allowed?: boolean;
  pets_allowed?: boolean;
  preferred_gender?: string;
}

const RoomsMapView: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 }); // Madrid por defecto
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RoomFilters>({
    minPrice: 0,
    maxPrice: 2000,
    maxOccupants: 10,
    availableOnly: false,
    hasImages: false,
    city: '',
    privateBathroom: false,
    hasBalcony: false,
    smokingAllowed: false,
    petsAllowed: false,
    gender: 'any'
  });
  
  const { isLoaded: mapsLoaded, isLoading: mapsLoading, error: mapsError } = useGoogleMaps();

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, filters]);

  useEffect(() => {
    if (filteredRooms.length > 0 && mapRef.current && !map && mapsLoaded) {
      initializeMap();
    }
  }, [filteredRooms, map, mapsLoaded]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      // Obtener listings de habitaciones
      const { data: listingsData, error: listingsError } = await supabase
        .from('property_listings')
        .select(`
          *,
          property_images(
            image_url,
            is_primary
          )
        `)
        .eq('listing_type', 'room_rental')
        .order('created_at', { ascending: false });

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        return;
      }

      // Obtener requisitos para cada listing
      const roomsWithDetails = await Promise.all(
        listingsData.map(async (listing) => {
          const { data: requirementsData, error: requirementsError } = await supabase
            .from('room_rental_requirements')
            .select('*')
            .eq('listing_id', listing.id)
            .single();

          if (requirementsError) {
            console.error('Error fetching requirements for listing', listing.id, requirementsError);
            return null;
          }

          return { ...listing, requirements: requirementsData };
        })
      );

      const validRooms = roomsWithDetails.filter(room => room !== null);

      // Agregar coordenadas por defecto para habitaciones sin coordenadas y extraer imagen principal
      const roomsWithCoords = validRooms.map((room) => {
        // Extraer la imagen principal
        const primaryImage = room.property_images?.find((img: any) => img.is_primary) || room.property_images?.[0];
        const primaryImageUrl = primaryImage?.image_url;
        
        console.log(`🏠 Habitación: ${room.title}`, {
          hasImages: !!room.property_images,
          imagesCount: room.property_images?.length || 0,
          primaryImageUrl: primaryImageUrl,
          allImages: room.property_images
        });
        
        if (!room.latitude || !room.longitude) {
          // Usar coordenadas por defecto basadas en la ciudad o Madrid
          const defaultCoords: { [key: string]: { lat: number; lng: number } } = {
            'madrid': { lat: 40.4168, lng: -3.7038 },
            'barcelona': { lat: 41.3851, lng: 2.1734 },
            'valencia': { lat: 39.4699, lng: -0.3763 },
            'sevilla': { lat: 37.3891, lng: -5.9845 },
            'cerro muriano': { lat: 37.9838, lng: -4.7669 }
          };
          
          const city = room.city?.toLowerCase() || 'madrid';
          const coords = defaultCoords[city] || defaultCoords['madrid'];
          
          return {
            ...room,
            latitude: coords.lat + (Math.random() - 0.5) * 0.01, // Pequeña variación
            longitude: coords.lng + (Math.random() - 0.5) * 0.01,
            primary_image_url: primaryImageUrl,
            // Propiedades para filtros
            private_bathroom: room.requirements?.private_bathroom || false,
            has_balcony: room.requirements?.has_balcony || false,
            smoking_allowed: room.requirements?.smoking_allowed || false,
            pets_allowed: room.requirements?.pets_allowed || false,
            preferred_gender: room.requirements?.preferred_gender || 'any'
          };
        }
        return {
          ...room,
          primary_image_url: primaryImageUrl,
          // Propiedades para filtros
          private_bathroom: room.requirements?.private_bathroom || false,
          has_balcony: room.requirements?.has_balcony || false,
          smoking_allowed: room.requirements?.smoking_allowed || false,
          pets_allowed: room.requirements?.pets_allowed || false,
          preferred_gender: room.requirements?.preferred_gender || 'any'
        };
      });

      setRooms(roomsWithCoords);
      
      // Centrar el mapa en la primera habitación
      if (roomsWithCoords.length > 0) {
        setMapCenter({
          lat: roomsWithCoords[0].latitude,
          lng: roomsWithCoords[0].longitude
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rooms];

    // Filtrar por precio
    filtered = filtered.filter(room => 
      room.price >= filters.minPrice && room.price <= filters.maxPrice
    );

    // Filtrar por ocupantes máximos
    filtered = filtered.filter(room => 
      room.max_occupants <= filters.maxOccupants
    );

    // Filtrar por ciudad
    if (filters.city.trim()) {
      filtered = filtered.filter(room => 
        room.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filtrar por disponibilidad
    if (filters.availableOnly) {
      filtered = filtered.filter(room => 
        room.current_occupants < room.max_occupants
      );
    }

    // Filtrar por imágenes
    if (filters.hasImages) {
      filtered = filtered.filter(room => 
        room.primary_image_url && room.primary_image_url.trim() !== ''
      );
    }
    
    // Filtros de características
    if (filters.privateBathroom) {
      filtered = filtered.filter(room => room.private_bathroom);
    }
    
    if (filters.hasBalcony) {
      filtered = filtered.filter(room => room.has_balcony);
    }
    
    if (filters.smokingAllowed) {
      filtered = filtered.filter(room => room.smoking_allowed);
    }
    
    if (filters.petsAllowed) {
      filtered = filtered.filter(room => room.pets_allowed);
    }
    
    // Filtro por género
    if (filters.gender !== 'any') {
      filtered = filtered.filter(room => room.preferred_gender === filters.gender);
    }

    setFilteredRooms(filtered);
  };

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);

    // Crear marcadores para cada habitación
    const newMarkers: google.maps.Marker[] = [];
    
    filteredRooms.forEach((room) => {
      if (room.latitude && room.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: room.latitude, lng: room.longitude },
          map: mapInstance,
          title: room.title,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#10B981" stroke="white" stroke-width="2"/>
                <path d="M12 12h8v8h-8z" fill="white"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16)
          }
        });

        console.log(`📸 Creando InfoWindow para: ${room.title}`, {
          hasImage: !!room.primary_image_url,
          imageUrl: room.primary_image_url
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-xs">
              ${room.primary_image_url ? `
                <div class="mb-3">
                  <img src="${room.primary_image_url}" alt="${room.title}" class="w-full h-32 object-cover rounded-lg" onerror="console.log('Error cargando imagen:', this.src)">
                </div>
              ` : '<div class="mb-3 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">Sin imagen</div>'}
              <h3 class="font-semibold text-lg mb-2">${room.title}</h3>
              <p class="text-sm text-gray-600 mb-2">${room.description.substring(0, 100)}...</p>
              <div class="flex items-center justify-between mb-2">
                <span class="text-green-600 font-bold">€${room.price}/mes</span>
                <span class="text-sm text-gray-500">${room.current_occupants}/${room.max_occupants}</span>
              </div>
              <button id="details-btn-${room.id}" class="w-full px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                Ver detalles
              </button>
            </div>
          `
        });

        marker.addListener('click', () => {
          setSelectedRoom(room);
          infoWindow.open(mapInstance, marker);
          
          // Agregar event listener para el botón de detalles después de que se abra el InfoWindow
          setTimeout(() => {
            const detailsButton = document.getElementById(`details-btn-${room.id}`);
            if (detailsButton) {
              detailsButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔗 Navegando a detalles de habitación:', room.title);
                navigate(`/dashboard/rooms/${room.id}`);
              });
            }
          }, 100);
        });

        newMarkers.push(marker);
      }
    });

    // Los marcadores se manejan automáticamente por Google Maps
  };

  const getAvailableSpots = (room: Room) => {
    return room.max_occupants - room.current_occupants;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading || mapsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Cargando habitaciones...' : 'Cargando Google Maps...'}
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mapa de Habitaciones</h1>
              <p className="text-gray-600 mt-1">
                Explora habitaciones disponibles en el mapa
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {filteredRooms.length} de {rooms.length} habitaciones
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filtros
              </button>
              <Link
                to="/dashboard/rooms"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Vista Lista
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Mapa */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-0">
          <div ref={mapRef} className="w-full h-full min-h-[400px]" />
          
          {/* Controles del mapa */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Habitaciones disponibles</span>
            </div>
          </div>
        </div>

        {/* Panel lateral con lista de habitaciones */}
        <div className="w-full lg:w-96 bg-white shadow-lg overflow-y-auto max-h-[400px] lg:max-h-none">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Habitaciones</h2>
            <p className="text-sm text-gray-600">Haz clic en un marcador para ver detalles</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedRoom?.id === room.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                }`}
                onClick={() => setSelectedRoom(room)}
              >
                <div className="flex items-start space-x-3">
                  {/* Imagen de la habitación */}
                  <div className="flex-shrink-0">
                    {room.primary_image_url ? (
                      <img 
                        src={room.primary_image_url} 
                        alt={room.title}
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
                    <h3 className="font-semibold text-gray-900 mb-1">{room.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {room.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{room.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UsersIcon className="w-4 h-4" />
                        <span>{room.current_occupants}/{room.max_occupants}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-bold text-lg">
                        €{room.price}/mes
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(room.created_at)}
                      </span>
                    </div>
                    
                    {getAvailableSpots(room) > 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {getAvailableSpots(room)} plaza{getAvailableSpots(room) !== 1 ? 's' : ''} disponible{getAvailableSpots(room) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <Link
                    to={`/dashboard/rooms/${room.id}`}
                    className="flex-1 bg-green-600 text-white text-center py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {rooms.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <HomeIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay habitaciones disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Componente de Filtros */}
      <RoomsMapFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowFilters(false)}
        isOpen={showFilters}
      />
    </div>
  );
};

export default RoomsMapView;

