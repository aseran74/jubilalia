import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  HeartIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShareIcon,
  ClockIcon,
  UserIcon as UserIcon2,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

interface RoomDetailProps {
  room?: {
    id: string;
    title: string;
    description: string;
    address: string;
    city: string;
    postal_code?: string;
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
      id: string;
      full_name: string;
      avatar_url?: string;
      email?: string;
      phone?: string;
      bio?: string;
      rating?: number;
      review_count?: number;
    };
    created_at: string;
    rating?: number;
    review_count?: number;
    amenities?: string[];
    other_requirements?: string;
  };
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

const RoomDetail: React.FC<RoomDetailProps> = ({
  room,
  onFavorite,
  isFavorite = false
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [roomData, setRoomData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Función para cargar los datos de la habitación
  const fetchRoomData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError('');
      console.log('🔄 Cargando datos de habitación:', id);
      
      // Obtener el listing principal
      const { data: listingData, error: listingError } = await supabase
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
          profile_id,
          listing_type,
          is_available
        `)
        .eq('id', id)
        .eq('listing_type', 'room_rental')
        .single();

      if (listingError) {
        console.error('Error fetching listing:', listingError);
        setError('No se pudo cargar la información de la habitación');
        return;
      }

      console.log('📊 Datos del listing obtenidos:', listingData);

      // Obtener los requisitos de la habitación
      const { data: requirementsData, error: requirementsError } = await supabase
        .from('room_rental_requirements')
        .select('*')
        .eq('listing_id', id)
        .single();

      if (requirementsError) {
        console.error('Error fetching requirements:', requirementsError);
        setError('No se pudo cargar los requisitos de la habitación');
        return;
      }

      console.log('📋 Datos de requisitos obtenidos:', requirementsData);

      // Obtener el perfil del propietario
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email, phone')
        .eq('id', listingData.profile_id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('No se pudo cargar la información del propietario');
        return;
      }

      console.log('👤 Datos del perfil obtenidos:', profileData);

      // Obtener las imágenes
      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('image_url')
        .eq('listing_id', id);

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
      }

      console.log('🖼️ Datos de imágenes obtenidos:', imagesData);

      // Combinar todos los datos
      const combinedData = {
        ...listingData,
        ...requirementsData,
        owner: profileData,
        images: imagesData?.map(img => img.image_url) || [],
        price_per_month: listingData.price,
        room_area: requirementsData.room_area,
        private_bathroom: requirementsData.private_bathroom,
        has_balcony: requirementsData.has_balcony,
        preferred_gender: requirementsData.preferred_gender,
        preferred_age_min: requirementsData.preferred_age_min,
        preferred_age_max: requirementsData.preferred_age_max,
        smoking_allowed: requirementsData.smoking_allowed,
        pets_allowed: requirementsData.pets_allowed,
        pet_types: requirementsData.pet_types || [],
        other_requirements: requirementsData.other_requirements
      };

      console.log('🎉 Datos combinados:', combinedData);
      setRoomData(combinedData);

    } catch (error) {
      console.error('Error fetching room data:', error);
      setError('Error al cargar los datos de la habitación');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos cuando cambie el ID
  useEffect(() => {
    if (id) {
      fetchRoomData();
    }
  }, [id]);

  // Usar datos reales o mock como fallback
  const currentRoom = roomData || room || {
    id: id || '1',
    title: 'Habitación luminosa en piso céntrico',
    description: 'Hermosa habitación en un piso completamente reformado, ubicado en el centro de la ciudad. La habitación cuenta con mucha luz natural, armario empotrado y escritorio. El piso tiene cocina equipada, salón amplio y está muy bien comunicado con transporte público.',
    address: 'Calle Gran Vía 123',
    city: 'Madrid',
    postal_code: '28013',
    price_per_month: 450,
    room_area: 18,
    private_bathroom: true,
    has_balcony: true,
    preferred_gender: 'any' as const,
    preferred_age_min: 55,
    preferred_age_max: 75,
    smoking_allowed: false,
    pets_allowed: true,
    pet_types: ['perros pequeños', 'gatos'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop'
    ],
    owner: {
      id: 'owner-1',
      full_name: 'María García',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      email: 'maria.garcia@email.com',
      phone: '+34 600 123 456',
      bio: 'Soy una jubilada activa que disfruta de la compañía y la conversación. Me encanta cocinar y compartir momentos en familia.',
      rating: 4.8,
      review_count: 12
    },
    created_at: '2024-01-15T10:00:00Z',
    rating: 4.9,
    review_count: 8,
    amenities: ['WiFi', 'Calefacción', 'Aire acondicionado', 'Lavadora', 'Secadora', 'Parking'],
    other_requirements: 'Buscamos una persona tranquila, respetuosa y que valore la convivencia pacífica.'
  };

  const handleFavorite = async () => {
    if (!onFavorite) return;
    setIsLoading(true);
    try {
      await onFavorite(currentRoom.id);
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
      month: 'long',
      year: 'numeric'
    });
  };

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowContactForm(true);
  };

  const handleSendMessage = () => {
    // Aquí iría la lógica para enviar el mensaje
    console.log('Mensaje enviado:', contactMessage);
    setShowContactForm(false);
    setContactMessage('');
    // Mostrar notificación de éxito
  };

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de la habitación...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay alguno
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard/rooms')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Volver a Habitaciones
          </button>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Habitación no encontrada</h3>
          <p className="text-gray-600 mb-4">La habitación que buscas no existe o ha sido eliminada.</p>
          <button
            onClick={() => navigate('/dashboard/rooms')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Volver a Habitaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con botón de regreso */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal - Imágenes y descripción */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galería de imágenes */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-96 bg-gray-200">
                {currentRoom.images && currentRoom.images.length > 0 ? (
                  <>
                    <img
                      src={currentRoom.images[currentImageIndex]}
                      alt={currentRoom.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Navegación de imágenes */}
                    {currentRoom.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : currentRoom.images.length - 1)}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                          <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev < currentRoom.images.length - 1 ? prev + 1 : 0)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                          <ArrowLeftIcon className="w-5 h-5 rotate-180" />
                        </button>
                        {/* Indicadores */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {currentRoom.images.map((_: string, index: number) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-all ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                                     <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                     <div className="text-center text-gray-400">
                       <BuildingOfficeIcon className="w-16 h-16 mx-auto mb-4" />
                       <p>Sin imágenes disponibles</p>
                     </div>
                   </div>
                )}
              </div>
            </div>

            {/* Información principal */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentRoom.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <span className="text-lg">{currentRoom.address}, {currentRoom.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-green-600 mb-1">
                    {formatPrice(currentRoom.price_per_month)}
                  </div>
                  <div className="text-gray-500">por mes</div>
                </div>
              </div>

              {/* Badges de características */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getGenderColor(currentRoom.preferred_gender)}`}>
                  {getGenderLabel(currentRoom.preferred_gender)}
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {currentRoom.preferred_age_min}-{currentRoom.preferred_age_max} años
                </span>
                                 {currentRoom.private_bathroom && (
                   <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                     <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                     Baño propio
                   </span>
                 )}
                {currentRoom.has_balcony && (
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    🌅 Balcón
                  </span>
                )}
                                 {currentRoom.smoking_allowed && (
                   <span className="px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                     <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                     Fumadores
                   </span>
                 )}
                                 {currentRoom.pets_allowed && (
                   <span className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                     <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                     Mascotas
                   </span>
                 )}
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">{currentRoom.description}</p>
              </div>

              {/* Características */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Características</h3>
                  <div className="space-y-2">
                                         <div className="flex items-center text-gray-700">
                       <BuildingOfficeIcon className="w-5 h-5 mr-3 text-green-600" />
                       <span>{currentRoom.room_area} metros cuadrados</span>
                     </div>
                     <div className="flex items-center text-gray-700">
                       <BuildingOfficeIcon className="w-5 h-5 mr-3 text-blue-600" />
                       <span>{currentRoom.private_bathroom ? 'Baño privado' : 'Baño compartido'}</span>
                     </div>
                    {currentRoom.has_balcony && (
                      <div className="flex items-center text-gray-700">
                        <div className="w-5 h-5 mr-3">🌅</div>
                        <span>Balcón</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {currentRoom.amenities?.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Otros requisitos */}
              {currentRoom.other_requirements && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisitos adicionales</h3>
                  <p className="text-gray-700 leading-relaxed">{currentRoom.other_requirements}</p>
                </div>
              )}

              {/* Información del propietario */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sobre el propietario</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    {currentRoom.owner?.avatar_url ? (
                      <img 
                        src={currentRoom.owner.avatar_url} 
                        alt={currentRoom.owner.full_name || 'Propietario'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                        {currentRoom.owner?.full_name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{currentRoom.owner?.full_name || 'Propietario'}</h4>
                    {currentRoom.owner?.bio && (
                      <p className="text-gray-600 mb-2">{currentRoom.owner.bio}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Publicado {formatDate(currentRoom.created_at)}</span>
                      {currentRoom.owner?.rating && (
                        <div className="flex items-center">
                          <StarIcon className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span>{currentRoom.owner.rating} ({currentRoom.owner.review_count || 0} reseñas)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Precio y acciones */}
          <div className="space-y-6">
            {/* Card de precio y reserva */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {formatPrice(currentRoom.price_per_month)}
                </div>
                <div className="text-gray-500">por mes</div>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={handleContact}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                  Contactar
                </button>
                
                <button
                  onClick={handleFavorite}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    isFavorite 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <HeartIcon className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'En favoritos' : 'Añadir a favoritos'}
                </button>

                <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Compartir
                </button>
              </div>

              {/* Información adicional */}
              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span>Disponible desde {formatDate(currentRoom.created_at)}</span>
                  </div>
                  <div className="flex items-center">

                    <UserIcon className="w-4 h-4 mr-2" />
                    <span>Preferencia: {getGenderLabel(currentRoom.preferred_gender)}</span>
                  </div>
                  <div className="flex items-center">
                    <UserIcon2 className="w-4 h-4 mr-2" />
                    <span>Edad: {currentRoom.preferred_age_min}-{currentRoom.preferred_age_max} años</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de contacto</h3>
              <div className="space-y-3">
                {currentRoom.owner?.phone && (
                  <div className="flex items-center text-gray-700">
                    <PhoneIcon className="w-4 h-4 mr-3 text-green-600" />
                    <span className="text-sm">{currentRoom.owner.phone}</span>
                  </div>
                )}
                {currentRoom.owner?.email && (
                  <div className="flex items-center text-gray-700">
                    <EnvelopeIcon className="w-4 h-4 mr-3 text-blue-600" />
                    <span className="text-sm">{currentRoom.owner.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de contacto */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Enviar mensaje</h3>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowContactForm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendMessage}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;
