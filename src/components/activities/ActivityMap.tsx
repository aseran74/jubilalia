import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  city: string;
  max_participants: number;
  current_participants: number;
  price: number;
  is_free: boolean;
  difficulty_level: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
}

interface ActivityMapProps {
  activities: Activity[];
  onActivitySelect: (activity: Activity) => void;
  className?: string;
}

declare global {
  namespace google.maps {
    interface Map {}
    interface Marker {
      setMap(map: Map | null): void;
      getPosition(): LatLng | null;
    }
    interface InfoWindow {}
    interface LatLng {}
  }
}

const ActivityMap: React.FC<ActivityMapProps> = ({
  activities,
  onActivitySelect,
  className = ""
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const { mapsLoading, mapsError } = useGoogleMaps();

  useEffect(() => {
    if (mapsLoading || mapsError || !window.google?.maps) return;

    const initializeMap = () => {
      if (!mapRef.current) return;

      const defaultCenter = { lat: 40.4168, lng: -3.7038 }; // Madrid
      
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: defaultCenter,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      const newInfoWindow = new window.google.maps.InfoWindow();
      
      setMap(newMap);
      setInfoWindow(newInfoWindow);
    };

    initializeMap();
  }, [mapsLoading, mapsError]);

  // Actualizar marcadores cuando cambien las actividades
  useEffect(() => {
    if (!map || !infoWindow) return;

    // Limpiar marcadores existentes
    markers.forEach(marker => marker.setMap(null));

    // Crear nuevos marcadores
    const newMarkers: google.maps.Marker[] = [];
    
    activities.forEach((activity) => {
      // Usar coordenadas de la actividad o coordenadas por defecto basadas en la ciudad
      let lat = activity.latitude || 40.4168;
      let lng = activity.longitude || -3.7038;

      // Si no hay coordenadas específicas, usar coordenadas por defecto para la ciudad
      if (!activity.latitude || !activity.longitude) {
        const cityCoords: { [key: string]: { lat: number; lng: number } } = {
          'madrid': { lat: 40.4168, lng: -3.7038 },
          'barcelona': { lat: 41.3851, lng: 2.1734 },
          'valencia': { lat: 39.4699, lng: -0.3763 },
          'sevilla': { lat: 37.3891, lng: -5.9845 },
          'bilbao': { lat: 43.2627, lng: -2.9253 },
          'zaragoza': { lat: 41.6488, lng: -0.8891 }
        };

        const cityKey = activity.city?.toLowerCase();
        if (cityKey && cityCoords[cityKey]) {
          lat = cityCoords[cityKey].lat;
          lng = cityCoords[cityKey].lng;
        }
      }
      
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: newMap,
        title: activity.title,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">📅</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Agregar evento de clic al marcador
      marker.addListener('click', () => {
        const content = `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-gray-900 mb-2">${activity.title}</h3>
            <p class="text-sm text-gray-600 mb-2">${activity.description.substring(0, 100)}${activity.description.length > 100 ? '...' : ''}</p>
            <div class="space-y-1 text-xs text-gray-500">
              <div class="flex items-center">
                <span class="mr-1">📅</span>
                <span>${new Date(activity.date).toLocaleDateString('es-ES')}</span>
              </div>
              <div class="flex items-center">
                <span class="mr-1">🕐</span>
                <span>${activity.time}</span>
              </div>
              <div class="flex items-center">
                <span class="mr-1">👥</span>
                <span>${activity.current_participants}/${activity.max_participants}</span>
              </div>
              <div class="flex items-center">
                <span class="mr-1">📍</span>
                <span>${activity.city}</span>
              </div>
            </div>
            <button class="mt-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 w-full">
              Ver detalles
            </button>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        
        // Manejar clic en el botón "Ver detalles"
        setTimeout(() => {
          const button = document.querySelector('.bg-blue-600');
          if (button) {
            button.addEventListener('click', () => {
              onActivitySelect(activity);
              infoWindow.close();
            });
          }
        }, 100);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Ajustar vista del mapa si hay marcadores
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });
      map.fitBounds(bounds);
      
      // Asegurar zoom mínimo
      if (map.getZoom() && map.getZoom() > 15) {
        map.setZoom(15);
      }
    }
  }, [activities, map, infoWindow, onActivitySelect]);

  if (mapsLoading) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (mapsError) {
    return (
      <div className={`flex items-center justify-center h-64 bg-red-50 rounded-lg ${className}`}>
        <div className="text-center">
          <p className="text-sm text-red-600">Error cargando el mapa</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-500" />
          Mapa de Actividades
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {activities.length} actividad{activities.length !== 1 ? 'es' : ''} encontrada{activities.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-96"
        style={{ minHeight: '400px' }}
      />
      
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 Haz clic en un marcador para ver detalles de la actividad
        </p>
      </div>
    </div>
  );
};

export default ActivityMap;
