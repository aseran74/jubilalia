import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createPropertyListing } from '../../lib/properties';
import { supabase } from '../../lib/supabase';
import type { CreatePropertyListingComplete } from '../../types/properties';
import { 
  MapPin, 
  Euro,
  Calendar,
  AlertCircle,
  Home,
  Users,
  CheckCircle
} from 'lucide-react';
import ImageUpload from '../dashboard/ImageUpload';

const PropertyListingFormSimple: React.FC = () => {
  const { user, ensureProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreatePropertyListingComplete>({
    listing: {
      listing_type: 'room_rental',
      title: '',
      description: '',
      property_type: 'Piso',
      address: '',
      city: '',
      postal_code: '',
      country: 'España',
      price: undefined,
      price_type: 'monthly',
      currency: 'EUR',
      available_from: ''
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 0,
      private_bathroom: false,
      shared_bathroom: false,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 65,
      preferred_age_max: 80,
      smoking_allowed: false,
      tenant_smoker: false,
      pets_allowed: false,
      pet_types: [],
      tenant_pets_allowed: false,
      tenant_pet_types: [],
      tenant_gender_preference: 'any',
      tenant_age_min: 55,
      tenant_age_max: 100,
      other_requirements: ''
    },
    amenities: [],
    images: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Opciones para tipos de propiedad
  const propertyTypes = [
    'Piso', 'Casa', 'Ático', 'Dúplex', 'Estudio', 'Loft', 'Chalet', 'Mansión'
  ];

  // Opciones para amenidades
  const availableAmenities = [
    'Calefacción', 'Aire acondicionado', 'Internet/WiFi', 'Lavadora', 'Secadora',
    'Cocina equipada', 'Ascensor', 'Terraza', 'Jardín', 'Piscina', 'Parking',
    'Rampa de acceso', 'Baño adaptado', 'Puertas anchas', 'Gimnasio', 'Spa'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      listing: {
        ...prev.listing,
        [field]: value
      }
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoomRequirementChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      roomRequirements: {
        ...prev.roomRequirements!,
        [field]: value
      }
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }));
  };

  const handleImagesUploaded = (imageUrls: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...imageUrls]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.listing.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (!formData.listing.property_type.trim()) {
      newErrors.property_type = 'El tipo de propiedad es obligatorio';
    }
    
    if (!formData.listing.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }
    
    if (!formData.listing.city.trim()) {
      newErrors.city = 'La ciudad es obligatoria';
    }
    
    if (!formData.listing.price || formData.listing.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.roomRequirements?.room_area || formData.roomRequirements.room_area <= 0) {
      newErrors.room_area = 'Los metros cuadrados son obligatorios';
    }

    // Validar que haya al menos una imagen
    if (!formData.images || formData.images.length === 0) {
      newErrors.images = 'Debes subir al menos una imagen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      // Asegurar que tenemos un perfil válido
      const currentProfile = await ensureProfile();
      if (!currentProfile?.id) {
        setErrors({ general: 'No se pudo obtener el perfil del usuario. Por favor, inicia sesión de nuevo.' });
        setIsSubmitting(false);
        return;
      }

      console.log('✅ Usando perfil:', currentProfile);

      // 1. Crear el listado principal
      const { data: listing, error: listingError } = await supabase
        .from('property_listings')
        .insert({
          profile_id: currentProfile.id,
          listing_type: 'room_rental',
          title: formData.listing.title,
          description: formData.listing.description,
          price: parseFloat(formData.listing.price),
          address: formData.listing.address,
          city: formData.listing.city,
          country: formData.listing.country,
          available_from: formData.listing.available_from,
          is_available: true
        })
        .select()
        .single();

      if (listingError) throw listingError;

      const listingId = listing.id;

      // 2. Crear los requisitos específicos para habitaciones
      const { error: requirementsError } = await supabase
        .from('room_rental_requirements')
        .insert({
          listing_id: listingId,
          has_private_bathroom: formData.roomRequirements?.private_bathroom,
          is_shared: formData.roomRequirements?.shared_bathroom,
          smoking_allowed: formData.roomRequirements?.smoking_allowed,
          gender_preference: formData.roomRequirements?.preferred_gender,
          pets_allowed: formData.roomRequirements?.pets_allowed,
          pet_types: formData.roomRequirements?.pet_types,
          age_range: formData.roomRequirements?.preferred_age_min + '-' + formData.roomRequirements?.preferred_age_max
        });

      if (requirementsError) throw requirementsError;

      // 3. Crear las imágenes
      if (formData.images.length > 0) {
        const imagesData = formData.images.map((imageUrl, index) => ({
          listing_id: listingId,
          image_url: imageUrl,
          image_order: index + 1,
          is_primary: index === 0
        }));

        const { error: imagesError } = await supabase
          .from('property_images')
          .insert(imagesData);

        if (imagesError) throw imagesError;
      }

      setSuccessMessage('¡Habitación publicada exitosamente! Redirigiendo...');
      
      setTimeout(() => {
        navigate('/dashboard/rooms/search');
      }, 2000);

    } catch (error) {
      console.error('Error creating room listing:', error);
      setErrors({ general: `Error al crear el listado: ${error instanceof Error ? error.message : 'Error desconocido'}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Publicar Habitación
          </h1>
          <p className="text-lg text-gray-600">
            Completa todos los campos para publicar tu habitación
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sección 1: Información básica */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Home className="w-6 h-6 mr-3 text-blue-500" />
                1. Información básica de la habitación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del anuncio *
                  </label>
                  <input
                    type="text"
                    value={formData.listing.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Habitación luminosa en piso céntrico"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de propiedad *
                  </label>
                  <select
                    value={formData.listing.property_type}
                    onChange={(e) => handleInputChange('property_type', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.property_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.property_type && <p className="text-red-500 text-sm mt-1">{errors.property_type}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.listing.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe tu habitación, sus características y lo que buscas..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección completa *
                  </label>
                  <input
                    type="text"
                    value={formData.listing.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Calle, número, piso..."
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={formData.listing.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Madrid, Barcelona..."
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código postal
                  </label>
                  <input
                    type="text"
                    value={formData.listing.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="28001"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Precio y disponibilidad */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Euro className="w-6 h-6 mr-3 text-green-500" />
                2. Precio y disponibilidad
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio mensual *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.listing.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponible desde *
                  </label>
                  <input
                    type="date"
                    value={formData.listing.available_from}
                    onChange={(e) => handleInputChange('available_from', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda
                  </label>
                  <select
                    value={formData.listing.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 3: Características de la habitación */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-purple-500" />
                3. Características de la habitación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de cama *
                  </label>
                  <select
                    value={formData.roomRequirements?.bed_type || 'single'}
                    onChange={(e) => handleRoomRequirementChange('bed_type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="single">Cama individual</option>
                    <option value="double">Cama doble</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metros cuadrados *
                  </label>
                  <input
                    type="number"
                    value={formData.roomRequirements?.room_area || ''}
                    onChange={(e) => handleRoomRequirementChange('room_area', parseFloat(e.target.value))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.room_area ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="15"
                    min="5"
                    step="0.5"
                  />
                  {errors.room_area && <p className="text-red-500 text-sm mt-1">{errors.room_area}</p>}
                </div>

                {/* CAMPOS ESPECÍFICOS SOLICITADOS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Tiene baño propio?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="private_bathroom"
                        checked={formData.roomRequirements?.private_bathroom === true}
                        onChange={() => handleRoomRequirementChange('private_bathroom', true)}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="private_bathroom"
                        checked={formData.roomRequirements?.private_bathroom === false}
                        onChange={() => handleRoomRequirementChange('private_bathroom', false)}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Debe compartir baño?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="shared_bathroom"
                        checked={formData.roomRequirements?.shared_bathroom === true}
                        onChange={() => handleRoomRequirementChange('shared_bathroom', true)}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="shared_bathroom"
                        checked={formData.roomRequirements?.shared_bathroom === false}
                        onChange={() => handleRoomRequirementChange('shared_bathroom', false)}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Tiene balcón?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="has_balcony"
                        checked={formData.roomRequirements?.has_balcony === true}
                        onChange={() => handleRoomRequirementChange('has_balcony', true)}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="has_balcony"
                        checked={formData.roomRequirements?.has_balcony === false}
                        onChange={() => handleRoomRequirementChange('has_balcony', false)}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferencia de género
                  </label>
                  <select
                    value={formData.roomRequirements?.preferred_gender || 'any'}
                    onChange={(e) => handleRoomRequirementChange('preferred_gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="any">Indiferente</option>
                    <option value="female">Solo mujeres</option>
                    <option value="male">Solo hombres</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad mínima preferida
                  </label>
                  <input
                    type="number"
                    value={formData.roomRequirements?.preferred_age_min || 65}
                    onChange={(e) => handleRoomRequirementChange('preferred_age_min', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="65"
                    min="55"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad máxima preferida
                  </label>
                  <input
                    type="number"
                    value={formData.roomRequirements?.preferred_age_max || 80}
                    onChange={(e) => handleRoomRequirementChange('preferred_age_max', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="80"
                    min="55"
                    max="100"
                  />
                </div>

                {/* CAMPOS ESPECÍFICOS SOLICITADOS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Se permite fumar en la habitación?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="smoking_allowed"
                        checked={formData.roomRequirements?.smoking_allowed === true}
                        onChange={() => handleRoomRequirementChange('smoking_allowed', true)}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="smoking_allowed"
                        checked={formData.roomRequirements?.smoking_allowed === false}
                        onChange={() => handleRoomRequirementChange('smoking_allowed', false)}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Se permiten mascotas?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pets_allowed"
                        checked={formData.roomRequirements?.pets_allowed === true}
                        onChange={() => handleRoomRequirementChange('pets_allowed', true)}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pets_allowed"
                        checked={formData.roomRequirements?.pets_allowed === false}
                        onChange={() => handleRoomRequirementChange('pets_allowed', false)}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                {formData.roomRequirements?.pets_allowed && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipos de mascotas permitidas
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Perro', 'Gato', 'Pájaro', 'Conejo', 'Hamster', 'Otros'].map((petType) => (
                        <label key={petType} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.roomRequirements?.pet_types?.includes(petType) || false}
                            onChange={(e) => {
                              const currentTypes = formData.roomRequirements?.pet_types || [];
                              if (e.target.checked) {
                                handleRoomRequirementChange('pet_types', [...currentTypes, petType]);
                              } else {
                                handleRoomRequirementChange('pet_types', currentTypes.filter(t => t !== petType));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{petType}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Otros requisitos o preferencias
                  </label>
                  <textarea
                    value={formData.roomRequirements?.other_requirements || ''}
                    onChange={(e) => handleRoomRequirementChange('other_requirements', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe cualquier otro requisito o preferencia específica..."
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Amenidades e imágenes */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                4. Amenidades e imágenes
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Amenidades disponibles
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableAmenities.map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.amenities?.includes(amenity) || false}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imágenes de la habitación
                  </label>
                                     <ImageUpload 
                     onImagesUploaded={handleImagesUploaded}
                     maxImages={5}
                     className="mb-4"
                   />
                   {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                  {formData.images && formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        {formData.images.length} imagen(es) subida(s) a Supabase Storage
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                        {formData.images.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={imageUrl} 
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }))
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mensaje de éxito */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-green-700">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error general */}
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Publicando...' : 'Publicar Habitación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyListingFormSimple;
