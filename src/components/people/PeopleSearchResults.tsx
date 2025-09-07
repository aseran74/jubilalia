import React from 'react';
import { LocationSearchResult } from '../../types/supabase';

interface PeopleSearchResultsProps {
  results: LocationSearchResult[];
  loading: boolean;
  onPersonClick: (person: LocationSearchResult) => void;
  onPersonSelect: (person: LocationSearchResult) => void;
}

const PeopleSearchResults: React.FC<PeopleSearchResultsProps> = ({
  results,
  loading,
  onPersonClick
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Buscando personas...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron personas
          </h3>
          <p className="text-gray-600">
            Intenta ampliar el radio de búsqueda o ajustar los filtros
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Resultados de búsqueda
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {results.length} personas encontradas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {results.map((person) => (
          <div
            key={person.id}
            onClick={() => onPersonClick(person)}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-all duration-150"
          >
            {/* Header con avatar y nombre */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0">
                {person.avatar_url ? (
                  <img
                    src={person.avatar_url}
                    alt={person.full_name || 'Usuario'}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-medium text-gray-900 hover:text-blue-600 truncate">
                  {person.full_name || 'Usuario sin nombre'}
                </h4>
                {person.occupation && (
                  <p className="text-sm text-gray-600 truncate">
                    {person.occupation}
                  </p>
                )}
              </div>
            </div>

            {/* Ubicación */}
            {person.formatted_address && (
              <div className="flex items-center mb-3 text-sm text-gray-500">
                <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">
                  {person.formatted_address}
                </span>
              </div>
            )}

            {/* Bio */}
            {person.bio && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {person.bio}
              </p>
            )}

            {/* Intereses */}
            {person.interests && person.interests.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {person.interests.slice(0, 3).map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {interest}
                    </span>
                  ))}
                  {person.interests.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{person.interests.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Botón de acción */}
            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPersonClick(person);
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ver perfil
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación básica */}
      {results.length >= 100 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Mostrando los primeros 100 resultados
            </p>
            <p className="text-sm text-gray-500">
              Refina los filtros para obtener resultados más específicos
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleSearchResults;
