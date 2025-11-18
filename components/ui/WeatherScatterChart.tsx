import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { WeatherData, Unit } from '../../types';

interface WeatherScatterChartProps {
  xAxisKey: keyof WeatherData;
  yAxisKey: keyof WeatherData;
  zAxisKey: keyof WeatherData;
  allData: WeatherData[];
  unit: Unit;
}

export const WeatherScatterChart: React.FC<WeatherScatterChartProps> = ({ xAxisKey, yAxisKey, zAxisKey, allData, unit }) => {

  const getUnitSymbol = (key: keyof WeatherData) => {
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

  const xUnit = getUnitSymbol(xAxisKey);
  const yUnit = getUnitSymbol(yAxisKey);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid stroke="#9ca3af" />
          <XAxis type="number" dataKey={xAxisKey} name={xAxisKey} unit={xUnit} stroke="#000" style={{ fontFamily: 'Roboto Mono' }} />
          <YAxis type="number" dataKey={yAxisKey} name={yAxisKey} unit={yUnit} stroke="#000" style={{ fontFamily: 'Roboto Mono' }} />
          <ZAxis type="number" dataKey={zAxisKey} name={zAxisKey} range={[60, 400]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            contentStyle={{ backgroundColor: '#000', color: '#facc15', border: '2px solid #facc15', fontFamily: 'Roboto Mono' }}
            formatter={(value: number, name: string) => [`${value} ${getUnitSymbol(name as keyof WeatherData)}`, name]}
          />
          <Legend wrapperStyle={{ fontFamily: 'Roboto Mono' }} />
          <Scatter name="Cities" data={allData} fill="#000" shape="circle" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};