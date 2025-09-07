declare global {
  interface Window {
    google: {
      maps: {
        Map: new (mapDiv: HTMLElement, opts?: google.maps.MapOptions) => google.maps.Map;
        Marker: new (opts?: google.maps.MarkerOptions) => google.maps.Marker;
        InfoWindow: new (opts?: google.maps.InfoWindowOptions) => google.maps.InfoWindow;
        LatLng: new (lat: number, lng: number) => google.maps.LatLng;
        LatLngBounds: new () => google.maps.LatLngBounds;
        Size: new (width: number, height: number) => google.maps.Size;
        Point: new (x: number, y: number) => google.maps.Point;
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

declare namespace google.maps {
  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    styles?: MapTypeStyle[];
    mapTypeId?: MapTypeId;
  }

  enum MapTypeId {
    ROADMAP = 'roadmap',
    SATELLITE = 'satellite',
    HYBRID = 'hybrid',
    TERRAIN = 'terrain'
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface MapTypeStyle {
    featureType?: string;
    elementType?: string;
    stylers?: any[];
  }

  interface MarkerOptions {
    position?: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: string | Icon | Symbol;
  }

  interface Icon {
    url: string;
    scaledSize?: Size;
    anchor?: Point;
  }

  interface Symbol {
    path: string;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    scale?: number;
  }

  interface InfoWindowOptions {
    content?: string | Node;
    position?: LatLng | LatLngLiteral;
  }

  interface Map {
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    fitBounds(bounds: LatLngBounds): void;
  }

  interface Marker {
    setMap(map: Map | null): void;
    getPosition(): LatLng | null;
    addListener(eventName: string, handler: () => void): void;
  }

  interface InfoWindow {
    open(map?: Map, anchor?: Marker): void;
    close(): void;
  }

  interface LatLng {
    lat(): number;
    lng(): number;
  }

  interface LatLngBounds {
    extend(point: LatLng): void;
  }

  interface Size {
    width: number;
    height: number;
  }

  interface Point {
    x: number;
    y: number;
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
    nearbySearch(
      request: PlaceSearchRequest,
      callback: (results: PlaceResult[] | null, status: PlacesServiceStatus) => void
    ): void;
  }

  interface PlaceDetailsRequest {
    placeId: string;
    fields: string[];
  }

  interface PlaceSearchRequest {
    location: google.maps.LatLng;
    radius: number;
    type: string;
  }

  interface PlaceResult {
    place_id?: string;
    name?: string;
    rating?: number;
    price_level?: number;
    vicinity?: string;
    types?: string[];
    icon?: string;
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
