import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, MapPin, Euro, Users, Search } from 'lucide-react';

const RoomPublish: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header con navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/dashboard"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Publicar Habitación</h1>
            <p className="text-sm sm:text-base text-gray-600">Comparte tu habitación disponible con la comunidad</p>
          </div>
        </div>
      </div>

      {/* Opciones de publicación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Opción 1: Formulario simple */}
        <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 hover:border-blue-300 transition-colors">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Formulario Simple</h3>
            <p className="text-sm sm:text-base text-gray-600">Formulario rápido con campos esenciales</p>
          </div>
          
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Campos básicos de la habitación</span>
            </div>
            <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Precio y disponibilidad</span>
            </div>
            <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Requisitos del inquilino</span>
            </div>
            <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Subida de imágenes</span>
            </div>
          </div>

          <Link
            to="/properties/create-simple"
            className="w-full bg-blue-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-blue-600 transition-colors text-center block font-medium text-sm sm:text-base"
          >
            Usar Formulario Simple
          </Link>
        </div>

        {/* Opción 2: Formulario completo */}
        <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 hover:border-green-300 transition-colors">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Formulario Completo</h3>
            <p className="text-sm sm:text-base text-gray-600">Formulario detallado con todas las opciones</p>
          </div>
          
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Todos los campos disponibles</span>
            </div>
            <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Múltiples pasos organizados</span>
            </div>
            <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Validación avanzada</span>
            </div>
            <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Gestión de amenidades</span>
            </div>
          </div>

          <Link
            to="/properties/create"
            className="w-full bg-green-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-green-600 transition-colors text-center block font-medium text-sm sm:text-base"
          >
            Usar Formulario Completo
          </Link>
        </div>
      </div>

      {/* Consejos para publicar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-6 border border-blue-200">
        <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          </div>
          Consejos para una publicación exitosa
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-blue-900 text-sm sm:text-base">Fotos de calidad</h4>
                <p className="text-xs sm:text-sm text-blue-700">Incluye fotos claras y bien iluminadas de la habitación</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-blue-900 text-sm sm:text-base">Descripción detallada</h4>
                <p className="text-xs sm:text-sm text-blue-700">Explica las características y ventajas de tu habitación</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-blue-900 text-sm sm:text-base">Precio competitivo</h4>
                <p className="text-xs sm:text-sm text-blue-700">Investiga precios similares en tu zona</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-blue-900 text-sm sm:text-base">Respuesta rápida</h4>
                <p className="text-xs sm:text-sm text-blue-700">Responde pronto a las consultas de los interesados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <h4 className="text-sm sm:text-lg font-semibold text-gray-900">Ubicación</h4>
          <p className="text-xs sm:text-sm text-gray-600">Especifica bien la zona y transporte</p>
        </div>
        
        <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <Euro className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <h4 className="text-sm sm:text-lg font-semibold text-gray-900">Precio</h4>
          <p className="text-xs sm:text-sm text-gray-600">Incluye gastos y servicios</p>
        </div>
        
        <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          </div>
          <h4 className="text-sm sm:text-lg font-semibold text-gray-900">Compañeros</h4>
          <p className="text-xs sm:text-sm text-gray-600">Describe el ambiente de convivencia</p>
        </div>
      </div>

      {/* Enlaces útiles */}
      <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Enlaces Útiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <Link
            to="/dashboard/rooms/search"
            className="flex items-center p-2 sm:p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base text-gray-700">Ver habitaciones disponibles</span>
          </Link>
          
          <Link
            to="/dashboard/profile/edit"
            className="flex items-center p-2 sm:p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base text-gray-700">Completar mi perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomPublish;
