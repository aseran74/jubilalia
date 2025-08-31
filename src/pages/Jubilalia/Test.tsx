import React from 'react';

const JubilaliaTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">
          🎉 ¡Funciona!
        </h1>
        <p className="text-xl text-blue-600">
          La ruta de Jubilalia está funcionando correctamente
        </p>
        <div className="mt-8 space-y-4">
          <a 
            href="/login" 
            className="block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Ir a Login
          </a>
          <a 
            href="/register" 
            className="block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Ir a Registro
          </a>
        </div>
      </div>
    </div>
  );
};

export default JubilaliaTest;
