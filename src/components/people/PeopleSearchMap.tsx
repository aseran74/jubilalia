import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { LocationSearchResult } from '../../types/supabase';

interface PeopleSearchMapProps {
  searchResults: LocationSearchResult[];
  onPersonSelect: (person: LocationSearchResult) => void;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const PeopleSearchMap: React.FC<PeopleSearchMapProps> = ({
  searchResults,
  onPersonSelect,
  className = ""
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindow, setInfoWindow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar Google Maps API
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (mapRef.current && window.google && window.google.maps) {
          initializeMap();
        }
      };

      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps) return;

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
      setIsLoading(false);
    };

    loadGoogleMapsAPI();

    return () => {
      // Cleanup
      // Cleanup
    };
  }, []);

  // Actualizar marcadores cuando cambien los resultados
  useEffect(() => {
    if (!map || !infoWindow) return;

    // Limpiar marcadores existentes
    markers.forEach(marker => marker.setMap(null));

    // Crear nuevos marcadores
    const newMarkers: any[] = [];
    
    searchResults.forEach((person) => {
      if (!person.formatted_address) return;
      
      // For now, we'll skip coordinates since they're not in the LocationSearchResult type
      return;
      
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: person.full_name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3B82F6"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        }
      });

      // Agregar evento de clic al marcador
      marker.addListener('click', () => {
        const content = `
          <div class="p-3">
            <h3 class="font-semibold text-gray-900">${person.full_name}</h3>
            <p class="text-sm text-gray-600">${person.occupation || 'Sin ocupación'}</p>
            <p class="text-xs text-gray-500">${person.formatted_address || 'Ubicación no especificada'}</p>
            <button class="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
              Ver perfil
            </button>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        
        // Manejar clic en el botón "Ver perfil"
        setTimeout(() => {
          const button = document.querySelector('.bg-blue-600');
          if (button) {
            button.addEventListener('click', () => {
              onPersonSelect(person);
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
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds);
      
      // Asegurar zoom mínimo
      if (map.getZoom() > 15) {
        map.setZoom(15);
      }
    }
  }, [searchResults, map, infoWindow, onPersonSelect]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-500" />
          Mapa de Resultados
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {searchResults.length} persona{searchResults.length !== 1 ? 's' : ''} encontrada{searchResults.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-96"
        style={{ minHeight: '400px' }}
      />
      
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 Haz clic en un marcador para ver detalles de la persona
        </p>
      </div>
    </div>
  );
};

export default PeopleSearchMap;
