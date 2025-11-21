import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

export type ActivityMapActivity = {
  id: string | number;
  title: string;
  city?: string;
  date: string;
  time?: string;
  images?: string[];
  is_free?: boolean;
  price?: number;
  activity_type?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export interface ActivityMapProps {
  activities: ActivityMapActivity[];
  onActivitySelect: (activity: ActivityMapActivity) => void;
  className?: string;
}

// Estilo minimalista
const MAP_STYLES = [
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] }
];

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

  // --- INICIALIZACIÓN ---
  useEffect(() => {
    if (mapsLoading || mapsError || !window.google?.maps) return;

    const initializeMap = () => {
      if (!mapRef.current) return;

      const defaultCenter = { lat: 40.4168, lng: -3.7038 }; 
      
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: defaultCenter,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        gestureHandling: 'cooperative',
        styles: MAP_STYLES,
      });

      const newInfoWindow = new window.google.maps.InfoWindow({
        maxWidth: 280, // Ancho fijo para evitar reflows
        minWidth: 280,
        disableAutoPan: false 
      });
      
      setMap(newMap);
      setInfoWindow(newInfoWindow);
    };

    initializeMap();
  }, [mapsLoading, mapsError]);

  // --- GESTIÓN DE MARCADORES ---
  useEffect(() => {
    if (!map || !infoWindow) return;

    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];
    
    activities.forEach((activity) => {
        // (Lógica de coordenadas igual que antes...)
        let lat: number | null = activity.latitude ?? null;
        let lng: number | null = activity.longitude ?? null;

        if (!lat || !lng) {
             // Fallback simple para el ejemplo
             lat = 40.4168; lng = -3.7038;
             const cityCoords: any = { 'madrid': { lat: 40.4168, lng: -3.7038 }, 'barcelona': { lat: 41.3851, lng: 2.1734 } };
             const cityKey = activity.city?.toLowerCase().trim();
             if (cityKey && cityCoords[cityKey]) { lat = cityCoords[cityKey].lat; lng = cityCoords[cityKey].lng; }
        }
      
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: activity.title,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <filter id="shadow" x="-2" y="-2" width="52" height="52">
                <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3"/>
              </filter>
              <path d="M24 44C24 44 40 32 40 18C40 9.16344 32.8366 2 24 2C15.1634 2 8 9.16344 8 18C8 32 24 44 24 44Z" fill="#2563eb" stroke="white" stroke-width="2" filter="url(#shadow)"/>
              <circle cx="24" cy="18" r="8" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 44)
        }
      });

      // --- AQUÍ ESTÁ LA MAGIA PARA ELIMINAR BORDES Y SCROLL ---
      marker.addListener('click', () => {
        // Badge de precio
        const priceBadge = activity.is_free 
          ? '<span style="background:rgba(255,255,255,0.95); color:#166534; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700; box-shadow:0 2px 4px rgba(0,0,0,0.1);">Gratis</span>' 
          : `<span style="background:rgba(255,255,255,0.95); color:#1e40af; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700; box-shadow:0 2px 4px rgba(0,0,0,0.1);">€${activity.price}</span>`;
        
        // Imagen Header
        const imageHtml = activity.images && activity.images.length > 0 
          ? `<div class="iw-image-container" style="background-image: url('${activity.images[0]}');">
               <div class="iw-price-badge">${priceBadge}</div>
               <div class="iw-type-badge">${activity.activity_type || 'Evento'}</div>
             </div>`
          : `<div class="iw-image-container" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">📍</span>
                <div class="iw-price-badge">${priceBadge}</div>
             </div>`;
        
        const content = `
          <div class="iw-card-wrapper">
            ${imageHtml}
            
            <div class="iw-content">
              <h3 class="iw-title">${activity.title}</h3>
              
              <div class="iw-meta">
                 <span>📅 ${new Date(activity.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                 <span class="iw-dot">·</span>
                 <span>${activity.time?.substring(0, 5)}h</span>
                 <span class="iw-dot">·</span>
                 <span>📍 ${activity.city}</span>
              </div>

              <button id="details-btn-${activity.id}" class="iw-button">
                Ver actividad
              </button>
            </div>

            <style>
              /* 1. ELIMINAR BORDES BLANCOS DEL MAPA */
              .gm-style-iw-c {
                padding: 0 !important;
                border-radius: 12px !important;
                overflow: hidden !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.15) !important;
              }

              /* 2. ELIMINAR SCROLL */
              .gm-style-iw-d {
                overflow: hidden !important;
                padding: 0 !important;
                margin: 0 !important;
                max-height: none !important; 
              }

              /* 3. MOVER Y ESTILIZAR LA "X" DENTRO DE LA FOTO */
              button.gm-ui-hover-effect {
                position: absolute !important;
                top: 8px !important;
                right: 8px !important;
                background: rgba(0, 0, 0, 0.5) !important; /* Fondo oscuro */
                border-radius: 50% !important;
                width: 28px !important;
                height: 28px !important;
                z-index: 100 !important;
                opacity: 1 !important;
              }
              
              /* Icono de la X en blanco */
              button.gm-ui-hover-effect img {
                filter: invert(1) !important; 
                margin: 6px !important;
                width: 16px !important;
                height: 16px !important;
              }

              /* ESTILOS INTERNOS DE LA CARD */
              .iw-card-wrapper {
                width: 280px;
                font-family: 'Inter', system-ui, sans-serif;
                padding-bottom: 2px; /* Fix pequeño corte */
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
                /* Truncar texto a 1 linea */
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
                background-color: #2563eb;
                color: white;
                font-size: 13px;
                font-weight: 600;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              .iw-button:hover {
                background-color: #1d4ed8;
              }
            </style>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        
        setTimeout(() => {
          const button = document.getElementById(`details-btn-${activity.id}`);
          if (button) {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              onActivitySelect(activity);
              infoWindow.close();
            });
          }
        }, 50);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // ... (Resto de lógica de zoom igual)
  }, [activities, map, infoWindow, onActivitySelect]);

  if (mapsLoading) return <div className={`h-[600px] bg-gray-100 rounded-2xl ${className} animate-pulse`} />;
  if (mapsError) return null;

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Mapa de Actividades
        </h3>
      </div>
      
      <div className="relative w-full h-[600px] bg-gray-100">
        <div ref={mapRef} className="w-full h-full focus:outline-none"/>
      </div>
    </div>
  );
};

export default ActivityMap;