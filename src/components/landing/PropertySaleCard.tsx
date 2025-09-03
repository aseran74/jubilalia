import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  HomeIcon,
  CurrencyEuroIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface PropertySaleCardProps {
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
    property_condition: string;
    images: string[];
    is_featured: boolean;
    created_at: string;
  };
}

const PropertySaleCard: React.FC<PropertySaleCardProps> = ({ property }) => {
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
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
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
                 <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
           Venta
         </div>
         {property.is_featured && (
           <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg">
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
          <div className="flex items-center text-blue-600 font-bold">
            <CurrencyEuroIcon className="w-4 h-4 mr-1" />
            {formatPrice(property.price)}
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
            {property.property_condition && (
              <span> • {property.property_condition}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Publicado {formatDate(property.created_at)}
          </span>
                     <Link
             to={`/dashboard/properties/sale/${property.id}`}
             className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
           >
             Ver detalles
           </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertySaleCard;
