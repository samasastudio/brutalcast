import React from 'react';
import type { WeatherData, Unit } from '../../types';

interface WeatherCardProps {
  cities: string[];
  allData: WeatherData[];
  unit: Unit;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ cities, allData, unit }) => {
  const cityData = allData.filter(d => cities.includes(d.city));

  if (cityData.length === 0) {
    return <p>No data available for selected cities.</p>;
  }

  const tempUnit = unit === 'imperial' ? '°F' : '°C';
  const windUnit = unit === 'imperial' ? 'mph' : 'm/s';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
      {cityData.map(data => (
        <div key={data.city} className="bg-black text-yellow-400 p-4 border-2 border-yellow-400 flex flex-col justify-between">
          <div>
            <h4 className="text-2xl font-bold">{data.city}</h4>
            <p className="text-lg capitalize">{data.description}</p>
          </div>
          <p className="text-5xl font-bold self-end mt-4">{Math.round(data.temp)}{tempUnit}</p>
          <div className="mt-2 text-sm grid grid-cols-2 gap-x-2 gap-y-1">
            <span>Feels Like: {Math.round(data.feels_like)}{tempUnit}</span>
            <span>Humidity: {data.humidity}%</span>
            <span>Wind: {data.wind_speed} {windUnit}</span>
            <span>Pressure: {data.pressure} hPa</span>
          </div>
        </div>
      ))}
    </div>
  );
};