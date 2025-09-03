import React, { useState } from 'react';
import TailAdminDatePicker from '../common/TailAdminDatePicker';

const CalendarDemo: React.FC = () => {
  const [selectedDate1, setSelectedDate1] = useState<Date | null>(null);
  const [selectedDate2, setSelectedDate2] = useState<Date | null>(null);
  const [selectedDate3, setSelectedDate3] = useState<Date | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Calendario TailAdmin
          </h1>
          <p className="text-gray-600">
            Componente de calendario personalizado inspirado en el diseño de TailAdmin
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Ejemplo básico */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Ejemplo Básico</h3>
              <TailAdminDatePicker
                selected={selectedDate1}
                onChange={setSelectedDate1}
                placeholder="Seleccionar fecha"
                label="Fecha de inicio"
              />
              <div className="text-sm text-gray-500">
                Fecha seleccionada: {selectedDate1 ? selectedDate1.toLocaleDateString('es-ES') : 'Ninguna'}
              </div>
            </div>

            {/* Ejemplo con fecha mínima */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Con Fecha Mínima</h3>
              <TailAdminDatePicker
                selected={selectedDate2}
                onChange={setSelectedDate2}
                placeholder="Seleccionar fecha futura"
                label="Fecha futura"
                minDate={new Date()}
                required={true}
              />
              <div className="text-sm text-gray-500">
                Solo permite fechas desde hoy
              </div>
            </div>

            {/* Ejemplo con rango de fechas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Con Rango</h3>
              <TailAdminDatePicker
                selected={selectedDate3}
                onChange={setSelectedDate3}
                placeholder="Seleccionar fecha"
                label="Fecha con rango"
                minDate={new Date(2024, 0, 1)}
                maxDate={new Date(2024, 11, 31)}
              />
              <div className="text-sm text-gray-500">
                Solo permite fechas de 2024
              </div>
            </div>

          </div>

          {/* Características */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Características del Calendario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Diseño inspirado en TailAdmin</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Navegación entre meses</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Resaltado del día actual</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Botones "Hoy" y "Limpiar"</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Fechas mínimas y máximas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Cierre automático al hacer clic fuera</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Formato de fecha español</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Totalmente responsive</span>
                </div>
              </div>
            </div>
          </div>

          {/* Código de ejemplo */}
          <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Código de ejemplo:</h4>
            <pre className="text-sm text-gray-700 overflow-x-auto">
{`import TailAdminDatePicker from '../common/TailAdminDatePicker';

const [selectedDate, setSelectedDate] = useState<Date | null>(null);

<TailAdminDatePicker
  selected={selectedDate}
  onChange={setSelectedDate}
  label="Fecha de inicio"
  placeholder="Seleccionar fecha"
  minDate={new Date()}
  required={true}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDemo;
