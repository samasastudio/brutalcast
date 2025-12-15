import type { WeatherData } from '../types';

export const findOriginalCityName = (data: WeatherData, cities: string[]): string => {
    const originalCityName = cities.find(c => c.toLowerCase() === data.city.toLowerCase());
    return originalCityName || data.city;
};

export const buildWeatherDataByCity = (results: WeatherData[], cities: string[]): Record<string, WeatherData> => {
    return results.reduce((acc, data) => {
        const key = findOriginalCityName(data, cities);
        return { ...acc, [key]: data };
    }, {} as Record<string, WeatherData>);
};
