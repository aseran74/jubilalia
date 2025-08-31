import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Euro, 
  Tag, 
  Heart, 
  Eye,
  Star,
  Activity,
  User
} from 'lucide-react';

interface ActivityCardProps {
  activity: {
    id: string;
    title: string;
    description: string;
    activity_type: string;
    date: string;
    time: string;
    duration: number;
    location: string;
    city: string;
    max_participants: number;
    current_participants: number;
    price: number;
    is_free: boolean;
    difficulty_level: string;
    age_min: number;
    age_max: number;
    tags: string[];
    images: string[];
    owner: {
      full_name: string;
      avatar_url?: string;
    };
    is_favorite?: boolean;
    rating?: number;
    review_count?: number;
  };
  onFavoriteToggle?: (activityId: string, isFavorite: boolean) => void;
  showActions?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  onFavoriteToggle, 
  showActions = true 
}) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(activity.is_favorite || false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    onFavoriteToggle?.(activity.id, newFavoriteState);
  };

  const handleCardClick = () => {
    navigate(`/activities/${activity.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${remainingMinutes}min`;
      }
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'principiante':
        return 'bg-green-100 text-green-800';
      case 'intermedio':
        return 'bg-yellow-100 text-yellow-800';
      case 'avanzado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getActivityTypeColor = (type: string) => {
    const colors = {
      'deportes': 'bg-blue-100 text-blue-800',
      'cultura': 'bg-purple-100 text-purple-800',
      'música': 'bg-pink-100 text-pink-800',
      'arte': 'bg-indigo-100 text-indigo-800',
      'gastronomía': 'bg-orange-100 text-orange-800',
      'naturaleza': 'bg-green-100 text-green-800',
      'viajes': 'bg-teal-100 text-teal-800',
      'tecnología': 'bg-gray-100 text-gray-800',
      'educación': 'bg-amber-100 text-amber-800',
      'social': 'bg-rose-100 text-rose-800',
      'voluntariado': 'bg-emerald-100 text-emerald-800',
      'fitness': 'bg-red-100 text-red-800',
      'yoga': 'bg-cyan-100 text-cyan-800',
      'baile': 'bg-fuchsia-100 text-fuchsia-800',
      'fotografía': 'bg-slate-100 text-slate-800',
      'jardinería': 'bg-lime-100 text-lime-800',
      'manualidades': 'bg-amber-100 text-amber-800',
      'juegos': 'bg-violet-100 text-violet-800',
      'lectura': 'bg-stone-100 text-stone-800',
      'meditación': 'bg-sky-100 text-sky-800',
      'senderismo': 'bg-emerald-100 text-emerald-800',
      'ciclismo': 'bg-orange-100 text-orange-800',
      'natación': 'bg-cyan-100 text-cyan-800',
      'pintura': 'bg-pink-100 text-pink-800',
      'escritura': 'bg-indigo-100 text-indigo-800',
      'teatro': 'bg-purple-100 text-purple-800',
      'cine': 'bg-slate-100 text-slate-800',
      'museos': 'bg-amber-100 text-amber-800',
      'conciertos': 'bg-rose-100 text-rose-800',
      'festivales': 'bg-fuchsia-100 text-fuchsia-800',
      'talleres': 'bg-teal-100 text-teal-800',
      'seminarios': 'bg-blue-100 text-blue-800',
      'grupos de conversación': 'bg-green-100 text-green-800',
      'clubes de lectura': 'bg-indigo-100 text-indigo-800',
      'excursiones': 'bg-emerald-100 text-emerald-800',
      'paseos culturales': 'bg-purple-100 text-purple-800'
    };
    return colors[type.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const participationPercentage = (current_participants / max_participants) * 100;
  const isFull = current_participants >= max_participants;
  const isAlmostFull = participationPercentage >= 80;

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 overflow-hidden group"
      onClick={handleCardClick}
    >
      {/* Imagen principal */}
      <div className="relative h-48 overflow-hidden">
        {activity.images && activity.images.length > 0 ? (
          <img
            src={activity.images[0]}
            alt={activity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
            <Activity className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Overlay con información rápida */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.activity_type)}`}>
              {activity.activity_type}
            </span>
            {activity.is_free ? (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Gratis
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {activity.price}€
              </span>
            )}
          </div>
        </div>

        {/* Botón de favorito */}
        {showActions && (
          <button
            onClick={handleFavoriteToggle}
            className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Indicador de disponibilidad */}
        <div className="absolute bottom-4 right-4">
          {isFull ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Completo
            </span>
          ) : isAlmostFull ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Casi lleno
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Plazas disponibles
            </span>
          )}
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-6 space-y-4">
        {/* Título y descripción */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {activity.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {activity.description}
          </p>
        </div>

        {/* Información de fecha y hora */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{formatDate(activity.date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{formatTime(activity.time)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span className="font-medium">{formatDuration(activity.duration)}</span>
          </div>
        </div>

        {/* Ubicación */}
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{activity.location}, {activity.city}</span>
        </div>

        {/* Participantes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Participantes</span>
            <span className="font-medium text-gray-900">
              {activity.current_participants}/{activity.max_participants}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isFull ? 'bg-red-500' : isAlmostFull ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(participationPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Etiquetas */}
        {activity.tags && activity.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activity.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {activity.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{activity.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Información adicional */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              {activity.owner.avatar_url ? (
                <img
                  src={activity.owner.avatar_url}
                  alt={activity.owner.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <span className="text-sm text-gray-600">{activity.owner.full_name}</span>
          </div>

          <div className="flex items-center space-x-2">
            {activity.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">
                  {activity.rating.toFixed(1)}
                </span>
                {activity.review_count && (
                  <span className="text-xs text-gray-500">
                    ({activity.review_count})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botón de acción */}
        {showActions && (
          <div className="pt-4">
            <button
              onClick={handleCardClick}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Ver detalles</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;

