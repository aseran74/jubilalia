import React from 'react';
import PropertyRentalList from '../../components/properties/PropertyRentalList';

const PropertyRentalSearch: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Buscar Propiedades en Alquiler
        </h1>
        <p className="text-gray-600">
          Encuentra la propiedad perfecta para alquilar
        </p>
      </div>
      
      <PropertyRentalList />
    </div>
  );
};

export default PropertyRentalSearch;
