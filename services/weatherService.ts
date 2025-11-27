import type { WeatherData, Unit, DailyForecast } from '../types';

async function getWeatherForCity(city: string, unit: Unit, apiKey: string): Promise<WeatherData> {
    const baseUrl = 'https://api.openweathermap.org/data/2.5';

    // Fetch current weather and forecast in parallel
    const [currentWeatherRes, forecastRes] = await Promise.all([
        fetch(`${baseUrl}/weather?q=${encodeURIComponent(city)}&units=${unit}&appid=${apiKey}`),
        fetch(`${baseUrl}/forecast?q=${encodeURIComponent(city)}&units=${unit}&appid=${apiKey}`)
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

    // Process forecast data to get daily summaries for the next 5 unique days
    const dailyForecasts: DailyForecast[] = [];
    const seenDayNames = new Set<string>(); // Track day names to prevent duplicates

    // Get unique upcoming days from the forecast list using LOCAL date (not UTC)
    // This ensures day grouping matches the day name generation, preventing duplicate day labels
    const getLocalDateString = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const uniqueDays = [...new Set(forecastData.list.map((item: any) => getLocalDateString(item.dt)))];

    // FIX: Explicitly type `dateStr` as `string` to resolve error where it's inferred as `unknown`.
    uniqueDays.slice(0, 5).forEach((dateStr: string) => {
        const dayForecasts = forecastData.list.filter((item: any) => getLocalDateString(item.dt) === dateStr);

        if (dayForecasts.length > 0) {
            const dayName = new Date(dayForecasts[0].dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });

            // Skip if we've already seen this day name (additional safety check)
            if (seenDayNames.has(dayName)) {
                return;
            }
            seenDayNames.add(dayName);

            // Find temperature around noon for a representative daily temp
            const noonForecast = dayForecasts.find((f: any) => new Date(f.dt * 1000).getUTCHours() >= 12) || dayForecasts[Math.floor(dayForecasts.length / 2)];

            // Calculate average humidity and max chance of rain for the day
            const avgHumidity = dayForecasts.reduce((sum: number, f: any) => sum + f.main.humidity, 0) / dayForecasts.length;
            const maxChanceOfRain = Math.max(...dayForecasts.map((f: any) => f.pop));

            dailyForecasts.push({
                day: dayName,
                temp: Math.round(noonForecast.main.temp),
                humidity: Math.round(avgHumidity),
                chance_of_rain: Math.round(maxChanceOfRain * 100)
            });
        }
    });

    // Map the API response to our app's WeatherData type
    return {
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
    };
}

export const getWeatherForCities = async (cities: string[], unit: Unit, apiKey: string): Promise<Record<string, WeatherData>> => {
    if (!apiKey) {
        throw new Error("OpenWeather API key is not configured.");
    }

    // Fetch all city data concurrently
    const weatherPromises = cities.map(city => getWeatherForCity(city, unit, apiKey));

    const results = await Promise.all(weatherPromises);

    const weatherDataByCity: Record<string, WeatherData> = {};
    results.forEach(data => {
        // Find the original city name from the input array to use as the key,
        // matching case-insensitively to handle API response variations (e.g., "new york" -> "New York").
        const originalCityName = cities.find(c => c.toLowerCase() === data.city.toLowerCase()) || data.city;
        weatherDataByCity[originalCityName] = data;
    });

    return weatherDataByCity;
};
