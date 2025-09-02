import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  UserIcon, 
  HomeIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';

interface RoomCardProps {
  room: {
    id: string;
    title: string;
    description: string;
    price: number;
    address: string;
    city: string;
    bed_type: string;
    room_area: number;
    private_bathroom: boolean;
    images: string[];
    created_at: string;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
      {/* Imagen */}
      <div className="relative h-48 bg-gray-200">
        {room.images && room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={room.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <HomeIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
                 <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
           Habitación
         </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {room.title}
          </h3>
          <div className="flex items-center text-green-600 font-bold">
            <CurrencyEuroIcon className="w-4 h-4 mr-1" />
            {formatPrice(room.price)}/mes
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {room.description}
        </p>

        {/* Detalles */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>{room.address}, {room.city}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>Cama {room.bed_type} • {room.room_area}m²</span>
            {room.private_bathroom && (
              <span className="ml-2 text-green-600 font-medium">• Baño privado</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Publicado {formatDate(room.created_at)}
          </span>
                     <Link
             to={`/dashboard/rooms/${room.id}`}
             className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
           >
             Ver detalles
           </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
