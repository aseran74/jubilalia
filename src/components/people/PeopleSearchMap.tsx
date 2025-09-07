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
  const { isLoading: mapsLoading, error: mapsError } = useGoogleMaps();

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

  useEffect(() => {
    if (!map || !infoWindow || !window.google?.maps) return;

    markers.forEach(marker => marker.setMap(null));

    const newMarkers: any[] = [];
    let geocodingCount = 0;
    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds();
    
    searchResults.forEach((person) => {
      console.log(`👤 Procesando persona: ${person.full_name}, avatar: ${person.avatar_url}, dirección: ${person.formatted_address}`);
      if (!person.formatted_address || person.formatted_address === 'Ubicación no especificada') {
        geocodingCount++;
        return;
      }
      
      geocoder.geocode({ address: person.formatted_address }, (results: any, status: any) => {
        geocodingCount++;
        
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          bounds.extend(location);
          
          // === SOLUCIÓN ALTERNATIVA SIN MAP ID ===
          // Crear un icono SVG personalizado que funcione con marcadores normales
          let iconUrl;
          
          if (person.avatar_url) {
            // Para personas con foto, crear un SVG con la imagen
            iconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="avatar-${person.id}" patternUnits="userSpaceOnUse" width="48" height="48">
                    <image href="${person.avatar_url}" width="48" height="48" preserveAspectRatio="xMidYMid slice"/>
                  </pattern>
                </defs>
                <circle cx="24" cy="24" r="21" fill="url(#avatar-${person.id})" stroke="#3B82F6" stroke-width="3"/>
                <circle cx="24" cy="24" r="21" fill="none" stroke="#fff" stroke-width="2"/>
              </svg>
            `)}`;
          } else {
            // Para personas sin foto, crear un SVG con iniciales
            const initials = (person.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            iconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="21" fill="#10B981" stroke="#fff" stroke-width="3"/>
                <text x="24" y="30" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${initials}</text>
              </svg>
            `)}`;
          }
          
          // Crear el marcador con el icono personalizado
          const marker = new window.google.maps.Marker({
            map: map,
            position: location,
            title: person.full_name,
            icon: {
              url: iconUrl,
              scaledSize: new window.google.maps.Size(48, 48),
              anchor: new window.google.maps.Point(24, 24)
            }
          });
          // === FIN DE LA SOLUCIÓN ===
          
          marker.addListener('click', () => {
            const content = `
              <div class="p-4 max-w-xs">
                <div class="flex items-center space-x-3 mb-3">
                  ${person.avatar_url ? 
                    `<img src="${person.avatar_url}" alt="${person.full_name}" class="w-12 h-12 rounded-full object-cover border-2 border-blue-500">` :
                    `<div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center border-2 border-blue-500">
                      <svg class="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                      </svg>
                    </div>`
                  }
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 text-base">${person.full_name}</h3>
                    <p class="text-sm text-gray-600">${person.occupation || 'Sin ocupación'}</p>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="flex items-center text-sm text-gray-500 mb-1">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="text-xs">${person.formatted_address}</span>
                  </div>
                  ${person.bio ? `<p class="text-xs text-gray-600 line-clamp-2">${person.bio}</p>` : ''}
                </div>
                <button id="profile-btn-${person.id}" class="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Ver perfil completo
                </button>
              </div>
            `;
            
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
            
            setTimeout(() => {
              const button = document.getElementById(`profile-btn-${person.id}`);
              if (button) {
                button.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔗 Navegando a perfil de:', person.full_name);
                  onPersonSelect(person);
                  infoWindow.close();
                });
              }
            }, 200);
          });

          newMarkers.push(marker);
        }
        
        if (geocodingCount === searchResults.length) {
          console.log(`🎯 Total de marcadores creados: ${newMarkers.length}`);
          setMarkers(newMarkers);
          if (newMarkers.length > 0) {
            map.fitBounds(bounds);
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
        <div className="flex items-center justify-center space-x-6 mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
            <span className="text-xs text-gray-600">Con foto</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
            <span className="text-xs text-gray-600">Sin foto</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center">
          💡 Haz clic en un marcador para ver detalles de la persona
        </p>
      </div>
    </div>
  );
};

export default PeopleSearchMap;