import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, UserPlus, LogIn } from 'lucide-react';

const AppSplash: React.FC = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Mostrar contenido después de un breve delay para efecto de splash
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex flex-col">
      {/* Header con logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo y título */}
        <div className={`text-center mb-12 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-gray-800">Jubilalia</h1>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Tu comunidad de jubilados activos
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Conecta, comparte experiencias y encuentra tu lugar ideal para vivir
          </p>
        </div>

        {/* Botones de acción */}
        <div className={`w-full max-w-sm space-y-4 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Botón de Login */}
          <Link
            to="/login"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white text-xl font-bold py-4 px-8 rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 group"
          >
            <LogIn className="w-6 h-6" />
            <span>Iniciar Sesión</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Botón de Registro */}
          <Link
            to="/register"
            className="w-full bg-white text-gray-800 text-xl font-bold py-4 px-8 rounded-full border-2 border-green-500 hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 group"
          >
            <UserPlus className="w-6 h-6" />
            <span>Crear Cuenta</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Características destacadas */}
        <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl transition-all duration-1000 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Comunidad</h3>
            <p className="text-gray-600 text-sm">Conecta con personas afines</p>
          </div>

          <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Vivienda</h3>
            <p className="text-gray-600 text-sm">Encuentra tu hogar ideal</p>
          </div>

          <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Actividades</h3>
            <p className="text-gray-600 text-sm">Participa en eventos y actividades</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`text-center py-6 px-4 transition-all duration-1000 delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className="text-sm text-gray-500">
          Al continuar, aceptas nuestros{' '}
          <Link to="/terms" className="text-green-600 hover:text-green-700 font-medium">
            términos de servicio
          </Link>{' '}
          y{' '}
          <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">
            política de privacidad
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AppSplash;
