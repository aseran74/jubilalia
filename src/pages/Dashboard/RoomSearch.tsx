import React from 'react';
import RoomList from '../../components/dashboard/RoomList';

const RoomSearch: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Buscar Habitaciones</h1>
        <p className="text-gray-600">
          Encuentra la habitación perfecta para ti. Filtra por ubicación, precio y preferencias.
        </p>
      </div>
      
      <RoomList />
    </div>
  );
};

export default RoomSearch;
