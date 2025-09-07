import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface RoomFilters {
  minPrice: number;
  maxPrice: number;
  maxOccupants: number;
  availableOnly: boolean;
  hasImages: boolean;
  city: string;
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
      city: ''
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-h-[80vh] overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
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

        {/* Filtros de disponibilidad */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Disponibilidad
          </label>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="availableOnly"
              checked={localFilters.availableOnly}
              onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="availableOnly" className="ml-2 text-sm text-gray-700">
              Solo habitaciones disponibles
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasImages"
              checked={localFilters.hasImages}
              onChange={(e) => handleFilterChange('hasImages', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="hasImages" className="ml-2 text-sm text-gray-700">
              Solo con imágenes
            </label>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={resetFilters}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Limpiar
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomsMapFilters;
