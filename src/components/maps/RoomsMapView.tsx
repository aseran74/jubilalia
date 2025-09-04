import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, HomeIcon, UsersIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  latitude?: number;
  longitude?: number;
  max_occupants: number;
  current_occupants: number;
  images?: string[];
  created_at: string;
  user_id: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

const RoomsMapView: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 }); // Madrid por defecto
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (rooms.length > 0 && mapRef.current && !map) {
      initializeMap();
    }
  }, [rooms, map]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          user_profile:profiles!rooms_user_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rooms:', error);
        return;
      }

      setRooms(data || []);
      
      // Si hay habitaciones con coordenadas, centrar el mapa en la primera
      const roomsWithCoords = data?.filter(room => room.latitude && room.longitude);
      if (roomsWithCoords && roomsWithCoords.length > 0) {
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
    
    rooms.forEach((room) => {
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

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2 max-w-xs">
              <h3 class="font-semibold text-gray-800 mb-1">${room.title}</h3>
              <p class="text-sm text-gray-600 mb-2">${room.description.substring(0, 100)}...</p>
              <div class="flex items-center justify-between">
                <span class="text-green-600 font-bold">€${room.price}/mes</span>
                <span class="text-sm text-gray-500">${room.current_occupants}/${room.max_occupants}</span>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          setSelectedRoom(room);
          infoWindow.open(mapInstance, marker);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa de habitaciones...</p>
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
                {rooms.length} habitaciones encontradas
              </div>
              <Link
                to="/rooms"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Vista Lista
              </Link>
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
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Habitaciones disponibles</span>
            </div>
          </div>
        </div>

        {/* Panel lateral con lista de habitaciones */}
        <div className="w-96 bg-white shadow-lg overflow-y-auto">
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
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
                    to={`/rooms/${room.id}`}
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
    </div>
  );
};

export default RoomsMapView;

