import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface RoomFilters {
  minPrice: number;
  maxPrice: number;
  maxOccupants: number;
  availableOnly: boolean;
  hasImages: boolean;
  city: string;
  privateBathroom: boolean;
  hasBalcony: boolean;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  gender: string;
}

interface RoomsMapFiltersProps {
  filters: RoomFilters;
  onFiltersChange: (filters: RoomFilters) => void;
  onClose: () => void;
  isOpen: boolean;
}

const RoomsMapFilters: React.FC<RoomsMapFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
  isOpen
}) => {
  const [localFilters, setLocalFilters] = useState<RoomFilters>(filters);

  const handleFilterChange = (key: keyof RoomFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: RoomFilters = {
      minPrice: 0,
      maxPrice: 2000,
      maxOccupants: 10,
      availableOnly: false,
      hasImages: false,
      city: '',
      privateBathroom: false,
      hasBalcony: false,
      smokingAllowed: false,
      petsAllowed: false,
      gender: 'any'
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
        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rango de Precio (€/mes)
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Precio mínimo</label>
              <input
                type="number"
                min="0"
                max="2000"
                value={localFilters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Precio máximo</label>
              <input
                type="number"
                min="0"
                max="2000"
                value={localFilters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 2000)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="2000"
              />
            </div>
          </div>
        </div>

        {/* Ocupantes máximos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ocupantes Máximos
          </label>
          <select
            value={localFilters.maxOccupants}
            onChange={(e) => handleFilterChange('maxOccupants', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value={1}>1 persona</option>
            <option value={2}>2 personas</option>
            <option value={3}>3 personas</option>
            <option value={4}>4 personas</option>
            <option value={5}>5 personas</option>
            <option value={6}>6 personas</option>
            <option value={8}>8 personas</option>
            <option value={10}>10+ personas</option>
          </select>
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ciudad
          </label>
          <input
            type="text"
            value={localFilters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ej: Madrid, Barcelona..."
          />
        </div>

        {/* Filtros de características */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Características
          </label>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="privateBathroom"
              checked={localFilters.privateBathroom}
              onChange={(e) => handleFilterChange('privateBathroom', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="privateBathroom" className="ml-2 text-sm text-gray-700">
              Baño privado
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasBalcony"
              checked={localFilters.hasBalcony}
              onChange={(e) => handleFilterChange('hasBalcony', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="hasBalcony" className="ml-2 text-sm text-gray-700">
              Balcón
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="smokingAllowed"
              checked={localFilters.smokingAllowed}
              onChange={(e) => handleFilterChange('smokingAllowed', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="smokingAllowed" className="ml-2 text-sm text-gray-700">
              Fumar permitido
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="petsAllowed"
              checked={localFilters.petsAllowed}
              onChange={(e) => handleFilterChange('petsAllowed', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="petsAllowed" className="ml-2 text-sm text-gray-700">
              Mascotas permitidas
            </label>
          </div>
        </div>

        {/* Filtro de género */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Género
          </label>
          <select
            value={localFilters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="any">Cualquier género</option>
            <option value="male">Soy un hombre</option>
            <option value="female">Soy una mujer</option>
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

export default RoomsMapFilters;
