import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  HomeIcon,
  CurrencyEuroIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    description: string;
    property_type: string;
    address: string;
    city: string;
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    listing_type: 'property_rental' | 'property_purchase';
    images: string[];
    price_per_person?: number;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getListingTypeLabel = () => {
    return property.listing_type === 'property_rental' ? 'Alquiler' : 'Venta';
  };

  const getListingTypePath = () => {
    return property.listing_type === 'property_rental' ? 'rental' : 'sale';
  };

  const getListingTypeColor = () => {
    return property.listing_type === 'property_rental' 
      ? 'bg-blue-500' 
      : 'bg-green-500';
  };

  return (
    <Link 
      to={`/properties/${getListingTypePath()}/${property.id}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-green-400"
    >
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
            <HomeIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {/* Badge de tipo */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${getListingTypeColor()}`}>
          {getListingTypeLabel()}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Tipo de propiedad */}
        <div className="mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase">
            {property.property_type}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {property.title}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {property.description}
        </p>

        {/* Ubicación */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span className="line-clamp-1">{property.city}</span>
        </div>

        {/* Características */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          {property.bedrooms && (
            <div className="flex items-center">
              <HomeIcon className="w-4 h-4 mr-1" />
              <span>{property.bedrooms} hab.</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Squares2X2Icon className="w-4 h-4 mr-1" />
              <span>{property.bathrooms} baños</span>
            </div>
          )}
        </div>

        {/* Precio */}
        <div className="flex items-baseline justify-between pt-4 border-t border-gray-200">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(property.price)}
            </div>
            {property.listing_type === 'property_rental' && property.price_per_person && (
              <div className="text-xs text-gray-500 mt-1">
                {formatPrice(property.price_per_person)}/mes por persona
              </div>
            )}
            {property.listing_type === 'property_purchase' && property.price_per_person && (
              <div className="text-xs text-gray-500 mt-1">
                {formatPrice(property.price_per_person)}/persona
              </div>
            )}
          </div>
          <CurrencyEuroIcon className="w-6 h-6 text-green-600" />
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;


