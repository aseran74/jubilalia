import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  HomeIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  listing_type: 'property_purchase' | 'property_rental';
  is_available: boolean;
  created_at: string;
  owner_name: string;
}

const AdminPropertyManagement: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sale' | 'rental'>('all');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      fetchProperties();
    }
  }, [isAdmin, filter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('🔍 AdminPropertyManagement - Cargando propiedades...');

      // Obtener todas las propiedades
      let query = supabase
        .from('property_listings')
        .select(`
          id,
          title,
          description,
          address,
          city,
          price,
          listing_type,
          is_available,
          created_at,
          profile_id
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtro si no es 'all'
      if (filter === 'sale') {
        query = query.eq('listing_type', 'property_purchase');
      } else if (filter === 'rental') {
        query = query.eq('listing_type', 'property_rental');
      }

      const { data: propertiesData, error: propertiesError } = await query;

      console.log('🔍 AdminPropertyManagement - Propiedades obtenidas:', propertiesData, 'Error:', propertiesError);

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        return;
      }

      // Obtener nombres de propietarios
      const profileIds = propertiesData?.map(p => p.profile_id).filter(Boolean) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', profileIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Crear mapa de perfiles
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile.full_name);
      });

      // Transformar datos
      const transformedProperties = propertiesData?.map(property => ({
        ...property,
        owner_name: profilesMap.get(property.profile_id) || 'Propietario desconocido'
      })) || [];

      console.log('🎉 AdminPropertyManagement - Propiedades procesadas:', transformedProperties);
      setProperties(transformedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

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

      // Eliminar amenidades si existen
      const { error: amenitiesError } = await supabase
        .from('property_amenities')
        .delete()
        .eq('listing_id', propertyId);

      if (amenitiesError) {
        console.error('Error deleting amenities:', amenitiesError);
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

     const getPropertyTypeLabel = (listingType: string) => {
     switch (listingType) {
       case 'property_purchase':
         return 'Venta';
       case 'property_rental':
         return 'Alquiler';
       default:
         return 'Desconocido';
     }
   };

     const getPropertyTypeIcon = (listingType: string) => {
     switch (listingType) {
       case 'property_purchase':
         return <CurrencyEuroIcon className="w-5 h-5 text-green-600" />;
       case 'property_rental':
         return <HomeIcon className="w-5 h-5 text-blue-600" />;
       default:
         return <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />;
     }
   };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BuildingOfficeIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso restringido</h3>
          <p className="text-gray-600">Solo los administradores pueden acceder a esta sección</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

     const filteredProperties = filter === 'all' 
     ? properties 
     : properties.filter(p => 
         filter === 'sale' ? p.listing_type === 'property_purchase' : p.listing_type === 'property_rental'
       );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Propiedades</h1>
            <p className="text-gray-600 mt-1">Administra todas las propiedades de venta y alquiler</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/dashboard/properties/sale/create')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Nueva Venta
            </button>
            <button
              onClick={() => navigate('/dashboard/properties/rental/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Nuevo Alquiler
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyEuroIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Propiedades en Venta</p>
                             <p className="text-2xl font-bold text-gray-900">
                 {properties.filter(p => p.listing_type === 'property_purchase').length}
               </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HomeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Propiedades en Alquiler</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.listing_type === 'property_rental').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Propiedades</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('sale')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'sale'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Venta
          </button>
          <button
            onClick={() => setFilter('rental')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'rental'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alquiler
          </button>
        </div>
      </div>

      {/* Lista de propiedades */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Propiedades ({filteredProperties.length})
          </h2>
        </div>
        
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay propiedades</h3>
            <p className="text-gray-500">No se encontraron propiedades con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propietario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {property.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {property.city}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPropertyTypeIcon(property.listing_type)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getPropertyTypeLabel(property.listing_type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(property.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.owner_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        property.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {property.is_available ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(property.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                                                 <button
                           onClick={() => navigate(`/dashboard/properties/${property.listing_type === 'property_purchase' ? 'sale' : 'rental'}/${property.id}`)}
                           className="text-blue-600 hover:text-blue-900"
                         >
                           <EyeIcon className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => navigate(`/dashboard/properties/${property.listing_type === 'property_purchase' ? 'sale' : 'rental'}/${property.id}/edit`)}
                           className="text-green-600 hover:text-green-900"
                         >
                           <PencilIcon className="w-4 h-4" />
                         </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPropertyManagement;
