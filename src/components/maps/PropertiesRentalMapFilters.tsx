import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface PropertyRentalFilters {
  searchTerm: string;
  selectedCity: string;
  selectedListingType: string;
  selectedPropertyType: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
}

interface PropertiesRentalMapFiltersProps {
  filters: PropertyRentalFilters;
  onFiltersChange: (filters: PropertyRentalFilters) => void;
  onClose: () => void;
  isOpen: boolean;
  cities: string[];
  propertyTypes: string[];
}

const PropertiesRentalMapFilters: React.FC<PropertiesRentalMapFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
  isOpen,
  cities,
  propertyTypes
}) => {
  const [localFilters, setLocalFilters] = useState<PropertyRentalFilters>(filters);

  const handleFilterChange = (key: keyof PropertyRentalFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: PropertyRentalFilters = {
      searchTerm: '',
      selectedCity: '',
      selectedListingType: '',
      selectedPropertyType: '',
      minPrice: 0,
      maxPrice: 5000,
      bedrooms: 0,
      bathrooms: 0
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Filtros de Búsqueda</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Búsqueda por texto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            value={localFilters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Título, descripción, dirección..."
          />
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ciudad
          </label>
          <select
            value={localFilters.selectedCity}
            onChange={(e) => handleFilterChange('selectedCity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las ciudades</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Tipo de listado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Listado
          </label>
          <select
            value={localFilters.selectedListingType}
            onChange={(e) => handleFilterChange('selectedListingType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="property_rental">Alquiler</option>
            <option value="property_purchase">Venta</option>
            <option value="coliving_community">Coliving</option>
            <option value="room_rental">Habitación</option>
          </select>
        </div>

        {/* Tipo de propiedad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Propiedad
          </label>
          <select
            value={localFilters.selectedPropertyType}
            onChange={(e) => handleFilterChange('selectedPropertyType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Máximo (€/mes)
          </label>
          <input
            type="number"
            min="0"
            value={localFilters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Sin límite"
          />
        </div>

        {/* Habitaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Habitaciones Mínimas
          </label>
          <select
            value={localFilters.bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={0}>Cualquier cantidad</option>
            <option value={1}>1+ habitación</option>
            <option value={2}>2+ habitaciones</option>
            <option value={3}>3+ habitaciones</option>
            <option value={4}>4+ habitaciones</option>
            <option value={5}>5+ habitaciones</option>
          </select>
        </div>

        {/* Baños */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Baños Mínimos
          </label>
          <select
            value={localFilters.bathrooms}
            onChange={(e) => handleFilterChange('bathrooms', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={0}>Cualquier cantidad</option>
            <option value={1}>1+ baño</option>
            <option value={2}>2+ baños</option>
            <option value={3}>3+ baños</option>
          </select>
        </div>

        </div>
        
        {/* Botones de acción */}
        <div className="flex space-x-4 pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={resetFilters}
            className="flex-1 px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Limpiar Filtros
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PropertiesRentalMapFilters;

