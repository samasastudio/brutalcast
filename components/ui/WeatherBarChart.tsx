import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { WeatherData, Unit } from '../../types';

interface WeatherBarChartProps {
  dataKeys: (keyof WeatherData)[];
  allData: WeatherData[];
  unit: Unit;
}

const COLORS = ['#facc15', '#4f46e5', '#d946ef'];

export const WeatherBarChart: React.FC<WeatherBarChartProps> = ({ dataKeys, allData, unit }) => {
  
  const getUnitSymbol = (key: string) => {
    if (key.includes('temp') || key.includes('feels_like')) {
      return unit === 'imperial' ? '°F' : '°C';
    }
    if (key.includes('wind')) {
      return unit === 'imperial' ? 'mph' : 'm/s';
    }
    if (key === 'humidity') return '%';
    if (key === 'pressure') return 'hPa';
    return '';
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={allData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
          <XAxis dataKey="city" stroke="#000" style={{ fontFamily: 'Roboto Mono' }} />
          <YAxis stroke="#000" style={{ fontFamily: 'Roboto Mono' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', color: '#facc15', border: '2px solid #facc15', fontFamily: 'Roboto Mono' }}
            formatter={(value: number, name: string) => [`${value} ${getUnitSymbol(name)}`, name]}
          />
          <Legend wrapperStyle={{ fontFamily: 'Roboto Mono' }} />
          {dataKeys.map((key, index) => (
            <Bar key={key} dataKey={key} name={String(key)} fill={COLORS[index % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};