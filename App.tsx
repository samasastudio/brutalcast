import React, { useState, useCallback } from 'react';
import { SearchForm } from './components/SearchForm';
import { Loader } from './components/Loader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ApiKeyInput } from './components/ApiKeyInput';
import { getWeatherForCities } from './services/weatherService';
import { generateUiLayout, generateImage } from './services/geminiService';
import type { WeatherData, GeneratedLayout, Unit } from './types';
import { ApiKeyProvider, useApiKeys } from './context/ApiKeyContext';
import { useRateLimit } from './hooks/useRateLimit';

const BrutalcastApp: React.FC = () => {
  const { geminiKey, openWeatherKey, hasKeys } = useApiKeys();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData> | null>(null);
  const [generatedLayout, setGeneratedLayout] = useState<GeneratedLayout | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>('imperial');
  const { isRateLimited, remainingRequests, incrementCount, resetTime } = useRateLimit();

  const handleSearch = useCallback(async (cities: string[], prompt: string, selectedUnit: Unit) => {
    if (cities.length === 0) return;

    if (!geminiKey || !openWeatherKey) {
      setError("API Keys are missing. Please reload and enter them.");
      return;
    }

    if (isRateLimited) {
      const resetDate = resetTime ? new Date(resetTime).toLocaleTimeString() : 'soon';
      setError(`Rate limit reached. You have 0 requests remaining. Limit resets at ${resetDate}.`);
      return;
    }

    incrementCount();

    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    setGeneratedLayout(null);
    setGeneratedImageUrl(null);
    setUnit(selectedUnit);

    try {
      // 1. Fetch weather data from live OpenWeather API
      const data = await getWeatherForCities(cities, selectedUnit, openWeatherKey);
      setWeatherData(data);

      // 2. Generate UI layout, blurb, and image prompt from Gemini
      const layout = await generateUiLayout(data, prompt, selectedUnit, geminiKey);
      setGeneratedLayout(layout);

      // 3. Generate image from Imagen using the prompt from step 2
      if (layout.imagePrompt) {
        try {
          const imageUrl = await generateImage(layout.imagePrompt, geminiKey);
          setGeneratedImageUrl(imageUrl);
        } catch (imageError) {
          console.error("Image generation failed:", imageError);
          // Do not set main error, just leave image as null
        }
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [geminiKey, openWeatherKey, isRateLimited, incrementCount, resetTime]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 sm:p-6 lg:p-8 relative">
      {!hasKeys && <ApiKeyInput />}

      <main className={`max-w-7xl mx-auto transition-opacity duration-500 ${!hasKeys ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter border-4 border-black p-4 inline-block shadow-[8px_8px_0px_#facc15]">
            Brutalcast
          </h1>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
            Compare city climates with AI-generated visualizations. Enter cities, get insights.
          </p>
          <p className="mt-2 text-sm text-gray-500 font-mono">
            Requests remaining: {remainingRequests}
          </p>
        </header>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {isLoading && <Loader />}
        {error && (
          <div className="mt-8 text-center bg-red-100 border-2 border-red-500 text-red-700 p-4 max-w-md mx-auto shadow-[4px_4px_0px_#000]">
            <p className="font-bold">Error!</p>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && weatherData && generatedLayout && (
          <ResultsDisplay
            weatherData={weatherData}
            layout={generatedLayout}
            imageUrl={generatedImageUrl}
            unit={unit}
          />
        )}
      </main>
      <footer className={`text-center mt-12 text-gray-500 text-sm transition-opacity duration-500 ${!hasKeys ? 'opacity-0' : 'opacity-100'}`}>
        <p>Powered by Generative UI &amp; Modern Brutalism</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ApiKeyProvider>
      <BrutalcastApp />
    </ApiKeyProvider>
  );
};

export default App;