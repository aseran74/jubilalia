import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import AdminButtons from '../common/AdminButtons';
import ChatModal from './ChatModal';
import RoomDetailMap from '../maps/RoomDetailMap';
import { 
  ArrowLeft, 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Star,
  MessageCircle,
  Phone,
  Mail,
  CheckCircle,
  ChevronRight,
  Dog,
  Share2,
  Check
} from 'lucide-react';

interface RoomDetail {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  price: number;
  available_from: string;
  room_requirements: {
    bed_type: string;
    room_area: number;
    private_bathroom: boolean;
    has_balcony: boolean;
    preferred_gender: string;
    preferred_age_min: number;
    preferred_age_max: number;
    smoking_allowed: boolean;
    pets_allowed: boolean;
    pet_types?: string[];
    other_requirements?: string;
  };
  owner: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
    phone?: string;
    bio?: string;
    rating?: number;
    review_count?: number;
  };
  images: string[];
  amenities: string[];
  created_at: string;
}

const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  // Debug: verificar si isAdmin se está obteniendo correctamente
  console.log('🔍 RoomDetail - isAdmin:', isAdmin, 'type:', typeof isAdmin);
  
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRoomDetails(id);
    }
  }, [id]);

  // Debug: detectar cambios en el estado del room
  useEffect(() => {
    if (room) {
      console.log('🔄 Room state actualizado:', room);
      console.log('🖼️ Imágenes en el estado:', room.images);
      console.log('🖼️ Número de imágenes:', room.images?.length || 0);
    }
  }, [room]);

  const fetchRoomDetails = async (roomId: string) => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando carga de datos para habitación:', roomId);
      
      // Limpiar el estado anterior para evitar datos obsoletos
      setRoom(null);
      
      // Obtener la información básica de la habitación
      const { data: roomData, error: roomError } = await supabase
        .from('property_listings')
        .select(`
          id,
          title,
          description,
          address,
          city,
          postal_code,
          price,
          available_from,
          created_at,
          profile_id
        `)
        .eq('id', roomId)
        .eq('listing_type', 'room_rental')
        .single();

      if (roomError) {
        console.error('Error fetching room:', roomError);
        return;
      }

      // Obtener los requisitos específicos
      const { data: requirementsData, error: requirementsError } = await supabase
        .from('room_rental_requirements')
        .select('*')
        .eq('listing_id', roomId)
        .single();

      if (requirementsError) {
        console.error('Error fetching requirements:', requirementsError);
        return;
      }

      // Obtener el perfil del propietario
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email, phone, bio')
        .eq('id', roomData.profile_id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Obtener las imágenes
      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('image_url')
        .eq('listing_id', roomId)
        .order('image_order', { ascending: true });

      console.log('🖼️ Imágenes obtenidas:', imagesData);
      console.log('🖼️ Error de imágenes:', imagesError);

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
        return;
      }

      // Obtener las amenidades
      const { data: amenitiesData, error: amenitiesError } = await supabase
        .from('property_amenities')
        .select('amenity_name')
        .eq('listing_id', roomId)
        .eq('is_available', true);

      if (amenitiesError) {
        console.error('Error fetching amenities:', amenitiesError);
        return;
      }

      // Construir el objeto completo de la habitación
      const roomDetail: RoomDetail = {
        id: roomData.id,
        title: roomData.title,
        description: roomData.description,
        address: roomData.address,
        city: roomData.city,
        postal_code: roomData.postal_code,
        price: roomData.price,
        available_from: roomData.available_from,
        room_requirements: requirementsData,
        owner: profileData,
        images: imagesData?.map(img => img.image_url) || [],
        amenities: amenitiesData?.map(amenity => amenity.amenity_name) || [],
        created_at: roomData.created_at
      };

      console.log('🏠 Room detail construido:', roomDetail);
      console.log('🖼️ Número de imágenes:', roomDetail.images.length);
      console.log('🖼️ URLs de imágenes:', roomDetail.images);

      setRoom(roomDetail);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implementar lógica de favoritos con Supabase
  };

  const handleContact = () => {
    setShowChatModal(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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


  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: room?.title || 'Habitación en Jubilalia',
          text: room?.description || 'Mira esta habitación disponible',
          url: url,
        });
      } catch (err) {
        console.log('Error al compartir:', err);
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };


  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta habitación?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('room_rental_listings')
        .delete()
        .eq('id', roomId);

      if (error) {
        console.error('Error deleting room:', error);
        alert('Error al eliminar la habitación');
        return;
      }

      alert('Habitación eliminada correctamente');
      navigate('/dashboard/rooms');
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Error al eliminar la habitación');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando habitación...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Habitación no encontrada</h2>
          <p className="text-gray-600 mb-4">La habitación que buscas no existe o ha sido eliminada.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con botón de volver */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a la búsqueda
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galería de imágenes mejorada */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {room.images && room.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 p-2">
                  {/* Imagen principal - ocupa 2 columnas */}
                  <div className="col-span-2 relative h-80 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer">
                    <img
                      src={room.images[0]}
                      alt={room.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => window.open(room.images[0], '_blank')}
                        className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Ver más grande
                      </button>
                    </div>
                  </div>
                  
                  {/* Segunda imagen - ocupa 1 columna */}
                  {room.images.length > 1 && (
                    <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer">
                      <img
                        src={room.images[1]}
                        alt={room.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => window.open(room.images[1], '_blank')}
                          className="bg-white/90 hover:bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          Ver más
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Tercera imagen - ocupa 1 columna */}
                  {room.images.length > 2 && (
                    <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer">
                      <img
                        src={room.images[2]}
                        alt={room.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => window.open(room.images[2], '_blank')}
                          className="bg-white/90 hover:bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          Ver más
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Cuarta imagen - ocupa 1 columna */}
                  {room.images.length > 3 && (
                    <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer">
                      <img
                        src={room.images[3]}
                        alt={room.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => window.open(room.images[3], '_blank')}
                          className="bg-white/90 hover:bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          Ver más
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Quinta imagen - ocupa 1 columna */}
                  {room.images.length > 4 && (
                    <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer">
                      <img
                        src={room.images[4]}
                        alt={room.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => window.open(room.images[4], '_blank')}
                          className="bg-white/90 hover:bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          Ver más
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Indicador de más imágenes */}
                  {room.images.length > 5 && (
                    <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer">
                      <img
                        src={room.images[5]}
                        alt={room.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          +{room.images.length - 5} más
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center text-gray-500">
                    <Bed className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Sin imágenes disponibles</p>
                  </div>
                </div>
              )}
            </div>

            {/* Información de la habitación */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{room.address}, {room.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-green-600 mb-1">
                    {formatPrice(room.price)}
                  </div>
                  <div className="text-gray-500">por mes</div>
                </div>
              </div>

              {/* Badges de características */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getGenderColor(room.room_requirements.preferred_gender)}`}>
                  {getGenderLabel(room.room_requirements.preferred_gender)}
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {room.room_requirements.preferred_age_min}-{room.room_requirements.preferred_age_max} años
                </span>
                {room.room_requirements.private_bathroom && (
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Bath className="w-4 h-4 inline mr-1" />
                    Baño propio
                  </span>
                )}
                {room.room_requirements.has_balcony && (
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    🌅 Balcón
                  </span>
                )}
                                    {room.room_requirements.smoking_allowed && (
                      <span className="px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        🚬 Fumadores
                      </span>
                    )}
                {room.room_requirements.pets_allowed && (
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    <Dog className="w-4 h-4 inline mr-1" />
                    Mascotas
                  </span>
                )}
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">{room.description}</p>
              </div>

              {/* Mapa de ubicación */}
              <div className="mb-6">
                <RoomDetailMap
                  latitude={room.latitude || 40.4168}
                  longitude={room.longitude || -3.7038}
                  title={room.title}
                  location={`${room.address}, ${room.city}`}
                  className="w-full h-80"
                />
              </div>

              {/* Características y amenidades */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Características</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <Square className="w-5 h-5 mr-3 text-green-600" />
                      <span>{room.room_requirements.room_area} metros cuadrados</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Bed className="w-5 h-5 mr-3 text-blue-600" />
                      <span>Cama {room.room_requirements.bed_type}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Bath className="w-5 h-5 mr-3 text-purple-600" />
                      <span>{room.room_requirements.private_bathroom ? 'Baño privado' : 'Baño compartido'}</span>
                    </div>
                    {room.room_requirements.has_balcony && (
                      <div className="flex items-center text-gray-700">
                        <div className="w-5 h-5 mr-3">🌅</div>
                        <span>Balcón</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenidades</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {room.amenities.length > 0 ? (
                      room.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No hay amenidades específicas</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Requisitos adicionales */}
              {room.room_requirements.other_requirements && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisitos adicionales</h3>
                  <p className="text-gray-700 leading-relaxed">{room.room_requirements.other_requirements}</p>
                </div>
              )}

              {/* Información del propietario */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sobre el propietario</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    {room.owner.avatar_url ? (
                      <img 
                        src={room.owner.avatar_url} 
                        alt={room.owner.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                        {room.owner.full_name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{room.owner.full_name || 'Propietario'}</h4>
                    {room.owner.bio && (
                      <p className="text-gray-600 mb-2">{room.owner.bio}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Publicado {formatDate(room.created_at)}</span>
                      {room.owner.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span>{room.owner.rating} ({room.owner.review_count || 0} reseñas)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar con precio y acciones */}
          <div className="space-y-6">
            {/* Tarjeta de precio y acciones */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {formatPrice(room.price)}
                </div>
                <div className="text-gray-500">por mes</div>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={handleContact}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contactar
                </button>
                
                <button
                  onClick={handleFavorite}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    isFavorite 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartir
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => id && fetchRoomDetails(id)}
                  className="w-full border border-blue-300 text-blue-700 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Recargar datos
                </button>
              </div>

              {/* Botones de administrador - DEBUG */}
              <div className="border-t border-gray-200 pt-4">
                <div className="text-xs text-gray-500 mb-2">
                  DEBUG: isAdmin = {String(isAdmin)} (tipo: {typeof isAdmin})
                </div>
                {isAdmin === true && (
                  <div>
                    <div className="text-xs text-green-600 mb-2">✅ Usuario es administrador</div>
                    <AdminButtons 
                      itemId={room.id}
                      itemType="room"
                      onDelete={handleDeleteRoom}
                    />
                  </div>
                )}
                {isAdmin !== true && (
                  <div className="text-xs text-red-600">
                    ❌ Usuario NO es administrador (valor: {String(isAdmin)})
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Disponible desde:</span>
                  <span className="font-medium">{formatDate(room.available_from)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tipo de cama:</span>
                  <span className="font-medium capitalize">{room.room_requirements.bed_type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Superficie:</span>
                  <span className="font-medium">{room.room_requirements.room_area}m²</span>
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de contacto</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-3" />
                  <span className="text-sm">{room.owner.email || 'Email no disponible'}</span>
                </div>
                {room.owner.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-3" />
                    <span className="text-sm">{room.owner.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

                {/* Chat Modal */}
          <ChatModal
            isOpen={showChatModal}
            onClose={() => setShowChatModal(false)}
            recipientId={room.owner.id}
            recipientName={room.owner.full_name}
            listingId={room.id}
            listingTitle={room.title}
          />
    </div>
  );
};

export default RoomDetail;
