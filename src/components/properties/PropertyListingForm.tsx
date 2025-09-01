import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createPropertyListing } from '../../lib/properties';
import type { CreatePropertyListingComplete, ListingType } from '../../types/properties';
import TailAdminDatePicker from '../common/TailAdminDatePicker';
import { 
  Building, 
  Users, 
  Home, 
  Umbrella, 
  Upload, 
  CheckCircle,
  AlertCircle,
  Euro
} from 'lucide-react';

const PropertyListingForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreatePropertyListingComplete>({
    listing: {
      listing_type: 'room_rental',
      title: '',
      description: '',
      property_type: '',
      address: '',
      city: '',
      postal_code: '',
      country: 'España',
      price: undefined,
      price_type: 'monthly',
      currency: 'EUR',
      bedrooms: undefined,
      bathrooms: undefined,
      total_area: undefined,
      available_from: null as Date | null,
      available_until: null as Date | null
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

  // Opciones para los tipos de listado
  const listingTypes = [
    {
      type: 'room_rental' as ListingType,
      title: 'Alquilar Habitación',
      description: 'Publicita una habitación para alquilar con compañeros',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      type: 'property_rental' as ListingType,
      title: 'Alquilar Propiedad Completa',
      description: 'Alquila una propiedad completa para varias personas senior',
      icon: Building,
      color: 'bg-green-500'
    },
    {
      type: 'property_purchase' as ListingType,
      title: 'Comprar Propiedad Compartida',
      description: 'Compra una propiedad entre varias personas para jubilación',
      icon: Home,
      color: 'bg-purple-500'
    },
    {
      type: 'seasonal_rental' as ListingType,
      title: 'Alquiler Temporal (Holydeo.com)',
      description: 'Alquila tu propiedad fuera de temporada en la playa',
      icon: Umbrella,
      color: 'bg-orange-500'
    }
  ];

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

  const handleDateChange = (field: 'available_from' | 'available_until', date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      listing: {
        ...prev.listing,
        [field]: date
      }
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...files]
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrors({ general: 'Debes estar autenticado para crear un listado' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convertir fechas a formato ISO antes de enviar
      const formDataToSend = {
        ...formData,
        listing: {
          ...formData.listing,
          available_from: formData.listing.available_from ? formData.listing.available_from.toISOString().split('T')[0] : null,
          available_until: formData.listing.available_until ? formData.listing.available_until.toISOString().split('T')[0] : null
        }
      };

      // Aquí se agregarían los requisitos específicos según el tipo
      const result = await createPropertyListing(formDataToSend);
      
      if (result.success) {
        navigate('/dashboard/properties/sale');
      } else {
        setErrors({ general: 'Error al crear el listado' });
      }
    } catch (error) {
      setErrors({ general: 'Error inesperado al crear el listado' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Selecciona el tipo de listado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listingTypes.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.type}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.listing.listing_type === option.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('listing_type', option.type)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${option.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{option.title}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Información básica de la propiedad
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <option value="">Selecciona un tipo</option>
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
              placeholder="Describe tu propiedad, sus características y lo que buscas..."
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
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Características y precio
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio *
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
              Tipo de precio
            </label>
            <select
              value={formData.listing.price_type}
              onChange={(e) => handleInputChange('price_type', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="monthly">Mensual</option>
              <option value="total">Total</option>
              <option value="per_person">Por persona</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Habitaciones
            </label>
            <input
              type="number"
              value={formData.listing.bedrooms || ''}
              onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Baños
            </label>
            <input
              type="number"
              value={formData.listing.bathrooms || ''}
              onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Superficie total (m²)
            </label>
            <input
              type="number"
              value={formData.listing.total_area || ''}
              onChange={(e) => handleInputChange('total_area', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="80"
              min="0"
              step="0.1"
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
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Disponibilidad y amenidades
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TailAdminDatePicker
              selected={formData.listing.available_from}
              onChange={(date) => handleDateChange('available_from', date)}
              label="Disponible desde"
              placeholder="Seleccionar fecha de inicio"
              minDate={new Date()}
            />
          </div>

          <div>
            <TailAdminDatePicker
              selected={formData.listing.available_until}
              onChange={(date) => handleDateChange('available_until', date)}
              label="Disponible hasta"
              placeholder="Seleccionar fecha de fin"
              minDate={formData.listing.available_from || new Date()}
            />
          </div>
        </div>

        <div className="mt-6">
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

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes de la propiedad
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Arrastra y suelta las imágenes aquí o haz clic para seleccionar
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
            >
              Seleccionar imágenes
            </label>
          </div>
          {formData.images && formData.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {formData.images.length} imagen(es) seleccionada(s)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Requisitos específicos de la habitación
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de cama *
            </label>
            <select
              value={formData.roomRequirements?.bed_type || 'single'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                roomRequirements: {
                  ...prev.roomRequirements!,
                  bed_type: e.target.value as 'single' | 'double'
                }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="single">Cama individual</option>
              <option value="double">Cama doble</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metros cuadrados de la habitación *
            </label>
            <input
              type="number"
              value={formData.roomRequirements?.room_area || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                roomRequirements: {
                  ...prev.roomRequirements!,
                  room_area: parseFloat(e.target.value) || 0
                }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="15"
              min="5"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Tiene cuarto de baño propio?
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="private_bathroom"
                  checked={formData.roomRequirements?.private_bathroom === true}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    roomRequirements: {
                      ...prev.roomRequirements!,
                      private_bathroom: true
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="private_bathroom"
                  checked={formData.roomRequirements?.private_bathroom === false}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    roomRequirements: {
                       ...prev.roomRequirements!,
                       private_bathroom: false
                     }
                   }))}
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
                   onChange={() => setFormData(prev => ({
                     ...prev,
                     roomRequirements: {
                       ...prev.roomRequirements!,
                       has_balcony: true
                     }
                   }))}
                   className="w-4 h-4 text-blue-600 border-gray-300"
                 />
                 <span className="text-sm text-gray-700">Sí</span>
               </label>
               <label className="flex items-center space-x-2 cursor-pointer">
                 <input
                   type="radio"
                   name="has_balcony"
                   checked={formData.roomRequirements?.has_balcony === false}
                   onChange={() => setFormData(prev => ({
                     ...prev,
                     roomRequirements: {
                       ...prev.roomRequirements!,
                       has_balcony: false
                     }
                   }))}
                   className="w-4 h-4 text-blue-600 border-gray-300"
                 />
                 <span className="text-sm text-gray-700">No</span>
               </label>
             </div>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Preferencia de género *
             </label>
             <select
               value={formData.roomRequirements?.preferred_gender || 'any'}
               onChange={(e) => setFormData(prev => ({
                 ...prev,
                 roomRequirements: {
                   ...prev.roomRequirements!,
                   preferred_gender: e.target.value as 'any' | 'male' | 'female'
                 }
               }))}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             >
               <option value="any">Indiferente</option>
               <option value="female">Solo mujeres</option>
               <option value="male">Solo hombres</option>
             </select>
           </div>

                     <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edad mínima preferida *
            </label>
            <input
              type="number"
              value={formData.roomRequirements?.preferred_age_min || 65}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                roomRequirements: {
                  ...prev.roomRequirements!,
                  preferred_age_min: parseInt(e.target.value) || 65
                }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="65"
              min="55"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edad máxima preferida *
            </label>
            <input
              type="number"
              value={formData.roomRequirements?.preferred_age_max || 80}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                roomRequirements: {
                  ...prev.roomRequirements!,
                  preferred_age_max: parseInt(e.target.value) || 80
                }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="80"
              min="55"
              max="100"
            />
          </div>

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
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    roomRequirements: {
                      ...prev.roomRequirements!,
                      smoking_allowed: true
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="smoking_allowed"
                  checked={formData.roomRequirements?.smoking_allowed === false}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    roomRequirements: {
                      ...prev.roomRequirements!,
                      smoking_allowed: false
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Se permiten mascotas en la habitación?
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="pets_allowed"
                  checked={formData.roomRequirements?.pets_allowed === true}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    roomRequirements: {
                      ...prev.roomRequirements!,
                      pets_allowed: true
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="pets_allowed"
                  checked={formData.roomRequirements?.pets_allowed === false}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    roomRequirements: {
                      ...prev.roomRequirements!,
                      pets_allowed: false
                    }
                  }))}
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
                          setFormData(prev => ({
                            ...prev,
                            roomRequirements: {
                              ...prev.roomRequirements!,
                              pet_types: [...currentTypes, petType]
                            }
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            roomRequirements: {
                              ...prev.roomRequirements!,
                              pet_types: currentTypes.filter(t => t !== petType)
                            }
                          }));
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

          {/* Nueva sección: Requisitos del inquilino */}
          <div className="md:col-span-2">
            <h4 className="text-md font-semibold text-gray-800 mb-4 border-t pt-4">
              Requisitos del inquilino
            </h4>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿El inquilino debe compartir baño?
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="shared_bathroom"
                  checked={formData.roomRequirements?.shared_bathroom === true}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    roomRequirements: {
                      ...prev.roomRequirements!,
                      shared_bathroom: true
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="shared_bathroom"
                  checked={formData.roomRequirements?.shared_bathroom === false}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    roomRequirements: {
                      ...prev.roomRequirements!,
                      shared_bathroom: false
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Se permite que el inquilino sea fumador?
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="tenant_smoker"
                  checked={formData.roomRequirements?.tenant_smoker === true}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    roomRequirements: {
                      ...prev.roomRequirements!,
                      tenant_smoker: true
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="tenant_smoker"
                  checked={formData.roomRequirements?.tenant_smoker === false}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    roomRequirements: {
                      ...prev.roomRequirements!,
                      tenant_smoker: false
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferencia de género del inquilino
            </label>
            <select
              value={formData.roomRequirements?.tenant_gender_preference || 'any'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                roomRequirements: {
                  ...prev.roomRequirements!,
                  tenant_gender_preference: e.target.value as 'any' | 'male' | 'female'
                }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="any">Indiferente</option>
              <option value="female">Solo mujeres</option>
              <option value="male">Solo hombres</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edad mínima del inquilino
            </label>
            <input
              type="number"
              value={formData.roomRequirements?.tenant_age_min || 55}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                roomRequirements: {
                  ...prev.roomRequirements!,
                  tenant_age_min: parseInt(e.target.value) || 55
                }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="55"
              min="55"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edad máxima del inquilino
            </label>
            <input
              type="number"
              value={formData.roomRequirements?.tenant_age_max || 100}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                roomRequirements: {
                  ...prev.roomRequirements!,
                  tenant_age_max: parseInt(e.target.value) || 100
                }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
              min="55"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Se permiten mascotas al inquilino?
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="tenant_pets_allowed"
                  checked={formData.roomRequirements?.tenant_pets_allowed === true}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    roomRequirements: {
                      ...prev.roomRequirements!,
                      tenant_pets_allowed: true
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="tenant_pets_allowed"
                  checked={formData.roomRequirements?.tenant_pets_allowed === false}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    roomRequirements: {
                      ...prev.roomRequirements!,
                      tenant_pets_allowed: false
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {formData.roomRequirements?.tenant_pets_allowed && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipos de mascotas permitidas para el inquilino
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Perro', 'Gato', 'Pájaro', 'Conejo', 'Hamster', 'Otros'].map((petType) => (
                  <label key={petType} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.roomRequirements?.tenant_pet_types?.includes(petType) || false}
                      onChange={(e) => {
                        const currentTypes = formData.roomRequirements?.tenant_pet_types || [];
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            roomRequirements: {
                              ...prev.roomRequirements!,
                              tenant_pet_types: [...currentTypes, petType]
                            }
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            roomRequirements: {
                              ...prev.roomRequirements!,
                              tenant_pet_types: currentTypes.filter(t => t !== petType)
                            }
                          }));
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
              onChange={(e) => setFormData(prev => ({
                ...prev,
                roomRequirements: {
                  ...prev.roomRequirements!,
                  other_requirements: e.target.value
                }
              }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe cualquier otro requisito o preferencia específica..."
            />
          </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Edad máxima preferida *
             </label>
             <input
               type="number"
               value={formData.roomRequirements?.preferred_age_max || 80}
               onChange={(e) => setFormData(prev => ({
                 ...prev,
                 roomRequirements: {
                   ...prev.roomRequirements!,
                   preferred_age_max: parseInt(e.target.value) || 80
                 }
               }))}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               placeholder="80"
               min="55"
               max="100"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               ¿Admite fumadores?
             </label>
             <div className="flex space-x-4">
               <label className="flex items-center space-x-2 cursor-pointer">
                 <input
                   type="radio"
                   name="smoking_allowed"
                   checked={formData.roomRequirements?.smoking_allowed === true}
                   onChange={() => setFormData(prev => ({
                     ...prev,
                     roomRequirements: {
                       ...prev.roomRequirements!,
                       smoking_allowed: true
                     }
                   }))}
                   className="w-4 h-4 text-blue-600 border-gray-300"
                 />
                 <span className="text-sm text-gray-700">Sí</span>
               </label>
               <label className="flex items-center space-x-2 cursor-pointer">
                 <input
                   type="radio"
                   name="smoking_allowed"
                   checked={formData.roomRequirements?.smoking_allowed === false}
                   onChange={() => setFormData(prev => ({
                     ...prev,
                     roomRequirements: {
                       ...prev.roomRequirements!,
                       smoking_allowed: false
                     }
                   }))}
                   className="w-4 h-4 text-blue-600 border-gray-300"
                 />
                 <span className="text-sm text-gray-700">No</span>
               </label>
             </div>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               ¿Admite mascotas?
             </label>
             <div className="flex space-x-4">
               <label className="flex items-center space-x-2 cursor-pointer">
                 <input
                   type="radio"
                   name="pets_allowed"
                   checked={formData.roomRequirements?.pets_allowed === true}
                   onChange={() => setFormData(prev => ({
                     ...prev,
                     roomRequirements: {
                       ...prev.roomRequirements!,
                       pets_allowed: true
                     }
                   }))}
                   className="w-4 h-4 text-blue-600 border-gray-300"
                 />
                 <span className="text-sm text-gray-700">Sí</span>
               </label>
               <label className="flex items-center space-x-2 cursor-pointer">
                 <input
                   type="radio"
                   name="pets_allowed"
                   checked={formData.roomRequirements?.pets_allowed === false}
                   onChange={() => setFormData(prev => ({
                     ...prev,
                     roomRequirements: {
                       ...prev.roomRequirements!,
                       pets_allowed: false
                     }
                   }))}
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
               <input
                 type="text"
                 value={formData.roomRequirements?.pet_types?.join(', ') || ''}
                 onChange={(e) => setFormData(prev => ({
                   ...prev,
                   roomRequirements: {
                     ...prev.roomRequirements!,
                     pet_types: e.target.value.split(',').map(pet => pet.trim()).filter(pet => pet.length > 0)
                   }
                 }))}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="Perro, Gato, Pájaro (separados por comas)"
               />
             </div>
           )}

           <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Otros requisitos o preferencias
             </label>
             <textarea
               value={formData.roomRequirements?.other_requirements || ''}
               onChange={(e) => setFormData(prev => ({
                 ...prev,
                 roomRequirements: {
                   ...prev.roomRequirements!,
                   other_requirements: e.target.value
                 }
               }))}
               rows={3}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               placeholder="Describe cualquier otro requisito o preferencia específica..."
             />
           </div>
         </div>
       </div>
     </div>
   );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.listing.listing_type;
      case 2:
        return formData.listing.title && formData.listing.property_type && formData.listing.address && formData.listing.city;
      case 3:
        return formData.listing.price && formData.listing.price > 0;
      case 4:
        // Si es alquiler de habitación, validar requisitos básicos
        if (formData.listing.listing_type === 'room_rental') {
          return formData.roomRequirements?.bed_type && formData.roomRequirements?.room_area > 0;
        }
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const canGoPrevious = () => currentStep > 1;

  const handleNext = () => {
    if (canGoNext()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious()) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Publicar Propiedad
          </h1>
                     <p className="text-lg text-gray-600">
             Crea tu anuncio en solo {formData.listing.listing_type === 'room_rental' ? '5' : '4'} pasos simples
           </p>
        </div>

        {/* Progress Bar */}
                 <div className="mb-8">
           <div className="flex items-center justify-between">
             {formData.listing.listing_type === 'room_rental' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4].map((step) => (
               <div key={step} className="flex items-center">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                   step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                 }`}>
                   {step < currentStep ? (
                     <CheckCircle className="w-6 h-6" />
                   ) : (
                     <span className="font-semibold">{step}</span>
                   )}
                 </div>
                 {step < (formData.listing.listing_type === 'room_rental' ? 5 : 4) && (
                   <div className={`w-16 h-1 mx-2 ${
                     step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                   }`} />
                 )}
               </div>
             ))}
           </div>
         </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            {/* Error general */}
            {errors.general && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={!canGoPrevious()}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  canGoPrevious()
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Anterior
              </button>

                             <div className="flex space-x-3">
                 {currentStep < (formData.listing.listing_type === 'room_rental' ? 5 : 4) ? (
                   <button
                     type="button"
                     onClick={handleNext}
                     disabled={!canGoNext()}
                     className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                       canGoNext()
                         ? 'bg-blue-500 text-white hover:bg-blue-600'
                         : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                     }`}
                   >
                     Siguiente
                   </button>
                 ) : (
                   <button
                     type="submit"
                     disabled={isSubmitting}
                     className="px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                   >
                     {isSubmitting ? 'Publicando...' : 'Publicar Propiedad'}
                   </button>
                 )}
               </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyListingForm;
