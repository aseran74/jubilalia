import React, { useState, useEffect } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  step?: number;
  className?: string;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1000,
  className = ''
}) => {
  const [minVal, setMinVal] = useState(value.min);
  const [maxVal, setMaxVal] = useState(value.max);

  useEffect(() => {
    setMinVal(value.min);
    setMaxVal(value.max);
  }, [value]);

  const handleMinChange = (newMin: number) => {
    const newValue = Math.min(newMin, maxVal - step);
    setMinVal(newValue);
    onChange({ min: newValue, max: maxVal });
  };

  const handleMaxChange = (newMax: number) => {
    const newValue = Math.max(newMax, minVal + step);
    setMaxVal(newValue);
    onChange({ min: minVal, max: newValue });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-700">Precio</span>
        <div className="text-xs text-gray-600">
          {formatPrice(minVal)} - {formatPrice(maxVal)}
        </div>
      </div>
      
      <div className="relative">
        <div className="relative h-2 bg-gray-200 rounded-lg">
          <div
            className="absolute h-2 bg-green-500 rounded-lg"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          step={step}
          className="absolute top-0 w-full h-2 appearance-none bg-transparent pointer-events-none slider-thumb"
        />
        
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          step={step}
          className="absolute top-0 w-full h-2 appearance-none bg-transparent pointer-events-none slider-thumb"
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
