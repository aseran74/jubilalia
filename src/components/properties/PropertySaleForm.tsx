import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  AlertCircle,
  CheckCircle,
  X,
  Building
} from 'lucide-react';
import ImageUpload from '../dashboard/ImageUpload';
import { SUPABASE_BUCKETS } from '../../config/supabase';
import TailAdminDatePicker from '../common/TailAdminDatePicker';

interface PropertySaleFormData {
  title: string;
  description: string;
  property_type: string;
  address: string;
  city: string;
  country: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  total_area: string;
  land_area: string;
  construction_year: string;
  property_condition: string;
  parking_spaces: string;
  amenities: string[];
  images: string[];
  is_featured: boolean;
  available_from: Date | null;
}

const PropertySaleForm: React.FC = () => {
  const { ensureProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<PropertySaleFormData>({
    title: '',
    description: '',
    property_type: '',
    address: '',
    city: '',
    country: 'España',
    price: '',
    bedrooms: '',
    bathrooms: '',
    total_area: '',
    land_area: '',
    construction_year: '',
    property_condition: '',
    parking_spaces: '',
    amenities: [],
    images: [],
    is_featured: false,
    available_from: null
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
    'Fumadores permitidos',
    'Armarios empotrados',
    'Cocina equipada',
    'Trastero',
    'Balcón',
    'Vistas',
    'Orientación sur',
    'Chimenea',
    'Bodega'
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
    'Local comercial',
    'Oficina',
    'Nave industrial'
  ];

  const propertyConditions = [
    'Excelente',
    'Muy bueno',
    'Bueno',
    'Aceptable',
    'Necesita reforma',
    'Nuevo'
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
    if (!formData.bedrooms) newErrors.bedrooms = 'El número de habitaciones es obligatorio';
    if (!formData.bathrooms) newErrors.bathrooms = 'El número de baños es obligatorio';
    if (!formData.total_area) newErrors.total_area = 'La superficie total es obligatoria';
    if (!formData.construction_year) newErrors.construction_year = 'El año de construcción es obligatorio';
    if (!formData.property_condition) newErrors.property_condition = 'Selecciona el estado de la propiedad';
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

      // 1. Crear el listado principal
      const { data: listing, error: listingError } = await supabase
        .from('property_listings')
        .insert({
          profile_id: currentProfile.id,
          listing_type: 'property_purchase',
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          address: formData.address,
          city: formData.city,
          country: formData.country,
          available_from: formData.available_from ? formData.available_from.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          is_featured: formData.is_featured,
          is_available: true,
          property_type: formData.property_type,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          total_area: parseFloat(formData.total_area),
          land_area: formData.land_area ? parseFloat(formData.land_area) : null,
          construction_year: parseInt(formData.construction_year),
          property_condition: formData.property_condition,
          parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : 0
        })
        .select()
        .single();

      if (listingError) throw listingError;

      const listingId = listing.id;

      // 2. Crear los requisitos específicos para compra de propiedades (solo información adicional)
      const { error: requirementsError } = await supabase
        .from('property_purchase_requirements')
        .insert({
          listing_id: listingId,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          total_area: parseFloat(formData.total_area),
          land_area: formData.land_area ? parseFloat(formData.land_area) : null,
          construction_year: parseInt(formData.construction_year),
          property_condition: formData.property_condition,
          parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : 0,
          property_type: formData.property_type
        });

      if (requirementsError) throw requirementsError;

      // 3. Crear las amenidades
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

      // 4. Crear las imágenes
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

      setSuccessMessage('¡Propiedad publicada exitosamente! Redirigiendo...');
      
      setTimeout(() => {
        navigate('/dashboard/purchase/search');
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
              Publicar Propiedad en Venta
            </h1>
            <p className="text-gray-600">
              Completa los datos de tu propiedad para encontrar compradores
            </p>
          </div>

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
                    placeholder="Ej: Casa adosada en urbanización tranquila"
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
                    placeholder="Describe tu propiedad, sus características, ventajas y cualquier detalle relevante para los compradores..."
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
                    placeholder="3"
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
                    Superficie construida (m²)
                  </label>
                  <input
                    type="number"
                    name="total_area"
                    value={formData.total_area}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="120"
                  />
                  {errors.total_area && <p className="text-red-500 text-sm mt-1">{errors.total_area}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Superficie terreno (m²)
                  </label>
                  <input
                    type="number"
                    name="land_area"
                    value={formData.land_area}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="200"
                  />
                </div>
              </div>
            </div>

            {/* Detalles adicionales */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                4. Detalles adicionales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año de construcción
                  </label>
                  <input
                    type="number"
                    name="construction_year"
                    value={formData.construction_year}
                    onChange={handleInputChange}
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="2010"
                  />
                  {errors.construction_year && <p className="text-red-500 text-sm mt-1">{errors.construction_year}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de la propiedad
                  </label>
                  <select
                    name="property_condition"
                    value={formData.property_condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecciona el estado</option>
                    {propertyConditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                  {errors.property_condition && <p className="text-red-500 text-sm mt-1">{errors.property_condition}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plazas de parking
                  </label>
                  <input
                    type="number"
                    name="parking_spaces"
                    value={formData.parking_spaces}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>

            {/* Fechas y Destacada */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                4.5. Fechas y Promoción
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <TailAdminDatePicker
                    selected={formData.available_from}
                    onChange={(date) => setFormData(prev => ({ ...prev, available_from: date }))}
                    label="Disponible desde"
                    placeholder="Seleccionar fecha de disponibilidad"
                    minDate={new Date()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Propiedad destacada
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_featured"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <label htmlFor="is_featured" className="text-sm text-gray-700">
                      Marcar como propiedad destacada (aparecerá en la página principal)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Precio */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                5. Precio
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de venta (€)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="250000"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    <p>💡 <strong>Consejo:</strong> Investiga precios similares en la zona</p>
                    <p>💡 Incluye gastos de notaría y registro si es aplicable</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenidades */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                6. Amenidades
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
                7. Imágenes de la propiedad
              </h3>
              
              <ImageUpload 
                onImagesUploaded={handleImagesUploaded}
                maxImages={15}
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
                    <Building className="w-5 h-5" />
                    Publicar Propiedad en Venta
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

export default PropertySaleForm;
