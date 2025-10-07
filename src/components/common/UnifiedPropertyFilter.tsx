import React from 'react';
import { FunnelIcon } from 'lucide-react';
import CompactNumberStepper from './CompactNumberStepper';

interface UnifiedPropertyFilterProps {
  // Estados de filtros
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCity: string;
  setSelectedCity: (value: string) => void;
  selectedListingType?: string;
  setSelectedListingType?: (value: string) => void;
  selectedPropertyType: string;
  setSelectedPropertyType: (value: string) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (value: { min: number; max: number }) => void;
  bedrooms: number;
  setBedrooms: (value: number) => void;
  bathrooms: number;
  setBathrooms: (value: number) => void;
  selectedAmenities: string[];
  setSelectedAmenities: (value: string[]) => void;
  
  // Datos para opciones
  cities: string[];
  propertyTypes: string[];
  
  // Configuración
  showListingType?: boolean;
  onOpenAdvancedFilters: () => void;
  maxPrice?: number;
}

const UnifiedPropertyFilter: React.FC<UnifiedPropertyFilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCity,
  setSelectedCity,
  selectedListingType,
  setSelectedListingType,
  selectedPropertyType,
  setSelectedPropertyType,
  priceRange,
  setPriceRange,
  bedrooms,
  setBedrooms,
  bathrooms,
  setBathrooms,
  selectedAmenities,
  setSelectedAmenities,
  cities,
  propertyTypes,
  showListingType = false,
  onOpenAdvancedFilters,
  maxPrice = 5000
}) => {
  return (
    <div className="space-y-4">
      {/* Fila 1: Búsqueda (50%), Ciudad (25%), Tipo de Operación (25%) y Tipo de Vivienda (25%) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar propiedades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las ciudades</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        
        {showListingType && selectedListingType !== undefined && setSelectedListingType && (
          <select
            value={selectedListingType}
            onChange={(e) => setSelectedListingType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tipo de operación</option>
            <option value="property_rental">Alquiler</option>
            <option value="property_purchase">Venta</option>
            <option value="coliving">Coliving</option>
            <option value="room_rental">Habitaciones</option>
          </select>
        )}
        
        <select
          value={selectedPropertyType}
          onChange={(e) => setSelectedPropertyType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tipo de vivienda</option>
          {propertyTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      {/* Fila 2: Rango de Precio con Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Rango de precio: {priceRange.min}€ - {priceRange.max}€
          </label>
          <button
            onClick={() => setPriceRange({ min: 0, max: maxPrice })}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Resetear
          </button>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max={maxPrice}
            step="100"
            value={priceRange.min}
            onChange={(e) => setPriceRange((prev: { min: number; max: number }) => ({ ...prev, min: Number(e.target.value) }))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="range"
            min="0"
            max={maxPrice}
            step="100"
            value={priceRange.max}
            onChange={(e) => setPriceRange((prev: { min: number; max: number }) => ({ ...prev, max: Number(e.target.value) }))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {/* Fila 3: Habitaciones, Baños y Más Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CompactNumberStepper
          label="Habitaciones"
          value={bedrooms}
          onChange={setBedrooms}
          max={5}
        />
        
        <CompactNumberStepper
          label="Baños"
          value={bathrooms}
          onChange={setBathrooms}
          max={4}
        />
        
        <button
          onClick={onOpenAdvancedFilters}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          <span className="text-sm">Más filtros</span>
          {selectedAmenities.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {selectedAmenities.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default UnifiedPropertyFilter;
