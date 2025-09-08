import React, { useEffect, useRef, useState } from 'react';
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

interface Group {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_by: string;
  is_public: boolean;
  max_members: number;
  current_members: number;
  created_at: string;
  is_member?: boolean;
  role?: string;
  category: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  postal_code?: string;
  country: string;
}

interface GroupsMapProps {
  groups: Group[];
  onGroupSelect: (group: Group) => void;
  className?: string;
}

const GroupsMap: React.FC<GroupsMapProps> = ({
  groups,
  onGroupSelect,
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

      const defaultCenter = { lat: 40.4168, lng: -3.7038 }; // Madrid
      
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: defaultCenter,
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

  // Actualizar marcadores cuando cambien los grupos
  useEffect(() => {
    if (!map || !infoWindow) return;

    console.log('🗺️ GroupsMap: Actualizando marcadores para', groups.length, 'grupos');

    // Limpiar marcadores existentes
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new window.google.maps.LatLngBounds();

    groups.forEach(group => {
      // Usar coordenadas del grupo o coordenadas por defecto basadas en la ciudad
      let lat = group.latitude;
      let lng = group.longitude;

      if (!lat || !lng) {
        // Coordenadas por defecto basadas en la ciudad
        const defaultCoords = getDefaultCoordinates(group.city);
        lat = defaultCoords.lat;
        lng = defaultCoords.lng;
      }

      console.log(`📍 Creando marcador para "${group.name}" en ${group.city} (${lat}, ${lng})`);
      
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: group.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">👥</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Agregar evento de clic al marcador
      marker.addListener('click', () => {
        const content = `
          <div style="padding: 8px; max-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
            ${group.image_url ? `
              <div style="margin-bottom: 8px;">
                <img src="${group.image_url}" alt="${group.name}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 6px;" onerror="console.log('Error cargando imagen:', this.src)">
              </div>
            ` : '<div style="margin-bottom: 8px; height: 80px; background-color: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 12px;">Sin imagen</div>'}
            <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 6px; color: #111827;">${group.name}</h3>
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 6px;">${group.description.substring(0, 60)}${group.description.length > 60 ? '...' : ''}</p>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; margin-bottom: 6px;">
              <span style="color: #10B981; font-weight: 600;">${group.current_members}/${group.max_members}</span>
              <span style="display: flex; align-items: center; gap: 2px;">🏷️ ${group.category}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 2px; font-size: 10px; color: #6b7280; margin-bottom: 6px;">
              <span>📍</span>
              <span>${group.city}</span>
            </div>
            <button id="details-btn-${group.id}" style="margin-top: 4px; padding: 4px 8px; background-color: #10B981; color: white; font-size: 10px; border-radius: 4px; border: none; cursor: pointer; hover: background-color: #059669; width: 100%;">
              Ver detalles
            </button>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        
        // Manejar clic en el botón "Ver detalles"
        setTimeout(() => {
          const button = document.getElementById(`details-btn-${group.id}`);
          if (button) {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔗 Navegando a detalles de grupo:', group.name);
              onGroupSelect(group);
              infoWindow.close();
            });
          }
        }, 100);
      });

      newMarkers.push(marker);
      bounds.extend({ lat, lng });
    });

    setMarkers(newMarkers);

    // Ajustar la vista del mapa para mostrar todos los marcadores
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // Asegurar zoom mínimo
      if (map.getZoom() && map.getZoom() > 15) {
        map.setZoom(15);
      }
    }
  }, [groups, map, infoWindow, onGroupSelect]);

  if (mapsLoading) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (mapsError) {
    return (
      <div className={`flex items-center justify-center h-64 bg-red-50 rounded-lg ${className}`}>
        <div className="text-center">
          <p className="text-red-600">Error cargando el mapa</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className={`w-full h-96 rounded-lg ${className}`} />
  );
};

// Función para obtener coordenadas por defecto basadas en la ciudad
const getDefaultCoordinates = (city: string) => {
  const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'Madrid': { lat: 40.4168, lng: -3.7038 },
    'Barcelona': { lat: 41.3851, lng: 2.1734 },
    'Valencia': { lat: 39.4699, lng: -0.3763 },
    'Sevilla': { lat: 37.3891, lng: -5.9845 },
    'Bilbao': { lat: 43.2627, lng: -2.9253 },
    'Málaga': { lat: 36.7213, lng: -4.4214 },
    'Zaragoza': { lat: 41.6488, lng: -0.8891 },
    'Murcia': { lat: 37.9922, lng: -1.1307 },
    'Palma': { lat: 39.5696, lng: 2.6502 },
    'Las Palmas': { lat: 28.1248, lng: -15.4300 },
    'Alicante': { lat: 38.3452, lng: -0.4810 },
    'Córdoba': { lat: 37.8882, lng: -4.7794 },
    'Valladolid': { lat: 41.6523, lng: -4.7245 },
    'Vigo': { lat: 42.2406, lng: -8.7207 },
    'Gijón': { lat: 43.5357, lng: -5.6615 },
    'L\'Hospitalet': { lat: 41.3596, lng: 2.0998 },
    'Vitoria': { lat: 42.8467, lng: -2.6716 },
    'A Coruña': { lat: 43.3623, lng: -8.4115 },
    'Elche': { lat: 38.2622, lng: -0.7011 },
    'Granada': { lat: 37.1773, lng: -3.5986 }
  };

  return cityCoordinates[city] || { lat: 40.4168, lng: -3.7038 }; // Madrid por defecto
};

export default GroupsMap;
