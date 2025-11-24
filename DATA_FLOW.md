# Brutalcast Data Flow

## User Request → Weather Display Rendering

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. USER INPUT                                                           │
│    SearchForm Component                                                 │
│    ├─ Cities: "New York, London, Tokyo"                                │
│    ├─ Prompt: "A bar chart comparing temperatures..."                   │
│    └─ Unit: "imperial" | "metric"                                      │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. FORM SUBMISSION                                                      │
│    SearchForm.handleSubmit()                                            │
│    └─ Calls: onSearch(cities, prompt, unit)                            │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. APP STATE MANAGEMENT                                                │
│    App.handleSearch()                                                   │
│    ├─ Validates API keys (geminiKey, openWeatherKey)                   │
│    ├─ Checks rate limits (useRateLimit hook)                           │
│    └─ Sets loading state                                               │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. FETCH WEATHER DATA (Parallel)                                        │
│    weatherService.getWeatherForCities()                                 │
│    │                                                                     │
│    ├─ For each city:                                                   │
│    │   ├─ OpenWeather API: /weather (current)                         │
│    │   └─ OpenWeather API: /forecast (5-day)                          │
│    │                                                                     │
│    └─ Returns: Record<string, WeatherData>                             │
│       └─ { city, temp, humidity, wind_speed, forecast, ... }           │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 5. GENERATE UI LAYOUT                                                   │
│    geminiService.generateUiLayout()                                    │
│    │                                                                     │
│    ├─ Input: weatherData + userPrompt + unit                          │
│    ├─ Model: gemini-2.5-flash                                          │
│    ├─ Schema: JSON with blurb, imagePrompt, uiComponents               │
│    │                                                                     │
│    └─ Returns: GeneratedLayout                                         │
│       ├─ blurb: "Witty one-liner..."                                  │
│       ├─ imagePrompt: "2D vector illustration..."                     │
│       └─ uiComponents: [                                               │
│           { type: 'BAR_CHART', title: '...', props: {...} },          │
│           { type: 'CARD', title: '...', props: {...} },               │
│           ...                                                           │
│         ]                                                               │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 6. GENERATE IMAGE (Optional)                                            │
│    geminiService.generateImage()                                       │
│    │                                                                     │
│    ├─ Input: imagePrompt from step 5                                   │
│    ├─ Model: imagen-4.0-generate-001                                   │
│    └─ Returns: base64 image URL                                        │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 7. STATE UPDATES                                                        │
│    App Component                                                        │
│    ├─ setWeatherData(data)                                             │
│    ├─ setGeneratedLayout(layout)                                       │
│    ├─ setGeneratedImageUrl(imageUrl)                                   │
│    └─ setIsLoading(false)                                              │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 8. RENDER RESULTS                                                       │
│    ResultsDisplay Component                                             │
│    │                                                                     │
│    ├─ Props: weatherData, layout, imageUrl, unit                       │
│    │                                                                     │
│    ├─ Header Section:                                                  │
│    │   ├─ Generated image (from step 6)                                │
│    │   └─ Blurb text (from layout.blurb)                               │
│    │                                                                     │
│    └─ UI Components Grid:                                               │
│       └─ For each layout.uiComponents:                                 │
│          ├─ renderUiComponent(config)                                  │
│          │                                                              │
│          └─ Component Router:                                          │
│             ├─ 'TABLE' → WeatherTable                                  │
│             ├─ 'CARD' → WeatherCard                                    │
│             ├─ 'BAR_CHART' → WeatherBarChart                           │
│             ├─ 'LINE_CHART' → WeatherLineChart                         │
│             └─ 'SCATTER_CHART' → WeatherScatterChart                   │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 9. FINAL RENDER                                                         │
│    Each UI Component                                                    │
│    ├─ Receives: allCitiesData, unit, component-specific props          │
│    ├─ Transforms data for visualization                                │
│    └─ Renders: Recharts components / HTML tables / Cards               │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Data Structures

### WeatherData
```typescript
{
  city: string,
  temp: number,
  humidity: number,
  wind_speed: number,
  forecast: DailyForecast[],
  ... (15+ fields)
}
```

### GeneratedLayout
```typescript
{
  blurb: string,
  imagePrompt: string,
  uiComponents: [
    { type: 'BAR_CHART', title: string, props: {...} },
    ...
  ]
}
```

## External APIs

- **OpenWeather API**: Current weather + 5-day forecast
- **Google Gemini**: UI layout generation (JSON schema)
- **Google Imagen**: Image generation (base64)

## Rate Limiting

- `useRateLimit` hook tracks requests
- Blocks submission if limit reached
- Shows remaining requests in UI

