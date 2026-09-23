import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import UnifiedPropertyFilter from '../common/UnifiedPropertyFilter';
import AmenitiesFilter from '../common/AmenitiesFilter';
import { MapPin, Bed, Bath, Square, Heart, Eye, MessageCircle, Building, Calendar, Car, X } from 'lucide-react';
import MapViewControls, { MapOverlayHeader, CreateListingButton } from '../common/MapViewControls';
import ListingsMap from '../maps/ListingsMap';

interface PropertySale {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  available_from: string;
  recommended_occupants?: number;
  price_per_person?: number;
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
  latitude?: number | null;
  longitude?: number | null;
}

const PropertySaleList: React.FC = () => {
  const [properties, setProperties] = useState<PropertySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
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
          land_area,
          construction_year,
          property_condition,
          parking_spaces,
          recommended_occupants,
          price_per_person,
          latitude,
          longitude
        `)
        .eq('listing_type', 'property_purchase')
        .eq('is_available', true);

      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }

      const propertyIds = propertiesData?.map(property => property.id) || [];
      
      const { data: requirementsData, error: requirementsError } = await supabase
        .from('property_purchase_requirements')
        .select('*')
        .in('listing_id', propertyIds);

      if (requirementsError) {
        console.error('Error fetching requirements:', requirementsError);
        return;
      }

      const profileIds = propertiesData?.map(property => property.profile_id).filter(Boolean) || [];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', profileIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('listing_id, image_url')
        .in('listing_id', propertyIds);

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
        return;
      }

      const requirementsMap = new Map(requirementsData?.map(req => [req.listing_id, req]));
      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]));
      const imagesMap = new Map<string, string[]>();

      imagesData?.forEach(img => {
        if (!imagesMap.has(img.listing_id)) {
          imagesMap.set(img.listing_id, []);
        }
        imagesMap.get(img.listing_id)!.push(img.image_url);
      });

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
          purchase_requirements: {
            ...requirements,
            bedrooms: property.bedrooms || requirements.bedrooms || 0,
            bathrooms: property.bathrooms || requirements.bathrooms || 0,
            total_area: property.total_area || requirements.total_area || 0,
            land_area: property.land_area || requirements.land_area || 0,
            construction_year: property.construction_year || requirements.construction_year || 0,
            property_condition: property.property_condition || requirements.property_condition || '',
            parking_spaces: property.parking_spaces || requirements.parking_spaces || 0,
            property_type: property.property_type || requirements.property_type || ''
          },
          owner: profilesMap.get(property.profile_id) || { full_name: 'Propietario' },
          images: imagesMap.get(property.id) || [],
          latitude: property.latitude,
          longitude: property.longitude
        };
      }) || [];

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
      property.purchase_requirements.property_type?.toLowerCase() === propertyType.toLowerCase();
    const matchesPrice = property.price >= priceRange.min && property.price <= priceRange.max;
    const matchesBedrooms = bedrooms === 0 || property.purchase_requirements.bedrooms >= bedrooms;
    const matchesBathrooms = bathrooms === 0 || property.purchase_requirements.bathrooms >= bathrooms;

    return matchesSearch && matchesCity && matchesPropertyType && matchesPrice && matchesBedrooms && matchesBathrooms;
  });

  const cities = [...new Set(properties.map(property => property.city))];

  const propertyTypes = [
    'Comunidad Coliving', 'Apartamento', 'Casa', 'Estudio', 'Loft', 'Duplex', 'Villa', 'Chalet',
    'Casa rural'
  ];

  const formatPrice = (price: number) => new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 0
    }).format(price);


  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setPropertyType('');
    setPriceRange({ min: 0, max: 1000000 });
    setBedrooms(0);
    setBathrooms(0);
    setSelectedAmenities([]);
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCity,
    propertyType,
    bedrooms > 0,
    bathrooms > 0,
    priceRange.min !== 0 || priceRange.max !== 1000000,
    selectedAmenities.length > 0
  ].filter(Boolean).length;

  const createSale = () => navigate('/dashboard/properties/sale/create');

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-slate-50">
      {viewMode === 'list' && (
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 pl-[4.5rem] md:pl-4 pt-[calc(var(--safe-top)+12px)]">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-stone-900">Venta</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {filteredProperties.length} propiedades
          </p>
        </div>
        <CreateListingButton onClick={createSale} label="Crear anuncio de venta" />
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
            onSelect={(item) => navigate(`/dashboard/properties/sale/${item.id}`)}
            actionLabel="Ver venta"
            markerLetter="V"
            compact
            className="h-full w-full"
          />
          <MapOverlayHeader
            title="Venta"
            subtitle={`${filteredProperties.length} propiedades`}
            action={<CreateListingButton onClick={createSale} label="Crear anuncio de venta" />}
          />
        </div>
      ) : (
        <div className="p-4 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300 group">
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Building className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-blue-700 shadow-sm backdrop-blur-sm">
                  {property.purchase_requirements.property_type}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-orange-700 shadow-sm backdrop-blur-sm">
                  {property.purchase_requirements.property_condition}
                </span>
              </div>
              <button className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-sm hover:scale-110">
                <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">{property.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <MapPin className="w-4 h-4 mr-1.5 text-green-600" />
                <span className="font-medium">{property.city}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1"><Bed className="w-4 h-4 text-gray-400" /><span className="font-medium">{property.purchase_requirements.bedrooms}</span></div>
                <div className="flex items-center gap-1"><Bath className="w-4 h-4 text-gray-400" /><span className="font-medium">{property.purchase_requirements.bathrooms}</span></div>
                <div className="flex items-center gap-1"><Square className="w-4 h-4 text-gray-400" /><span className="font-medium">{property.purchase_requirements.total_area}m²</span></div>
                {property.purchase_requirements.parking_spaces > 0 && (
                  <div className="flex items-center gap-1"><Car className="w-4 h-4 text-gray-400" /><span className="font-medium">{property.purchase_requirements.parking_spaces}</span></div>
                )}
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">{formatPrice(property.price)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Precio de venta</div>
                  {property.price_per_person && (
                    <div className="text-xs font-medium text-blue-600 mt-1">
                      {property.price_per_person.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€/persona
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">{property.purchase_requirements.construction_year}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/dashboard/properties/sale/${property.id}`)}
                  className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow"
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalles
                </button>
                <button className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProperties.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron propiedades</h3>
          <p className="text-gray-500 mb-6">Intenta ajustar los filtros de búsqueda para ver más resultados</p>
          <button
            onClick={handleClearFilters}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium inline-flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        </div>
      )}
        </div>
      )}

      <MapViewControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFiltersClick={() => setShowFiltersModal(true)}
        filterCount={activeFiltersCount}
      />

      {/* Modal de Filtros Avanzados */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <h2 className="text-2xl font-bold text-gray-900">Filtros</h2>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
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
                maxPrice={1000000}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Amenidades Disponibles
                </label>
                <AmenitiesFilter
                  selectedAmenities={selectedAmenities}
                  onAmenitiesChange={setSelectedAmenities}
                />
              </div>
            </div>
          
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleClearFilters}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar Filtros
              </button>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySaleList;