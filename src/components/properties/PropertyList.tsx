import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  BuildingOfficeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  created_at: string;
  status: string;
}

const PropertyList: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      setError(error.message || 'Error al cargar las propiedades');
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = propertyType === 'all' || property.property_type === propertyType;
    
    const matchesPrice = priceRange === 'all' || 
                        (priceRange === 'low' && property.price <= 100000) ||
                        (priceRange === 'medium' && property.price > 100000 && property.price <= 300000) ||
                        (priceRange === 'high' && property.price > 300000);

    return matchesSearch && matchesType && matchesPrice;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando propiedades...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Propiedades
            </h1>
            <p className="mt-2 text-gray-600">
              Encuentra la propiedad perfecta para ti
            </p>
          </div>
          <Link
            to="/dashboard/properties/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Publicar Propiedad
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Título, descripción o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Propiedad
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="apartment">Apartamento</option>
                <option value="house">Casa</option>
                <option value="villa">Villa</option>
                <option value="studio">Estudio</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de Precio
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los precios</option>
                <option value="low">Hasta 100.000€</option>
                <option value="medium">100.000€ - 300.000€</option>
                <option value="high">Más de 300.000€</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {filteredProperties.length} propiedades encontradas
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros o publica una nueva propiedad
            </p>
            <Link
              to="/dashboard/properties/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Publicar Propiedad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Property Image */}
                <div className="h-48 bg-gray-200 relative">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      property.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {property.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{property.bedrooms} hab</span>
                      <span>{property.bathrooms} baños</span>
                      <span>{property.area}m²</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-blue-600">
                      {property.price.toLocaleString('es-ES')}€
                    </div>
                    <Link
                      to={`/dashboard/properties/${property.id}`}
                      className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Ver detalles →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyList;
