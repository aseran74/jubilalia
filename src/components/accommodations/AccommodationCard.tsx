import React, { useState } from 'react';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Users,
  Heart,
  Star,
  Calendar,
  Euro,
  Home,
  Car,
  Wifi,
  Dog,
  Building
} from 'lucide-react';
import type { Accommodation } from '../../types/accommodations';

interface AccommodationCardProps {
  accommodation: Accommodation;
  onFavorite?: (id: string) => void;
  onRequest?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isFavorite?: boolean;
  showActions?: boolean;
}

const AccommodationCard: React.FC<AccommodationCardProps> = ({
  accommodation,
  onFavorite,
  onRequest,
  onViewDetails,
  isFavorite = false,
  showActions = true
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavorite = async () => {
    if (!onFavorite) return;
    setIsLoading(true);
    try {
      await onFavorite(accommodation.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = () => {
    if (onRequest) {
      onRequest(accommodation.id);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(accommodation.id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'casa': 'Casa',
      'piso': 'Piso',
      'residencia': 'Residencia',
      'chalet': 'Chalet',
      'duplex': 'Dúplex'
    };
    return labels[type] || type;
  };

  const getPropertyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'casa': 'bg-green-100 text-green-800',
      'piso': 'bg-blue-100 text-blue-800',
      'residencia': 'bg-purple-100 text-purple-800',
      'chalet': 'bg-orange-100 text-orange-800',
      'duplex': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Imagen principal */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        {accommodation.images && accommodation.images.length > 0 ? (
          <>
            <img
              src={accommodation.images[imageIndex]}
              alt={accommodation.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            {/* Indicadores de imagen */}
            {accommodation.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {accommodation.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === imageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
            <div className="text-center text-gray-500">
              <Square className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sin imagen</p>
            </div>
          </div>
        )}

        {/* Botón de favorito */}
        {showActions && (
          <button
            onClick={handleFavorite}
            disabled={isLoading}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
              isFavorite
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/90 text-gray-600 hover:bg-white hover:shadow-md'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Tipo de propiedad */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getPropertyTypeColor(accommodation.property_type)}`}>
          {getPropertyTypeLabel(accommodation.property_type)}
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-6">
        {/* Título y precio */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 leading-tight">
            {accommodation.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(accommodation.price_per_month)}
              <span className="text-sm text-gray-500 font-normal">/mes</span>
            </div>
            {accommodation.price_per_person && (
              <div className="text-sm text-gray-600">
                {formatPrice(accommodation.price_per_person)}/persona
              </div>
            )}
          </div>
        </div>

        {/* Descripción */}
        {accommodation.description && (
          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {accommodation.description}
          </p>
        )}

        {/* Ubicación */}
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-2 text-green-500" />
          <span className="text-sm">{accommodation.city}</span>
          {accommodation.postal_code && (
            <span className="text-sm text-gray-400 ml-1">({accommodation.postal_code})</span>
          )}
        </div>

        {/* Características principales */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center text-gray-600">
            <Bed className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-sm font-medium">
              {accommodation.available_rooms}/{accommodation.total_rooms} hab.
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Bath className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-sm font-medium">
              {accommodation.total_bathrooms} baños
            </span>
          </div>
          {accommodation.square_meters && (
            <div className="flex items-center text-gray-600">
              <Square className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium">
                {accommodation.square_meters}m²
              </span>
            </div>
          )}
        </div>

        {/* Comodidades */}
        {accommodation.amenities && accommodation.amenities.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Comodidades:</h4>
            <div className="flex flex-wrap gap-2">
              {accommodation.amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium"
                >
                  {amenity}
                </span>
              ))}
              {accommodation.amenities.length > 4 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                  +{accommodation.amenities.length - 4} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        {showActions && (
          <div className="flex space-x-3">
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Ver Detalles
            </button>
            <button
              onClick={handleRequest}
              className="px-4 py-3 border-2 border-green-500 text-green-600 rounded-xl font-semibold hover:bg-green-500 hover:text-white transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Disponible desde: {new Date(accommodation.created_at).toLocaleDateString('es-ES')}</span>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span>Nuevo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationCard;
