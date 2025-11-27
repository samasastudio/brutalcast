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
            contentStyle={{ 
              backgroundColor: '#000', 
              color: '#facc15', 
              border: '2px solid #facc15', 
              fontFamily: 'Roboto Mono',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '600'
            }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              
              // ScatterChart payload contains x, y, z values
              const data = payload[0].payload as WeatherData;
              const xValue = data[xAxisKey];
              const yValue = data[yAxisKey];
              const zValue = data[zAxisKey];
              
              // Convert values to displayable format (scatter charts only use numeric fields)
              const formatValue = (val: unknown): string => {
                if (typeof val === 'number') return String(val);
                if (typeof val === 'string') return val;
                // Fallback for edge cases
                return String(val ?? 'N/A');
              };
              
              const xDisplay = formatValue(xValue);
              const yDisplay = formatValue(yValue);
              const zDisplay = formatValue(zValue);
              
              return (
                <div>
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
                    <strong>{String(xAxisKey)}:</strong> {xDisplay}{getUnitSymbol(xAxisKey)}
                  </div>
                  <div style={{ marginBottom: '4px', color: '#facc15' }}>
                    <strong>{String(yAxisKey)}:</strong> {yDisplay}{getUnitSymbol(yAxisKey)}
                  </div>
                  <div style={{ color: '#facc15' }}>
                    <strong>{String(zAxisKey)}:</strong> {zDisplay}{getUnitSymbol(zAxisKey)}
                  </div>
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontFamily: 'Roboto Mono' }} />
          <Scatter name="Cities" data={allData} fill="#000" shape="circle" x={xAxisKey} y={yAxisKey} z={zAxisKey} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};