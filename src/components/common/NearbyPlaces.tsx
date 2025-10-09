import React from 'react';
import { useNearbyPlaces, getPlaceEmoji, NearbyPlace } from '../../hooks/useNearbyPlaces';

interface NearbyPlacesProps {
  latitude: number;
  longitude: number;
  radius?: number;
  className?: string;
}

const NearbyPlaces: React.FC<NearbyPlacesProps> = ({
  latitude,
  longitude,
  radius = 1000,
  className = ''
}) => {
  const { places, loading, error } = useNearbyPlaces(
    latitude,
    longitude,
    radius,
    ['supermarket', 'hospital', 'transit_station', 'school', 'pharmacy', 'bank']
  );

  // Debug logs
  console.log('🗺️ NearbyPlaces Debug:', {
    latitude,
    longitude,
    radius,
    loading,
    error,
    placesCount: places.length,
    places
  });

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Actividades Cercanas
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Buscando lugares cercanos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Actividades Cercanas
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No se pudieron cargar los lugares cercanos</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (places.length === 0 && !loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Actividades Cercanas
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No se encontraron lugares cercanos</p>
          <p className="text-xs text-gray-400">
            Coordenadas: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
          {error && (
            <p className="text-xs text-red-500 mt-2">Error: {error}</p>
          )}
        </div>
      </div>
    );
  }

  // Verificar si son datos de ejemplo
  const isMockData = places.length > 0 && places[0].id.startsWith('mock-');

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Actividades Cercanas
        </h2>
        {isMockData && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Datos de ejemplo
          </span>
        )}
      </div>
      
      {isMockData && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>Nota:</strong> Estos son lugares de ejemplo. Para ver lugares reales, configura <code className="bg-blue-100 px-1 rounded">VITE_GOOGLE_PLACES_API_KEY</code> en tu archivo <code className="bg-blue-100 px-1 rounded">.env</code>
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        {places.map((place) => (
          <PlaceItem key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
};

interface PlaceItemProps {
  place: NearbyPlace;
}

const PlaceItem: React.FC<PlaceItemProps> = ({ place }) => {
  const emoji = getPlaceEmoji(place.types);
  const distance = place.distance ? `${place.distance.toFixed(1)} km` : '';

  // Colores basados en el tipo de lugar
  const getColorClass = (types: string[]) => {
    if (types.includes('supermarket') || types.includes('grocery_or_supermarket')) return 'bg-blue-100 text-blue-600';
    if (types.includes('hospital') || types.includes('health')) return 'bg-green-100 text-green-600';
    if (types.includes('transit_station') || types.includes('bus_station')) return 'bg-yellow-100 text-yellow-600';
    if (types.includes('school') || types.includes('university')) return 'bg-purple-100 text-purple-600';
    if (types.includes('pharmacy')) return 'bg-red-100 text-red-600';
    if (types.includes('bank') || types.includes('atm')) return 'bg-indigo-100 text-indigo-600';
    return 'bg-gray-100 text-gray-600';
  };

  const colorClass = getColorClass(place.types);

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
        <span className="font-semibold text-lg">{emoji}</span>
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{place.name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">{place.vicinity}</p>
          {distance && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {distance}
            </span>
          )}
        </div>
        {place.rating > 0 && (
          <div className="flex items-center mt-1">
            <span className="text-yellow-400 text-sm">⭐</span>
            <span className="text-sm text-gray-600 ml-1">{place.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyPlaces;
