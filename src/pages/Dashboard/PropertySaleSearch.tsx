import React from 'react';
import PropertySaleList from '../../components/properties/PropertySaleList';

const PropertySaleSearch: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Buscar Propiedades en Venta
        </h1>
        <p className="text-gray-600">
          Encuentra la propiedad perfecta para comprar
        </p>
      </div>
      
      <PropertySaleList />
    </div>
  );
};

export default PropertySaleSearch;
