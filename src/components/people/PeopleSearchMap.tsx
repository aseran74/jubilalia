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
      if (!person.formatted_address) return; // Changed from person.location
      
      // For now, we'll skip coordinates since they're not in the LocationSearchResult type
      return; // This line effectively skips marker creation until coordinates are available
      
      // const [lng, lat] = person.location.coordinates; // Removed
      
      // const marker = new window.google.maps.Marker({ // Removed
      //   position: { lat, lng }, // Removed
      //   // ... (rest of marker creation)
      // });

      // Agregar evento de clic al marcador
      // marker.addListener('click', () => { // Removed
      //   const content = ` // Removed
      //     <div class="p-3"> // Removed
      //       <h3 class="font-semibold text-gray-900">${person.full_name}</h3> // Removed
      //       <p class="text-sm text-gray-600">${person.occupation || 'Sin ocupación'}</p> // Removed
      //       <p class="text-xs text-gray-500">${person.formatted_address || 'Ubicación no especificada'}</p> // Removed
      //       <button class="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"> // Removed
      //         Ver perfil // Removed
      //       </button> // Removed
      //     </div> // Removed
      //   `; // Removed
        
      //   infoWindow.setContent(content); // Removed
      //   infoWindow.open(map, marker); // Removed
        
      //   // Manejar clic en el botón "Ver perfil" // Removed
      //   setTimeout(() => { // Removed
      //     const button = document.querySelector('.bg-blue-600'); // Removed
      //     if (button) { // Removed
      //       button.addEventListener('click', () => { // Removed
      //         onPersonSelect(person); // Removed
      //         infoWindow.close(); // Removed
      //       }); // Removed
      //     } // Removed
      //   }, 100); // Removed
      // }); // Removed

      // newMarkers.push(marker); // Removed
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
