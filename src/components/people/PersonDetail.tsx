import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { MapPin, Phone, Mail, Home, Users, ArrowLeft, Briefcase, X, ChevronLeft, ChevronRight, Heart, Music, Camera, BookOpen, Gamepad2, Dumbbell, UtensilsCrossed, Film, Plane, Car, Coffee, Palette, TreePine, Waves, Mountain, UserPlus, Check, XCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import UserContent from '../profile/UserContent';

interface Person {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  city?: string;
  address?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  interests?: string[];
  occupation?: string;
  phone?: string;
  whatsapp?: string;
  has_room_to_share?: boolean;
  wants_to_find_roommate?: boolean;
}

const PersonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile: currentProfile } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked' | null>(null);
  const [loadingFriendship, setLoadingFriendship] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPerson();
      fetchInterestsAndGallery();
    }
  }, [id]);

  const checkFriendshipStatus = useCallback(async () => {
    if (!currentProfile || !id || currentProfile.id === id) {
      setFriendshipStatus(null);
      return;
    }

    try {
      // Buscar si existe una amistad entre estos usuarios
      // Primero buscamos donde el usuario actual es el que envía
      const { data: friendship1 } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', currentProfile.id)
        .eq('friend_id', id)
        .maybeSingle();

      // Si no encontramos, buscamos donde el usuario actual es el receptor
      const { data: friendship2 } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', id)
        .eq('friend_id', currentProfile.id)
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
        if (friendship.user_id === currentProfile.id) {
          setFriendshipStatus('pending_sent');
        } else {
          setFriendshipStatus('pending_received');
        }
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  }, [currentProfile, id]);

  useEffect(() => {
    if (id && currentProfile) {
      checkFriendshipStatus();
    }
  }, [id, currentProfile, checkFriendshipStatus]);

  const fetchPerson = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPerson(data);
    } catch (error) {
      console.error('Error fetching person:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterestsAndGallery = async () => {
    if (!id) return;
    
    try {
      // Obtener intereses
      const { data: profileData } = await supabase
        .from('profiles')
        .select('interests')
        .eq('id', id)
        .single();
      
      if (profileData?.interests) {
        setInterests(profileData.interests);
      }

      // Obtener todas las imágenes del usuario
      const images: string[] = [];

      // Imágenes de posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('featured_image_url')
        .eq('profile_id', id)
        .eq('is_published', true)
        .not('featured_image_url', 'is', null);
      
      if (postsData) {
        postsData.forEach(post => {
          if (post.featured_image_url) images.push(post.featured_image_url);
        });
      }

      // Imágenes de actividades
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('id')
        .eq('profile_id', id)
        .eq('is_active', true);
      
      if (activitiesData && activitiesData.length > 0) {
        const activityIds = activitiesData.map(a => a.id);
        const { data: activityImages } = await supabase
          .from('activity_images')
          .select('image_url')
          .in('activity_id', activityIds)
          .order('image_order', { ascending: true });
        
        if (activityImages) {
          activityImages.forEach(img => images.push(img.image_url));
        }
      }

      // Imágenes de propiedades
      const { data: propertiesData } = await supabase
        .from('property_listings')
        .select('id')
        .eq('profile_id', id)
        .eq('is_available', true);
      
      if (propertiesData && propertiesData.length > 0) {
        const propertyIds = propertiesData.map(p => p.id);
        const { data: propertyImages } = await supabase
          .from('property_images')
          .select('image_url')
          .in('listing_id', propertyIds)
          .order('image_order', { ascending: true });
        
        if (propertyImages) {
          propertyImages.forEach(img => images.push(img.image_url));
        }
      }

      // Imágenes del perfil (profile_photos)
      const { data: profilePhotosData } = await supabase
        .from('profile_photos')
        .select('image_url')
        .eq('profile_id', id)
        .order('image_order', { ascending: true });
      
      if (profilePhotosData) {
        profilePhotosData.forEach(photo => images.push(photo.image_url));
      }

      // Limitar a 20 imágenes
      setAllImages(images.slice(0, 20));
    } catch (error) {
      console.error('Error fetching interests and gallery:', error);
    }
  };

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Socio no encontrado</h2>
          <button
            onClick={() => navigate('/dashboard/users')}
            className="text-blue-600 hover:text-blue-700"
          >
            Volver a buscar gente
          </button>
        </div>
      </div>
    );
  }

  const age = person.date_of_birth 
    ? Math.floor((new Date().getTime() - new Date(person.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const handleWhatsAppClick = () => {
    if (person.whatsapp) {
      const cleanNumber = person.whatsapp.replace(/\s+/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  const handlePhoneClick = () => {
    if (person.phone) {
      window.location.href = `tel:${person.phone}`;
    }
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${person.email}`;
  };

  const handleMessageClick = () => {
    if (!person) return;
    navigate('/dashboard/messages', { 
      state: { 
        startNewChat: true, 
        otherUserId: person.id, 
        otherUserName: person.full_name || 'Usuario',
        otherUserAvatar: person.avatar_url || undefined
      } 
    });
  };

  const sendFriendRequest = async () => {
    if (!currentProfile || !id || loadingFriendship) return;

    try {
      setLoadingFriendship(true);
      
      // Verificar que no exista ya una solicitud
      const { data: existing1 } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', currentProfile.id)
        .eq('friend_id', id)
        .maybeSingle();

      const { data: existing2 } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', id)
        .eq('friend_id', currentProfile.id)
        .maybeSingle();

      if (existing1 || existing2) {
        console.error('Ya existe una solicitud de amistad');
        await checkFriendshipStatus(); // Actualizar estado
        return;
      }

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: currentProfile.id,
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
    if (!currentProfile || !id || loadingFriendship) return;

    try {
      setLoadingFriendship(true);
      
      // Buscar la solicitud pendiente donde el usuario actual es el receptor
      const { data: friendship, error: findError } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', id)
        .eq('friend_id', currentProfile.id)
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
    if (!currentProfile || !id || loadingFriendship) return;

    try {
      setLoadingFriendship(true);
      
      // Buscar y eliminar la solicitud pendiente
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', id)
        .eq('friend_id', currentProfile.id)
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
    if (!currentProfile || !id || loadingFriendship) return;

    try {
      setLoadingFriendship(true);
      
      // Eliminar la solicitud enviada
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', currentProfile.id)
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

  // Función para obtener el icono según el interés
  const getInterestIcon = (interest: string) => {
    const interestLower = interest.toLowerCase();
    
    // Mapeo de intereses comunes a iconos
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      'música': Music,
      'musica': Music,
      'fotografía': Camera,
      'fotografia': Camera,
      'foto': Camera,
      'lectura': BookOpen,
      'libros': BookOpen,
      'leer': BookOpen,
      'videojuegos': Gamepad2,
      'gaming': Gamepad2,
      'juegos': Gamepad2,
      'deporte': Dumbbell,
      'deportes': Dumbbell,
      'ejercicio': Dumbbell,
      'gimnasio': Dumbbell,
      'cocina': UtensilsCrossed,
      'gastronomía': UtensilsCrossed,
      'gastronomia': UtensilsCrossed,
      'cine': Film,
      'películas': Film,
      'peliculas': Film,
      'viajes': Plane,
      'viajar': Plane,
      'turismo': Plane,
      'coche': Car,
      'coches': Car,
      'automóviles': Car,
      'automoviles': Car,
      'café': Coffee,
      'cafe': Coffee,
      'arte': Palette,
      'pintura': Palette,
      'dibujo': Palette,
      'naturaleza': TreePine,
      'senderismo': Mountain,
      'montaña': Mountain,
      'montana': Mountain,
      'playa': Waves,
      'mar': Waves,
      'amor': Heart,
      'amistad': Heart,
    };

    // Buscar coincidencia exacta o parcial
    for (const [key, Icon] of Object.entries(iconMap)) {
      if (interestLower.includes(key) || key.includes(interestLower)) {
        return Icon;
      }
    }

    // Icono por defecto
    return Heart;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/users')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a buscar gente
          </button>
        </div>

        {/* Perfil */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header con avatar */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-12">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {person.avatar_url ? (
                  <img
                    src={person.avatar_url}
                    alt={person.full_name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-4xl border-4 border-white shadow-lg">
                    {person.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="text-white flex-1">
                <h1 className="text-3xl font-bold mb-2">{person.full_name}</h1>
                {age && <p className="text-xl opacity-90">{age} años</p>}
                {person.gender && (
                  <span className="inline-block mt-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm text-black font-medium">
                    {person.gender === 'male' ? 'Hombre' : person.gender === 'female' ? 'Mujer' : 'Otro'}
                  </span>
                )}
                
                {/* Intereses */}
                {interests.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-3">
                      {interests.map((interest, index) => {
                        const InterestIcon = getInterestIcon(interest);
                        return (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 text-white text-sm font-medium"
                          >
                            <InterestIcon className="w-4 h-4" />
                            {interest}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Galería */}
                {allImages.length > 0 && (
                  <div className="mt-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {allImages.slice(0, 6).map((image, index) => (
                        <div
                          key={index}
                          onClick={() => openGallery(index)}
                          className="relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer group flex-shrink-0 border-2 border-white border-opacity-30 hover:border-opacity-100 transition-all"
                        >
                          <img
                            src={image}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {allImages.length > 6 && index === 5 && (
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-xs font-bold">
                              +{allImages.length - 6}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-8 space-y-6">
            {/* Estado de búsqueda - EXCLUYENTE */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Estado de búsqueda</h3>
              {person.has_room_to_share && !person.wants_to_find_roommate && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Tiene habitación disponible</p>
                    <p className="text-sm text-green-700">Quiere ser anfitrión y compartir su vivienda</p>
                  </div>
                </div>
              )}
              {person.wants_to_find_roommate && !person.has_room_to_share && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Busca compañero/a</p>
                    <p className="text-sm text-blue-700">Quiere ser huésped y compartir gastos y experiencias</p>
                  </div>
                </div>
              )}
              {!person.has_room_to_share && !person.wants_to_find_roommate && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sin preferencias activas</p>
                    <p className="text-sm text-gray-600">No está buscando activamente compartir vivienda</p>
                  </div>
                </div>
              )}
            </div>

            {/* Biografía */}
            {person.bio && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre mí</h3>
                <p className="text-gray-700 leading-relaxed">{person.bio}</p>
              </div>
            )}

            {/* Ubicación */}
            {(person.address || person.city) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ubicación</h3>
                <div className="flex items-start text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 mt-0.5 text-gray-400" />
                  <div>
                    {person.address && <div>{person.address}</div>}
                    <div>
                      {person.postal_code && `${person.postal_code}, `}
                      {person.city}
                      {person.state && `, ${person.state}`}
                    </div>
                    {person.country && <div className="text-gray-500 text-sm">{person.country}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Ocupación */}
            {person.occupation && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ocupación</h3>
                <div className="flex items-center text-gray-700">
                  <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                  {person.occupation}
                </div>
              </div>
            )}

            {/* Solicitud de Amistad */}
            {currentProfile && currentProfile.id !== id && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amistad</h3>
                <div className="space-y-3">
                  {friendshipStatus === null && (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                      <span>Cargando estado...</span>
                    </div>
                  )}
                  
                  {friendshipStatus === 'none' && (
                    <button
                      onClick={sendFriendRequest}
                      disabled={loadingFriendship}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <UserPlus className="w-5 h-5" />
                      {loadingFriendship ? 'Enviando...' : 'Enviar solicitud de amistad'}
                    </button>
                  )}
                  
                  {friendshipStatus === 'pending_sent' && (
                    <button
                      onClick={cancelFriendRequest}
                      disabled={loadingFriendship}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <XCircle className="w-5 h-5" />
                      {loadingFriendship ? 'Cancelando...' : 'Solicitud enviada - Cancelar'}
                    </button>
                  )}
                  
                  {friendshipStatus === 'pending_received' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={acceptFriendRequest}
                        disabled={loadingFriendship}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        <Check className="w-5 h-5" />
                        {loadingFriendship ? 'Aceptando...' : 'Aceptar'}
                      </button>
                      <button
                        onClick={rejectFriendRequest}
                        disabled={loadingFriendship}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        <XCircle className="w-5 h-5" />
                        {loadingFriendship ? 'Rechazando...' : 'Rechazar'}
                      </button>
                    </div>
                  )}
                  
                  {friendshipStatus === 'accepted' && (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-300 font-medium">
                      <Check className="w-5 h-5" />
                      Son amigos
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Opciones de contacto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contactar</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {person.whatsapp && (
                  <button
                    onClick={handleWhatsAppClick}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FaWhatsapp className="w-6 h-6" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </button>
                )}
                {person.phone && (
                  <button
                    onClick={handlePhoneClick}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Phone className="w-6 h-6" />
                    <span className="text-sm font-medium">Teléfono</span>
                  </button>
                )}
                <button
                  onClick={handleEmailClick}
                  className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-6 h-6" />
                  <span className="text-sm font-medium">Email</span>
                </button>
                <button
                  onClick={handleMessageClick}
                  className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Mail className="w-6 h-6" />
                  <span className="text-sm font-medium">Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del usuario: Posts, Actividades, Propiedades */}
        {id && (
          <div className="mt-8">
            <UserContent userId={id} />
          </div>
        )}
      </div>

      {/* Modal de Galería */}
      {galleryOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setGalleryOpen(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setGalleryOpen(false);
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 text-white hover:text-gray-300 z-10"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 text-white hover:text-gray-300 z-10"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <div className="max-w-7xl mx-auto px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={allImages[currentImageIndex]}
              alt={`Imagen ${currentImageIndex + 1}`}
              className="max-h-[90vh] max-w-full object-contain"
            />
            <div className="text-center text-white mt-4">
              <p className="text-sm">
                {currentImageIndex + 1} / {allImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonDetail;

