
import React from 'react';
import type { Quality } from '../types';

interface QualitySelectorProps {
  selectedQuality: Quality;
  onQualityChange: (quality: Quality) => void;
}

const QUALITY_OPTIONS: { id: Quality; label: string; description: string }[] = [
  { id: 'standard', label: 'Standard', description: 'Good quality, fast processing.' },
  { id: 'high', label: 'High', description: 'Excellent quality, balanced speed.' },
  { id: 'museum', label: 'Museum', description: 'Ultimate 60K archival quality.' },
];

const QualitySelector: React.FC<QualitySelectorProps> = ({ selectedQuality, onQualityChange }) => {
  return (
    <fieldset className="flex flex-col items-center w-full">
        <legend className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 w-full text-center">
            Output Quality
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full bg-gray-200 dark:bg-gray-900 p-2 rounded-xl shadow-inner">
            {QUALITY_OPTIONS.map((option) => (
            <button
                key={option.id}
                onClick={() => onQualityChange(option.id)}
                aria-pressed={selectedQuality === option.id}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-900 hover:scale-105 active:scale-95
                ${
                    selectedQuality === option.id
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                }`}
            >
                {option.label}
            </button>
            ))}
        </div>
         <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center h-4" aria-live="polite">
            {QUALITY_OPTIONS.find(o => o.id === selectedQuality)?.description}
        </p>
    </fieldset>
  );
};

export default QualitySelector;