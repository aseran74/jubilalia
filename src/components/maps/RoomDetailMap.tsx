import React, { useEffect, useRef, useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface RoomDetailMapProps {
  latitude: number;
  longitude: number;
  title: string;
  location: string;
  className?: string;
}

const RoomDetailMap: React.FC<RoomDetailMapProps> = ({
  latitude,
  longitude,
  title,
  location,
  className = "w-full h-64"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current && latitude && longitude && !map) {
      initializeMap();
    }
  }, [latitude, longitude, map]);

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 15,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      }
    });

    setMap(mapInstance);

    // Crear marcador personalizado
    const roomMarker = new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: mapInstance,
      title: title,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="16" fill="#10B981" stroke="white" stroke-width="3"/>
            <path d="M14 14h12v12h-12z" fill="white"/>
            <path d="M16 16h8v2h-8z" fill="#10B981"/>
            <path d="M16 19h8v2h-8z" fill="#10B981"/>
            <path d="M16 22h6v2h-6z" fill="#10B981"/>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    setMarker(roomMarker);

    // Crear ventana de información
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-3 max-w-xs">
          <h3 class="font-semibold text-gray-800 mb-1">${title}</h3>
          <p class="text-sm text-gray-600 mb-2">${location}</p>
          <div class="flex items-center text-sm text-green-600">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
            </svg>
            <span>Ubicación exacta</span>
          </div>
        </div>
      `
    });

    // Mostrar info window al hacer clic en el marcador
    roomMarker.addListener('click', () => {
      infoWindow.open(mapInstance, roomMarker);
    });

    // Mostrar info window por defecto
    infoWindow.open(mapInstance, roomMarker);
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  if (!latitude || !longitude) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <MapPinIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Ubicación no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header del mapa */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPinIcon className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Ubicación</h3>
        </div>
        <button
          onClick={openInGoogleMaps}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Ver en Google Maps
        </button>
      </div>

      {/* Mapa */}
      <div className={`${className} rounded-lg overflow-hidden shadow-sm border border-gray-200`}>
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Información adicional */}
      <div className="text-sm text-gray-600">
        <p><strong>Dirección:</strong> {location}</p>
        <p><strong>Coordenadas:</strong> {latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
      </div>
    </div>
  );
};

export default RoomDetailMap;

