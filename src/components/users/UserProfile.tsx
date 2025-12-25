import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserPlusIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  occupation?: string;
  interests?: string[];
  created_at: string;
  updated_at?: string;
}

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked' | null>(null);
  const [loadingFriendship, setLoadingFriendship] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile();
      checkIfFavorite();
      checkFriendshipStatus();
    }
  }, [id, currentUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!currentUser || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('favorite_user_id', id)
        .single();

      if (!error && data) {
        setIsFavorite(true);
      }
    } catch (error) {
      // No es favorito
    }
  };

  const toggleFavorite = async () => {
    if (!currentUser || !id) return;

    try {
      if (isFavorite) {
        // Remover de favoritos
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('favorite_user_id', id);
        setIsFavorite(false);
      } else {
        // Agregar a favoritos
        await supabase
          .from('user_favorites')
          .insert({
            user_id: currentUser.id,
            favorite_user_id: id
          });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const checkFriendshipStatus = async () => {
    if (!currentUser || !id || currentUser.id === id) {
      setFriendshipStatus(null);
      return;
    }

    try {
      // Buscar si existe una amistad entre estos usuarios
      // Primero buscamos donde el usuario actual es el que envía
      const { data: friendship1 } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('friend_id', id)
        .maybeSingle();

      // Si no encontramos, buscamos donde el usuario actual es el receptor
      const { data: friendship2 } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', id)
        .eq('friend_id', currentUser.id)
        .maybeSingle();

      const friendship = friendship1 || friendship2;

      if (!friendship) {
        setFriendshipStatus('none');
        return;
      }

      if (friendship.status === 'accepted') {
        setFriendshipStatus('accepted');
      } else if (friendship.status === 'blocked') {
        setFriendshipStatus('blocked');
      } else if (friendship.status === 'pending') {
        // Verificar quién envió la solicitud
        if (friendship.user_id === currentUser.id) {
          setFriendshipStatus('pending_sent');
        } else {
          setFriendshipStatus('pending_received');
        }
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  const sendFriendRequest = async () => {
    if (!currentUser || !id || loadingFriendship) return;

    try {
      setLoadingFriendship(true);
      
      // Verificar que no exista ya una solicitud
      const { data: existing1 } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('friend_id', id)
        .maybeSingle();

      const { data: existing2 } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', id)
        .eq('friend_id', currentUser.id)
        .maybeSingle();

      if (existing1 || existing2) {
        console.error('Ya existe una solicitud de amistad');
        await checkFriendshipStatus(); // Actualizar estado
        return;
      }

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: currentUser.id,
          friend_id: id,
          status: 'pending'
        });

      if (error) throw error;
      
      setFriendshipStatus('pending_sent');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Error al enviar la solicitud de amistad');
    } finally {
      setLoadingFriendship(false);
    }
  };

  const acceptFriendRequest = async () => {
    if (!currentUser || !id || loadingFriendship) return;

    try {
      setLoadingFriendship(true);
      
      // Buscar la solicitud pendiente donde el usuario actual es el receptor
      const { data: friendship, error: findError } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', id)
        .eq('friend_id', currentUser.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (findError || !friendship) {
        console.error('No se encontró la solicitud de amistad');
        return;
      }

      // Actualizar el estado a 'accepted'
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendship.id);

      if (updateError) throw updateError;
      
      setFriendshipStatus('accepted');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Error al aceptar la solicitud de amistad');
    } finally {
      setLoadingFriendship(false);
    }
  };

  const rejectFriendRequest = async () => {
    if (!currentUser || !id || loadingFriendship) return;

    try {
      setLoadingFriendship(true);
      
      // Buscar y eliminar la solicitud pendiente
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', id)
        .eq('friend_id', currentUser.id)
        .eq('status', 'pending');

      if (error) throw error;
      
      setFriendshipStatus('none');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Error al rechazar la solicitud de amistad');
    } finally {
      setLoadingFriendship(false);
    }
  };

  const cancelFriendRequest = async () => {
    if (!currentUser || !id || loadingFriendship) return;

    try {
      setLoadingFriendship(true);
      
      // Eliminar la solicitud enviada
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('friend_id', id)
        .eq('status', 'pending');

      if (error) throw error;
      
      setFriendshipStatus('none');
    } catch (error) {
      console.error('Error canceling friend request:', error);
      alert('Error al cancelar la solicitud de amistad');
    } finally {
      setLoadingFriendship(false);
    }
  };

  const startConversation = async () => {
    if (!currentUser || !id) return;

    try {
      // Crear o obtener conversación existente
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
        .or(`user1_id.eq.${id},user2_id.eq.${id}`)
        .single();

      if (existingConversation) {
        navigate(`/chat/${existingConversation.id}`);
        return;
      }

      // Crear nueva conversación
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user1_id: currentUser.id,
          user2_id: id,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;
      navigate(`/chat/${newConversation.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || 'Perfil no encontrado'}
          </div>
          <button
            onClick={() => navigate('/users')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver a Usuarios
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenderLabel = (gender: string) => {
    const labels: { [key: string]: string } = {
      'male': 'Masculino',
      'female': 'Femenino',
      'other': 'Otro'
    };
    return labels[gender] || gender;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón de regreso */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/users')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver a Usuarios
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header del perfil */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {profile.full_name || 'Usuario'}
                      </h1>
                      {profile.city && (
                        <div className="flex items-center text-gray-600 mt-2">
                          <MapPinIcon className="w-5 h-5 mr-2" />
                          <span>{profile.city}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-500 mt-1">
                        Miembro desde {formatDate(profile.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {profile.bio && (
                    <p className="text-gray-700 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información personal */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.occupation && (
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Ocupación: {profile.occupation}</span>
                  </div>
                )}
                {profile.gender && (
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Género: {getGenderLabel(profile.gender)}</span>
                  </div>
                )}
                {profile.date_of_birth && (
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Fecha de nacimiento: {formatDate(profile.date_of_birth)}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Teléfono: {profile.phone}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Email: {profile.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dirección */}
            {(profile.address || profile.city || profile.state || profile.postal_code) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ubicación
                </h2>
                <div className="space-y-2">
                  {profile.address && <p className="text-gray-700">{profile.address}</p>}
                  <p className="text-gray-700">
                    {[profile.city, profile.state, profile.postal_code, profile.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Intereses */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Intereses
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Acciones */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones
              </h3>
              <div className="space-y-3">
                {/* Botón de Amistad */}
                {currentUser && currentUser.id !== id && friendshipStatus !== null && (
                  <>
                    {friendshipStatus === 'none' && (
                      <button
                        onClick={sendFriendRequest}
                        disabled={loadingFriendship}
                        className="w-full flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserPlusIcon className="w-4 h-4 mr-2" />
                        {loadingFriendship ? 'Enviando...' : 'Enviar solicitud de amistad'}
                      </button>
                    )}
                    
                    {friendshipStatus === 'pending_sent' && (
                      <button
                        onClick={cancelFriendRequest}
                        disabled={loadingFriendship}
                        className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XMarkIcon className="w-4 h-4 mr-2" />
                        {loadingFriendship ? 'Cancelando...' : 'Solicitud enviada - Cancelar'}
                      </button>
                    )}
                    
                    {friendshipStatus === 'pending_received' && (
                      <div className="space-y-2">
                        <button
                          onClick={acceptFriendRequest}
                          disabled={loadingFriendship}
                          className="w-full flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckIcon className="w-4 h-4 mr-2" />
                          {loadingFriendship ? 'Aceptando...' : 'Aceptar solicitud'}
                        </button>
                        <button
                          onClick={rejectFriendRequest}
                          disabled={loadingFriendship}
                          className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XMarkIcon className="w-4 h-4 mr-2" />
                          {loadingFriendship ? 'Rechazando...' : 'Rechazar solicitud'}
                        </button>
                      </div>
                    )}
                    
                    {friendshipStatus === 'accepted' && (
                      <div className="w-full flex items-center justify-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-md border border-emerald-300">
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Son amigos
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={toggleFavorite}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                    isFavorite
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <HeartIcon className="w-4 h-4 mr-2" />
                  {isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                </button>
                
                <button
                  onClick={startConversation}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                  Enviar mensaje
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estadísticas
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Miembro desde</span>
                  <span className="font-medium">{formatDate(profile.created_at)}</span>
                </div>
                {profile.updated_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Última actualización</span>
                    <span className="font-medium">{formatDate(profile.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
