import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface CompactNumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
}

const CompactNumberStepper: React.FC<CompactNumberStepperProps> = ({
  label,
  value,
  onChange,
  max = 10,
  min = 0
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
    <div className="flex flex-col">
      <label className="text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecrease}
          disabled={value <= min}
          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <MinusIcon className="w-3 h-3 text-gray-600" />
        </button>
        
        <span className="text-sm font-medium text-gray-900 min-w-[20px] text-center">
          {value}
        </span>
        
        <button
          onClick={handleIncrease}
          disabled={value >= max}
          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PlusIcon className="w-3 h-3 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default CompactNumberStepper;
