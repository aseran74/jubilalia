import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description: string;
    category?: string;
    current_members: number;
    max_members: number;
    is_public: boolean;
    created_at: string;
    image_url?: string;
  };
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
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
        {group.image_url ? (
          <img
            src={group.image_url}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <UserGroupIcon className="w-16 h-16 text-blue-400" />
          </div>
        )}
                          {group.category && (
           <div className={`absolute top-3 right-3 ${getCategoryColor(group.category)} text-white px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-lg`}>
             {group.category}
           </div>
         )}
         {!group.is_public && (
           <div className="absolute top-3 left-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
             Privado
           </div>
         )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {group.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {group.description}
        </p>

        {/* Detalles */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>{group.current_members} de {group.max_members} miembros</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>Creado {formatDate(group.created_at)}</span>
          </div>
        </div>

        {/* Progreso de miembros */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Miembros</span>
            <span>{Math.round((group.current_members / group.max_members) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(group.current_members / group.max_members) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {group.is_public ? 'Grupo público' : 'Grupo privado'}
          </span>
                     <Link
             to={`/dashboard/groups/${group.id}`}
             className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
           >
             Ver grupo
           </Link>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
