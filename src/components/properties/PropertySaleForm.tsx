import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  available_from: Date | null;
  // Campos específicos para Coliving
  coliving_total_spots?: string;
  coliving_community_description?: string;
  coliving_housing_type?: 'individual_apartments' | 'shared_house' | '';
  coliving_price_per_apartment?: string;
  coliving_price_per_unit?: string;
  coliving_show_members_publicly?: boolean;
  coliving_selected_members?: string[];
}

const PropertySaleForm: React.FC = () => {
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
          console.log('🔍 PropertySaleForm - Cargando datos para propiedad ID:', id);
          
          // Obtener datos de la propiedad
          const { data: propertyData, error: propertyError } = await supabase
            .from('property_listings')
            .select('*')
            .eq('id', id)
            .eq('listing_type', 'property_purchase')
            .single();

          console.log('🔍 PropertySaleForm - Datos de propiedad:', propertyData, 'Error:', propertyError);
          if (propertyError) throw propertyError;

          // Obtener imágenes
          const { data: imagesData, error: imagesError } = await supabase
            .from('property_images')
            .select('image_url')
            .eq('listing_id', id)
            .order('order_index', { ascending: true });

          console.log('🔍 PropertySaleForm - Datos de imágenes:', imagesData, 'Error:', imagesError);
          if (imagesError) throw imagesError;

          // Obtener datos de coliving si es una comunidad
          let colivingData = null;
          if (propertyData.property_type === 'Comunidad Coliving') {
            const { data: coliving, error: colivingError } = await supabase
              .from('coliving_requirements')
              .select('*')
              .eq('listing_id', id)
              .single();

            console.log('🔍 PropertySaleForm - Datos de coliving:', coliving, 'Error:', colivingError);
            if (!colivingError && coliving) {
              colivingData = coliving;

              // Cargar miembros si show_members_publicly es true
              if (coliving.show_members_publicly) {
                const { data: members, error: membersError } = await supabase
                  .from('coliving_members')
                  .select('profile_id')
                  .eq('listing_id', id);

                if (!membersError && members) {
                  colivingData.members = members.map(m => m.profile_id);
                }
              }
            }
          }

          // Actualizar el formulario con los datos obtenidos
          setFormData({
            title: propertyData.title || '',
            description: propertyData.description || '',
            property_type: propertyData.property_type || '',
            address: propertyData.address || '',
            city: propertyData.city || '',
            country: propertyData.country || 'España',
            price: propertyData.price?.toString() || '',
            bedrooms: propertyData.bedrooms?.toString() || '',
            bathrooms: propertyData.bathrooms?.toString() || '',
            total_area: propertyData.total_area?.toString() || '',
            land_area: propertyData.land_area?.toString() || '',
            construction_year: propertyData.construction_year?.toString() || '',
            property_condition: propertyData.property_condition || '',
            parking_spaces: propertyData.parking_spaces?.toString() || '',
            amenities: [], // Las amenities se manejan por separado
            images: imagesData?.map(img => img.image_url) || [],
            available_from: propertyData.available_from ? new Date(propertyData.available_from) : null,
            // Datos de coliving
            coliving_total_spots: colivingData?.total_spots?.toString() || '',
            coliving_community_description: colivingData?.community_description || '',
            coliving_housing_type: colivingData?.housing_type || '',
            coliving_price_per_apartment: colivingData?.price_per_apartment?.toString() || '',
            coliving_price_per_unit: colivingData?.price_per_unit?.toString() || '',
            coliving_show_members_publicly: colivingData?.show_members_publicly || false,
            coliving_selected_members: colivingData?.members || [],
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
    available_from: null,
    // Campos específicos para Coliving
    coliving_total_spots: '',
    coliving_community_description: '',
    coliving_housing_type: '',
    coliving_price_per_apartment: '',
    coliving_price_per_unit: '',
    coliving_show_members_publicly: false,
    coliving_selected_members: [],
  });

  const [availableUsers, setAvailableUsers] = useState<Array<{id: string, full_name: string, avatar_url?: string}>>([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // Cargar usuarios disponibles cuando se selecciona Comunidad Coliving
  useEffect(() => {
    if (formData.property_type === 'Comunidad Coliving') {
      fetchAvailableUsers();
    }
  }, [formData.property_type]);

  const fetchAvailableUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setAvailableUsers(users || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
    'Comunidad Coliving',
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

  const handleMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      coliving_selected_members: prev.coliving_selected_members?.includes(memberId)
        ? prev.coliving_selected_members.filter(id => id !== memberId)
        : [...(prev.coliving_selected_members || []), memberId]
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
            available_from: formData.available_from ? formData.available_from.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            property_type: formData.property_type,
            bedrooms: parseInt(formData.bedrooms),
            bathrooms: parseInt(formData.bathrooms),
            total_area: parseFloat(formData.total_area),
            land_area: formData.land_area ? parseFloat(formData.land_area) : null,
            construction_year: parseInt(formData.construction_year),
            property_condition: formData.property_condition,
            parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : 0
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
            listing_type: 'property_purchase',
            title: formData.title,
            description: formData.description,
            price: parseFloat(formData.price),
            address: formData.address,
            city: formData.city,
            country: formData.country,
            available_from: formData.available_from ? formData.available_from.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
        listingId = listing.id;
      }

      // 2. Guardar datos específicos de Coliving si aplica (sin available_spots para venta)
      if (formData.property_type === 'Comunidad Coliving' && formData.coliving_total_spots && formData.coliving_community_description && formData.coliving_housing_type) {
        if (isEditing) {
          // Eliminar requisitos existentes y crear nuevos
          await supabase
            .from('coliving_requirements')
            .delete()
            .eq('listing_id', listingId);
        }

        const { error: colivingError } = await supabase
          .from('coliving_requirements')
          .insert({
            listing_id: listingId,
            total_spots: parseInt(formData.coliving_total_spots),
            available_spots: parseInt(formData.coliving_total_spots), // En venta, todas las plazas están disponibles inicialmente
            community_description: formData.coliving_community_description,
            housing_type: formData.coliving_housing_type,
            price_per_apartment: formData.coliving_price_per_apartment ? parseFloat(formData.coliving_price_per_apartment) : null,
            price_per_unit: formData.coliving_price_per_unit ? parseFloat(formData.coliving_price_per_unit) : null,
            show_members_publicly: formData.coliving_show_members_publicly || false
          });

        if (colivingError) throw colivingError;

        // Guardar miembros apuntados si están seleccionados
        if (formData.coliving_show_members_publicly && formData.coliving_selected_members && formData.coliving_selected_members.length > 0) {
          // Eliminar miembros existentes si estamos editando
          if (isEditing) {
            await supabase
              .from('coliving_members')
              .delete()
              .eq('listing_id', listingId);
          }

          // Insertar nuevos miembros
          const membersData = formData.coliving_selected_members.map(profileId => ({
            listing_id: listingId,
            profile_id: profileId,
            status: 'active'
          }));

          const { error: membersError } = await supabase
            .from('coliving_members')
            .insert(membersData);

          if (membersError) throw membersError;
        }
      }

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
        navigate('/dashboard/properties/sale');
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
              {isEditing ? 'Editar Propiedad en Venta' : 'Publicar Propiedad en Venta'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Modifica los datos de tu propiedad' : 'Completa los datos de tu propiedad para encontrar compradores'}
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

              {/* Campos específicos para Coliving/Comunidad - Justo después de tipo */}
              {formData.property_type === 'Comunidad Coliving' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🏘️</span>
                    Configuración de Comunidad Coliving
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Número total de plazas (sin disponibles para venta) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número total de plazas
                      </label>
                      <input
                        type="number"
                        name="coliving_total_spots"
                        value={formData.coliving_total_spots}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ej: 10"
                      />
                      <p className="text-xs text-gray-500 mt-1">Total de personas que podrán vivir en la comunidad una vez comprada</p>
                    </div>

                    {/* Descripción de la comunidad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción de la comunidad
                      </label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                        <p className="text-sm text-blue-800 mb-2">
                          <strong>💡 ¿Qué incluir en esta descripción?</strong>
                        </p>
                        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                          <li>¿Es solo para parejas o también para individuos?</li>
                          <li>¿Qué incluye cada unidad? (cocina propia, baño privado, etc.)</li>
                          <li>¿Qué espacios son compartidos? (sala común, jardín, cocina, etc.)</li>
                          <li>¿Qué tipo de convivencia se busca? (activa, tranquila, etc.)</li>
                          <li>¿Hay servicios incluidos? (limpieza, actividades, etc.)</li>
                          <li>Explica el precio: ¿Cómo se divide entre los compradores?</li>
                        </ul>
                      </div>
                      <textarea
                        name="coliving_community_description"
                        value={formData.coliving_community_description}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ejemplo: Comunidad diseñada para personas mayores de 55 años que buscan un estilo de vida activo y social. Cada unidad cuenta con cocina completa equipada, baño privado y dormitorio independiente. Los espacios comunes incluyen sala de estar amplia, jardín con zona de huerto, y sala de actividades. El precio total se divide entre los compradores según el número de plazas adquiridas..."
                      />
                    </div>

                    {/* Tipo de vivienda */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipo de estructura de vivienda
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="relative flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                          <input
                            type="radio"
                            name="coliving_housing_type"
                            value="individual_apartments"
                            checked={formData.coliving_housing_type === 'individual_apartments'}
                            onChange={handleInputChange}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">
                              🏢 Apartamentos individuales
                            </span>
                            <span className="block text-xs text-gray-500 mt-1">
                              Cada persona/pareja tiene su propio apartamento completo con cocina y baño privados
                            </span>
                          </div>
                        </label>

                        <label className="relative flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                          <input
                            type="radio"
                            name="coliving_housing_type"
                            value="shared_house"
                            checked={formData.coliving_housing_type === 'shared_house'}
                            onChange={handleInputChange}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">
                              🏠 Casa grupal compartida
                            </span>
                            <span className="block text-xs text-gray-500 mt-1">
                              Habitaciones privadas con espacios comunes compartidos (cocina, sala, baños)
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Precios específicos según tipo de estructura */}
                    {formData.coliving_housing_type && (
                      <div className="mt-6 pt-6 border-t border-purple-300">
                        <h4 className="text-md font-semibold text-gray-800 mb-4">
                          💰 Precios por Unidad
                        </h4>
                        
                        {formData.coliving_housing_type === 'individual_apartments' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Precio por apartamento individual (€)
                            </label>
                            <input
                              type="number"
                              name="coliving_price_per_apartment"
                              value={formData.coliving_price_per_apartment}
                              onChange={handleInputChange}
                              min="0"
                              step="1000"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Ej: 150000"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Precio de compra de cada apartamento individual completo
                            </p>
                          </div>
                        )}

                        {formData.coliving_housing_type === 'shared_house' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Precio por unidad/habitación (€)
                            </label>
                            <input
                              type="number"
                              name="coliving_price_per_unit"
                              value={formData.coliving_price_per_unit}
                              onChange={handleInputChange}
                              min="0"
                              step="1000"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Ej: 50000"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Precio de compra de cada unidad/habitación en la casa compartida
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Gestión de miembros apuntados */}
                    <div className="mt-6 pt-6 border-t border-purple-300">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">
                        👥 Miembros Apuntados
                      </h4>

                      {/* Checkbox para hacer pública la lista */}
                      <div className="mb-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.coliving_show_members_publicly || false}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              coliving_show_members_publicly: e.target.checked 
                            }))}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              Mostrar miembros apuntados públicamente
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Si activas esta opción, cualquier persona podrá ver quiénes están interesados en la comunidad
                            </p>
                          </div>
                        </label>
                      </div>

                      {/* Selector de miembros (solo si está marcado como público) */}
                      {formData.coliving_show_members_publicly && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Seleccionar miembros apuntados
                          </label>
                          
                          {/* Filtro de búsqueda */}
                          <div className="mb-3">
                            <input
                              type="text"
                              placeholder="Buscar por nombre..."
                              value={memberSearchTerm}
                              onChange={(e) => setMemberSearchTerm(e.target.value)}
                              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                          </div>

                          <div className="bg-white rounded-lg border border-purple-200 p-4 max-h-64 overflow-y-auto">
                            {availableUsers.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-4">
                                Cargando usuarios...
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {(() => {
                                  const filteredUsers = availableUsers.filter(user => 
                                    user.full_name.toLowerCase().includes(memberSearchTerm.toLowerCase())
                                  );

                                  if (filteredUsers.length === 0) {
                                    return (
                                      <p className="text-sm text-gray-500 text-center py-4">
                                        No se encontraron usuarios con ese nombre
                                      </p>
                                    );
                                  }

                                  return filteredUsers.map(user => (
                                    <label 
                                      key={user.id} 
                                      className="flex items-center space-x-3 p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={formData.coliving_selected_members?.includes(user.id) || false}
                                        onChange={() => handleMemberToggle(user.id)}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 rounded"
                                      />
                                      <div className="flex items-center space-x-3 flex-1">
                                        {user.avatar_url ? (
                                          <img 
                                            src={user.avatar_url} 
                                            alt={user.full_name}
                                            className="w-8 h-8 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
                                            <span className="text-purple-700 text-sm font-medium">
                                              {user.full_name.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                        )}
                                        <span className="text-sm text-gray-900">{user.full_name}</span>
                                      </div>
                                    </label>
                                  ));
                                })()}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Seleccionados: {formData.coliving_selected_members?.length || 0} miembros apuntados
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                    {isEditing ? 'Editar Propiedad en Venta' : 'Publicar Propiedad en Venta'}
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
