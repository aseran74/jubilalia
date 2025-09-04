import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import AdminButtons from '../common/AdminButtons';
import CompactNumberStepper from '../common/CompactNumberStepper';
import AmenitiesFilter from '../common/AmenitiesFilter';
import Modal from '../common/Modal';
import { Search, MapPin, Bed, Bath, Square, Heart, Eye, MessageCircle, Building, Calendar, Car, Plus, FunnelIcon } from 'lucide-react';

interface PropertySale {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  available_from: string;
  purchase_requirements: {
    bedrooms: number;
    bathrooms: number;
    total_area: number;
    land_area?: number;
    construction_year: number;
    property_condition: string;
    parking_spaces: number;
    property_type: string;
  };
  owner: {
    full_name: string;
    avatar_url?: string;
  };
  images: string[];
}

const PropertySaleList: React.FC = () => {
  const [properties, setProperties] = useState<PropertySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [bedroomsFilter, setBedroomsFilter] = useState('');
  const [bathroomsFilter, setBathroomsFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [yearRange, setYearRange] = useState({ min: 1800, max: new Date().getFullYear() });

  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDeleteProperty = async (propertyId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      return;
    }

    try {
      // Eliminar imágenes primero
      const { error: imagesError } = await supabase
        .from('property_images')
        .delete()
        .eq('listing_id', propertyId);

      if (imagesError) {
        console.error('Error deleting images:', imagesError);
      }

      // Eliminar requisitos
      const { error: requirementsError } = await supabase
        .from('property_purchase_requirements')
        .delete()
        .eq('listing_id', propertyId);

      if (requirementsError) {
        console.error('Error deleting requirements:', requirementsError);
      }

      // Eliminar la propiedad
      const { error: propertyError } = await supabase
        .from('property_listings')
        .delete()
        .eq('id', propertyId);

      if (propertyError) {
        console.error('Error deleting property:', propertyError);
        alert('Error al eliminar la propiedad');
        return;
      }

      // Actualizar la lista
      setProperties(prev => prev.filter(property => property.id !== propertyId));
      alert('Propiedad eliminada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la propiedad');
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando fetch de propiedades en venta...');
      
      // Obtener propiedades con sus requisitos y propietarios
      const { data: propertiesData, error } = await supabase
        .from('property_listings')
        .select(`
          id,
          title,
          description,
          address,
          city,
          price,
          available_from,
          profile_id,
          listing_type,
          is_available
        `)
        .eq('listing_type', 'property_purchase')
        .eq('is_available', true);

      console.log('📊 Datos de propiedades obtenidos:', {
        count: propertiesData?.length || 0,
        data: propertiesData,
        error: error
      });

      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }

      // Obtener los requisitos de las propiedades por separado
      const propertyIds = propertiesData?.map(property => property.id) || [];
      console.log('🆔 IDs de propiedades encontrados:', propertyIds);
      
      const { data: requirementsData, error: requirementsError } = await supabase
        .from('property_purchase_requirements')
        .select('*')
        .in('listing_id', propertyIds);

      console.log('📋 Datos de requisitos obtenidos:', {
        count: requirementsData?.length || 0,
        data: requirementsData,
        error: requirementsError
      });

      if (requirementsError) {
        console.error('Error fetching requirements:', requirementsError);
        return;
      }

      // Obtener los perfiles de los propietarios
      const profileIds = propertiesData?.map(property => property.profile_id).filter(Boolean) || [];
      console.log('👤 IDs de perfiles encontrados:', profileIds);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', profileIds);

      console.log('👤 Datos de perfiles obtenidos:', {
        count: profilesData?.length || 0,
        data: profilesData,
        error: profilesError
      });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Obtener las imágenes
      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('listing_id, image_url')
        .in('listing_id', propertyIds);

      console.log('🖼️ Datos de imágenes obtenidos:', {
        count: imagesData?.length || 0,
        data: imagesData,
        error: imagesError
      });

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
        return;
      }

      // Crear un mapa de requisitos por listing_id
      const requirementsMap = new Map();
      requirementsData?.forEach(req => {
        requirementsMap.set(req.listing_id, req);
      });

      // Crear un mapa de perfiles por id
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Crear un mapa de imágenes por listing_id
      const imagesMap = new Map();
      imagesData?.forEach(img => {
        if (!imagesMap.has(img.listing_id)) {
          imagesMap.set(img.listing_id, []);
        }
        imagesMap.get(img.listing_id).push(img.image_url);
      });

      // Transformar los datos para que sean más fáciles de usar
      const transformedProperties = propertiesData?.map(property => ({
        id: property.id,
        title: property.title,
        description: property.description,
        address: property.address,
        city: property.city,
        price: property.price,
        available_from: property.available_from,
        purchase_requirements: requirementsMap.get(property.id) || {},
        owner: profilesMap.get(property.profile_id) || { full_name: 'Propietario' },
        images: imagesMap.get(property.id) || []
      })) || [];

      console.log('🔄 Propiedades transformadas:', {
        count: transformedProperties.length,
        properties: transformedProperties
      });

      setProperties(transformedProperties);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = !selectedCity || property.city === selectedCity;
    const matchesType = !selectedType || property.purchase_requirements.property_type === selectedType;
    const matchesPrice = property.price >= priceRange.min && property.price <= priceRange.max;
    const matchesBedrooms = !bedroomsFilter || property.purchase_requirements.bedrooms >= parseInt(bedroomsFilter);
    const matchesBathrooms = !bathroomsFilter || property.purchase_requirements.bathrooms >= parseFloat(bathroomsFilter);
    const matchesCondition = !conditionFilter || property.purchase_requirements.property_condition === conditionFilter;
    const matchesYear = property.purchase_requirements.construction_year >= yearRange.min && 
                       property.purchase_requirements.construction_year <= yearRange.max;

    return matchesSearch && matchesCity && matchesType && matchesPrice && 
           matchesBedrooms && matchesBathrooms && matchesCondition && matchesYear;
  });

  const cities = [...new Set(properties.map(property => property.city))];
  const propertyTypes = [...new Set(properties.map(property => property.purchase_requirements.property_type))];
  const propertyConditions = [...new Set(properties.map(property => property.purchase_requirements.property_condition))];

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
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Propiedades en Venta</h1>
            <p className="text-gray-600 mt-1">
              {filteredProperties.length} propiedades encontradas
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/properties/sale/map')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Ver en Mapa
            </button>
            <button
              onClick={() => navigate('/properties/sale/create')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Publicar Propiedad
            </button>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtros de búsqueda</h2>
          <button
            onClick={fetchProperties}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Recargar
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Fila 1: Búsqueda y Ciudad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar propiedades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas las ciudades</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          {/* Fila 2: Precio, Habitaciones, Baños y Más Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min/€"
                value={priceRange.min || ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Max/€"
                value={priceRange.max || ''}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <CompactNumberStepper
              label="Habitaciones"
              value={bedrooms}
              onChange={setBedrooms}
              max={5}
            />
            
            <CompactNumberStepper
              label="Baños"
              value={bathrooms}
              onChange={setBathrooms}
              max={4}
            />
            
            <button
              onClick={() => setIsFiltersModalOpen(true)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">Más filtros</span>
              {selectedAmenities.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {selectedAmenities.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4">
        <p className="text-gray-600">
          Se encontraron <span className="font-semibold text-green-600">{filteredProperties.length}</span> propiedades
        </p>
      </div>

      {/* Lista de propiedades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Imagen */}
            <div className="h-48 bg-gray-200 relative">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Building className="w-12 h-12" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 space-y-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {property.purchase_requirements.property_type}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {property.purchase_requirements.property_condition}
                </span>
              </div>

              {/* Botón de favorito */}
              <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Heart className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                {property.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {property.description}
              </p>

              {/* Ubicación */}
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{property.city}</span>
              </div>

              {/* Características */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{property.purchase_requirements.bedrooms}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  <span>{property.purchase_requirements.bathrooms}</span>
                </div>
                <div className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  <span>{property.purchase_requirements.total_area}m²</span>
                </div>
                {property.purchase_requirements.parking_spaces > 0 && (
                  <div className="flex items-center">
                    <Car className="w-4 h-4 mr-1" />
                    <span>{property.purchase_requirements.parking_spaces}</span>
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{property.purchase_requirements.construction_year}</span>
                </div>
                {property.purchase_requirements.land_area && (
                  <div className="flex items-center">
                    <Square className="w-4 h-4 mr-1" />
                    <span>Terreno: {property.purchase_requirements.land_area}m²</span>
                  </div>
                )}
              </div>

              {/* Precio */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(property.price)}
                  </div>
                  <div className="text-sm text-gray-500">Precio de venta</div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Publicado el</div>
                  <div className="font-medium">{formatDate(property.available_from)}</div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate(`/dashboard/properties/sale/${property.id}`)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalles
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Botones de administrador */}
              {isAdmin && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <AdminButtons
                    itemId={property.id}
                    itemType="property_sale"
                    onDelete={handleDeleteProperty}
                    className="justify-center"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProperties.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron propiedades</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Modal de Filtros */}
      <Modal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        title="Filtros Avanzados"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Amenidades</h4>
            <AmenitiesFilter
              selectedAmenities={selectedAmenities}
              onAmenitiesChange={setSelectedAmenities}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setSelectedAmenities([]);
                setBedrooms(0);
                setBathrooms(0);
                setPriceRange({ min: 0, max: 1000000 });
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpiar filtros
            </button>
            <button
              onClick={() => setIsFiltersModalOpen(false)}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PropertySaleList;
