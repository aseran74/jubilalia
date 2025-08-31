import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Layers } from 'lucide-react';
import PropertyListingForm from '../../components/properties/PropertyListingForm';
import PropertyListingFormMultiStep from '../../components/properties/PropertyListingFormMultiStep';

const FormComparison: React.FC = () => {
  const [activeForm, setActiveForm] = useState<'single' | 'multistep'>('single');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              to="/properties"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mr-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver a Propiedades</span>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Comparación de Formularios
          </h1>
          <p className="text-lg text-gray-600">
            Compara el formulario simplificado con el formulario de múltiples pasos
          </p>
        </div>

        {/* Form Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveForm('single')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeForm === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Formulario Simplificado</span>
            </button>
            
            <button
              onClick={() => setActiveForm('multistep')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeForm === 'multistep'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span>Formulario Multi-Paso</span>
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              {activeForm === 'single' ? 'Formulario Simplificado' : 'Formulario Multi-Paso'}
            </h3>
            <p className="text-blue-700 text-sm">
              {activeForm === 'single' 
                ? 'Formulario en una sola página con todos los campos organizados por secciones. Más rápido de completar pero puede ser abrumador.'
                : 'Formulario dividido en 5 pasos lógicos. Más guiado y menos abrumador, pero requiere más navegación.'
              }
            </p>
          </div>
        </div>

        {/* Form Display */}
        <div className="bg-white rounded-xl shadow-sm">
          {activeForm === 'single' ? (
            <PropertyListingForm />
          ) : (
            <PropertyListingFormMultiStep />
          )}
        </div>

        {/* Comparison Table */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparación de Características</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Característica</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Formulario Simplificado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Formulario Multi-Paso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">Número de pasos</td>
                  <td className="py-3 px-4 text-gray-600">1 paso</td>
                  <td className="py-3 px-4 text-gray-600">5 pasos</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">Tiempo de completado</td>
                  <td className="py-3 px-4 text-gray-600">Más rápido</td>
                  <td className="py-3 px-4 text-gray-600">Más lento</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">Complejidad visual</td>
                  <td className="py-3 px-4 text-gray-600">Más campos visibles</td>
                  <td className="py-3 px-4 text-gray-600">Menos campos por paso</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">Experiencia del usuario</td>
                  <td className="py-3 px-4 text-gray-600">Directo pero abrumador</td>
                  <td className="py-3 px-4 text-gray-600">Guiado y progresivo</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">Validación</td>
                  <td className="py-3 px-4 text-gray-600">Al enviar</td>
                  <td className="py-3 px-4 text-gray-600">Por paso</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">Navegación</td>
                  <td className="py-3 px-4 text-gray-600">Scroll vertical</td>
                  <td className="py-3 px-4 text-gray-600">Botones anterior/siguiente</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">Progreso visual</td>
                  <td className="py-3 px-4 text-gray-600">No visible</td>
                  <td className="py-3 px-4 text-gray-600">Barra de progreso</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">Mantenimiento</td>
                  <td className="py-3 px-4 text-gray-600">Más fácil</td>
                  <td className="py-3 px-4 text-gray-600">Más complejo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Formulario Simplificado</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Ventajas:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Más rápido de completar</li>
                <li>Vista completa de todos los campos</li>
                <li>Fácil de mantener y modificar</li>
                <li>Mejor para usuarios experimentados</li>
              </ul>
              <p className="mt-3"><strong>Desventajas:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Puede ser abrumador</li>
                <li>Scroll largo</li>
                <li>No hay validación por pasos</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Formulario Multi-Paso</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Ventajas:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Experiencia guiada y progresiva</li>
                <li>Menos abrumador visualmente</li>
                <li>Validación por pasos</li>
                <li>Barra de progreso clara</li>
              </ul>
              <p className="mt-3"><strong>Desventajas:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Más lento de completar</li>
                <li>Requiere navegación entre pasos</li>
                <li>Más complejo de mantener</li>
                <li>Puede frustrar a usuarios avanzados</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Final Recommendation */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Recomendación</h3>
          <p className="text-blue-700">
            Para <strong>Jubilalia</strong>, recomendamos el <strong>Formulario Simplificado</strong> porque:
          </p>
          <ul className="list-disc list-inside ml-4 mt-2 text-blue-700 space-y-1">
            <li>Los usuarios jubilados prefieren ver todo el formulario de una vez</li>
            <li>Reduce la complejidad de navegación</li>
            <li>Permite revisar y corregir fácilmente antes de enviar</li>
            <li>Es más accesible para personas con problemas de memoria</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FormComparison;
