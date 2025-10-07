import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import CompactNumberStepper from '../common/CompactNumberStepper';
import AmenitiesFilter from '../common/AmenitiesFilter';
import Modal from '../common/Modal';
import { Search, MapPin, Bed, Bath, Square, Heart, Eye, MessageCircle, Home, Plus, FunnelIcon } from 'lucide-react';
import PriceRangeSlider from '../common/PriceRangeSlider';

interface PropertyRental {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  available_from: string;
  rental_requirements: {
    bedrooms: number;
    bathrooms: number;
    total_area: number;
    max_occupants: number;
    property_type: string;
  };
  owner: {
    full_name: string;
    avatar_url?: string;
  };
  images: string[];
}

const PropertyRentalList: React.FC = () => {
  const [properties, setProperties] = useState<PropertyRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);


  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando fetch de propiedades en alquiler...');
      
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
        .eq('listing_type', 'property_rental')
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
        .from('property_rental_requirements')
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
        rental_requirements: requirementsMap.get(property.id) || {},
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
    const matchesPropertyType = !propertyType || property.rental_requirements.property_type === propertyType;
    const matchesPrice = (priceRange.min === 0 || property.price >= priceRange.min) && 
                        (priceRange.max === 0 || property.price <= priceRange.max);
    const matchesBedrooms = bedrooms === 0 || property.rental_requirements.bedrooms >= bedrooms;
    const matchesBathrooms = bathrooms === 0 || property.rental_requirements.bathrooms >= bathrooms;

    return matchesSearch && matchesCity && matchesPropertyType && matchesPrice && matchesBedrooms && matchesBathrooms;
  });

  const cities = [...new Set(properties.map(property => property.city))];
  
  // Tipos de vivienda consistentes con los formularios
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
            <h1 className="text-3xl font-bold text-gray-900">Propiedades en Alquiler</h1>
            <p className="text-gray-600 mt-1">
              {filteredProperties.length} propiedades encontradas
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard/properties/rental/map')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Ver en Mapa
            </button>
            <button
              onClick={() => navigate('/dashboard/properties/rental/create')}
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
        
        <div className="space-y-2 pl-4">
          {/* Fila 1: Búsqueda, Ciudad y Tipo de Vivienda */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Fila 2: Precio, Habitaciones, Baños y Más Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 30% - Barra de precio */}
            <div className="w-full">
              <PriceRangeSlider
                min={0}
                max={5000}
                value={priceRange}
                onChange={setPriceRange}
                step={50}
                className="text-sm"
              />
            </div>
            
            {/* 33% - Habitaciones y Baños centrados */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-300 rounded-lg">
                <Bed className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Habitaciones</span>
                <CompactNumberStepper label="" value={bedrooms} onChange={setBedrooms} max={5} />
              </div>

              <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-300 rounded-lg">
                <Bath className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Baños</span>
                <CompactNumberStepper label="" value={bathrooms} onChange={setBathrooms} max={4} />
              </div>
            </div>
            
            {/* 33% - Más Filtros centrado */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setIsFiltersModalOpen(true)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                <span>Más Filtros</span>
                {selectedAmenities.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                    {selectedAmenities.length}
                  </span>
                )}
              </button>
            </div>
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
                  <Home className="w-12 h-12" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 space-y-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {property.rental_requirements.property_type}
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
                  <span>{property.rental_requirements.bedrooms}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  <span>{property.rental_requirements.bathrooms}</span>
                </div>
                <div className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  <span>{property.rental_requirements.total_area}m²</span>
                </div>
              </div>

              {/* Precio y disponibilidad */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(property.price)}
                  </div>
                  <div className="text-sm text-gray-500">por mes</div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Disponible desde</div>
                  <div className="font-medium">{formatDate(property.available_from)}</div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate(`/dashboard/properties/rental/${property.id}`)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalles
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {filteredProperties.length === 0 && !loading && (
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
                setPriceRange({ min: 0, max: 5000 });
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

export default PropertyRentalList;
