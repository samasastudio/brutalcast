import React from 'react';
import type { WeatherData, Unit } from '../../types';

interface WeatherTableProps {
  dataKeys: (keyof WeatherData)[];
  cities: string[];
  allData: WeatherData[];
  unit: Unit;
}

const getKeyLabels = (unit: Unit): Record<keyof WeatherData, string> => ({
  city: 'City',
  country: 'Country',
  temp: `Temp (${unit === 'imperial' ? '°F' : '°C'})`,
  feels_like: `Feels Like (${unit === 'imperial' ? '°F' : '°C'})`,
  temp_min: `Min Temp (${unit === 'imperial' ? '°F' : '°C'})`,
  temp_max: `Max Temp (${unit === 'imperial' ? '°F' : '°C'})`,
  humidity: 'Humidity (%)',
  pressure: 'Pressure (hPa)',
  wind_speed: `Wind (${unit === 'imperial' ? 'mph' : 'm/s'})`,
  description: 'Description',
  icon: 'Icon',
  sunrise: 'Sunrise',
  sunset: 'Sunset',
  lon: 'Longitude',
  lat: 'Latitude',
  // FIX: Add 'forecast' property to satisfy the `Record<keyof WeatherData, string>` type.
  forecast: '5-Day Forecast',
});

export const WeatherTable: React.FC<WeatherTableProps> = ({ dataKeys, cities, allData, unit }) => {
  const tableData = allData.filter(d => cities.includes(d.city));

  const headers = ['city', ...dataKeys.filter(k => k !== 'city')];
  const KEY_LABELS = getKeyLabels(unit);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            {headers.map(key => (
              <th key={key} className="p-2 bg-black text-white border-b-4 border-yellow-400 uppercase tracking-wider">
                {KEY_LABELS[key as keyof WeatherData] || key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((data, index) => (
            <tr key={data.city} className={index % 2 === 0 ? 'bg-yellow-400' : 'bg-white'}>
              {headers.map(key => (
                <td key={key} className="p-2 border-b-2 border-black text-black">
                  {String(data[key as keyof WeatherData])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
