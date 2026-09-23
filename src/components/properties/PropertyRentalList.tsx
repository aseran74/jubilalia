import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import UnifiedPropertyFilter from '../common/UnifiedPropertyFilter';
import AmenitiesFilter from '../common/AmenitiesFilter';
import Modal from '../common/Modal';
import { MapPin, Bed, Bath, Square, Heart, Eye, MessageCircle, Home } from 'lucide-react';
import MapViewControls, { MapOverlayHeader, CreateListingButton } from '../common/MapViewControls';
import ListingsMap from '../maps/ListingsMap';

interface PropertyRental {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  available_from: string;
  recommended_occupants?: number;
  price_per_person?: number;
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
  latitude?: number | null;
  longitude?: number | null;
}

const PropertyRentalList: React.FC = () => {
  const [properties, setProperties] = useState<PropertyRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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
          is_available,
          property_type,
          bedrooms,
          bathrooms,
          total_area,
          max_occupants,
          recommended_occupants,
          price_per_person,
          latitude,
          longitude
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
      const transformedProperties = propertiesData?.map(property => {
        const requirements = requirementsMap.get(property.id) || {};
        return {
          id: property.id,
          title: property.title,
          description: property.description,
          address: property.address,
          city: property.city,
          price: property.price,
          available_from: property.available_from,
          recommended_occupants: property.recommended_occupants,
          price_per_person: property.price_per_person,
          rental_requirements: {
            ...requirements,
            bedrooms: property.bedrooms || requirements.bedrooms || 0,
            bathrooms: property.bathrooms || requirements.bathrooms || 0,
            total_area: property.total_area || requirements.total_area || 0,
            max_occupants: property.max_occupants || requirements.max_occupants || 1,
            property_type: property.property_type || requirements.property_type || ''
          },
          owner: profilesMap.get(property.profile_id) || { full_name: 'Propietario' },
          images: imagesMap.get(property.id) || [],
          latitude: property.latitude,
          longitude: property.longitude
        };
      }) || [];

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
    // Comparación case-insensitive para property_type
    const matchesPropertyType = !propertyType || 
      property.rental_requirements.property_type?.toLowerCase() === propertyType.toLowerCase();
    const matchesPrice = (priceRange.min === 0 || property.price >= priceRange.min) && 
                        (priceRange.max === 0 || property.price <= priceRange.max);
    const matchesBedrooms = bedrooms === 0 || property.rental_requirements.bedrooms >= bedrooms;
    const matchesBathrooms = bathrooms === 0 || property.rental_requirements.bathrooms >= bathrooms;

    return matchesSearch && matchesCity && matchesPropertyType && matchesPrice && matchesBedrooms && matchesBathrooms;
  });

  const cities = [...new Set(properties.map(property => property.city))];
  
  // Tipos de vivienda consistentes con los formularios
  const propertyTypes = [
    'Comunidad Coliving',
    'Apartamento',
    'Casa',
    'Estudio',
    'Loft',
    'Duplex',
    'Villa',
    'Chalet',
    'Finca'
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

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (selectedCity ? 1 : 0) +
    (propertyType ? 1 : 0) +
    (priceRange.min !== 0 || priceRange.max !== 10000 ? 1 : 0) +
    (bedrooms > 0 ? 1 : 0) +
    (bathrooms > 0 ? 1 : 0) +
    selectedAmenities.length;

  const createRental = () => navigate('/dashboard/properties/rental/create');

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-slate-50">
      {viewMode === 'list' && (
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 pl-[4.5rem] md:pl-4 pt-[calc(var(--safe-top)+12px)]">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-stone-900">Alquiler</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {filteredProperties.length} propiedades
          </p>
        </div>
        <CreateListingButton onClick={createRental} label="Crear anuncio de alquiler" />
      </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-700" />
        </div>
      )}

      {viewMode === 'map' ? (
        <div className="relative h-[100dvh] min-h-[22rem] w-full">
          <ListingsMap
            items={filteredProperties.map((property) => ({
              id: property.id,
              title: property.title,
              city: property.city,
              address: property.address,
              latitude: property.latitude,
              longitude: property.longitude,
              price: property.price,
              imageUrl: property.images?.[0],
            }))}
            onSelect={(item) => navigate(`/dashboard/properties/rental/${item.id}`)}
            actionLabel="Ver alquiler"
            markerLetter="A"
            compact
            className="h-full w-full"
          />
          <MapOverlayHeader
            title="Alquiler"
            subtitle={`${filteredProperties.length} propiedades`}
            action={<CreateListingButton onClick={createRental} label="Crear anuncio de alquiler" />}
          />
        </div>
      ) : (
        <div className="p-4 pb-32">
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
                  {property.price_per_person && (
                    <div className="text-sm font-medium text-blue-600 mt-1">
                      {property.price_per_person.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€/mes por persona
                    </div>
                  )}
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
        </div>
      )}

      <MapViewControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFiltersClick={() => setIsFiltersModalOpen(true)}
        filterCount={activeFilterCount}
      />

      {/* Modal de Filtros */}
      <Modal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        title="Filtros"
        size="lg"
      >
        <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
          <UnifiedPropertyFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedPropertyType={propertyType}
            setSelectedPropertyType={setPropertyType}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            bedrooms={bedrooms}
            setBedrooms={setBedrooms}
            bathrooms={bathrooms}
            setBathrooms={setBathrooms}
            selectedAmenities={selectedAmenities}
            cities={cities}
            propertyTypes={propertyTypes}
            maxPrice={5000}
          />
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
                setSearchTerm('');
                setSelectedCity('');
                setPropertyType('');
                setSelectedAmenities([]);
                setBedrooms(0);
                setBathrooms(0);
                setPriceRange({ min: 0, max: 10000 });
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
