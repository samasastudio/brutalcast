import React from 'react';
import type { WeatherData, Unit, CardProps } from '../../types';

interface WeatherCardProps extends CardProps {
  allData: WeatherData[];
  unit: Unit;
}

const getFieldValue = (data: WeatherData, key: string): string | number | null => {
  if (key !== 'chance_of_rain') {
    return (data as any)[key] ?? null;
  }
  
  if (!data.forecast || data.forecast.length === 0) {
    return null;
  }
  
  return data.forecast[0].chance_of_rain;
};

const getFieldLabel = (key: string): string => {
  const labels: Record<string, string> = {
    temp: 'Temperature',
    feels_like: 'Feels Like',
    humidity: 'Humidity',
    wind_speed: 'Wind',
    pressure: 'Pressure',
    aqi: 'AQI',
    chance_of_rain: 'Chance of Rain',
    description: 'Description',
  };
  return labels[key] || key;
};

const getFieldUnit = (key: string, value: number | string | null, tempUnit: string, windUnit: string): string => {
  if (value === null) return '';
  if (key === 'temp' || key === 'feels_like') return tempUnit;
  if (key === 'wind_speed') return windUnit;
  if (key === 'humidity' || key === 'chance_of_rain') return '%';
  if (key === 'pressure') return ' hPa';
  if (key === 'aqi') return '';
  return '';
};

const formatValue = (key: string, value: number | string | null): string => {
  if (value === null) return 'N/A';
  if (typeof value !== 'number') return value;
  
  if (key === 'temp' || key === 'feels_like') {
    return Math.round(value).toString();
  }
  if (key === 'wind_speed') {
    return parseFloat(value.toFixed(1)).toString();
  }
  return value.toString();
};

const getFieldsToShow = (dataKeys?: (keyof WeatherData | 'chance_of_rain')[]): (keyof WeatherData | 'chance_of_rain')[] => {
  if (dataKeys && dataKeys.length > 0) return dataKeys;
  return ['temp', 'feels_like', 'humidity', 'wind_speed', 'pressure', 'aqi'];
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ cities, allData, unit, dataKeys }) => {
  const cityData = allData.filter(d => cities.includes(d.city));

  if (cityData.length === 0) {
    return <p>No data available for selected cities.</p>;
  }

  const tempUnit = unit === 'imperial' ? '°F' : '°C';
  const windUnit = unit === 'imperial' ? 'mph' : 'm/s';
  const fieldsToShow = getFieldsToShow(dataKeys);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
      {cityData.map(data => (
        <div key={data.city} className="bg-black text-yellow-400 p-4 border-2 border-yellow-400 flex flex-col justify-between">
          <div>
            <h4 className="text-2xl font-bold">{data.city}</h4>
            {fieldsToShow.includes('description') && (
              <p className="text-lg capitalize">{data.description}</p>
            )}
          </div>
          
          {/* Show temperature prominently if it's in the fields */}
          {fieldsToShow.includes('temp') && (
            <p className="text-5xl font-bold self-end mt-4">
              {formatValue('temp', data.temp)}{getFieldUnit('temp', data.temp, tempUnit, windUnit)}
            </p>
          )}
          
          <div className="mt-2 text-sm grid grid-cols-2 gap-x-2 gap-y-1">
            {fieldsToShow
              .filter(key => key !== 'temp' && key !== 'description')
              .map(key => {
                const value = getFieldValue(data, key);
                if (value === null && key !== 'aqi') return null;
                
                return (
                  <span key={key}>
                    {getFieldLabel(key)}: {formatValue(key, value)}{getFieldUnit(key, value, tempUnit, windUnit)}
                  </span>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};