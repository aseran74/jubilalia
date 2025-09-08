import React, { useState, useRef, useEffect } from 'react';
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
    if (mapsLoaded && !mapsError) {
      initializeAutocomplete();
    }
  }, [mapsLoaded, mapsError, onLocationSelect]);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
      componentRestrictions: { country: 'es' }
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
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
        onLocationSelect(location);
      }
    });
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
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
