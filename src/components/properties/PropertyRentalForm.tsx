import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  AlertCircle,
  CheckCircle,
  X,
  Home
} from 'lucide-react';
import ImageUpload from '../dashboard/ImageUpload';
import { SUPABASE_BUCKETS } from '../../config/supabase';
import TailAdminDatePicker from '../common/TailAdminDatePicker';

interface PropertyRentalFormData {
  title: string;
  description: string;
  property_type: string;
  address: string;
  city: string;
  country: string;
  price: string;
  available_from: Date | null;
  available_until: Date | null;
  bedrooms: string;
  bathrooms: string;
  total_area: string;
  max_occupants: string;
  amenities: string[];
  images: string[];
}

const PropertyRentalForm: React.FC = () => {
  const { ensureProfile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = !!id;

  // Cargar datos de la propiedad si se está editando
  useEffect(() => {
    if (isEditing && id) {
      const fetchProperty = async () => {
        try {
          setLoadingData(true);
          console.log('🔍 PropertyRentalForm - Cargando datos para propiedad ID:', id);
          
          // Obtener datos de la propiedad
          const { data: propertyData, error: propertyError } = await supabase
            .from('property_listings')
            .select('*')
            .eq('id', id)
            .eq('listing_type', 'property_rental')
            .single();

          console.log('🔍 PropertyRentalForm - Datos de propiedad:', propertyData, 'Error:', propertyError);
          if (propertyError) throw propertyError;

          // Obtener imágenes
          const { data: imagesData, error: imagesError } = await supabase
            .from('property_images')
            .select('image_url')
            .eq('listing_id', id)
            .order('order_index', { ascending: true });

          console.log('🔍 PropertyRentalForm - Datos de imágenes:', imagesData, 'Error:', imagesError);
          if (imagesError) throw imagesError;

          // Actualizar el formulario con los datos obtenidos
          setFormData({
            title: propertyData.title || '',
            description: propertyData.description || '',
            property_type: propertyData.property_type || '',
            address: propertyData.address || '',
            city: propertyData.city || '',
            country: propertyData.country || 'España',
            price: propertyData.price?.toString() || '',
            available_from: propertyData.available_from ? new Date(propertyData.available_from) : null,
            available_until: propertyData.available_until ? new Date(propertyData.available_until) : null,
            bedrooms: propertyData.bedrooms?.toString() || '',
            bathrooms: propertyData.bathrooms?.toString() || '',
            total_area: propertyData.total_area?.toString() || '',
            max_occupants: propertyData.max_occupants?.toString() || '',
            amenities: [], // Las amenities se manejan por separado
            images: imagesData?.map(img => img.image_url) || [],
          });

        } catch (error) {
          console.error('Error loading property data:', error);
          setErrors({ general: 'Error al cargar los datos de la propiedad' });
        } finally {
          setLoadingData(false);
        }
      };

      fetchProperty();
    }
  }, [id, isEditing]);

  const [formData, setFormData] = useState<PropertyRentalFormData>({
    title: '',
    description: '',
    property_type: '',
    address: '',
    city: '',
    country: 'España',
    price: '',
    available_from: null,
    available_until: null,
    bedrooms: '',
    bathrooms: '',
    total_area: '',
    max_occupants: '',
    amenities: [],
    images: [],
  });

  const availableAmenities = [
    'WiFi',
    'Aire acondicionado',
    'Calefacción',
    'Lavadora',
    'Secadora',
    'Dishwasher',
    'Terraza',
    'Jardín',
    'Parking',
    'Ascensor',
    'Piscina',
    'Gimnasio',
    'Seguridad 24h',
    'Mascotas permitidas',
    'Fumadores permitidos'
  ];

  const propertyTypes = [
    'Apartamento',
    'Casa',
    'Estudio',
    'Loft',
    'Duplex',
    'Villa',
    'Chalet',
    'Finca',
    'Comunidad'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImagesUploaded = (imageUrls: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: imageUrls
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.property_type) newErrors.property_type = 'Selecciona el tipo de propiedad';
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (!formData.city.trim()) newErrors.city = 'La ciudad es obligatoria';
    if (!formData.price) newErrors.price = 'El precio es obligatorio';
    if (!formData.available_from) newErrors.available_from = 'La fecha de disponibilidad es obligatoria';
    if (!formData.bedrooms) newErrors.bedrooms = 'El número de habitaciones es obligatorio';
    if (!formData.bathrooms) newErrors.bathrooms = 'El número de baños es obligatorio';
    if (!formData.total_area) newErrors.total_area = 'La superficie total es obligatoria';
    if (!formData.max_occupants) newErrors.max_occupants = 'El número máximo de ocupantes es obligatorio';
    if (!formData.images || formData.images.length === 0) {
      newErrors.images = 'Debes subir al menos una imagen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Asegurar que tenemos un perfil válido
      const currentProfile = await ensureProfile();
      if (!currentProfile?.id) {
        setErrors({ general: 'No se pudo obtener el perfil del usuario. Por favor, inicia sesión de nuevo.' });
        setLoading(false);
        return;
      }

      console.log('✅ Usando perfil:', currentProfile);

      let listingId: string;

      if (isEditing && id) {
        // Actualizar propiedad existente
        const { error: listingError } = await supabase
          .from('property_listings')
          .update({
            title: formData.title,
            description: formData.description,
            price: parseFloat(formData.price),
            address: formData.address,
            city: formData.city,
            country: formData.country,
            available_from: formData.available_from ? formData.available_from.toISOString().split('T')[0] : null,
            available_until: formData.available_until ? formData.available_until.toISOString().split('T')[0] : null,
            bedrooms: parseInt(formData.bedrooms),
            bathrooms: parseInt(formData.bathrooms),
            total_area: parseFloat(formData.total_area),
            property_type: formData.property_type
          })
          .eq('id', id);

        if (listingError) throw listingError;
        listingId = id;
      } else {
        // Crear nueva propiedad
        const { data: listing, error: listingError } = await supabase
          .from('property_listings')
          .insert({
            profile_id: currentProfile.id,
            listing_type: 'property_rental',
            title: formData.title,
            description: formData.description,
            price: parseFloat(formData.price),
            address: formData.address,
            city: formData.city,
            country: formData.country,
            available_from: formData.available_from ? formData.available_from.toISOString().split('T')[0] : null,
            available_until: formData.available_until ? formData.available_until.toISOString().split('T')[0] : null,
            is_available: true,
            bedrooms: parseInt(formData.bedrooms),
            bathrooms: parseInt(formData.bathrooms),
            total_area: parseFloat(formData.total_area),
            property_type: formData.property_type
          })
          .select()
          .single();

        if (listingError) throw listingError;
        listingId = listing.id;
      }

      // 2. Los datos ya están guardados en property_listings, no necesitamos tabla separada

      // 3. Manejar amenidades
      if (isEditing) {
        // Eliminar amenidades existentes y crear nuevas
        await supabase
          .from('property_amenities')
          .delete()
          .eq('listing_id', listingId);
      }

      if (formData.amenities.length > 0) {
        const amenitiesData = formData.amenities.map(amenityName => ({
          listing_id: listingId,
          amenity_type: 'basic',
          amenity_name: amenityName,
          is_available: true
        }));

        const { error: amenitiesError } = await supabase
          .from('property_amenities')
          .insert(amenitiesData);

        if (amenitiesError) throw amenitiesError;
      }

      // 4. Manejar imágenes
      if (isEditing) {
        // Eliminar imágenes existentes y crear nuevas
        await supabase
          .from('property_images')
          .delete()
          .eq('listing_id', listingId);
      }

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

      setSuccessMessage(isEditing ? '¡Propiedad actualizada exitosamente! Redirigiendo...' : '¡Propiedad publicada exitosamente! Redirigiendo...');
      
      setTimeout(() => {
        navigate('/dashboard/properties/rental');
      }, 2000);

    } catch (error) {
      console.error('Error creating property listing:', error);
      setErrors({ general: `Error al crear el listado: ${error instanceof Error ? error.message : 'Error desconocido'}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? 'Editar Propiedad en Alquiler' : 'Publicar Propiedad en Alquiler'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Modifica los datos de tu propiedad' : 'Completa los datos de tu propiedad para encontrar inquilinos'}
            </p>
          </div>

          {loadingData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">Cargando datos de la propiedad...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información básica */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                1. Información básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la publicación
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Apartamento luminoso en el centro"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de propiedad
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecciona el tipo</option>
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
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe tu propiedad, sus características y ventajas..."
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                2. Ubicación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Calle y número"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Madrid, Barcelona..."
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Características */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                3. Características
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Habitaciones
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="2"
                  />
                  {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baños
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    min="1"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="2"
                  />
                  {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Superficie total (m²)
                  </label>
                  <input
                    type="number"
                    name="total_area"
                    value={formData.total_area}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="80"
                  />
                  {errors.total_area && <p className="text-red-500 text-sm mt-1">{errors.total_area}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo ocupantes
                  </label>
                  <input
                    type="number"
                    name="max_occupants"
                    value={formData.max_occupants}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="4"
                  />
                  {errors.max_occupants && <p className="text-red-500 text-sm mt-1">{errors.max_occupants}</p>}
                </div>
              </div>
            </div>

            {/* Precio y disponibilidad */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                4. Precio y disponibilidad
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio mensual (€)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1200"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <TailAdminDatePicker
                    selected={formData.available_from}
                    onChange={(date) => setFormData(prev => ({ ...prev, available_from: date }))}
                    label="Disponible desde"
                    placeholder="Seleccionar fecha de inicio"
                    minDate={new Date()}
                    error={errors.available_from}
                  />
                </div>

                <div>
                  <TailAdminDatePicker
                    selected={formData.available_until}
                    onChange={(date) => setFormData(prev => ({ ...prev, available_until: date }))}
                    label="Disponible hasta"
                    placeholder="Seleccionar fecha de fin"
                    minDate={formData.available_from || new Date()}
                  />
                </div>

              </div>
            </div>

            {/* Amenidades */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                5. Amenidades
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableAmenities.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                6. Imágenes de la propiedad
              </h3>
              
              <ImageUpload 
                onImagesUploaded={handleImagesUploaded}
                maxImages={10}
                bucketName={SUPABASE_BUCKETS.PROPERTY_IMAGES}
                className="mb-4"
              />
              {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Publicando...
                  </>
                ) : (
                  <>
                    <Home className="w-5 h-5" />
                    Publicar Propiedad
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyRentalForm;
