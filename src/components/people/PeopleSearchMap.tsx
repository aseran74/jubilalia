import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { LocationSearchResult } from '../../types/supabase';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

interface PeopleSearchMapProps {
  searchResults: LocationSearchResult[];
  onPersonSelect: (person: LocationSearchResult) => void;
  className?: string;
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
  const { mapsLoading, mapsError } = useGoogleMaps();

  useEffect(() => {
    if (!mapsLoading && !mapsError && mapRef.current && window.google?.maps) {
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
    }
  }, [mapsLoading, mapsError]);

  // Actualizar marcadores cuando cambien los resultados
  useEffect(() => {
    if (!map || !infoWindow || !window.google?.maps) return;

    // Limpiar marcadores existentes
    markers.forEach(marker => marker.setMap(null));

    // Crear nuevos marcadores usando geocoding
    const newMarkers: any[] = [];
    let geocodingCount = 0;
    
    searchResults.forEach((person) => {
      if (!person.formatted_address || person.formatted_address === 'Ubicación no especificada') return;
      
      // Usar geocoding para obtener coordenadas
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: person.formatted_address }, (results: any, status: any) => {
        geocodingCount++;
        
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          
          const marker = new window.google.maps.Marker({
            position: location,
            map: map,
            title: person.full_name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="2"/>
                  <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">👤</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 16)
            }
          });

          // Agregar evento de clic al marcador
          marker.addListener('click', () => {
            const content = `
              <div class="p-3 max-w-xs">
                <div class="flex items-center space-x-3 mb-2">
                  ${person.avatar_url ? 
                    `<img src="${person.avatar_url}" alt="${person.full_name}" class="w-8 h-8 rounded-full object-cover">` :
                    `<div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                      </svg>
                    </div>`
                  }
                  <div>
                    <h3 class="font-semibold text-gray-900 text-sm">${person.full_name}</h3>
                    <p class="text-xs text-gray-600">${person.occupation || 'Sin ocupación'}</p>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mb-2">${person.formatted_address}</p>
                <button class="w-full px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
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
        }
        
        // Cuando terminemos de geocodificar todos, ajustar la vista
        if (geocodingCount === searchResults.filter(p => p.formatted_address && p.formatted_address !== 'Ubicación no especificada').length) {
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
        }
      });
    });
  }, [searchResults, map, infoWindow, onPersonSelect]);

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
