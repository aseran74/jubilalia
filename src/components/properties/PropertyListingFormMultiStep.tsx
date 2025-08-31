import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Calendar, Home, Users, Euro, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createPropertyListing } from '../../lib/properties';
import type { CreatePropertyListingComplete } from '../../types/properties';

const PropertyListingFormMultiStep: React.FC = () => {
  const { user, profile, syncProfileWithSupabase } = useAuth();
  const navigate = useNavigate();
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
      price: 0,
      price_type: 'monthly',
      currency: 'EUR',
      bedrooms: undefined,
      bathrooms: undefined,
      total_area: undefined,
      available_from: '',
      available_until: ''
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 0,
      private_bathroom: false,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 65,
      preferred_age_max: 80,
      smoking_allowed: false,
      pets_allowed: false,
      pet_types: [],
      other_requirements: ''
    },
    amenities: [],
    images: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleRoomRequirementsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      roomRequirements: {
        ...prev.roomRequirements,
        [field]: value
      }
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => index !== i)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validación básica
    if (!formData.listing.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.listing.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.listing.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (!formData.listing.city.trim()) newErrors.city = 'La ciudad es obligatoria';
    if (!formData.listing.postal_code.trim()) newErrors.postal_code = 'El código postal es obligatorio';
    if (!formData.listing.bedrooms) newErrors.bedrooms = 'El número de habitaciones es obligatorio';
    if (!formData.listing.bathrooms) newErrors.bathrooms = 'El número de baños es obligatorio';
    if (!formData.listing.total_area) newErrors.total_area = 'La superficie total es obligatoria';
    if (!formData.listing.available_from) newErrors.available_from = 'La fecha de disponibilidad es obligatoria';
    if (!formData.listing.price || formData.listing.price <= 0) newErrors.price = 'El precio es obligatorio';
    if (!formData.roomRequirements.room_area || formData.roomRequirements.room_area <= 0) {
      newErrors.room_area = 'La superficie de la habitación es obligatoria';
    }
    if (formData.roomRequirements.preferred_age_min >= formData.roomRequirements.preferred_age_max) {
      newErrors.age_range = 'La edad mínima debe ser menor que la máxima';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Verificar que tenemos un perfil
      if (!profile) {
        console.log('📝 No hay perfil, intentando sincronizar...');
        await syncProfileWithSupabase();
        
        // Si aún no hay perfil después de sincronizar, mostrar error
        if (!profile) {
          setErrors({ general: 'No se pudo crear el perfil de usuario. Inténtalo de nuevo.' });
          setIsSubmitting(false);
          return;
        }
      }

      console.log('✅ Usando perfil:', profile);

      // Preparar los datos con user_id y profile_id
      const submissionData = {
        ...formData,
        listing: {
          ...formData.listing,
          user_id: user!.uid,
          profile_id: profile.id || profile.firebase_uid // Usar firebase_uid como fallback
        }
      };

      const result = await createPropertyListing(submissionData);

      if (result.success) {
        navigate('/properties');
      } else {
        setErrors({ general: result.error || 'Error al crear la publicación' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ general: 'Error inesperado al enviar el formulario' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Publicar Propiedad
          </h1>
          <p className="text-lg text-gray-600">
            Completa todos los campos para publicar tu propiedad
          </p>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Sección 1: Información básica */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Home className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                1. Información básica
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la publicación *
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
                  Tipo de propiedad
                </label>
                <select
                  value={formData.listing.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Piso">Piso</option>
                  <option value="Chalet">Chalet</option>
                  <option value="Ático">Ático</option>
                  <option value="Estudio">Estudio</option>
                  <option value="Loft">Loft</option>
                  <option value="Dúplex">Dúplex</option>
                  <option value="Casa de Campo">Casa de Campo</option>
                  <option value="Residencia">Residencia</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.listing.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe tu propiedad, el barrio, las ventajas..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
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
                  placeholder="Madrid"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal *
                </label>
                <input
                  type="text"
                  value={formData.listing.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.postal_code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="28001"
                />
                {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <input
                  type="text"
                  value={formData.listing.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="España"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Características de la propiedad */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Star className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                2. Características de la propiedad
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habitaciones *
                </label>
                <input
                  type="number"
                  value={formData.listing.bedrooms || ''}
                  onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bedrooms ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2"
                  min="0"
                />
                {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Baños *
                </label>
                <input
                  type="number"
                  value={formData.listing.bathrooms || ''}
                  onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bathrooms ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1"
                  min="0"
                />
                {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Superficie total (m²) *
                </label>
                <input
                  type="number"
                  value={formData.listing.total_area || ''}
                  onChange={(e) => handleInputChange('total_area', parseFloat(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.total_area ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="80"
                  min="0"
                  step="0.1"
                />
                {errors.total_area && <p className="text-red-500 text-sm mt-1">{errors.total_area}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponible desde *
                </label>
                <input
                  type="date"
                  value={formData.listing.available_from}
                  onChange={(e) => handleInputChange('available_from', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.available_from ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.available_from && <p className="text-red-500 text-sm mt-1">{errors.available_from}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponible hasta
                </label>
                <input
                  type="date"
                  value={formData.listing.available_until}
                  onChange={(e) => handleInputChange('available_until', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Precio y características de la habitación */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Euro className="w-6 h-6 text-yellow-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                3. Precio y características de la habitación
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio mensual (€) *
                </label>
                <input
                  type="number"
                  value={formData.listing.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="450"
                  min="0"
                  step="0.01"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de cama
                </label>
                <select
                  value={formData.roomRequirements.bed_type}
                  onChange={(e) => handleRoomRequirementsChange('bed_type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="single">Individual</option>
                  <option value="double">Doble</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Superficie de la habitación (m²) *
                </label>
                <input
                  type="number"
                  value={formData.roomRequirements.room_area || ''}
                  onChange={(e) => handleRoomRequirementsChange('room_area', parseFloat(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.room_area ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="18"
                  min="0"
                  step="0.1"
                />
                {errors.room_area && <p className="text-red-500 text-sm mt-1">{errors.room_area}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Baño privado
                </label>
                <select
                  value={formData.roomRequirements.private_bathroom ? 'true' : 'false'}
                  onChange={(e) => handleRoomRequirementsChange('private_bathroom', e.target.value === 'true')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Balcón
                </label>
                <select
                  value={formData.roomRequirements.has_balcony ? 'true' : 'false'}
                  onChange={(e) => handleRoomRequirementsChange('has_balcony', e.target.value === 'true')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección 4: Amenidades */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Star className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                4. Amenidades disponibles
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Calefacción', 'Aire acondicionado', 'Internet/WiFi', 'Lavadora',
                'Secadora', 'Cocina equipada', 'Ascensor', 'Terraza', 'Jardín',
                'Piscina', 'Parking', 'Gimnasio', 'Spa', 'Biblioteca'
              ].map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sección 5: Requisitos del inquilino */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                5. Requisitos del inquilino
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferencia de género
                </label>
                <select
                  value={formData.roomRequirements.preferred_gender}
                  onChange={(e) => handleRoomRequirementsChange('preferred_gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="any">Indiferente</option>
                  <option value="female">Solo mujeres</option>
                  <option value="male">Solo hombres</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad mínima
                </label>
                <input
                  type="number"
                  value={formData.roomRequirements.preferred_age_min || ''}
                  onChange={(e) => handleRoomRequirementsChange('preferred_age_min', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="65"
                  min="55"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad máxima
                </label>
                <input
                  type="number"
                  value={formData.roomRequirements.preferred_age_max || ''}
                  onChange={(e) => handleRoomRequirementsChange('preferred_age_max', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="80"
                  min="55"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fumadores permitidos
                </label>
                <select
                  value={formData.roomRequirements.smoking_allowed ? 'true' : 'false'}
                  onChange={(e) => handleRoomRequirementsChange('smoking_allowed', e.target.value === 'true')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mascotas permitidas
                </label>
                <select
                  value={formData.roomRequirements.pets_allowed ? 'true' : 'false'}
                  onChange={(e) => handleRoomRequirementsChange('pets_allowed', e.target.value === 'true')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              {formData.roomRequirements.pets_allowed && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipos de mascotas permitidas
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Perro', 'Gato', 'Pájaro', 'Conejo', 'Hamster', 'Otros'].map((petType) => (
                      <label key={petType} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.roomRequirements.pet_types?.includes(petType) || false}
                          onChange={(e) => {
                            const currentTypes = formData.roomRequirements.pet_types || [];
                            if (e.target.checked) {
                              handleRoomRequirementsChange('pet_types', [...currentTypes, petType]);
                            } else {
                              handleRoomRequirementsChange('pet_types', currentTypes.filter(t => t !== petType));
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
                  Otros requisitos
                </label>
                <textarea
                  value={formData.roomRequirements.other_requirements}
                  onChange={(e) => handleRoomRequirementsChange('other_requirements', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe cualquier otro requisito o preferencia..."
                />
              </div>

              {errors.age_range && (
                <div className="md:col-span-2">
                  <p className="text-red-500 text-sm">{errors.age_range}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sección 6: Imágenes */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Upload className="w-6 h-6 text-pink-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                6. Imágenes de la propiedad
              </h3>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Haz clic para subir imágenes</p>
                <p className="text-sm text-gray-500">PNG, JPG hasta 10MB</p>
              </label>
            </div>
            
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center space-x-2 px-8 py-4 rounded-lg font-medium transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>Publicar Propiedad</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyListingFormMultiStep;
