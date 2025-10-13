import React, { useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import type { GooglePlacesLocation } from '../../types/supabase';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

interface LocationSelectorProps {
  onLocationSelect: (location: GooglePlacesLocation) => void;
  placeholder?: string;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  placeholder = "Buscar ubicación...",
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Usar el hook de Google Maps
  const { isLoaded: mapsLoaded, error: mapsError } = useGoogleMaps();

  // Inicializar autocomplete cuando Google Maps esté cargado
  useEffect(() => {
    console.log('LocationSelector - mapsLoaded:', mapsLoaded, 'mapsError:', mapsError);
    if (mapsLoaded && !mapsError) {
      console.log('LocationSelector - Inicializando autocomplete...');
      initializeAutocomplete();
    }
  }, [mapsLoaded, mapsError, onLocationSelect]);

  const initializeAutocomplete = () => {
    console.log('initializeAutocomplete - inputRef.current:', !!inputRef.current);
    console.log('initializeAutocomplete - window.google:', !!window.google);

    if (!inputRef.current || !window.google) {
      console.log('initializeAutocomplete - Saliendo temprano, condiciones no cumplidas');
      return;
    }

    console.log('initializeAutocomplete - Creando autocomplete...');

    try {
      // Usar el método recomendado por Google Places
      // Si la nueva API no está disponible, usar el método antiguo
      if (window.google.maps.places && window.google.maps.places.PlaceAutocompleteElement) {
        console.log('initializeAutocomplete - Nueva API disponible, usando PlaceAutocompleteElement...');

        // Crear el elemento HTML personalizado
        const autocompleteElement = document.createElement('gmp-place-autocomplete');
        autocompleteElement.setAttribute('placeholder', placeholder);

        // Reemplazar el input con el componente de Google
        if (inputRef.current.parentNode) {
          inputRef.current.parentNode.replaceChild(autocompleteElement, inputRef.current);
          // Actualizar la referencia para apuntar al nuevo elemento
          inputRef.current = autocompleteElement as any;
        }

        console.log('initializeAutocomplete - PlaceAutocompleteElement creado exitosamente');
      } else {
        console.log('initializeAutocomplete - Nueva API no disponible, usando método alternativo');
        // Fallback al método antiguo si la nueva API no está disponible
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode'],
          componentRestrictions: { country: 'es' }
        });

        autocomplete.addListener('place_changed', () => {
          console.log('initializeAutocomplete - place_changed event triggered (fallback)');
          const place = autocomplete.getPlace();
          console.log('initializeAutocomplete - place:', place);

          if (place.geometry && place.geometry.location) {
            const location: GooglePlacesLocation = {
              place_id: place.place_id || '',
              formatted_address: place.formatted_address || '',
              geometry: {
                location: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }
              },
              address_components: place.address_components || [],
              name: place.name,
              types: place.types
            };
            console.log('initializeAutocomplete - Llamando onLocationSelect con:', location);
            onLocationSelect(location);
          } else {
            console.log('initializeAutocomplete - No hay geometría válida');
          }
        });

        console.log('initializeAutocomplete - Autocomplete creado exitosamente (fallback)');
      }
    } catch (error) {
      console.error('initializeAutocomplete - Error:', error);
    }
  };

  const handleInputChange = () => {
    // Handle input changes if needed
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          onChange={handleInputChange}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!mapsLoaded}
        />
        {!mapsLoaded && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
