import React, { useState } from 'react';
import type { Unit } from '../types';

interface SearchFormProps {
  onSearch: (cities: string[], prompt: string, unit: Unit) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('New York, London, Tokyo');
  const [prompt, setPrompt] = useState('A bar chart comparing temperatures and cards for each city.');
  const [unit, setUnit] = useState<Unit>('imperial');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cities = input.split(',').map(c => c.trim()).filter(Boolean);
    if (cities.length > 0) {
      onSearch(cities, prompt, unit);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white border-4 border-black shadow-[8px_8px_0px_#000]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="cities-input" className="block text-sm font-bold mb-1 text-gray-700">1. Enter Cities</label>
          <input
            id="cities-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., New York, London, Tokyo"
            disabled={isLoading}
            className="w-full p-3 text-lg bg-gray-100 border-2 border-black focus:outline-none focus:ring-4 focus:ring-yellow-400 disabled:opacity-50"
          />
           <p className="text-sm text-gray-600 mt-1">Enter comma-separated city names.</p>
        </div>

        <div>
           <label htmlFor="prompt-input" className="block text-sm font-bold mb-1 text-gray-700">2. Describe Your Desired Layout (Optional)</label>
           <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A line chart for humidity and cards for each city..."
            disabled={isLoading}
            className="w-full p-3 text-lg bg-gray-100 border-2 border-black focus:outline-none focus:ring-4 focus:ring-yellow-400 disabled:opacity-50"
            rows={2}
          />
           <p className="text-sm text-gray-600 mt-1">Use natural language to tell the AI what you want to see.</p>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1 text-gray-700">3. Select Units</label>
          <div className="flex border-2 border-black">
            <button
                type="button"
                onClick={() => setUnit('imperial')}
                disabled={isLoading}
                className={`flex-1 p-3 text-lg font-bold transition-colors ${unit === 'imperial' ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-500 hover:bg-yellow-200'}`}
            >
                Imperial (°F, mph)
            </button>
            <button
                type="button"
                onClick={() => setUnit('metric')}
                disabled={isLoading}
                className={`flex-1 p-3 text-lg font-bold transition-colors border-l-2 border-black ${unit === 'metric' ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-500 hover:bg-yellow-200'}`}
            >
                Metric (°C, m/s)
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="p-3 text-lg font-bold bg-yellow-400 border-2 border-black hover:bg-yellow-500 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
        >
          {isLoading ? 'Generating...' : 'Generate Comparison'}
        </button>
      </form>
    </div>
  );
};