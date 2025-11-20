import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { WeatherData, Unit, DailyForecast } from '../../types';

interface WeatherLineChartProps {
  xAxisKey: keyof DailyForecast;
  yAxisKey: keyof DailyForecast;
  cities: string[];
  allData: WeatherData[];
  unit: Unit;
  limitDays?: number;
}

const COLORS = ['#facc15', '#4f46e5', '#d946ef', '#f97316', '#14b8a6'];

export const WeatherLineChart: React.FC<WeatherLineChartProps> = ({ xAxisKey, yAxisKey, cities, allData, unit, limitDays = 5 }) => {

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

  // 1. Filter data for selected cities (case-insensitive)
  const lowerCaseCities = cities.map(c => c.toLowerCase());
  const selectedCitiesData = allData.filter(d => lowerCaseCities.includes(d.city.toLowerCase()) && d.forecast && d.forecast.length > 0);

  // 2. Pivot data: Create an array where each item is a "Day" (or whatever xAxisKey is)
  // and has properties for each city's yAxisKey value.
  // Example: [{ day: 'Mon', 'London': 20, 'Paris': 22 }, ...]

  // Get all unique X values (e.g., days) from the first city (assuming all have same forecast days)
  // If not, we might need to collect from all. For simplicity/robustness, let's collect from all.
  // Note: We aren't actually using allXValues right now, but keeping the logic in case we need it later.
  // const allXValues = Array.from(new Set(
  //   selectedCitiesData.flatMap(cityData => cityData.forecast!.map(f => f[xAxisKey]))
  // ));

  // Sort days if they are days of week? Hard to sort 'Mon', 'Tue' without a map. 
  // But usually the API returns them in order. Let's trust the order of the first city for now or just use the set order.
  // Actually, the set iteration order is insertion order, so if we flatMap in order, it should be roughly correct.
  // Better: Use the first city's forecast to define the order of days, as that's chronological.
  const referenceForecast = selectedCitiesData[0]?.forecast || [];
  const orderedXValues = referenceForecast.map(f => f[xAxisKey]).slice(0, limitDays);

  const chartData = orderedXValues.map(xValue => {
    const dataPoint: any = { [xAxisKey]: xValue };

    selectedCitiesData.forEach(cityData => {
      const forecastPoint = cityData.forecast!.find(f => f[xAxisKey] === xValue);
      if (forecastPoint) {
        dataPoint[cityData.city] = forecastPoint[yAxisKey];
      }
    });

    return dataPoint;
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
          <XAxis
            dataKey={xAxisKey}
            unit={xUnit}
            stroke="#000"
            style={{ fontFamily: 'Roboto Mono', textTransform: 'capitalize' }}
            padding={{ left: 30, right: 30 }}
          />
          <YAxis
            unit={yUnit}
            stroke="#000"
            style={{ fontFamily: 'Roboto Mono', textTransform: 'capitalize' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#000', color: '#facc15', border: '2px solid #facc15', fontFamily: 'Roboto Mono' }}
            itemStyle={{ color: '#facc15' }}
            formatter={(value: number, name: string) => [`${value}${yUnit}`, name]}
            labelStyle={{ color: '#fff', borderBottom: '1px solid #facc15', marginBottom: '5px' }}
          />
          <Legend wrapperStyle={{ fontFamily: 'Roboto Mono' }} />
          {selectedCitiesData.map((cityData, index) => (
            <Line
              key={cityData.city}
              type="monotone"
              dataKey={cityData.city}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={3}
              dot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};