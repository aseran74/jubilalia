import React from 'react';

const JubilaliaHomeSimple: React.FC = () => {
  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">
          🏠 Jubilalia
        </h1>
        <p className="text-xl text-green-600 mb-8">
          Aplicación para personas jubiladas
        </p>
        <div className="space-y-4">
          <a 
            href="/login" 
            className="block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Iniciar Sesión
          </a>
          <a 
            href="/register" 
            className="block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Registrarse
          </a>
        </div>
      </div>
    </div>
  );
};

export default JubilaliaHomeSimple;
