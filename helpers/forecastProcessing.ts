import type { DailyForecast } from '../types';
import { getLocalDateString } from './dateUtils';

export const processDayForecast = (dayForecasts: any[]): DailyForecast | null => {
    if (dayForecasts.length === 0) return null;
    
    const dayName = new Date(dayForecasts[0].dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
    const noonForecast = dayForecasts.find((f: any) => new Date(f.dt * 1000).getUTCHours() >= 12) 
        || dayForecasts[Math.floor(dayForecasts.length / 2)];
    
    const avgHumidity = dayForecasts.reduce((sum: number, f: any) => sum + f.main.humidity, 0) / dayForecasts.length;
    const maxChanceOfRain = Math.max(...dayForecasts.map((f: any) => f.pop));
    
    return {
        day: dayName,
        temp: Math.round(noonForecast.main.temp),
        humidity: Math.round(avgHumidity),
        chance_of_rain: Math.round(maxChanceOfRain * 100)
    };
};

export const deduplicateByDay = (forecasts: DailyForecast[]): DailyForecast[] => {
    return forecasts.reduce((acc: DailyForecast[], forecast) => {
        if (acc.some(f => f.day === forecast.day)) {
            return acc;
        }
        return [...acc, forecast];
    }, []);
};

export const buildDailyForecasts = (forecastData: any): DailyForecast[] => {
    const uniqueDays = [...new Set(forecastData.list.map((item: any) => getLocalDateString(item.dt)))];
    
    const forecasts = uniqueDays
        .slice(0, 5)
        .map((dateStr: string) => {
            const dayForecasts = forecastData.list.filter((item: any) => getLocalDateString(item.dt) === dateStr);
            return processDayForecast(dayForecasts);
        })
        .filter((forecast): forecast is DailyForecast => forecast !== null);
    
    return deduplicateByDay(forecasts);
};
