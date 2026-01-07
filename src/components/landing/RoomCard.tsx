import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  HomeIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';

interface RoomCardProps {
  room: {
    id: string;
    title: string;
    description: string;
    address: string;
    city: string;
    price: number;
    images: string[];
  };
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link 
      to={`/rooms/${room.id}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-green-400"
    >
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {room.images && room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={room.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
            <HomeIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {/* Badge de tipo */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white bg-purple-500">
          Habitación
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Título */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {room.title}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {room.description}
        </p>

        {/* Ubicación */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span className="line-clamp-1">{room.city}</span>
        </div>

        {/* Precio */}
        <div className="flex items-baseline justify-between pt-4 border-t border-gray-200">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(room.price)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              /mes
            </div>
          </div>
          <CurrencyEuroIcon className="w-6 h-6 text-green-600" />
        </div>
      </div>
    </Link>
  );
};

export default RoomCard;
