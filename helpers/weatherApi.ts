const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const fetchAqi = async (lat: number, lon: number, apiKey: string): Promise<number> => {
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

export { BASE_URL };
