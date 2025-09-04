import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface NumberStepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

const NumberStepper: React.FC<NumberStepperProps> = ({
  label,
  value,
  min = 0,
  max = 10,
  onChange,
  className = ""
}) => {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecrease}
          disabled={value <= min}
          className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-medium">{value}</span>
        <button
          onClick={handleIncrease}
          disabled={value >= max}
          className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NumberStepper;
