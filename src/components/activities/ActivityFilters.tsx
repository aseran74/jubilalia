import React from 'react';

interface ActivityFiltersProps {
  maxDistance: number;
  onDistanceChange: (distance: number) => void;
  activityType: string;
  onActivityTypeChange: (type: string) => void;
  difficultyLevel: string;
  onDifficultyChange: (level: string) => void;
  isFree: boolean | null;
  onIsFreeChange: (isFree: boolean | null) => void;
}

const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  maxDistance,
  onDistanceChange,
  activityType,
  onActivityTypeChange,
  difficultyLevel,
  onDifficultyChange,
  isFree,
  onIsFreeChange
}) => {
  const activityTypes = [
    'Todos',
    'Deportes',
    'Cultura',
    'Gastronomía',
    'Naturaleza',
    'Talleres',
    'Excursiones',
    'Eventos sociales',
    'Voluntariado',
    'Otros'
  ];

  const difficultyLevels = [
    { value: '', label: 'Todas' },
    { value: 'Baja', label: 'Baja' },
    { value: 'Media', label: 'Media' },
    { value: 'Alta', label: 'Alta' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>

      {/* Distancia */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Distancia máxima: {maxDistance === 999999 ? 'Sin límite' : `${maxDistance} km`}
        </label>
        <input
          type="range"
          min="5"
          max="999999"
          step="5"
          value={maxDistance}
          onChange={(e) => onDistanceChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5 km</span>
          <span>100 km</span>
          <span>Sin límite</span>
        </div>
        
        {/* Botones rápidos */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onDistanceChange(25)}
            className={`flex-1 px-3 py-1.5 text-xs rounded ${maxDistance === 25 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            25 km
          </button>
          <button
            onClick={() => onDistanceChange(50)}
            className={`flex-1 px-3 py-1.5 text-xs rounded ${maxDistance === 50 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            50 km
          </button>
          <button
            onClick={() => onDistanceChange(100)}
            className={`flex-1 px-3 py-1.5 text-xs rounded ${maxDistance === 100 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            100 km
          </button>
          <button
            onClick={() => onDistanceChange(999999)}
            className={`flex-1 px-3 py-1.5 text-xs rounded ${maxDistance === 999999 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Sin límite
          </button>
        </div>
      </div>

      {/* Tipo de actividad */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de actividad
        </label>
        <select
          value={activityType}
          onChange={(e) => onActivityTypeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {activityTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Dificultad */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dificultad
        </label>
        <select
          value={difficultyLevel}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {difficultyLevels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* Precio */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Precio
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              checked={isFree === null}
              onChange={() => onIsFreeChange(null)}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Todas</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={isFree === true}
              onChange={() => onIsFreeChange(true)}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Gratis</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={isFree === false}
              onChange={() => onIsFreeChange(false)}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">De pago</span>
          </label>
        </div>
      </div>

      {/* Botón limpiar filtros */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            onDistanceChange(50);
            onActivityTypeChange('Todos');
            onDifficultyChange('');
            onIsFreeChange(null);
          }}
          className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default ActivityFilters;


