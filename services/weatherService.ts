import type { WeatherData, Unit, DailyForecast } from '../types';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const getLocalDateString = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const fetchAqi = async (lat: number, lon: number, apiKey: string): Promise<number> => {
    try {
        const aqiRes = await fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        if (!aqiRes.ok) return 0;
        
        const aqiData = await aqiRes.json();
        if (!aqiData.list || aqiData.list.length === 0) return 0;
        
        return aqiData.list[0].main.aqi;
    } catch (err) {
        console.warn('Could not fetch AQI', err);
        return 0;
    }
};

const processDayForecast = (dayForecasts: any[]): DailyForecast | null => {
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

const deduplicateByDay = (forecasts: DailyForecast[]): DailyForecast[] => {
    return forecasts.reduce((acc: DailyForecast[], forecast) => {
        if (acc.some(f => f.day === forecast.day)) {
            return acc;
        }
        return [...acc, forecast];
    }, []);
};

const buildDailyForecasts = (forecastData: any): DailyForecast[] => {
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

const mapApiResponseToWeatherData = (
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

const findOriginalCityName = (data: WeatherData, cities: string[]): string => {
    const originalCityName = cities.find(c => c.toLowerCase() === data.city.toLowerCase());
    return originalCityName || data.city;
};

const buildWeatherDataByCity = (results: WeatherData[], cities: string[]): Record<string, WeatherData> => {
    return results.reduce((acc, data) => {
        const key = findOriginalCityName(data, cities);
        return { ...acc, [key]: data };
    }, {} as Record<string, WeatherData>);
};

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
