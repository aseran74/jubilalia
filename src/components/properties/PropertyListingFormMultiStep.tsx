import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';
import { CreatePropertyListingComplete, CreatePropertyListing, CreateRoomRentalRequirements } from '../../types/supabase';
import ImageUpload from '../dashboard/ImageUpload';

const PropertyListingFormMultiStep: React.FC = () => {
  const { ensureProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreatePropertyListingComplete>({
    listing: {
      property_type: 'Piso',
      title: '',
      description: '',
      price: 0,
      bedrooms: 1,
      bathrooms: 1,
      total_area: 0,
      available_until: ''
    },
    roomRequirements: {
      bed_type: 'single',
      room_area: 0,
      private_bathroom: false,
      shared_bathroom: true,
      has_balcony: false,
      preferred_gender: 'any',
      preferred_age_min: 18,
      preferred_age_max: 65,
      smoking_allowed: false,
      pets_allowed: false,
      pet_types: [],
      other_requirements: ''
    },
    images: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const amenities = [
    'WiFi', 'Calefacción', 'Aire acondicionado', 'Lavadora', 'Secadora',
    'Cocina equipada', 'Balcón', 'Terraza', 'Jardín', 'Parking',
    'Ascensor', 'Portero', 'Seguridad 24h', 'Gimnasio', 'Piscina'
  ];

  const handleInputChange = (field: keyof CreatePropertyListing, value: any) => {
    setFormData(prev => ({
      ...prev,
      listing: {
        ...prev.listing,
        [field]: value
      }
    }));
  };

  const handleRoomRequirementChange = (field: keyof CreateRoomRentalRequirements, value: any) => {
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
        ? (prev.amenities || []).filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }));
  };

  const handleImageUpload = (imageUrls: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...imageUrls]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.listing.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.listing.description?.trim()) newErrors.description = 'La descripción es obligatoria';
    if (formData.listing.price <= 0) newErrors.price = 'El precio debe ser mayor a 0';

    if (formData.roomRequirements) {
      if (!formData.roomRequirements.room_area || formData.roomRequirements.room_area <= 0) {
        newErrors.room_area = 'El área de la habitación es obligatoria';
      }
      if (formData.roomRequirements.preferred_age_min >= formData.roomRequirements.preferred_age_max) {
        newErrors.age_range = 'El rango de edad no es válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const userProfile = await ensureProfile();
      if (!userProfile) {
        setErrors({ general: 'Error al obtener el perfil del usuario' });
        return;
      }

      // Crear la publicación
      const { data: listingData, error: listingError } = await supabase
        .from('property_listings')
        .insert({
          profile_id: userProfile.id,
          property_type: formData.listing.property_type,
          title: formData.listing.title,
          description: formData.listing.description,
          price: formData.listing.price,
          bedrooms: formData.listing.bedrooms,
          bathrooms: formData.listing.bathrooms,
          total_area: formData.listing.total_area,
          available_until: formData.listing.available_until,
          amenities: formData.amenities,
          status: 'active'
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Crear los requisitos de la habitación
      if (formData.roomRequirements) {
        const { error: roomError } = await supabase
          .from('room_rental_requirements')
          .insert({
            listing_id: listingData.id,
            bed_type: formData.roomRequirements.bed_type,
            room_area: formData.roomRequirements.room_area,
            private_bathroom: formData.roomRequirements.private_bathroom,
            shared_bathroom: formData.roomRequirements.shared_bathroom,
            has_balcony: formData.roomRequirements.has_balcony,
            preferred_gender: formData.roomRequirements.preferred_gender,
            preferred_age_min: formData.roomRequirements.preferred_age_min,
            preferred_age_max: formData.roomRequirements.preferred_age_max,
            smoking_allowed: formData.roomRequirements.smoking_allowed,
            pets_allowed: formData.roomRequirements.pets_allowed,
            pet_types: formData.roomRequirements.pet_types,
            other_requirements: formData.roomRequirements.other_requirements
          });

        if (roomError) throw roomError;
      }

      // Subir imágenes
      if (formData.images && formData.images.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          const imageUrl = formData.images[i];
          
          // Guardar URL en la base de datos
          const { error: imageError } = await supabase
            .from('property_images')
            .insert({
              listing_id: listingData.id,
              image_url: imageUrl,
              order_index: i
            });

          if (imageError) throw imageError;
        }
      }

      // Éxito
      alert('Publicación creada exitosamente!');
      // Resetear formulario o redirigir
    } catch (error: any) {
      console.error('Error creating listing:', error);
      setErrors({ general: error.message || 'Error al crear la publicación' });
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Publicar Habitación</h1>
        <p className="text-gray-600">Completa la información para publicar tu habitación</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
              1
            </div>
            <span className="ml-2">Información Básica</span>
          </div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
              2
            </div>
            <span className="ml-2">Requisitos</span>
          </div>
          <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
              3
            </div>
            <span className="ml-2">Imágenes</span>
          </div>
        </div>
      </div>

      {/* Error General */}
      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{errors.general}</p>
        </div>
      )}

      {/* Step 1: Información Básica */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Información de la Propiedad</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Propiedad</label>
              <select
                value={formData.listing.property_type}
                onChange={(e) => handleInputChange('property_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Piso">Piso</option>
                <option value="Casa">Casa</option>
                <option value="Estudio">Estudio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
              <input
                type="text"
                value={formData.listing.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Habitación luminosa en el centro"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio (€/mes) *</label>
              <input
                type="number"
                value={formData.listing.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Habitaciones</label>
              <input
                type="number"
                value={formData.listing.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Baños</label>
              <input
                type="number"
                value={formData.listing.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Área Total (m²)</label>
              <input
                type="number"
                value={formData.listing.total_area}
                onChange={(e) => handleInputChange('total_area', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
            <textarea
              value={formData.listing.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe tu propiedad..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disponible hasta</label>
            <input
              type="date"
              value={formData.listing.available_until}
              onChange={(e) => handleInputChange('available_until', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenities.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.amenities?.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Requisitos de la Habitación */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Requisitos de la Habitación</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Cama</label>
              <select
                value={formData.roomRequirements?.bed_type}
                onChange={(e) => handleRoomRequirementChange('bed_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="single">Individual</option>
                <option value="double">Doble</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Área de la Habitación (m²) *</label>
              <input
                type="number"
                value={formData.roomRequirements?.room_area || ''}
                onChange={(e) => handleRoomRequirementChange('room_area', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              {errors.room_area && <p className="text-red-500 text-sm mt-1">{errors.room_area}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Baño Privado</label>
              <select
                value={formData.roomRequirements?.private_bathroom ? 'true' : 'false'}
                onChange={(e) => handleRoomRequirementChange('private_bathroom', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="false">Compartido</option>
                <option value="true">Privado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Balcón</label>
              <select
                value={formData.roomRequirements?.has_balcony ? 'true' : 'false'}
                onChange={(e) => handleRoomRequirementChange('has_balcony', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Género Preferido</label>
              <select
                value={formData.roomRequirements?.preferred_gender}
                onChange={(e) => handleRoomRequirementChange('preferred_gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="any">Cualquiera</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Edad Mínima</label>
              <input
                type="number"
                value={formData.roomRequirements?.preferred_age_min || ''}
                onChange={(e) => handleRoomRequirementChange('preferred_age_min', parseInt(e.target.value) || 18)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="18"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Edad Máxima</label>
              <input
                type="number"
                value={formData.roomRequirements?.preferred_age_max || ''}
                onChange={(e) => handleRoomRequirementChange('preferred_age_max', parseInt(e.target.value) || 65)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="18"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fumar Permitido</label>
              <select
                value={formData.roomRequirements?.smoking_allowed ? 'true' : 'false'}
                onChange={(e) => handleRoomRequirementChange('smoking_allowed', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mascotas Permitidas</label>
              <select
                value={formData.roomRequirements?.pets_allowed ? 'true' : 'false'}
                onChange={(e) => handleRoomRequirementChange('pets_allowed', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
          </div>

          {formData.roomRequirements?.pets_allowed && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipos de Mascotas</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Perro', 'Gato', 'Pájaro', 'Pez', 'Otro'].map((petType) => (
                  <label key={petType} className="flex items-center">
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
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{petType}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Otros Requisitos</label>
            <textarea
              value={formData.roomRequirements?.other_requirements}
              onChange={(e) => handleRoomRequirementChange('other_requirements', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Otros requisitos o preferencias..."
            />
          </div>

          {errors.age_range && <p className="text-red-500 text-sm">{errors.age_range}</p>}
        </div>
      )}

      {/* Step 3: Imágenes */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Imágenes de la Propiedad</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subir Imágenes</label>
            <ImageUpload
              bucketName="post-images"
              onImagesUploaded={handleImageUpload}
              maxImages={10}
              className="w-full"
            />
          </div>

          {formData.images && formData.images.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes Seleccionadas</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-8 border-t border-gray-200">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Publicar
          </button>
        )}
      </div>
    </div>
  );
};

export default PropertyListingFormMultiStep;
