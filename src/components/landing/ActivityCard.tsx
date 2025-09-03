import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface ActivityCardProps {
  activity: {
    id: string;
    title: string;
    description: string;
    category?: string;
    location: string;
    city: string;
    date: string;
    time: string;
    max_participants: number;
    current_participants: number;
    price: number;
    images: string[];
    is_featured: boolean;
    created_at: string;
  };
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
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

  const getCategoryColor = (category: string) => {
    if (!category) return 'bg-gray-500';
    
    const colors: { [key: string]: string } = {
      'deportes': 'bg-green-500',
      'cultura': 'bg-purple-500',
      'viajes': 'bg-blue-500',
      'gastronomia': 'bg-orange-500',
      'tecnologia': 'bg-indigo-500',
      'musica': 'bg-pink-500',
      'arte': 'bg-red-500',
      'naturaleza': 'bg-emerald-500',
      'social': 'bg-yellow-500',
      'educacion': 'bg-teal-500'
    };
    return colors[category.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
      {/* Imagen */}
      <div className="relative h-48 bg-gray-200">
        {activity.images && activity.images.length > 0 ? (
          <img
            src={activity.images[0]}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
            <CalendarIcon className="w-16 h-16 text-green-400" />
          </div>
        )}
                          {activity.category && (
           <div className={`absolute top-3 right-3 ${getCategoryColor(activity.category)} text-white px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-lg`}>
             {activity.category}
           </div>
         )}
         {activity.is_featured && (
           <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg">
             <StarIcon className="w-3 h-3 mr-1" />
             Destacada
           </div>
         )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {activity.title}
          </h3>
          <div className="flex items-center text-green-600 font-bold text-sm">
            {formatPrice(activity.price)}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {activity.description}
        </p>

        {/* Detalles */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>{activity.location}, {activity.city}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatDate(activity.date)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>{activity.time}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>{activity.current_participants} de {activity.max_participants} participantes</span>
          </div>
        </div>

        {/* Progreso de participantes */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Participantes</span>
            <span>{Math.round((activity.current_participants / activity.max_participants) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(activity.current_participants / activity.max_participants) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Publicado {formatDate(activity.created_at)}
          </span>
                     <Link
             to={`/dashboard/activities/${activity.id}`}
             className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
           >
             Ver actividad
           </Link>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
