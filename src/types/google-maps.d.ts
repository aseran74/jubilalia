declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete;
          AutocompleteService: new () => google.maps.places.AutocompleteService;
          PlacesService: new (attrContainer: HTMLDivElement | google.maps.Map) => google.maps.places.PlacesService;
          PlacesServiceStatus: typeof google.maps.places.PlacesServiceStatus;
        };
      };
    };
  }
}

declare namespace google.maps.places {
  interface AutocompleteOptions {
    types?: string[];
    componentRestrictions?: ComponentRestrictions;
    fields?: string[];
  }

  interface ComponentRestrictions {
    country: string | string[];
  }

  interface Autocomplete {
    addListener(eventName: string, handler: () => void): void;
    getPlace(): PlaceResult;
  }

  interface AutocompleteService {
    getPlacePredictions(
      request: AutocompletionRequest,
      callback: (
        predictions: AutocompletePrediction[] | null,
        status: PlacesServiceStatus
      ) => void
    ): void;
  }

  interface AutocompletionRequest {
    input: string;
    types?: string[];
    componentRestrictions?: ComponentRestrictions;
  }

  interface AutocompletePrediction {
    place_id: string;
    description: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }

  interface PlacesService {
    getDetails(
      request: PlaceDetailsRequest,
      callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void
    ): void;
  }

  interface PlaceDetailsRequest {
    placeId: string;
    fields: string[];
  }

  interface PlaceResult {
    address_components?: GeocoderAddressComponent[];
    formatted_address?: string;
    geometry?: PlaceGeometry;
  }

  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  interface PlaceGeometry {
    location?: google.maps.LatLng;
  }

  enum PlacesServiceStatus {
    OK = 'OK',
    ZERO_RESULTS = 'ZERO_RESULTS',
    OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
    REQUEST_DENIED = 'REQUEST_DENIED',
    INVALID_REQUEST = 'INVALID_REQUEST',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
  }
}

export {};
