import type { WeatherData, Unit } from '../types';
import { BASE_URL, fetchAqi } from '../helpers/weatherApi';
import { buildDailyForecasts } from '../helpers/forecastProcessing';
import { mapApiResponseToWeatherData } from '../helpers/weatherDataMapping';
import { buildWeatherDataByCity } from '../helpers/cityUtils';

async function getWeatherForCity(city: string, unit: Unit, apiKey: string): Promise<WeatherData> {
    const [currentWeatherRes, forecastRes] = await Promise.all([
        fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${unit}&appid=${apiKey}`),
        fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=${unit}&appid=${apiKey}`)
    ]);

    if (!currentWeatherRes.ok) {
        const errorData = await currentWeatherRes.json();
        throw new Error(`Could not fetch weather for "${city}": ${errorData.message}`);
    }
    
    if (!forecastRes.ok) {
        const errorData = await forecastRes.json();
        throw new Error(`Could not fetch forecast for "${city}": ${errorData.message}`);
    }

    const currentWeatherData = await currentWeatherRes.json();
    const forecastData = await forecastRes.json();

    const { lat, lon } = currentWeatherData.coord;
    const aqi = await fetchAqi(lat, lon, apiKey);
    const dailyForecasts = buildDailyForecasts(forecastData);

    return mapApiResponseToWeatherData(currentWeatherData, forecastData, aqi, dailyForecasts);
}

/* ============================================
   PRESENTATION MARKER #2: FETCH OPENWEATHER DATA
   ============================================
   This function fetches weather data from the OpenWeather API
   for all requested cities in parallel. The data includes current
   weather, forecast, and air quality information.
*/
export const getWeatherForCities = async (cities: string[], unit: Unit, apiKey: string): Promise<Record<string, WeatherData>> => {
    if (!apiKey) {
        throw new Error("OpenWeather API key is not configured.");
    }

    const weatherPromises = cities.map(city => getWeatherForCity(city, unit, apiKey));
    const results = await Promise.all(weatherPromises);

    return buildWeatherDataByCity(results, cities);
};
