import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getPropertyStats, getPropertyListings } from '../../lib/properties';
import type { PropertyListingWithDetails, PropertyStats } from '../../types/properties';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Euro, 
  Users, 
  Building, 
  Home, 
  Umbrella,
  Calendar,
  Star,
  MessageCircle,
  Eye,
  Layers
} from 'lucide-react';

const Properties: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [listings, setListings] = useState<PropertyListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsResult, listingsResult] = await Promise.all([
        getPropertyStats(),
        getPropertyListings()
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (listingsResult.success) {
        setListings(listingsResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getListingTypeIcon = (type: string) => {
    switch (type) {
      case 'room_rental':
        return <Users className="w-5 h-5" />;
      case 'property_rental':
        return <Building className="w-5 h-5" />;
      case 'property_purchase':
        return <Home className="w-5 h-5" />;
      case 'seasonal_rental':
        return <Umbrella className="w-5 h-5" />;
      default:
        return <Building className="w-5 h-5" />;
    }
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'room_rental':
        return 'Alquiler Habitación';
      case 'property_rental':
        return 'Alquiler Propiedad';
      case 'property_purchase':
        return 'Compra Compartida';
      case 'seasonal_rental':
        return 'Alquiler Temporal';
      default:
        return type;
    }
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'room_rental':
        return 'bg-blue-100 text-blue-800';
      case 'property_rental':
        return 'bg-green-100 text-green-800';
      case 'property_purchase':
        return 'bg-purple-100 text-purple-800';
      case 'seasonal_rental':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = searchTerm === '' || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || listing.listing_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Propiedades</h1>
              <p className="mt-2 text-gray-600">
                Encuentra o publica alojamientos, habitaciones y propiedades compartidas
              </p>
            </div>
            {user && (
              <div className="mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/properties/create"
                    className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Formulario Completo
                  </Link>
                  
                  <Link
                    to="/properties/create-simple"
                    className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Formulario Simple
                  </Link>
                  
                  <Link
                    to="/properties/compare"
                    className="inline-flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    <Layers className="w-5 h-5 mr-2" />
                    Comparar Formularios
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total_listings}</div>
                <div className="text-sm text-gray-600">Total Listados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.listings_by_type.room_rental}</div>
                <div className="text-sm text-gray-600">Habitaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.listings_by_type.property_rental}</div>
                <div className="text-sm text-gray-600">Propiedades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.listings_by_type.property_purchase}</div>
                <div className="text-sm text-gray-600">Compra</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.listings_by_type.seasonal_rental}</div>
                <div className="text-sm text-gray-600">Temporales</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por ciudad, dirección o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="md:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="room_rental">Habitaciones</option>
                <option value="property_rental">Propiedades</option>
                <option value="property_purchase">Compra</option>
                <option value="seasonal_rental">Temporales</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron propiedades</h3>
            <p className="text-gray-600">
              {searchTerm || selectedType !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Sé el primero en publicar una propiedad'
              }
            </p>
            {user && !searchTerm && selectedType === 'all' && (
              <Link
                to="/properties/create"
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors mt-4"
              >
                <Plus className="w-5 h-5 mr-2" />
                Publicar Primera Propiedad
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0].image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="w-16 h-16 text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getListingTypeColor(listing.listing_type)}`}>
                      {getListingTypeIcon(listing.listing_type)}
                      <span className="ml-1">{getListingTypeLabel(listing.listing_type)}</span>
                    </span>
                    {listing.price && (
                      <div className="text-lg font-bold text-gray-900">
                        {listing.price.toLocaleString('es-ES')}€
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {listing.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{listing.city}</span>
                  </div>

                  {/* Details */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    {listing.bedrooms && (
                      <span>{listing.bedrooms} hab.</span>
                    )}
                    {listing.bathrooms && (
                      <span>{listing.bathrooms} baños</span>
                    )}
                    {listing.total_area && (
                      <span>{listing.total_area}m²</span>
                    )}
                  </div>

                  {/* Description */}
                  {listing.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {listing.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Link
                      to={`/properties/${listing.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Link>
                    
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contactar
                    </button>
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

export default Properties;
