import React, { useState, useEffect, useRef } from 'react';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

interface GooglePlacesLocation {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationSelectorProps {
  onLocationSelect: (location: {
    address: string;
    city: string;
    postal_code: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  }) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  placeholder = "Buscar ubicación...",
  label = "Ubicación",
  required = false,
  error = "",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<GooglePlacesLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Usar el hook de Google Maps
  const { isLoaded: mapsLoaded, isLoading: mapsLoading, error: mapsError } = useGoogleMaps();

  // Inicializar autocomplete cuando Google Maps esté cargado
  useEffect(() => {
    if (mapsLoaded && !mapsError) {
      initializeAutocomplete();
    }
  }, [mapsLoaded, mapsError]);

  // Inicializar autocompletado
  const initializeAutocomplete = () => {
    if (!inputRef.current) {
      console.error('LocationSelector: inputRef no está disponible');
      return;
    }
    
    if (!window.google?.maps?.places) {
      console.error('LocationSelector: Google Maps Places API no está disponible');
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'es' }, // Restringir a España
        fields: ['address_components', 'formatted_address', 'geometry']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        console.log('Place selected:', place);
        
        if (place.address_components) {
          const location = parseAddressComponents(place.address_components);
          console.log('Parsed location:', location);
          
          if (place.geometry?.location) {
            (location as any).coordinates = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
          }
          onLocationSelect(location);
          setInputValue(place.formatted_address || '');
          setShowSuggestions(false);
        } else {
          console.warn('Place no tiene address_components');
        }
      });
      
      console.log('LocationSelector: Autocomplete inicializado correctamente');
    } catch (error) {
      console.error('LocationSelector: Error al inicializar autocomplete:', error);
    }
  };

  // Parsear componentes de dirección
  const parseAddressComponents = (components: any[]) => {
    const location = {
      address: '',
      city: '',
      postal_code: '',
      country: ''
    };

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number') || types.includes('route')) {
        location.address += component.long_name + ' ';
      }
      
      if (types.includes('locality')) {
        location.city = component.long_name;
      }
      
      if (types.includes('postal_code')) {
        location.postal_code = component.long_name;
      }
      
      if (types.includes('country')) {
        location.country = component.long_name;
      }
    });

    location.address = location.address.trim();
    return location;
  };

  // Buscar sugerencias manualmente
  const searchSuggestions = async (query: string) => {
    if (!query.trim() || !window.google?.maps?.places) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const service = new window.google.maps.places.AutocompleteService();
      const request = {
        input: query,
        types: ['geocode'],
        componentRestrictions: { country: 'es' }
      };

      service.getPlacePredictions(request, (predictions: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error searching places:', error);
      setIsLoading(false);
    }
  };

  // Manejar cambio de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length > 2) {
      searchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Seleccionar sugerencia
  const selectSuggestion = async (suggestion: GooglePlacesLocation) => {
    if (!window.google?.maps?.places) return;

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      placeId: suggestion.place_id,
      fields: ['address_components', 'formatted_address', 'geometry']
    };

    service.getDetails(request, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.address_components) {
        const location = parseAddressComponents(place.address_components);
        if (place.geometry?.location) {
          (location as any).coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
        }
        onLocationSelect(location);
        setInputValue(place.formatted_address || suggestion.description);
        setShowSuggestions(false);
      }
    });
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPinIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
            ${error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-green-500'
            }
          `}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => selectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">
                {suggestion.structured_formatting.main_text}
              </div>
              <div className="text-sm text-gray-500">
                {suggestion.structured_formatting.secondary_text}
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default LocationSelector;
