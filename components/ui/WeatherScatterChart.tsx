import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { WeatherData, Unit } from '../../types';

type ScatterDataKey = keyof WeatherData | 'chance_of_rain';

interface WeatherScatterChartProps {
  xAxisKey: ScatterDataKey;
  yAxisKey: ScatterDataKey;
  zAxisKey: ScatterDataKey;
  allData: WeatherData[];
  unit: Unit;
}

const getValueFromWeatherData = (data: WeatherData, key: ScatterDataKey): number | null => {
  if (key === 'chance_of_rain') {
    if (!data.forecast || data.forecast.length === 0) return null;
    return data.forecast[0].chance_of_rain;
  }
  const value = data[key as keyof WeatherData];
  return typeof value === 'number' ? value : null;
};

export const WeatherScatterChart: React.FC<WeatherScatterChartProps> = ({ xAxisKey, yAxisKey, zAxisKey, allData, unit }) => {

  const getUnitSymbol = (key: ScatterDataKey): string => {
    if (key === 'chance_of_rain') return '%';
    if (typeof key === 'string' && (key.includes('temp') || key.includes('feels_like'))) {
      return unit === 'imperial' ? '°F' : '°C';
    }
    if (typeof key === 'string' && key.includes('wind')) {
      return unit === 'imperial' ? 'mph' : 'm/s';
    }
    if (key === 'humidity') return '%';
    if (key === 'pressure') return 'hPa';
    return '';
  };

  const prepareScatterData = () => {
    return allData
      .map(data => {
        const x = getValueFromWeatherData(data, xAxisKey);
        const y = getValueFromWeatherData(data, yAxisKey);
        const z = getValueFromWeatherData(data, zAxisKey);
        
        if (x === null || y === null || z === null) return null;
        
        return {
          ...data,
          [xAxisKey]: x,
          [yAxisKey]: y,
          [zAxisKey]: z,
        };
      })
      .filter((item): item is WeatherData & Record<string, number> => item !== null);
  };

  const scatterData = prepareScatterData();

  const xUnit = getUnitSymbol(xAxisKey);
  const yUnit = getUnitSymbol(yAxisKey);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid stroke="#9ca3af" />
          <XAxis 
            type="number" 
            dataKey={xAxisKey} 
            name={String(xAxisKey)} 
            unit={xUnit} 
            stroke="#000" 
            style={{ fontFamily: 'Roboto Mono' }} 
          />
          <YAxis 
            type="number" 
            dataKey={yAxisKey} 
            name={String(yAxisKey)} 
            unit={yUnit} 
            stroke="#000" 
            style={{ fontFamily: 'Roboto Mono' }} 
          />
          <ZAxis 
            type="number" 
            dataKey={zAxisKey} 
            name={String(zAxisKey)} 
            range={[60, 400]} 
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              
              const data = payload[0].payload as WeatherData & Record<string, number>;
              const xValue = data[xAxisKey];
              const yValue = data[yAxisKey];
              const zValue = data[zAxisKey];
              
              return (
                <div style={{
                  backgroundColor: '#000',
                  color: '#facc15',
                  border: '2px solid #facc15',
                  fontFamily: 'Roboto Mono',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{ 
                    marginBottom: '8px', 
                    borderBottom: '1px solid #facc15', 
                    paddingBottom: '6px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: '#fff'
                  }}>
                    {data.city}
                  </div>
                  <div style={{ marginBottom: '4px', color: '#facc15' }}>
                    <strong>{String(xAxisKey)}:</strong> {xValue}{getUnitSymbol(xAxisKey)}
                  </div>
                  <div style={{ marginBottom: '4px', color: '#facc15' }}>
                    <strong>{String(yAxisKey)}:</strong> {yValue}{getUnitSymbol(yAxisKey)}
                  </div>
                  <div style={{ color: '#facc15' }}>
                    <strong>{String(zAxisKey)}:</strong> {zValue}{getUnitSymbol(zAxisKey)}
                  </div>
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontFamily: 'Roboto Mono' }} />
          <Scatter name="Cities" data={scatterData} fill="#000" shape="circle" x={xAxisKey} y={yAxisKey} z={zAxisKey} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};