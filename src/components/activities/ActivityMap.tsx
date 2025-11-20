import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

declare global {
  namespace google.maps {
    interface Map {
      fitBounds(bounds: LatLngBounds): void;
      getZoom(): number;
      setZoom(zoom: number): void;
    }
    interface InfoWindow {
      setContent(content: string): void;
      open(map: Map, marker: Marker): void;
      close(): void;
    }
    interface Marker {
      setMap(map: Map | null): void;
      getPosition(): LatLng | null;
    }
    interface LatLng {
      lat(): number;
      lng(): number;
    }
    interface LatLngBounds {
      extend(point: LatLng): void;
    }
  }
}

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
  images: string[];
  owner: {
    full_name: string;
    avatar_url?: string;
  };
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
  const { isLoading: mapsLoading, error: mapsError } = useGoogleMaps();

  useEffect(() => {
    if (mapsLoading || mapsError || !window.google?.maps) return;

    const initializeMap = () => {
      if (!mapRef.current) return;

      // Centro de España (aproximadamente el centro geográfico)
      const defaultCenter = { lat: 40.4168, lng: -3.7038 }; // Madrid
      
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 7, // Zoom para ver España sin incluir Marruecos
        center: defaultCenter,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        draggable: true,
        scrollwheel: true,
        disableDoubleClickZoom: false,
        gestureHandling: 'greedy',
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

    console.log('🗺️ ActivityMap: Actualizando marcadores para', activities.length, 'actividades');
    console.log('🗺️ Actividades:', activities);

    // Limpiar marcadores existentes
    markers.forEach(marker => marker.setMap(null));

    // Crear nuevos marcadores
    const newMarkers: google.maps.Marker[] = [];
    
    activities.forEach((activity) => {
      // Priorizar coordenadas de la base de datos
      let lat: number | null = activity.latitude ?? null;
      let lng: number | null = activity.longitude ?? null;

      // Si no hay coordenadas en la base de datos, usar diccionario de ciudades
      if (!lat || !lng || lat === 0 || lng === 0) {
        const cityCoords: { [key: string]: { lat: number; lng: number } } = {
          // Ciudades españolas
          'madrid': { lat: 40.4168, lng: -3.7038 },
          'barcelona': { lat: 41.3851, lng: 2.1734 },
          'valencia': { lat: 39.4699, lng: -0.3763 },
          'sevilla': { lat: 37.3891, lng: -5.9845 },
          'bilbao': { lat: 43.2627, lng: -2.9253 },
          'zaragoza': { lat: 41.6488, lng: -0.8891 },
          'santiago de compostela': { lat: 42.8782, lng: -8.5448 },
          'a coruña': { lat: 43.3623, lng: -8.4115 },
          'lugo': { lat: 43.0097, lng: -7.5568 },
          'oviedo': { lat: 43.3619, lng: -5.8494 },
          'santander': { lat: 43.4623, lng: -3.8099 },
          'pamplona': { lat: 42.8169, lng: -1.6432 },
          'girona': { lat: 41.9794, lng: 2.8214 },
          'tarragona': { lat: 41.1189, lng: 1.2445 },
          'málaga': { lat: 36.7213, lng: -4.4214 },
          'cádiz': { lat: 36.5270, lng: -6.2886 },
          'granada': { lat: 37.1773, lng: -3.5985 },
          'córdoba': { lat: 37.8881, lng: -4.7794 },
          'ourense': { lat: 42.3360, lng: -7.8642 },
          'logroño': { lat: 42.4650, lng: -2.4456 },
          'burgos': { lat: 42.3439, lng: -3.6969 },
          'salamanca': { lat: 40.9701, lng: -5.6635 },
          'cáceres': { lat: 39.4753, lng: -6.3724 },
          'benidorm': { lat: 38.5411, lng: -0.1225 },
          'ibiza': { lat: 38.9067, lng: 1.4206 },
          'palma': { lat: 39.5696, lng: 2.6502 },
          'mahón': { lat: 39.8885, lng: 4.2614 },
          'las palmas': { lat: 28.1248, lng: -15.4300 },
          'santa cruz de tenerife': { lat: 28.4636, lng: -16.2518 },
          // Destinos internacionales
          'lisboa': { lat: 38.7223, lng: -9.1393 },
          'oporto': { lat: 41.1579, lng: -8.6291 },
          'niza': { lat: 43.7102, lng: 7.2620 },
          'parís': { lat: 48.8566, lng: 2.3522 },
          'roma': { lat: 41.9028, lng: 12.4964 },
          'praga': { lat: 50.0755, lng: 14.4378 },
          'budapest': { lat: 47.4979, lng: 19.0402 },
          'estambul': { lat: 41.0082, lng: 28.9784 },
          'marrakech': { lat: 31.6295, lng: -7.9811 },
          'el cairo': { lat: 30.0444, lng: 31.2357 },
          'venecia': { lat: 45.4408, lng: 12.3155 },
          'florencia': { lat: 43.7696, lng: 11.2558 },
          'viena': { lat: 48.2082, lng: 16.3738 },
          'atenas': { lat: 37.9838, lng: 23.7275 },
          'bergen': { lat: 60.3913, lng: 5.3221 },
          'bruselas': { lat: 50.8503, lng: 4.3517 },
          'toronto': { lat: 43.6532, lng: -79.3832 },
          'buenos aires': { lat: -34.6037, lng: -58.3816 },
          'lima': { lat: -12.0464, lng: -77.0428 },
          'cartagena de indias': { lat: 10.3910, lng: -75.4794 },
          'nueva york': { lat: 40.7128, lng: -74.0060 },
          'nápoles': { lat: 40.8518, lng: 14.2681 },
          'san josé': { lat: 9.9281, lng: -84.0907 },
          'la habana': { lat: 23.1136, lng: -82.3666 },
          'antigua guatemala': { lat: 14.5586, lng: -90.7333 },
          'guadalajara': { lat: 40.6286, lng: -3.1618 },
          'évora': { lat: 38.5667, lng: -7.9000 },
          'zamora': { lat: 41.5033, lng: -5.7438 },
          'cartagena': { lat: 37.6000, lng: -0.7167 },
          'vigo': { lat: 42.2406, lng: -8.7207 },
          'huesca': { lat: 42.1361, lng: -0.4087 },
          'almería': { lat: 36.8381, lng: -2.4597 },
          'vielha': { lat: 42.7017, lng: 0.7956 },
          'frankfurt': { lat: 50.1109, lng: 8.6821 },
          'dubái': { lat: 25.2048, lng: 55.2708 },
          'berlín': { lat: 52.5200, lng: 13.4050 },
          'espargos': { lat: 16.7550, lng: -22.9490 },
          'zúrich': { lat: 47.3769, lng: 8.5417 },
          'estrasburgo': { lat: 48.5734, lng: 7.7521 },
          'milán': { lat: 45.4642, lng: 9.1900 },
          'dubrovnik': { lat: 42.6507, lng: 18.0944 },
          'ammán': { lat: 31.9539, lng: 35.9106 },
          'bangkok': { lat: 13.7563, lng: 100.5018 },
          'ciudad del cabo': { lat: -33.9249, lng: 18.4241 }
        };

        const cityKey = activity.city?.toLowerCase().trim();
        if (cityKey && cityCoords[cityKey]) {
          lat = cityCoords[cityKey].lat;
          lng = cityCoords[cityKey].lng;
        } else {
          // Si no se encuentra en el diccionario, usar coordenadas por defecto (Madrid)
          lat = 40.4168;
          lng = -3.7038;
        }
      }
      
      console.log(`📍 Creando marcador para "${activity.title}" en ${activity.city} (${lat}, ${lng})`);
      
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
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
            <button id="details-btn-${activity.id}" class="mt-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 w-full">
              Ver detalles
            </button>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        
        // Manejar clic en el botón "Ver detalles"
        setTimeout(() => {
          const button = document.getElementById(`details-btn-${activity.id}`);
          if (button) {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔗 Navegando a detalles de actividad:', activity.title);
              onActivitySelect(activity);
              infoWindow.close();
            });
          }
        }, 100);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
    console.log(`✅ ActivityMap: Se crearon ${newMarkers.length} marcadores`);

    // Ajustar vista del mapa si hay marcadores
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });
      
      // Ajustar bounds pero con límites para mantener España visible
      map.fitBounds(bounds);
      
      // Asegurar zoom mínimo (no demasiado cerca) y máximo (no demasiado lejos)
      const currentZoom = map.getZoom();
      if (currentZoom) {
        if (currentZoom > 10) {
          map.setZoom(10); // Zoom máximo: nivel 10 para ver varias ciudades
        } else if (currentZoom < 5) {
          map.setZoom(7); // Zoom mínimo: nivel 7 para ver España sin Marruecos
        }
      }
    } else {
      // Si no hay marcadores, centrar en España
      map.setCenter({ lat: 40.4168, lng: -3.7038 });
      map.setZoom(7);
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
        className="w-full"
        style={{ minHeight: '600px', height: '600px', cursor: 'default' }}
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
