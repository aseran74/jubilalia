import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

declare global {
  namespace google.maps {
    interface Map {
      fitBounds(bounds: LatLngBounds): void;
      getZoom(): number;
      setZoom(zoom: number): void;
      setCenter(center: { lat: number; lng: number }): void;
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

interface Person {
  id: string;
  full_name: string;
  avatar_url?: string;
  city?: string;
  state?: string;
  bio?: string;
  interests?: string[];
  gender?: string;
  age?: number;
  latitude?: number;
  longitude?: number;
}

interface PeopleMapProps {
  people: Person[];
  onPersonSelect: (person: Person) => void;
  className?: string;
}

// Función para obtener coordenadas por defecto basadas en la ciudad
const getDefaultCoordinates = (city?: string) => {
  if (!city) return { lat: 40.4168, lng: -3.7038 }; // Madrid por defecto

  const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'madrid': { lat: 40.4168, lng: -3.7038 },
    'barcelona': { lat: 41.3851, lng: 2.1734 },
    'valencia': { lat: 39.4699, lng: -0.3763 },
    'sevilla': { lat: 37.3891, lng: -5.9845 },
    'bilbao': { lat: 43.2627, lng: -2.9253 },
    'málaga': { lat: 36.7213, lng: -4.4214 },
    'zaragoza': { lat: 41.6488, lng: -0.8891 },
    'murcia': { lat: 37.9922, lng: -1.1307 },
    'palma': { lat: 39.5696, lng: 2.6502 },
    'las palmas': { lat: 28.1248, lng: -15.4300 },
    'alicante': { lat: 38.3452, lng: -0.4810 },
    'córdoba': { lat: 37.8882, lng: -4.7794 },
    'valladolid': { lat: 41.6523, lng: -4.7245 },
    'vigo': { lat: 42.2406, lng: -8.7207 },
    'gijón': { lat: 43.5357, lng: -5.6615 },
    'granada': { lat: 37.1773, lng: -3.5986 }
  };

  const cityKey = city.toLowerCase().trim();
  return cityCoordinates[cityKey] || { lat: 40.4168, lng: -3.7038 };
};

const PeopleMap: React.FC<PeopleMapProps> = ({
  people,
  onPersonSelect,
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

      // Centro de España
      const defaultCenter = { lat: 40.4168, lng: -3.7038 };
      
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 7, // Zoom para ver España sin incluir Marruecos
        center: defaultCenter,
        restriction: {
          latLngBounds: {
            north: 44.0,  // Norte de España
            south: 35.0,  // Sur de España (excluye Marruecos)
            west: -10.0,  // Oeste de España
            east: 5.0     // Este de España
          },
          strictBounds: false
        },
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

  // Actualizar marcadores cuando cambien las personas
  useEffect(() => {
    if (!map || !infoWindow) return;

    console.log('🗺️ PeopleMap: Actualizando marcadores para', people.length, 'personas');

    // Limpiar marcadores existentes
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    people.forEach(person => {
      // Priorizar coordenadas de la base de datos
      let lat: number | null = person.latitude ?? null;
      let lng: number | null = person.longitude ?? null;

      // Si no hay coordenadas, usar diccionario de ciudades
      if (!lat || !lng || lat === 0 || lng === 0) {
        const coords = getDefaultCoordinates(person.city);
        lat = coords.lat;
        lng = coords.lng;
      }

      console.log(`📍 Creando marcador para "${person.full_name}" en ${person.city} (${lat}, ${lng})`);
      
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: person.full_name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#8B5CF6" stroke="#ffffff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">👤</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Agregar evento de clic al marcador
      marker.addListener('click', () => {
        const interests = person.interests?.slice(0, 3).join(', ') || 'Sin intereses';
        const content = `
          <div style="padding: 8px; max-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
            ${person.avatar_url ? `
              <div style="margin-bottom: 8px; text-align: center;">
                <img src="${person.avatar_url}" alt="${person.full_name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #8B5CF6;" onerror="this.style.display='none'">
              </div>
            ` : `<div style="margin-bottom: 8px; height: 60px; width: 60px; margin: 0 auto; background-color: #8B5CF6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">${person.full_name?.charAt(0) || '?'}</div>`}
            <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 6px; color: #111827; text-align: center;">${person.full_name}</h3>
            ${person.age ? `<p style="color: #6b7280; font-size: 11px; margin-bottom: 6px; text-align: center;">${person.age} años</p>` : ''}
            ${person.city ? `
              <div style="display: flex; align-items: center; justify-content: center; gap: 2px; font-size: 10px; color: #6b7280; margin-bottom: 6px;">
                <span>📍</span>
                <span>${person.city}</span>
              </div>
            ` : ''}
            ${person.interests && person.interests.length > 0 ? `
              <div style="font-size: 10px; color: #6b7280; margin-bottom: 6px; text-align: center;">
                <span>${interests}${person.interests.length > 3 ? '...' : ''}</span>
              </div>
            ` : ''}
            <button id="details-btn-${person.id}" style="margin-top: 4px; padding: 4px 8px; background-color: #8B5CF6; color: white; font-size: 10px; border-radius: 4px; border: none; cursor: pointer; hover: background-color: #7C3AED; width: 100%;">
              Ver perfil
            </button>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        
        // Manejar clic en el botón "Ver perfil"
        setTimeout(() => {
          const button = document.getElementById(`details-btn-${person.id}`);
          if (button) {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔗 Navegando a perfil de persona:', person.full_name);
              onPersonSelect(person);
              infoWindow.close();
            });
          }
        }, 100);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
    console.log(`✅ PeopleMap: Se crearon ${newMarkers.length} marcadores`);

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
  }, [people, map, infoWindow, onPersonSelect, markers]);

  if (mapsLoading) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
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
    <div ref={mapRef} className={`w-full h-full rounded-lg ${className}`} />
  );
};

export default PeopleMap;

