import React from 'react';

export const ALL_PRICES = -1;
export const FREE_PRICE = 0;

export const PRICE_OPTIONS = [
  { value: ALL_PRICES, label: 'Todos' },
  { value: FREE_PRICE, label: 'Gratis' },
  { value: 100, label: '100 €' },
  { value: 200, label: '200 €' },
  { value: 300, label: '300 €' },
  { value: 400, label: '400 €' },
  { value: 500, label: '500 €' },
  { value: 1000, label: '1000 €' },
  { value: 1500, label: '1500 €' },
  { value: 2000, label: '2000 €' },
] as const;

export type PriceFilterValue = (typeof PRICE_OPTIONS)[number]['value'];

export const formatPriceFilterLabel = (value: number) => {
  if (value === ALL_PRICES) return 'Todos';
  if (value === FREE_PRICE) return 'Gratis';
  return `Hasta ${value} €`;
};

export const matchesPriceFilter = (
  value: number,
  isFree: boolean,
  price: number | null | undefined
) => {
  if (value === ALL_PRICES) return true;
  const amount = isFree ? 0 : price || 0;
  if (value === FREE_PRICE) return isFree || amount === 0;
  return amount <= value;
};

interface PriceFilterProps {
  value: number;
  onChange: (value: number) => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({ value, onChange }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-700">
      Precio: {formatPriceFilterLabel(value)}
    </label>
    <div className="flex flex-wrap gap-2">
      {PRICE_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-11 rounded-full px-3.5 py-2 text-sm font-semibold ${
              selected
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

export default PriceFilter;
