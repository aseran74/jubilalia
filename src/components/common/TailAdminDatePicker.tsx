import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface TailAdminDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  error?: string;
}

const TailAdminDatePicker: React.FC<TailAdminDatePickerProps> = ({
  selected,
  onChange,
  placeholder = "Seleccionar fecha",
  label,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  className = "",
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [currentYear, setCurrentYear] = useState(selected?.getFullYear() || new Date().getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(selected?.getMonth() || new Date().getMonth());
  const pickerRef = useRef<HTMLDivElement>(null);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Cerrar el calendario cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener el primer día del mes y el número de días
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonthIndex);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonthIndex);
    const days = [];

    // Días del mes anterior
    const prevMonthDays = getDaysInMonth(currentYear, currentMonthIndex - 1);
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: false
      });
    }

    // Días del mes actual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonthIndex, day);
      const isToday = today.toDateString() === currentDate.toDateString();
      const isSelected = selected && selected.toDateString() === currentDate.toDateString();
      const isDisabled = (minDate && currentDate < minDate) || (maxDate && currentDate > maxDate);

      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isDisabled
      });
    }

    // Días del mes siguiente
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: false
      });
    }

    return days;
  };

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  // Seleccionar una fecha
  const selectDate = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || disabled) return;

    const selectedDate = new Date(currentYear, currentMonthIndex, day);
    const isDisabled = (minDate && selectedDate < minDate) || (maxDate && selectedDate > maxDate);
    
    if (isDisabled) return;

    onChange(selectedDate);
    setIsOpen(false);
  };

  // Formatear la fecha seleccionada
  const formatSelectedDate = () => {
    if (!selected) return '';
    return selected.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className={`w-full ${className}`} ref={pickerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Input */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            relative cursor-pointer w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
            ${error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-green-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
          `}
        >
          <input
            type="text"
            value={formatSelectedDate()}
            placeholder={placeholder}
            readOnly
            className="w-full bg-transparent border-none outline-none cursor-pointer"
          />
          <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Calendario */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
            {/* Header del calendario */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
              </button>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {months[currentMonthIndex]}
                </h3>
                <p className="text-sm text-gray-500">{currentYear}</p>
              </div>
              
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 p-4">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7 gap-1 px-4 pb-4">
              {calendarDays.map((dayData, index) => (
                <button
                  key={index}
                  onClick={() => selectDate(dayData.day, dayData.isCurrentMonth)}
                  disabled={dayData.isDisabled}
                  className={`
                    h-8 w-8 rounded-lg text-sm font-medium transition-all duration-200
                    ${dayData.isCurrentMonth 
                      ? dayData.isSelected
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : dayData.isToday
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : dayData.isDisabled
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-900 hover:bg-gray-100'
                      : 'text-gray-300 cursor-default'
                    }
                  `}
                >
                  {dayData.day}
                </button>
              ))}
            </div>

            {/* Footer con botones de acción */}
            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onChange(new Date());
                  setIsOpen(false);
                }}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Hoy
              </button>
              
              <button
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default TailAdminDatePicker;
