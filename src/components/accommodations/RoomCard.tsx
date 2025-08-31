import React, { useState } from 'react';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Star,
  MessageCircle,
  Calendar,
  Users,
  Wifi,
  Car,
  Dog,
  Smoking,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface RoomCardProps {
  room: {
    id: string;
    title: string;
    description: string;
    address: string;
    city: string;
    price_per_month: number;
    room_area: number;
    private_bathroom: boolean;
    has_balcony: boolean;
    preferred_gender: 'any' | 'male' | 'female';
    preferred_age_min: number;
    preferred_age_max: number;
    smoking_allowed: boolean;
    pets_allowed: boolean;
    pet_types?: string[];
    images: string[];
    owner: {
      full_name: string;
      avatar_url?: string;
    };
    created_at: string;
    rating?: number;
    review_count?: number;
  };
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onFavorite,
  isFavorite = false
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavorite = async () => {
    if (!onFavorite) return;
    setIsLoading(true);
    try {
      await onFavorite(room.id);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      'any': 'Cualquier género',
      'male': 'Solo hombres',
      'female': 'Solo mujeres'
    };
    return labels[gender] || gender;
  };

  const getGenderColor = (gender: string) => {
    const colors: Record<string, string> = {
      'any': 'bg-blue-100 text-blue-800',
      'male': 'bg-green-100 text-green-800',
      'female': 'bg-pink-100 text-pink-800'
    };
    return colors[gender] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Imagen principal */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        {room.images && room.images.length > 0 ? (
          <>
            <img
              src={room.images[imageIndex]}
              alt={room.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Indicadores de imagen */}
            {room.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {room.images.map((_, index) => (
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center text-gray-400">
              <Bed className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Sin imagen</p>
            </div>
          </div>
        )}

        {/* Botón de favorito */}
        {onFavorite && (
          <button
            onClick={handleFavorite}
            disabled={isLoading}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:shadow-lg'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Badge de género preferido */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${getGenderColor(room.preferred_gender)}`}>
          {getGenderLabel(room.preferred_gender)}
        </div>

        {/* Badge de edad preferida */}
        <div className="absolute top-3 left-32 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {room.preferred_age_min}-{room.preferred_age_max} años
        </div>
      </div>

      {/* Contenido de la card */}
      <div className="p-6">
        {/* Título y precio */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
            {room.title}
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(room.price_per_month)}
            </div>
            <div className="text-sm text-gray-500">por mes</div>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {room.description}
        </p>

        {/* Ubicación */}
        <div className="flex items-center text-gray-500 mb-4">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm truncate">{room.address}, {room.city}</span>
        </div>

        {/* Características principales */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Square className="w-4 h-4 mr-2" />
            <span>{room.room_area} m²</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Bath className="w-4 h-4 mr-2" />
            <span>{room.private_bathroom ? 'Baño propio' : 'Baño compartido'}</span>
          </div>
          {room.has_balcony && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-4 h-4 mr-2">🌅</div>
              <span>Balcón</span>
            </div>
          )}
        </div>

        {/* Preferencias */}
        <div className="flex flex-wrap gap-2 mb-4">
          {room.smoking_allowed && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              <Smoking className="w-3 h-3 mr-1" />
              Fumadores
            </span>
          )}
          {room.pets_allowed && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Dog className="w-3 h-3 mr-1" />
              Mascotas
            </span>
          )}
        </div>

        {/* Información del propietario */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
              {room.owner.avatar_url ? (
                <img 
                  src={room.owner.avatar_url} 
                  alt={room.owner.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {room.owner.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{room.owner.full_name || 'Propietario'}</p>
              <p className="text-xs text-gray-500">Publicado {formatDate(room.created_at)}</p>
            </div>
          </div>

          {/* Rating si existe */}
          {room.rating && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-medium text-gray-900">{room.rating}</span>
              {room.review_count && (
                <span className="text-xs text-gray-500 ml-1">({room.review_count})</span>
              )}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <Link
            to={`/rooms/${room.id}`}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-center flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalles
          </Link>
          <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
