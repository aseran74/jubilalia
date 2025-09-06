import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import TailAdminDatePicker from '../common/TailAdminDatePicker';
import LocationSelector from '../common/LocationSelector';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface RoomFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  postal_code: string;
  price: number;
  available_from: Date | null;
  room_area: number;
  private_bathroom: boolean;
  has_balcony: boolean;
  preferred_gender: 'no_preference' | 'male' | 'female';
  preferred_age_min: number;
  preferred_age_max: number;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  pet_types: string[];
  bed_type: string;
  other_requirements: string;
  images: string[];
}

const RoomForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const isEditing = !!id;
  const [formData, setFormData] = useState<RoomFormData>({
    title: '',
    description: '',
    address: '',
    city: '',
    postal_code: '',
    price: 0,
    available_from: null,
    room_area: 0,
    private_bathroom: false,
    has_balcony: false,
    preferred_gender: 'no_preference',
    preferred_age_min: 55,
    preferred_age_max: 75,
    smoking_allowed: false,
    pets_allowed: false,
    pet_types: [],
    bed_type: 'single',
    other_requirements: '',
    images: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value)
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      available_from: date
    }));
  };

  const handlePetTypeToggle = (petType: string) => {
    setFormData(prev => ({
      ...prev,
      pet_types: prev.pet_types.includes(petType)
        ? prev.pet_types.filter(type => type !== petType)
        : [...prev.pet_types, petType]
    }));
  };

  // Cargar datos de la habitación si se está editando
  useEffect(() => {
    if (isEditing && id) {
      const fetchRoom = async () => {
        try {
          setLoadingData(true);
          console.log('🔍 RoomForm - Cargando datos para habitación ID:', id);
          
          // Obtener datos de la habitación
          const { data: roomData, error: roomError } = await supabase
            .from('property_listings')
            .select('*')
            .eq('id', id)
            .eq('listing_type', 'room_rental')
            .single();

          console.log('🔍 RoomForm - Datos de habitación:', roomData, 'Error:', roomError);
          if (roomError) throw roomError;

          // Obtener requisitos de la habitación
          const { data: requirementsData, error: requirementsError } = await supabase
            .from('room_rental_requirements')
            .select('*')
            .eq('listing_id', id)
            .single();

          console.log('🔍 RoomForm - Datos de requisitos:', requirementsData, 'Error:', requirementsError);
          if (requirementsError) throw requirementsError;

          // Obtener imágenes
          const { data: imagesData, error: imagesError } = await supabase
            .from('property_images')
            .select('image_url')
            .eq('listing_id', id)
            .order('created_at');

          console.log('🔍 RoomForm - Datos de imágenes:', imagesData, 'Error:', imagesError);
          if (imagesError) throw imagesError;

          // Actualizar el formulario con los datos obtenidos
          setFormData({
            title: roomData.title || '',
            description: roomData.description || '',
            address: roomData.address || '',
            city: roomData.city || '',
            postal_code: roomData.postal_code || '',
            price: roomData.price || 0,
            available_from: roomData.available_from ? new Date(roomData.available_from) : null,
            room_area: requirementsData.room_area || 0,
            private_bathroom: requirementsData.private_bathroom || false,
            has_balcony: requirementsData.has_balcony || false,
            preferred_gender: requirementsData.preferred_gender || 'no_preference',
            preferred_age_min: requirementsData.preferred_age_min || 18,
            preferred_age_max: requirementsData.preferred_age_max || 99,
            smoking_allowed: requirementsData.smoking_allowed || false,
            pets_allowed: requirementsData.pets_allowed || false,
            pet_types: requirementsData.pet_types || [],
            bed_type: requirementsData.bed_type || '',
            other_requirements: requirementsData.other_requirements || '',
            images: imagesData?.map(img => img.image_url) || []
          });

        } catch (error) {
          console.error('Error loading room data:', error);
          setError('Error al cargar los datos de la habitación');
        } finally {
          setLoadingData(false);
        }
      };

      fetchRoom();
    }
  }, [id, isEditing]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setLoading(true);
      const newImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Subir imagen al bucket de room-images
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('room-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('room-images')
          .getPublicUrl(filePath);

        newImages.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Error al subir las imágenes. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleLocationSelect = (location: {
    address: string;
    city: string;
    postal_code: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    setFormData(prev => ({
      ...prev,
      address: location.address,
      city: location.city,
      postal_code: location.postal_code
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      setError('Debes estar autenticado para publicar una habitación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing && id) {
        // Actualizar la habitación existente
        const { error: updateError } = await supabase
          .from('property_listings')
          .update({
            title: formData.title,
            description: formData.description,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postal_code,
            price: formData.price,
            available_from: formData.available_from ? formData.available_from.toISOString() : null,
          })
          .eq('id', id);

        if (updateError) throw updateError;

        // Actualizar los requisitos
        const { error: requirementsUpdateError } = await supabase
          .from('room_rental_requirements')
          .update({
            bed_type: formData.bed_type,
            room_area: formData.room_area,
            private_bathroom: formData.private_bathroom,
            has_balcony: formData.has_balcony,
            preferred_gender: formData.preferred_gender,
            preferred_age_min: formData.preferred_age_min,
            preferred_age_max: formData.preferred_age_max,
            smoking_allowed: formData.smoking_allowed,
            pets_allowed: formData.pets_allowed,
            pet_types: formData.pet_types.length > 0 ? formData.pet_types : [],
            other_requirements: formData.other_requirements
          })
          .eq('listing_id', id);

        if (requirementsUpdateError) throw requirementsUpdateError;

        // Actualizar imágenes si las hay
        if (formData.images.length > 0) {
          // Primero eliminar las imágenes existentes
          const { error: deleteImagesError } = await supabase
            .from('property_images')
            .delete()
            .eq('listing_id', id);

          if (deleteImagesError) {
            console.error('Error deleting existing images:', deleteImagesError);
          }

          // Luego insertar las nuevas imágenes con order_index
          const imagesData = formData.images.map((imageUrl, index) => ({
            listing_id: id,
            image_url: imageUrl,
            order_index: index
          }));

          const { error: imageError } = await supabase
            .from('property_images')
            .insert(imagesData);

          if (imageError) throw imageError;
        }

        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard/rooms');
        }, 2000);
      } else {
        // Crear nueva habitación
        const { data: listingData, error: listingError } = await supabase
          .from('property_listings')
          .insert({
            title: formData.title,
            description: formData.description,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postal_code,
            price: formData.price,
            available_from: formData.available_from ? formData.available_from.toISOString() : null,
            listing_type: 'room_rental',
            property_type: 'room',
            profile_id: profile.id,
            is_available: true
          })
          .select()
          .single();

        if (listingError) throw listingError;

      // Crear los requisitos de la habitación
      const { error: requirementsError } = await supabase
        .from('room_rental_requirements')
        .insert({
          listing_id: listingData.id,
          bed_type: formData.bed_type,
          room_area: formData.room_area,
          private_bathroom: formData.private_bathroom,
          has_balcony: formData.has_balcony,
          preferred_gender: formData.preferred_gender,
          preferred_age_min: formData.preferred_age_min,
          preferred_age_max: formData.preferred_age_max,
          smoking_allowed: formData.smoking_allowed,
          pets_allowed: formData.pets_allowed,
          pet_types: formData.pet_types.length > 0 ? formData.pet_types : [],
          other_requirements: formData.other_requirements
        });

      if (requirementsError) throw requirementsError;

      // Subir imágenes si las hay
      if (formData.images.length > 0) {
        const imagesData = formData.images.map((imageUrl, index) => ({
          listing_id: listingData.id,
          image_url: imageUrl,
          order_index: index
        }));

        const { error: imageError } = await supabase
          .from('property_images')
          .insert(imagesData);

        if (imageError) throw imageError;
      }

        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard/rooms');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating/updating room:', error);
      setError(isEditing ? 'Error al actualizar la habitación. Inténtalo de nuevo.' : 'Error al crear la habitación. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso restringido</h3>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para publicar una habitación</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/rooms')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver a Habitaciones
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? 'Editar Habitación' : 'Publicar Habitación'}
            </h1>
            <p className="text-gray-600">
              {isEditing 
                ? 'Modifica la información de tu habitación' 
                : 'Completa el formulario para publicar tu habitación disponible'
              }
            </p>
          </div>

          {loadingData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">Cargando datos de la habitación...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                {isEditing ? '¡Habitación actualizada exitosamente!' : '¡Habitación publicada exitosamente!'} Redirigiendo...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información básica */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                Información Básica
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Habitación luminosa en piso céntrico"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por mes (€) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleNumberChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="450"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe tu habitación, sus características y el ambiente..."
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2" />
                Ubicación
              </h2>
              <div className="space-y-4">
                <LocationSelector
                  onLocationSelect={handleLocationSelect}
                  placeholder="Buscar dirección, ciudad o barrio..."
                  label="Buscar ubicación"
                  required={true}
                  className="md:col-span-2"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Se completará automáticamente"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Se completará automáticamente"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Se completará automáticamente"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Características de la habitación */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Características de la Habitación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Superficie (m²) *
                  </label>
                  <input
                    type="number"
                    name="room_area"
                    value={formData.room_area}
                    onChange={handleNumberChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="18"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de cama
                  </label>
                  <select
                    name="bed_type"
                    value={formData.bed_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="single">Individual</option>
                    <option value="double">Doble</option>
                    <option value="queen">Queen</option>
                    <option value="king">King</option>
                    <option value="litera">Litera</option>
                    <option value="sofá">Sofá cama</option>
                  </select>
                </div>
                                 <div>
                   <TailAdminDatePicker
                     selected={formData.available_from}
                     onChange={handleDateChange}
                     label="Disponible desde"
                     placeholder="Seleccionar fecha de disponibilidad"
                     required={true}
                     minDate={new Date()}
                   />
                 </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="private_bathroom"
                      checked={formData.private_bathroom}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Baño propio</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="has_balcony"
                      checked={formData.has_balcony}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Balcón</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Preferencias */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Preferencias
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género preferido
                  </label>
                  <select
                    name="preferred_gender"
                    value={formData.preferred_gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="no_preference">Sin preferencia</option>
                    <option value="male">Solo hombres</option>
                    <option value="female">Solo mujeres</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad mínima
                  </label>
                  <input
                    type="number"
                    name="preferred_age_min"
                    value={formData.preferred_age_min}
                    onChange={handleNumberChange}
                    min="18"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="55"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad máxima
                  </label>
                  <input
                    type="number"
                    name="preferred_age_max"
                    value={formData.preferred_age_max}
                    onChange={handleNumberChange}
                    min="18"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="75"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="smoking_allowed"
                      checked={formData.smoking_allowed}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Fumadores permitidos</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="pets_allowed"
                      checked={formData.pets_allowed}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Mascotas permitidas</span>
                  </label>
                </div>

                {formData.pets_allowed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipos de mascotas permitidas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['perros', 'gatos', 'aves', 'roedores', 'otros'].map(petType => (
                        <label key={petType} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.pet_types.includes(petType)}
                            onChange={() => handlePetTypeToggle(petType)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">{petType}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Requisitos adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requisitos adicionales
              </label>
              <textarea
                name="other_requirements"
                value={formData.other_requirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Cualquier requisito adicional o información importante..."
              />
            </div>

            {/* Imágenes de la habitación */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="w-5 h-5 mr-2" />
                Imágenes de la Habitación
              </h2>
              <div className="space-y-4">
                {/* Subida de imágenes */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Agrega fotos de tu habitación para que los interesados puedan verla
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Puedes subir múltiples imágenes. Formatos: JPG, PNG, GIF
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="room-images-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="room-images-upload"
                    className={`inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Subiendo...
                      </>
                    ) : (
                      'Seleccionar Imágenes'
                    )}
                  </label>
                </div>

                {/* Vista previa de imágenes */}
                {formData.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Imágenes subidas ({formData.images.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {formData.images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/rooms')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publicando...
                  </>
                ) : (
                  isEditing ? 'Actualizar Habitación' : 'Publicar Habitación'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomForm;
