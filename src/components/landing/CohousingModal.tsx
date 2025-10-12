import React from 'react';
import { X, Users, Home, Heart, Shield, CheckCircle } from 'lucide-react';

interface CohousingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CohousingModal: React.FC<CohousingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">¿Qué es el Cohousing Senior?</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Introducción */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Una nueva forma de envejecer</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              El <strong>cohousing senior</strong> es una forma de vivienda colaborativa donde un grupo de personas mayores, 
              a menudo con intereses y valores similares, vive en viviendas privadas e independientes pero comparte 
              espacios y servicios comunes. Este modelo, originario de Dinamarca, está ganando terreno rápidamente 
              entre los seniors que buscan un envejecimiento activo.
            </p>
          </div>

          {/* Características principales */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Características del Cohousing</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Home className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Viviendas privadas completas</h4>
                  <p className="text-sm text-gray-600">Cada residente tiene su propia vivienda con cocina, baño y salón</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Espacios comunes amplios</h4>
                  <p className="text-sm text-gray-600">Cocinas comunitarias, salones, jardines, talleres</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Heart className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Autogestión democrática</h4>
                  <p className="text-sm text-gray-600">Los residentes toman decisiones de forma consensuada</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Accesibilidad total</h4>
                  <p className="text-sm text-gray-600">Diseñado pensando en la movilidad y comodidad</p>
                </div>
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Beneficios para los Seniors</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Combate la soledad</h4>
                  <p className="text-gray-600">Interacción social constante y apoyo emocional mutuo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Envejecimiento activo</h4>
                  <p className="text-gray-600">Actividades físicas y mentales que mantienen la vitalidad</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Autonomía preservada</h4>
                  <p className="text-gray-600">Independencia en su propio hogar con apoyo comunitario</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Ayuda mutua</h4>
                  <p className="text-gray-600">Sistema de apoyo entre vecinos compartiendo habilidades</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ventajas vs Residencias */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ventajas frente a las Residencias</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Cohousing</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Autonomía y privacidad</li>
                    <li>• Sentido de pertenencia</li>
                    <li>• Coste más económico</li>
                    <li>• Comunidad real</li>
                    <li>• Flexibilidad</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Residencias tradicionales</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Horarios y reglas estrictas</li>
                    <li>• Menos participación</li>
                    <li>• Coste más elevado</li>
                    <li>• Coexistencia pasiva</li>
                    <li>• Menos adaptabilidad</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Cómo funciona */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">¿Cómo funciona la vida en comunidad?</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                La vida en una comunidad cohousing se basa en la <strong>colaboración y el respeto</strong>. 
                Los residentes se reúnen regularmente para tomar decisiones sobre la gestión de los espacios comunes, 
                la organización de actividades y la resolución de problemas.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Decisiones democráticas</h4>
                  <p className="text-sm text-gray-600">Todos participan en las decisiones importantes</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Actividades compartidas</h4>
                  <p className="text-sm text-gray-600">Comidas, celebraciones y grupos de interés</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Mantenimiento conjunto</h4>
                  <p className="text-sm text-gray-600">Tareas compartidas y responsabilidad mutua</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white text-center">
            <h3 className="text-xl font-semibold mb-2">¿Listo para descubrir tu comunidad ideal?</h3>
            <p className="mb-4 opacity-90">
              Únete a Jubilalia y encuentra el cohousing perfecto para tu estilo de vida
            </p>
            <button
              onClick={onClose}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Explorar Comunidades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CohousingModal;
