import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface PropertySaleFilters {
  searchTerm: string;
  selectedCity: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
  selectedPropertyType: string;
}

interface PropertiesSaleMapFiltersProps {
  filters: PropertySaleFilters;
  onFiltersChange: (filters: PropertySaleFilters) => void;
  onClose: () => void;
  isOpen: boolean;
  cities: string[];
  propertyTypes: string[];
}

const PropertiesSaleMapFilters: React.FC<PropertiesSaleMapFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
  isOpen,
  cities,
  propertyTypes
}) => {
  const [localFilters, setLocalFilters] = useState<PropertySaleFilters>(filters);

  const handleFilterChange = (key: keyof PropertySaleFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: PropertySaleFilters = {
      searchTerm: '',
      selectedCity: '',
      minPrice: 0,
      maxPrice: 1000000,
      bedrooms: 0,
      bathrooms: 0,
      selectedPropertyType: ''
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todas las ciudades</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Precio con range slider doble */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rango de Precio
          </label>
          <div className="space-y-4">
            {/* Slider mínimo */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Precio mínimo</label>
              <input
                type="range"
                min="0"
                max="1000000"
                step="10000"
                value={localFilters.minPrice}
                onChange={(e) => {
                  const newMin = parseInt(e.target.value);
                  if (newMin <= localFilters.maxPrice) {
                    handleFilterChange('minPrice', newMin);
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>
            
            {/* Slider máximo */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Precio máximo</label>
              <input
                type="range"
                min="0"
                max="1000000"
                step="10000"
                value={localFilters.maxPrice}
                onChange={(e) => {
                  const newMax = parseInt(e.target.value);
                  if (newMax >= localFilters.minPrice) {
                    handleFilterChange('maxPrice', newMax);
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>
            
            {/* Valores seleccionados */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-semibold text-green-600 text-lg">
                €{localFilters.minPrice.toLocaleString()}
              </span>
              <span className="text-gray-400">—</span>
              <span className="font-semibold text-green-600 text-lg">
                {localFilters.maxPrice === 1000000 ? 'Sin límite' : `€${localFilters.maxPrice.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Habitaciones con step */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Habitaciones Mínimas
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleFilterChange('bedrooms', Math.max(0, localFilters.bedrooms - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-semibold text-gray-600">−</span>
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-semibold text-gray-900">{localFilters.bedrooms || 'Cualquier'}</span>
            </div>
            <button
              type="button"
              onClick={() => handleFilterChange('bedrooms', localFilters.bedrooms + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-semibold text-gray-600">+</span>
            </button>
          </div>
        </div>

        {/* Baños con step */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Baños Mínimos
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleFilterChange('bathrooms', Math.max(0, localFilters.bathrooms - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-semibold text-gray-600">−</span>
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-semibold text-gray-900">{localFilters.bathrooms || 'Cualquier'}</span>
            </div>
            <button
              type="button"
              onClick={() => handleFilterChange('bathrooms', localFilters.bathrooms + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-semibold text-gray-600">+</span>
            </button>
          </div>
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
            className="flex-1 px-6 py-3 text-base font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PropertiesSaleMapFilters;

