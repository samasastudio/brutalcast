import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { WeatherData, Unit, DailyForecast } from '../../types';

interface WeatherLineChartProps {
  xAxisKey: keyof DailyForecast;
  yAxisKey: keyof DailyForecast;
  cities: string[];
  allData: WeatherData[];
  unit: Unit;
}

const COLORS = ['#facc15', '#4f46e5', '#d946ef', '#f97316', '#14b8a6'];

export const WeatherLineChart: React.FC<WeatherLineChartProps> = ({ xAxisKey, yAxisKey, cities, allData, unit }) => {
  
  const filteredData = allData.filter(d => cities.includes(d.city) && d.forecast && d.forecast.length > 0);

  const getUnitSymbol = (key: string) => {
    if (key.includes('temp')) {
      return unit === 'imperial' ? '°F' : '°C';
    }
    if (key.includes('humidity') || key.includes('chance_of_rain')) {
      return '%';
    }
    return '';
  };

  const xUnit = getUnitSymbol(xAxisKey);
  const yUnit = getUnitSymbol(yAxisKey);
  
  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload; // This is the DailyForecast object for the hovered point
      const cityName = payload[0].name;     // This is the city name from the Scatter component's name prop

      return (
        <div className="bg-black text-yellow-400 p-3 border-2 border-yellow-400 shadow-lg">
          <p className="font-bold text-lg border-b-2 border-yellow-400 pb-1 mb-1">{cityName}</p>
          <p className="capitalize text-sm text-white mb-2">Day: {dataPoint.day}</p>
          <p className="capitalize">{xAxisKey.replace(/_/g, ' ')}: {dataPoint[xAxisKey]}{xUnit}</p>
          <p className="capitalize">{yAxisKey.replace(/_/g, ' ')}: {dataPoint[yAxisKey]}{yUnit}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
          <XAxis 
            type="number" 
            dataKey={xAxisKey} 
            name={xAxisKey.replace(/_/g, ' ')} 
            unit={xUnit} 
            stroke="#000" 
            style={{ fontFamily: 'Roboto Mono', textTransform: 'capitalize' }} 
          />
          <YAxis 
            type="number" 
            dataKey={yAxisKey} 
            name={yAxisKey.replace(/_/g, ' ')} 
            unit={yUnit} 
            stroke="#000" 
            style={{ fontFamily: 'Roboto Mono', textTransform: 'capitalize' }} 
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            content={<CustomTooltip />}
          />
          <Legend wrapperStyle={{ fontFamily: 'Roboto Mono' }} />
          {filteredData.map((cityData, index) => (
            <Scatter
              key={cityData.city}
              name={cityData.city}
              data={cityData.forecast}
              fill={COLORS[index % COLORS.length]}
              line
              shape="circle"
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};