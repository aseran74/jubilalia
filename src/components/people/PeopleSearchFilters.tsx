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
  embedded?: boolean;
}

const PeopleSearchFilters: React.FC<PeopleSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  embedded = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(embedded);

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

  const UNLIMITED_KM = 999999;
  const SLIDER_MAX_KM = 100;
  const isUnlimitedDistance = filters.maxDistance > SLIDER_MAX_KM;
  const sliderDistance = isUnlimitedDistance
    ? SLIDER_MAX_KM
    : Math.min(SLIDER_MAX_KM, Math.max(5, filters.maxDistance));

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
    <div className={embedded ? '' : 'bg-white rounded-lg shadow-sm p-6'}>
      {!embedded && (
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
      )}

      {/* Distancia */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Distancia máxima: {isUnlimitedDistance ? 'Sin límite' : `${sliderDistance} km`}
        </label>
        <input
          type="range"
          min="5"
          max={SLIDER_MAX_KM}
          step="5"
          value={sliderDistance}
          onChange={(e) => handleDistanceChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5 km</span>
          <span>50 km</span>
          <span>100 km</span>
        </div>
        
        {/* Botones rápidos */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={() => handleDistanceChange(25)}
            className={`rounded-full px-3.5 py-2 text-xs font-semibold ${!isUnlimitedDistance && filters.maxDistance === 25 ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
          >
            25 km
          </button>
          <button
            type="button"
            onClick={() => handleDistanceChange(50)}
            className={`rounded-full px-3.5 py-2 text-xs font-semibold ${!isUnlimitedDistance && filters.maxDistance === 50 ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
          >
            50 km
          </button>
          <button
            type="button"
            onClick={() => handleDistanceChange(100)}
            className={`rounded-full px-3.5 py-2 text-xs font-semibold ${!isUnlimitedDistance && filters.maxDistance === 100 ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
          >
            100 km
          </button>
          <button
            type="button"
            onClick={() => handleDistanceChange(UNLIMITED_KM)}
            className={`rounded-full px-3.5 py-2 text-xs font-semibold ${isUnlimitedDistance ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
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
        <div className="flex flex-wrap gap-2">
          {predefinedInterests.map((interest) => {
            const selected = filters.interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold ${
                  selected
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {interest}
              </button>
            );
          })}
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
            <div className="flex flex-wrap gap-2">
              {([
                { value: null, label: 'Cualquiera' },
                { value: 'male', label: 'Hombre' },
                { value: 'female', label: 'Mujer' },
                { value: 'other', label: 'Otro' },
              ] as const).map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleGenderChange(option.value)}
                  className={`rounded-full px-3.5 py-2 text-sm font-semibold ${
                    filters.gender === option.value
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ocupación */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ocupación
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedOccupations.map((occupation) => {
                const selected = filters.occupation === occupation;
                return (
                  <button
                    key={occupation}
                    type="button"
                    onClick={() => handleOccupationChange(selected ? null : occupation)}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold ${
                      selected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {occupation}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferencias de vivienda */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferencias de vivienda
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onFiltersChange({
                    has_room_to_share: filters.has_room_to_share === true ? null : true,
                  })
                }
                className={`rounded-full px-3.5 py-2 text-sm font-semibold ${
                  filters.has_room_to_share === true
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Tiene habitación
              </button>
              <button
                type="button"
                onClick={() =>
                  onFiltersChange({
                    wants_to_find_roommate: filters.wants_to_find_roommate === true ? null : true,
                  })
                }
                className={`rounded-full px-3.5 py-2 text-sm font-semibold ${
                  filters.wants_to_find_roommate === true
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Busca compañero/a
              </button>
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
