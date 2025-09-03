import React from 'react';
import ActivityList from '../../components/activities/ActivityList';

const ActivitySearch: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Buscar Actividades
        </h1>
        <p className="text-gray-600">
          Encuentra actividades interesantes y conecta con personas con intereses similares
        </p>
      </div>
      
      <ActivityList />
    </div>
  );
};

export default ActivitySearch;
