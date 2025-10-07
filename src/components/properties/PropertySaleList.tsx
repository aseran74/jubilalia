import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import UnifiedPropertyFilter from '../common/UnifiedPropertyFilter';
import AmenitiesFilter from '../common/AmenitiesFilter';
import PriceRangeSlider from '../common/PriceRangeSlider';
import { Search, MapPin, Bed, Bath, Square, Heart, Eye, MessageCircle, Building, Calendar, Car, Plus, X } from 'lucide-react';

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
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data: propertiesData, error } = await supabase
        .from('property_listings')
        .select(`id, title, description, address, city, price, available_from, profile_id, listing_type, is_available`)
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
    const matchesPropertyType = !propertyType || property.purchase_requirements.property_type === propertyType;
    const matchesPrice = property.price >= priceRange.min && property.price <= priceRange.max;
    const matchesBedrooms = bedrooms === 0 || property.purchase_requirements.bedrooms >= bedrooms;
    const matchesBathrooms = bathrooms === 0 || property.purchase_requirements.bathrooms >= bathrooms;

    return matchesSearch && matchesCity && matchesPropertyType && matchesPrice && matchesBedrooms && matchesBathrooms;
  });

  const cities = [...new Set(properties.map(property => property.city))];

  const propertyTypes = [
    'Apartamento', 'Casa', 'Estudio', 'Loft', 'Duplex', 'Villa', 'Chalet',
    'Finca', 'Comunidad', 'Local comercial', 'Oficina', 'Nave industrial'
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
    selectedCity,
    propertyType,
    bedrooms > 0,
    bathrooms > 0,
    priceRange.min !== 0 || priceRange.max !== 1000000,
    selectedAmenities.length > 0
  ].filter(Boolean).length;

  const areFiltersActive = activeFiltersCount > 0 || searchTerm !== '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Propiedades en Venta</h1>
            <p className="text-gray-600">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad disponible' : 'propiedades disponibles'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard/properties/sale/map')}
              className="px-4 py-2.5 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2 font-medium shadow-sm"
            >
              <MapPin className="w-4 h-4" />
              Ver en Mapa
            </button>
            <button
              onClick={() => navigate('/dashboard/properties/sale/create')}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Publicar Propiedad
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4">
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
            onOpenAdvancedFilters={() => setShowFiltersModal(true)}
            maxPrice={1000000}
          />
        </div>
        

        {/* Active Filters Tags */}
        {areFiltersActive && (
          <div className="px-4 py-3 bg-green-50 border-t border-green-100">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm font-semibold text-gray-700">Filtros activos:</span>
              
              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-sm px-3 py-1.5 rounded-full border border-gray-300 shadow-sm">
                  <Search className="w-3 h-3" />
                  "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="ml-0.5 text-gray-500 hover:text-gray-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedCity && (
                <span className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-sm px-3 py-1.5 rounded-full border border-gray-300 shadow-sm">
                  <MapPin className="w-3 h-3" />
                  {selectedCity}
                  <button onClick={() => setSelectedCity('')} className="ml-0.5 text-gray-500 hover:text-gray-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {propertyType && (
                <span className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-sm px-3 py-1.5 rounded-full border border-gray-300 shadow-sm">
                  <Building className="w-3 h-3" />
                  {propertyType}
                  <button onClick={() => setPropertyType('')} className="ml-0.5 text-gray-500 hover:text-gray-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {bedrooms > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-sm px-3 py-1.5 rounded-full border border-gray-300 shadow-sm">
                  <Bed className="w-3 h-3" />
                  {bedrooms}+ hab.
                  <button onClick={() => setBedrooms(0)} className="ml-0.5 text-gray-500 hover:text-gray-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {bathrooms > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-sm px-3 py-1.5 rounded-full border border-gray-300 shadow-sm">
                  <Bath className="w-3 h-3" />
                  {bathrooms}+ baños
                  <button onClick={() => setBathrooms(0)} className="ml-0.5 text-gray-500 hover:text-gray-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {(priceRange.min !== 0 || priceRange.max !== 1000000) && (
                <span className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-sm px-3 py-1.5 rounded-full border border-gray-300 shadow-sm">
                  {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                  <button onClick={() => setPriceRange({ min: 0, max: 1000000 })} className="ml-0.5 text-gray-500 hover:text-gray-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedAmenities.map(amenity => (
                <span key={amenity} className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-sm px-3 py-1.5 rounded-full border border-gray-300 shadow-sm">
                  {amenity}
                  <button onClick={() => setSelectedAmenities(prev => prev.filter(a => a !== amenity))} className="ml-0.5 text-gray-500 hover:text-gray-900">
                    <X className="w-3.5 h-3.5" />
            </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Property Grid */}
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

      {/* Modal de Filtros Avanzados */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <h2 className="text-2xl font-bold text-gray-900">Filtros Avanzados</h2>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              <PriceRangeSlider
                min={0}
                max={1000000}
                value={priceRange}
                onChange={setPriceRange}
                step={10000}
              />

          <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Amenidades Disponibles
                </label>
            <AmenitiesFilter
              selectedAmenities={selectedAmenities}
              onAmenitiesChange={setSelectedAmenities}
            />
                {selectedAmenities.length > 0 && (
                  <p className="mt-3 text-sm text-green-600 font-medium">
                    ✓ {selectedAmenities.length} amenidad{selectedAmenities.length !== 1 ? 'es' : ''} seleccionada{selectedAmenities.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
          </div>
          
            {/* Footer del Modal */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                  setPriceRange({ min: 0, max: 1000000 });
                setSelectedAmenities([]);
              }}
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