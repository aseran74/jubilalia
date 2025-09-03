import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker.css';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface CustomDatePickerProps {
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

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
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
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <DatePicker
          selected={selected}
          onChange={onChange}
          placeholderText={placeholder}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          dateFormat="dd/MM/yyyy"
          locale="es"
          className={`
            w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
            ${error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-green-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          calendarClassName="shadow-lg border border-gray-200 rounded-lg"
          popperClassName="z-50"
          showPopperArrow={false}
          customInput={
            <div className="relative">
              <input
                className={`
                  w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
                  ${error 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-green-500'
                  }
                  ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                `}
                placeholder={placeholder}
                readOnly
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          }
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default CustomDatePicker;
