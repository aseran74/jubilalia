import React, { useState } from 'react';

import { Plus, Calendar, Users, Activity, Star } from 'lucide-react';
import ActivityList from './ActivityList';
import ActivityForm from './ActivityForm';

const ActivityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);


  const handleCreateActivity = () => {
    setShowCreateForm(true);
    setActiveTab('create');
  };

  const handleBackToList = () => {
    setShowCreateForm(false);
    setActiveTab('list');
  };



  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Actividades</h1>
            <p className="text-gray-600">Descubre y organiza actividades emocionantes</p>
          </div>
          
          <button
            onClick={handleCreateActivity}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear Actividad
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Actividades</p>
                <p className="text-2xl font-bold text-blue-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Participantes</p>
                <p className="text-2xl font-bold text-green-900">156</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Este Mes</p>
                <p className="text-2xl font-bold text-orange-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Valoración</p>
                <p className="text-2xl font-bold text-purple-900">4.8</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'list'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Explorar Actividades
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'create'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Crear Nueva Actividad
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'list' && !showCreateForm && (
            <ActivityList />
          )}
          
          {activeTab === 'create' && showCreateForm && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleBackToList}
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  ← Volver a la lista
                </button>
                <h2 className="text-xl font-semibold text-gray-900">Crear Nueva Actividad</h2>
              </div>
              <ActivityForm />
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿Necesitas ayuda para crear tu primera actividad?
          </h3>
          <p className="text-gray-600 mb-4">
            Nuestro equipo está aquí para ayudarte a organizar actividades increíbles
          </p>
          <div className="flex gap-3 justify-center">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Ver Tutorial
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Contactar Soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDashboard;
