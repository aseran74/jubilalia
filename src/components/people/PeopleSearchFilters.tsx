import React, { useState } from 'react';

interface SearchFilters {
  maxDistance: number;
  interests: string[];
  ageRange: [number, number];
  gender: string | null;
  occupation: string | null;
  has_room_to_share?: boolean | null;
  wants_to_find_roommate?: boolean | null;
}

interface PeopleSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
}

const PeopleSearchFilters: React.FC<PeopleSearchFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Lista de intereses predefinidos
  const predefinedInterests = [
    'Viajes', 'Cocina', 'Música', 'Deportes', 'Arte', 'Literatura',
    'Jardinería', 'Fotografía', 'Tecnología', 'Historia', 'Cine',
    'Baile', 'Pintura', 'Senderismo', 'Pesca', 'Bricolaje',
    'Coleccionismo', 'Voluntariado', 'Idiomas', 'Meditación'
  ];

  // Lista de ocupaciones predefinidas
  const predefinedOccupations = [
    'Jubilado', 'Profesor', 'Médico', 'Ingeniero', 'Abogado',
    'Comercial', 'Administrativo', 'Técnico', 'Arquitecto',
    'Diseñador', 'Escritor', 'Artista', 'Consultor', 'Otros'
  ];

  const handleInterestToggle = (interest: string) => {
    const newInterests = filters.interests.includes(interest)
      ? filters.interests.filter(i => i !== interest)
      : [...filters.interests, interest];
    
    onFiltersChange({ interests: newInterests });
  };

  const handleDistanceChange = (distance: number) => {
    onFiltersChange({ maxDistance: distance });
  };

  const handleAgeRangeChange = (min: number, max: number) => {
    onFiltersChange({ ageRange: [min, max] });
  };

  const handleGenderChange = (gender: string | null) => {
    onFiltersChange({ gender });
  };

  const handleOccupationChange = (occupation: string | null) => {
    onFiltersChange({ occupation });
  };

  const clearFilters = () => {
    onFiltersChange({
      maxDistance: 50, // 50 km por defecto
      interests: [],
      ageRange: [55, 100],
      gender: null,
      occupation: null,
      has_room_to_share: null,
      wants_to_find_roommate: null
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Filtros
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? 'Ocultar' : 'Avanzados'}
        </button>
      </div>

      {/* Distancia */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Distancia máxima: {filters.maxDistance === 999999 ? 'Sin límite' : `${filters.maxDistance} km`}
        </label>
        <input
          type="range"
          min="5"
          max="999999"
          step="5"
          value={filters.maxDistance}
          onChange={(e) => handleDistanceChange(parseInt(e.target.value))}
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
            onClick={() => handleDistanceChange(25)}
            className={`flex-1 px-3 py-1.5 text-xs rounded ${filters.maxDistance === 25 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            25 km
          </button>
          <button
            onClick={() => handleDistanceChange(50)}
            className={`flex-1 px-3 py-1.5 text-xs rounded ${filters.maxDistance === 50 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            50 km
          </button>
          <button
            onClick={() => handleDistanceChange(100)}
            className={`flex-1 px-3 py-1.5 text-xs rounded ${filters.maxDistance === 100 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            100 km
          </button>
          <button
            onClick={() => handleDistanceChange(999999)}
            className={`flex-1 px-3 py-1.5 text-xs rounded ${filters.maxDistance === 999999 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Sin límite
          </button>
        </div>
      </div>

      {/* Intereses */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Intereses ({filters.interests.length} seleccionados)
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {predefinedInterests.map((interest) => (
            <label key={interest} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.interests.includes(interest)}
                onChange={() => handleInterestToggle(interest)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{interest}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <>
          {/* Rango de edad */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rango de edad: {filters.ageRange[0]} - {filters.ageRange[1]} años
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mínima</label>
                <input
                  type="number"
                  min="18"
                  max="120"
                  value={filters.ageRange[0]}
                  onChange={(e) => handleAgeRangeChange(parseInt(e.target.value), filters.ageRange[1])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Máxima</label>
                <input
                  type="number"
                  min="18"
                  max="120"
                  value={filters.ageRange[1]}
                  onChange={(e) => handleAgeRangeChange(filters.ageRange[0], parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Género */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Género
            </label>
            <div className="flex space-x-4">
              {['male', 'female', 'other', null].map((gender) => (
                <label key={gender || 'any'} className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    checked={filters.gender === gender}
                    onChange={() => handleGenderChange(gender)}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {gender === 'male' ? 'Hombre' : 
                     gender === 'female' ? 'Mujer' : 
                     gender === 'other' ? 'Otro' : 'Cualquiera'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Ocupación */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ocupación
            </label>
            <select
              value={filters.occupation || ''}
              onChange={(e) => handleOccupationChange(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Cualquiera</option>
              {predefinedOccupations.map((occupation) => (
                <option key={occupation} value={occupation}>
                  {occupation}
                </option>
              ))}
            </select>
          </div>

          {/* Preferencias de vivienda */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferencias de vivienda
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.has_room_to_share === true}
                  onChange={(e) => onFiltersChange({ has_room_to_share: e.target.checked ? true : null })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  🏠 Tiene habitación disponible
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.wants_to_find_roommate === true}
                  onChange={(e) => onFiltersChange({ wants_to_find_roommate: e.target.checked ? true : null })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  👥 Busca compañero/a
                </span>
              </label>
            </div>
          </div>
        </>
      )}

      {/* Botón limpiar filtros */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Información de filtros activos */}
      {(filters.interests.length > 0 || filters.gender || filters.occupation) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Filtros activos:
          </h4>
          <div className="space-y-1">
            {filters.interests.length > 0 && (
              <p className="text-xs text-blue-700">
                Intereses: {filters.interests.join(', ')}
              </p>
            )}
            {filters.gender && (
              <p className="text-xs text-blue-700">
                Género: {filters.gender === 'male' ? 'Hombre' : 
                         filters.gender === 'female' ? 'Mujer' : 'Otro'}
              </p>
            )}
            {filters.occupation && (
              <p className="text-xs text-blue-700">
                Ocupación: {filters.occupation}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleSearchFilters;
