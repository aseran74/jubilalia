import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  BuildingOfficeIcon,
  HomeIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon
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
  author_id: string;
}

interface Author {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      
      // Fetch property details
      const { data: propertyData, error: propertyError } = await supabase
        .from('property_listings')
        .select('*')
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);

      // Fetch author details
      if (propertyData.author_id) {
        const { data: authorData, error: authorError } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .eq('id', propertyData.author_id)
          .single();

        if (!authorError) {
          setAuthor(authorData);
        }
      }
    } catch (error: any) {
      console.error('Error fetching property:', error);
      setError(error.message || 'Error al cargar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando propiedad...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || 'Propiedad no encontrada'}
          </div>
          <button
            onClick={() => navigate('/dashboard/properties')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver a Propiedades
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'apartment': 'Apartamento',
      'house': 'Casa',
      'villa': 'Villa',
      'studio': 'Estudio'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/properties')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver a Propiedades
          </button>
        </div>

        {/* Property Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.title}
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center">
                  <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                  {getPropertyTypeLabel(property.property_type)}
                </span>
                <span className="flex items-center">
                  <HomeIcon className="w-4 h-4 mr-1" />
                  {property.bedrooms} habitaciones
                </span>
                <span className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  {property.bathrooms} baños
                </span>
                <span className="flex items-center">
                  <CurrencyEuroIcon className="w-4 h-4 mr-1" />
                  {property.area}m²
                </span>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 lg:ml-6">
              <div className="text-3xl font-bold text-blue-600">
                {property.price.toLocaleString('es-ES')}€
              </div>
              <div className="text-sm text-gray-600 text-center">
                Precio
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images */}
            {property.images && property.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={property.images[selectedImage]}
                    alt={property.title}
                    className="w-full h-96 object-cover"
                  />
                </div>
                {property.images.length > 1 && (
                  <div className="p-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {property.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                            index === selectedImage ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Descripción
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Detalles de la Propiedad
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Tipo: {getPropertyTypeLabel(property.property_type)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <HomeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Habitaciones: {property.bedrooms}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Baños: {property.bathrooms}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Superficie: {property.area}m²</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Publicado: {formatDate(property.created_at)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    property.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {property.status === 'active' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Author */}
            {author && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contactar con el propietario
                </h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    {author.avatar_url ? (
                      <img
                        src={author.avatar_url}
                        alt={author.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {author.full_name || 'Usuario'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Propietario
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    Llamar
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    Enviar Mensaje
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <Link
                  to={`/dashboard/properties/${property.id}/edit`}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Editar Propiedad
                </Link>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  Eliminar Propiedad
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
