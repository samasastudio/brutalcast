import type { WeatherData, DailyForecast } from '../types';

export const mapApiResponseToWeatherData = (
    currentWeatherData: any,
    forecastData: any,
    aqi: number,
    dailyForecasts: DailyForecast[]
): WeatherData => ({
    city: currentWeatherData.name,
    country: currentWeatherData.sys.country,
    temp: Math.round(currentWeatherData.main.temp),
    feels_like: Math.round(currentWeatherData.main.feels_like),
    temp_min: Math.round(currentWeatherData.main.temp_min),
    temp_max: Math.round(currentWeatherData.main.temp_max),
    humidity: currentWeatherData.main.humidity,
    pressure: currentWeatherData.main.pressure,
    wind_speed: parseFloat(currentWeatherData.wind.speed.toFixed(1)),
    description: currentWeatherData.weather[0].description,
    icon: currentWeatherData.weather[0].icon,
    sunrise: currentWeatherData.sys.sunrise,
    sunset: currentWeatherData.sys.sunset,
    lon: currentWeatherData.coord.lon,
    lat: currentWeatherData.coord.lat,
    forecast: dailyForecasts,
    aqi,
});
