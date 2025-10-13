import React from 'react';
import { LocationSearchResult } from '../../types/supabase';
import PersonCard from './PersonCard';

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
          <PersonCard
            key={person.id}
            person={person as any}
            onClick={() => onPersonClick(person)}
          />
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
