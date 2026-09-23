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
  compact?: boolean;
}

const GroupsMap: React.FC<GroupsMapProps> = ({
  groups,
  onGroupSelect,
  className = "",
  compact = false
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
        zoom: 7, // Zoom para ver España sin incluir Marruecos
        center: defaultCenter,
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

      const newInfoWindow = new window.google.maps.InfoWindow({
        maxWidth: 280,
        minWidth: 280,
      });
      
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
        const imageHtml = group.image_url
          ? `<div class="iw-image-container" style="background-image: url('${group.image_url}');">
               <div class="iw-type-badge">${group.category || (group.is_public ? 'Público' : 'Privado')}</div>
               <div class="iw-price-badge"><span style="background:rgba(255,255,255,0.95);color:#166534;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;">${group.current_members}/${group.max_members}</span></div>
             </div>`
          : `<div class="iw-image-container" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); display: flex; align-items: center; justify-content: center;">
               <span style="font-size: 30px;">👥</span>
               <div class="iw-type-badge">${group.category || 'Grupo'}</div>
             </div>`;

        const content = `
          <div class="iw-card-wrapper">
            ${imageHtml}
            <div class="iw-content">
              <h3 class="iw-title">${group.name}</h3>
              <div class="iw-meta">
                <span>📍 ${group.city || 'España'}</span>
                <span class="iw-dot">·</span>
                <span>${group.is_public ? 'Público' : 'Privado'}</span>
              </div>
              <button id="details-btn-${group.id}" class="iw-button">
                Ver grupo
              </button>
            </div>
            <style>
              .gm-style-iw-c {
                padding: 0 !important;
                border-radius: 12px !important;
                overflow: hidden !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.15) !important;
              }
              .gm-style-iw-d {
                overflow: hidden !important;
                padding: 0 !important;
                margin: 0 !important;
                max-height: none !important;
              }
              button.gm-ui-hover-effect {
                position: absolute !important;
                top: 8px !important;
                right: 8px !important;
                background: rgba(0, 0, 0, 0.5) !important;
                border-radius: 50% !important;
                width: 28px !important;
                height: 28px !important;
                z-index: 100 !important;
                opacity: 1 !important;
              }
              button.gm-ui-hover-effect img {
                filter: invert(1) !important;
                margin: 6px !important;
                width: 16px !important;
                height: 16px !important;
              }
              .iw-card-wrapper {
                width: 280px;
                font-family: system-ui, sans-serif;
                padding-bottom: 2px;
              }
              .iw-image-container {
                width: 100%;
                height: 130px;
                background-size: cover;
                background-position: center;
                position: relative;
              }
              .iw-price-badge {
                position: absolute;
                bottom: 10px;
                right: 10px;
              }
              .iw-type-badge {
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(0,0,0,0.6);
                color: white;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .iw-content {
                padding: 12px 14px;
              }
              .iw-title {
                font-weight: 700;
                font-size: 15px;
                color: #111827;
                margin: 0 0 6px 0;
                line-height: 1.25;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .iw-meta {
                display: flex;
                align-items: center;
                font-size: 12px;
                color: #6b7280;
                margin-bottom: 12px;
              }
              .iw-dot {
                margin: 0 6px;
                font-weight: bold;
                color: #d1d5db;
              }
              .iw-button {
                width: 100%;
                padding: 9px 0;
                background-color: #047857;
                color: white;
                font-size: 13px;
                font-weight: 600;
                border-radius: 8px;
                border: none;
                cursor: pointer;
              }
            </style>
          </div>
        `;

        infoWindow.setContent(content);
        infoWindow.open(map, marker);

        setTimeout(() => {
          const button = document.getElementById(`details-btn-${group.id}`);
          if (button) {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              onGroupSelect(group);
              infoWindow.close();
            });
          }
        }, 50);
      });

      newMarkers.push(marker);
      bounds.extend({ lat, lng });
    });

    setMarkers(newMarkers);

    // Ajustar la vista del mapa para mostrar todos los marcadores
    if (newMarkers.length > 0) {
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
  }, [groups, map, infoWindow, onGroupSelect]);

  if (mapsLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${compact ? 'h-full' : 'h-64 rounded-lg'} ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (mapsError) {
    return (
      <div className={`flex items-center justify-center bg-red-50 ${compact ? 'h-full' : 'h-64 rounded-lg'} ${className}`}>
        <div className="text-center">
          <p className="text-red-600">Error cargando el mapa</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`w-full ${compact ? 'h-full rounded-none' : 'h-96 rounded-lg'} ${className}`}
      style={{ cursor: 'default' }}
    />
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
