import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiKeyContextType {
  geminiKey: string | null;
  openWeatherKey: string | null;
  setKeys: (geminiKey: string, openWeatherKey: string) => void;
  clearKeys: () => void;
  hasKeys: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [geminiKey, setGeminiKeyState] = useState<string | null>(null);
  const [openWeatherKey, setOpenWeatherKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedGeminiKey = localStorage.getItem('brutalcast_gemini_key');
    const storedOpenWeatherKey = localStorage.getItem('brutalcast_openweather_key');

    if (storedGeminiKey && storedOpenWeatherKey) {
      setGeminiKeyState(storedGeminiKey);
      setOpenWeatherKeyState(storedOpenWeatherKey);
    }
    setIsLoading(false);
  }, []);

  const setKeys = (newGeminiKey: string, newOpenWeatherKey: string) => {
    localStorage.setItem('brutalcast_gemini_key', newGeminiKey);
    localStorage.setItem('brutalcast_openweather_key', newOpenWeatherKey);
    setGeminiKeyState(newGeminiKey);
    setOpenWeatherKeyState(newOpenWeatherKey);
  };

  const clearKeys = () => {
    localStorage.removeItem('brutalcast_gemini_key');
    localStorage.removeItem('brutalcast_openweather_key');
    setGeminiKeyState(null);
    setOpenWeatherKeyState(null);
  };

  const hasKeys = !!geminiKey && !!openWeatherKey;

  if (isLoading) {
    return null; // Or a loading spinner if checking storage takes time (usually instant)
  }

  return (
    <ApiKeyContext.Provider value={{ geminiKey, openWeatherKey, setKeys, clearKeys, hasKeys }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKeys = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeyProvider');
  }
  return context;
};
