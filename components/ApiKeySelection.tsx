
import React, { useState } from 'react';

interface ApiKeySelectionProps {
  onKeySubmit: (key: string) => void;
  onSkip: () => void;
}

const ApiKeySelection: React.FC<ApiKeySelectionProps> = ({ onKeySubmit, onSkip }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setError('Please enter a valid API key.');
      return;
    }
    onKeySubmit(inputKey.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-8 animate-fade-in-up relative">
        <button 
            onClick={onSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Skip for now"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="text-center">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary mb-3">
              Shahidul Image Studio
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
                Enter your Gemini API Key to access the ultimate restoration engine.
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="apiKey" className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                    API Key
                </label>
                <div className="relative">
                  <input
                      type="password"
                      id="apiKey"
                      value={inputKey}
                      onChange={(e) => {
                          setInputKey(e.target.value);
                          setError('');
                      }}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-0 bg-transparent dark:text-white transition-colors"
                      placeholder="AIza..."
                  />
                </div>
                {error && <p className="text-red-500 text-sm mt-2 font-semibold">{error}</p>}
            </div>

            <button
                type="submit"
                className="w-full btn-3d bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transform transition-all duration-200"
            >
                Enter Studio
            </button>
        </form>
        
        <div className="flex flex-col items-center gap-3 mt-6">
             <button 
                onClick={onSkip}
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
                Continue without API Key
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Need a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-brand-primary hover:text-brand-secondary font-bold hover:underline transition-colors">Get one here</a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySelection;
