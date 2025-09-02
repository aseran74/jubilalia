import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  HomeIcon,
  CurrencyEuroIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface PropertyRentalCardProps {
  property: {
    id: string;
    title: string;
    description: string;
    price: number;
    address: string;
    city: string;
    bedrooms: number;
    bathrooms: number;
    total_area: number;
    property_type: string;
    available_from: string;
    images: string[];
    is_featured: boolean;
    created_at: string;
  };
}

const PropertyRentalCard: React.FC<PropertyRentalCardProps> = ({ property }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Imagen */}
      <div className="relative h-48 bg-gray-200">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <HomeIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          Alquiler
        </div>
        {property.is_featured && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <StarIcon className="w-3 h-3 mr-1" />
            Destacada
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center text-purple-600 font-bold">
            <CurrencyEuroIcon className="w-4 h-4 mr-1" />
            {formatPrice(property.price)}/mes
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {property.description}
        </p>

        {/* Detalles */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>{property.address}, {property.city}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <HomeIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              {property.bedrooms} hab • {property.bathrooms} baños • {property.total_area}m²
            </span>
          </div>

          <div className="text-sm text-gray-600">
            <span className="capitalize">{property.property_type}</span>
            {property.available_from && (
              <span> • Disponible desde {formatDate(property.available_from)}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Publicado {formatDate(property.created_at)}
          </span>
          <Link
            to={`/dashboard/properties/rental/${property.id}`}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyRentalCard;
