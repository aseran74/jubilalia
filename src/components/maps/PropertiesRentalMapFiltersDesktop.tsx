import React from 'react';

export interface PropertyRentalFilters {
  searchTerm: string;
  selectedCity: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
  selectedPropertyType: string;
}

interface PropertiesRentalMapFiltersDesktopProps {
  filters: PropertyRentalFilters;
  onFiltersChange: (filters: PropertyRentalFilters) => void;
  cities: string[];
  propertyTypes: string[];
}

const PropertiesRentalMapFiltersDesktop: React.FC<PropertiesRentalMapFiltersDesktopProps> = ({
  filters,
  onFiltersChange,
  cities,
  propertyTypes
}) => {
  const handleInputChange = (field: keyof PropertyRentalFilters, value: string | number) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const resetFilters = () => {
    const defaultFilters: PropertyRentalFilters = {
      searchTerm: '',
      selectedCity: '',
      minPrice: 0,
      maxPrice: 5000,
      bedrooms: 0,
      bathrooms: 0,
      selectedPropertyType: ''
    };
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="space-y-6">
      {/* Filtros de búsqueda */}
      <div className="space-y-4">
        {/* Búsqueda por término */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => handleInputChange('searchTerm', e.target.value)}
            placeholder="Buscar por título o descripción..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ciudad
          </label>
          <select
            value={filters.selectedCity}
            onChange={(e) => handleInputChange('selectedCity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          >
            <option value="">Todas las ciudades</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Rango de precios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio mensual: €{filters.minPrice.toLocaleString()} - €{filters.maxPrice.toLocaleString()}
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={filters.minPrice}
              onChange={(e) => handleInputChange('minPrice', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={filters.maxPrice}
              onChange={(e) => handleInputChange('maxPrice', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Habitaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Habitaciones: {filters.bedrooms}
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={filters.bedrooms}
            onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Baños */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Baños: {filters.bathrooms}
          </label>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={filters.bathrooms}
            onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Tipo de propiedad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Propiedad
          </label>
          <select
            value={filters.selectedPropertyType}
            onChange={(e) => handleInputChange('selectedPropertyType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          >
            <option value="">Todos los tipos</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón reset */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={resetFilters}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};

export default PropertiesRentalMapFiltersDesktop;
