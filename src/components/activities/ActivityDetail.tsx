import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import ActivityParticipants from './ActivityParticipants';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Heart, 
  Star,
  Activity,
  User,
  Share2,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Camera,
  Edit,
  Trash2,
  Navigation,
  CheckCircle,
  Phone,
  Mail,
  Globe,
  XCircle
} from 'lucide-react';

interface ActivityDetail {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  city: string;
  address: string;
  max_participants: number;
  current_participants: number;
  price: number;
  is_free: boolean;
  contact_phone: string;
  contact_email: string;
  website: string;
  age_min: number;
  age_max: number;
  difficulty_level: string;
  tags: string[];
  images: string[];
  profile_id: string;
  owner: {
    id: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
  };
  is_favorite?: boolean;
  user_participation?: {
    status: string;
    joined_at: string;
  };
  rating?: number;
  review_count?: number;
  user_review?: {
    rating: number;
    comment: string;
  };
}

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, isAdmin } = useAuth();
  
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  const [joiningActivity, setJoiningActivity] = useState(false);
  const [leavingActivity, setLeavingActivity] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    if (id) {
      fetchActivityDetail();
    }
  }, [id]);

  const fetchActivityDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Obteniendo detalles de la actividad:', id);
      
      // Obtener la actividad principal
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();

      if (activityError) throw activityError;

      // Obtener información del propietario
      let ownerData = null;
      console.log('🔍 ActivityDetail: activityData.profile_id:', activityData.profile_id);
      
      if (activityData.profile_id) {
        const { data: owner, error: ownerError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, bio')
          .eq('id', activityData.profile_id)
          .single();
        
        console.log('👤 ActivityDetail: owner data:', owner, 'error:', ownerError);
        
        if (!ownerError) {
          ownerData = owner;
        }
      } else {
        console.log('⚠️ ActivityDetail: No profile_id found for activity');
      }

      // Obtener las imágenes
      const { data: imagesData, error: imagesError } = await supabase
        .from('activity_images')
        .select('*')
        .eq('activity_id', id)
        .order('image_order');

      if (imagesError) throw imagesError;

      // Obtener información del usuario actual
      let userParticipation = null;
      let isFavorite = false;
      let userReview = null;

      if (profile) {
        // Verificar si el usuario está participando
        const { data: participationData } = await supabase
          .from('activity_participants')
          .select('*')
          .eq('activity_id', id)
          .eq('profile_id', profile.id)
          .single();

        userParticipation = participationData || null;

        // Verificar si es favorito
        const { data: favoriteData } = await supabase
          .from('activity_favorites')
          .select('*')
          .eq('activity_id', id)
          .eq('profile_id', profile.id)
          .single();

        isFavorite = !!favoriteData;

        // Obtener la reseña del usuario si existe
        const { data: reviewData } = await supabase
          .from('activity_reviews')
          .select('*')
          .eq('activity_id', id)
          .eq('profile_id', profile.id)
          .single();

        userReview = reviewData || null;
      }

      // Obtener estadísticas de reseñas
      const { data: reviewsData } = await supabase
        .from('activity_reviews')
        .select('rating')
        .eq('activity_id', id);

      const rating = reviewsData && reviewsData.length > 0 
        ? reviewsData.reduce((acc, review) => acc + review.rating, 0) / reviewsData.length 
        : null;

      const activityDetail: ActivityDetail = {
        ...activityData,
        images: imagesData?.map(img => img.image_url) || [],
        owner: ownerData,
        is_favorite: isFavorite,
        user_participation: userParticipation,
        rating,
        review_count: reviewsData?.length || 0,
        user_review: userReview
      };

      setActivity(activityDetail);
      setIsFavorite(isFavorite);

    } catch (error) {
      console.error('Error fetching activity detail:', error);
      setError('No se pudo cargar la actividad. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!profile) {
      // Redirigir al login
      navigate('/auth/login');
      return;
    }

    try {
      if (isFavorite) {
        // Remover de favoritos
        const { error } = await supabase
          .from('activity_favorites')
          .delete()
          .eq('activity_id', id)
          .eq('profile_id', profile.id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        // Agregar a favoritos
        const { error } = await supabase
          .from('activity_favorites')
          .insert({
            activity_id: id,
            profile_id: profile.id
          });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) {
        console.error('Error deleting activity:', error);
        alert('Error al eliminar la actividad');
        return;
      }

      alert('Actividad eliminada correctamente');
      navigate('/dashboard/activities');
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Error al eliminar la actividad');
    }
  };

  const handleJoinActivity = async () => {
    if (!profile) {
      navigate('/auth/login');
      return;
    }

    if (!activity) return;

    try {
      setJoiningActivity(true);

      const { error } = await supabase
        .from('activity_participants')
        .insert({
          activity_id: id,
          profile_id: profile.id,
          status: 'confirmed'
        });

      if (error) throw error;

      // Actualizar el estado local
      setActivity(prev => prev ? {
        ...prev,
        current_participants: prev.current_participants + 1,
        user_participation: {
          status: 'confirmed',
          joined_at: new Date().toISOString()
        }
      } : null);

    } catch (error) {
      console.error('Error joining activity:', error);
    } finally {
      setJoiningActivity(false);
    }
  };

  const handleLeaveActivity = async () => {
    if (!profile || !activity) return;

    try {
      setLeavingActivity(true);

      const { error } = await supabase
        .from('activity_participants')
        .delete()
        .eq('activity_id', id)
        .eq('profile_id', profile.id);

      if (error) throw error;

      // Actualizar el estado local
      setActivity(prev => prev ? {
        ...prev,
        current_participants: prev.current_participants - 1,
        user_participation: undefined
      } : null);

    } catch (error) {
      console.error('Error leaving activity:', error);
    } finally {
      setLeavingActivity(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!profile || !activity) return;

    try {
      const { error } = await supabase
        .from('activity_reviews')
        .upsert({
          activity_id: id,
          profile_id: profile.id,
          rating: reviewData.rating,
          comment: reviewData.comment
        });

      if (error) throw error;

      setShowReviewModal(false);
      fetchActivityDetail(); // Recargar para obtener las nuevas estadísticas

    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const nextImage = () => {
    if (activity && activity.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === activity.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousImage = () => {
    if (activity && activity.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? activity.images.length - 1 : prev - 1
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} horas`;
      } else {
        return `${hours} horas y ${remainingMinutes} minutos`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando actividad...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'No se encontró la actividad'}</p>
          <button
            onClick={() => navigate('/activities')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a actividades
          </button>
        </div>
      </div>
    );
  }

  const participationPercentage = (activity.current_participants / activity.max_participants) * 100;
  const isFull = activity.current_participants >= activity.max_participants;
  const isAlmostFull = participationPercentage >= 80;
  // Verificar si es propietario: comparar directamente con profile_id de la actividad
  const isOwner = profile?.id === activity.profile_id || profile?.id === activity.owner?.id;
  const isParticipating = !!activity.user_participation;
  const canJoin = !isFull && !isParticipating && !isOwner;
  // Permitir editar si es admin o propietario
  const canEdit = isAdmin || isOwner;
  
  // Debug: Log para verificar permisos
  console.log('🔍 ActivityDetail - Permisos:', {
    profileId: profile?.id,
    profileIsAdmin: profile?.is_admin,
    isAdmin,
    activityProfileId: activity?.profile_id,
    isOwner,
    canEdit,
    activityId: activity?.id
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/activities')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver a actividades</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleFavoriteToggle}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isFavorite 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galería de imágenes */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-96">
                {activity.images && activity.images.length > 0 ? (
                  <>
                    <img
                      src={activity.images[currentImageIndex]}
                      alt={`${activity.title} - Imagen ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navegación de imágenes */}
                    {activity.images.length > 1 && (
                      <>
                        <button
                          onClick={previousImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        {/* Indicadores de imagen */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {activity.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay imágenes disponibles</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información principal */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{activity.title}</h1>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActivityTypeColor(activity.activity_type)}`}>
                      {activity.activity_type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(activity.difficulty_level)}`}>
                      {activity.difficulty_level}
                    </span>
                    {activity.is_free ? (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Gratis
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        {activity.price}€
                      </span>
                    )}
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => navigate(`/dashboard/activities/${activity.id}/edit`)}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                      title={isAdmin ? "Editar actividad (Administrador)" : "Editar actividad"}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      title={isAdmin ? "Eliminar actividad (Administrador)" : "Eliminar actividad"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                {isAdmin && !isOwner && (
                      <span className="text-xs text-gray-500 ml-2">(Modo Admin)</span>
                    )}
                  </div>
                )}
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-8">{activity.description}</p>

              {/* Información de fecha y hora */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-semibold text-gray-900">{formatDate(activity.date)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hora</p>
                    <p className="font-semibold text-gray-900">{formatTime(activity.time)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duración</p>
                    <p className="font-semibold text-gray-900">{formatDuration(activity.duration)}</p>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.location}</p>
                    <p className="text-gray-600">{activity.address && `${activity.address}, `}{activity.city}</p>
                    <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                      <Navigation className="w-4 h-4" />
                      <span>Ver en mapa</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Participantes */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Participantes</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Plazas ocupadas</span>
                    <span className="font-semibold text-gray-900">
                      {activity.current_participants} de {activity.max_participants}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isFull ? 'bg-red-500' : isAlmostFull ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(participationPercentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    {isFull ? (
                      <span className="text-red-600 text-sm font-medium flex items-center space-x-1">
                        <XCircle className="w-4 h-4" />
                        <span>Actividad completa</span>
                      </span>
                    ) : isAlmostFull ? (
                      <span className="text-yellow-600 text-sm font-medium flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>¡Últimas plazas disponibles!</span>
                      </span>
                    ) : (
                      <span className="text-green-600 text-sm font-medium flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Plazas disponibles</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Lista de participantes */}
                <div className="mt-6">
                  <ActivityParticipants 
                    activityId={activity.id} 
                    isOrganizer={isOwner}
                  />
                </div>
              </div>

              {/* Etiquetas */}
              {activity.tags && activity.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Etiquetas</h3>
                  <div className="flex flex-wrap gap-2">
                    {activity.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Rango de edad</h4>
                  <p className="text-gray-600">
                    {activity.age_min} - {activity.age_max} años
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Nivel de dificultad</h4>
                  <p className="text-gray-600">{activity.difficulty_level}</p>
                </div>
              </div>
            </div>

            {/* Reseñas */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Reseñas</h3>
                {!isOwner && isParticipating && !activity.user_review && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Escribir reseña
                  </button>
                )}
              </div>

              {activity.rating ? (
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-1">
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold text-gray-900">{activity.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-600">({activity.review_count} reseñas)</span>
                </div>
              ) : (
                <p className="text-gray-500 mb-6">Aún no hay reseñas para esta actividad</p>
              )}

              {activity.user_review && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Tu reseña</h4>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < activity.user_review!.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{activity.user_review.comment}</p>
                </div>
              )}
            </div>
          </div>

          {/* Barra lateral */}
          <div className="space-y-6">
            {/* Tarjeta de acción */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">¿Te interesa?</h3>
                <p className="text-gray-600">Únete a esta actividad y conoce gente nueva</p>
              </div>

              {isOwner ? (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">Eres el organizador de esta actividad</p>
                </div>
              ) : isParticipating ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">¡Ya estás participando!</p>
                    <p className="text-green-600 text-sm">Te esperamos el {formatDate(activity.date)}</p>
                  </div>
                  
                  <button
                    onClick={handleLeaveActivity}
                    disabled={leavingActivity}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {leavingActivity ? 'Cancelando...' : 'Cancelar participación'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleJoinActivity}
                  disabled={!canJoin || joiningActivity}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {joiningActivity ? 'Uniéndose...' : canJoin ? '¡Unirme a la actividad!' : 'Actividad completa'}
                </button>
              )}

              {!isOwner && !isParticipating && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Contactar al organizador
                  </button>
                </div>
              )}
            </div>

            {/* Información del organizador */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizador</h3>
              {activity.owner ? (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    {activity.owner.avatar_url ? (
                      <img
                        src={activity.owner.avatar_url}
                        alt={activity.owner.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{activity.owner.full_name}</h4>
                    {activity.owner.bio && (
                      <p className="text-gray-600 text-sm">{activity.owner.bio}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Organizador no disponible</h4>
                    <p className="text-gray-600 text-sm">Información del organizador no encontrada</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {activity.contact_phone && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{activity.contact_phone}</span>
                  </div>
                )}
                
                {activity.contact_email && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{activity.contact_email}</span>
                  </div>
                )}
                
                {activity.website && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a 
                      href={activity.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Visitar sitio web
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Participantes</span>
                  <span className="font-semibold text-gray-900">
                    {activity.current_participants}/{activity.max_participants}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Plazas libres</span>
                  <span className="font-semibold text-gray-900">
                    {activity.max_participants - activity.current_participants}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ocupación</span>
                  <span className="font-semibold text-gray-900">
                    {participationPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de contacto */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Contactar al organizador</h3>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Aquí implementar el envío del mensaje
                  setShowContactModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de reseña */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Escribir reseña</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                    className="p-1"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comentario</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Comparte tu experiencia..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar reseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDetail;
