import React from 'react';
import type { WeatherData, GeneratedLayout, UiComponentConfig, Unit } from '../types';
import { WeatherCard } from './ui/WeatherCard';
import { WeatherTable } from './ui/WeatherTable';
import { WeatherBarChart } from './ui/WeatherBarChart';
import { WeatherLineChart } from './ui/WeatherLineChart';
import { WeatherScatterChart } from './ui/WeatherScatterChart';

interface ResultsDisplayProps {
  weatherData: Record<string, WeatherData>;
  layout: GeneratedLayout;
  imageUrl: string | null;
  unit: Unit;
}

const BrutalistContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white border-4 border-black p-4 sm:p-6 shadow-[8px_8px_0px_#000] ${className}`}>
    {children}
  </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ weatherData, layout, imageUrl, unit }) => {
  
  const renderUiComponent = (config: UiComponentConfig) => {
    const allCitiesData = Object.values(weatherData);
    
    switch (config.type) {
      case 'TABLE':
        return <WeatherTable {...config.props} allData={allCitiesData} unit={unit} />;
      case 'CARD':
        return <WeatherCard {...config.props} allData={allCitiesData} unit={unit} />;
      case 'BAR_CHART':
        return <WeatherBarChart {...config.props} allData={allCitiesData} unit={unit} />;
      case 'LINE_CHART':
        return <WeatherLineChart {...config.props} allData={allCitiesData} unit={unit} />;
      case 'SCATTER_CHART':
        return <WeatherScatterChart {...config.props} allData={allCitiesData} unit={unit} />;
      default:
        return <div>Unknown component type: {(config as any).type}</div>;
    }
  };

  return (
    <div className="mt-10 space-y-10">
      <div className="animate-fade-in-up">
        <BrutalistContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1">
                  {imageUrl ? (
                      <img src={imageUrl} alt={layout.imagePrompt} className="w-full h-auto border-4 border-black object-cover" />
                  ) : (
                      <div className="w-full h-64 bg-gray-200 border-4 border-black flex items-center justify-center">
                          <p className="text-gray-500">Generating image...</p>
                      </div>
                  )}
              </div>
              <div className="md:col-span-2">
                  <p className="text-xl md:text-2xl font-bold bg-yellow-400 p-4 border-2 border-black">
                      "{layout.blurb}"
                  </p>
              </div>
          </div>
        </BrutalistContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {layout.uiComponents.map((config, index) => (
          <div 
            key={index} 
            className="animate-fade-in-up" 
            style={{ animationDelay: `${150 + index * 100}ms` }}
          >
            <BrutalistContainer>
              <h3 className="text-2xl font-bold mb-4 border-b-4 border-black pb-2">{config.title}</h3>
              {renderUiComponent(config)}
            </BrutalistContainer>
          </div>
        ))}
      </div>
    </div>
  );
};