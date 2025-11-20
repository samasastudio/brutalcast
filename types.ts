export type Unit = 'metric' | 'imperial';

export interface DailyForecast {
  day: string;
  temp: number;
  humidity: number;
  chance_of_rain: number;
}

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
  lon: number;
  lat: number;
  forecast?: DailyForecast[];
}

export type UiComponentType = 'TABLE' | 'CARD' | 'BAR_CHART' | 'LINE_CHART' | 'SCATTER_CHART';

export interface TableProps {
  cities: string[];
  dataKeys: (keyof WeatherData)[];
}

export interface CardProps {
  cities: string[];
}

export interface BarChartProps {
  dataKeys: (keyof WeatherData)[];
}

export interface LineChartProps {
  xAxisKey: keyof DailyForecast;
  yAxisKey: keyof DailyForecast;
  cities: string[];
  limitDays?: number;
}

export interface ScatterChartProps {
  xAxisKey: keyof WeatherData;
  yAxisKey: keyof WeatherData;
  zAxisKey: keyof WeatherData;
}

export type UiComponentConfig =
  | { type: 'TABLE'; title: string; props: TableProps }
  | { type: 'CARD'; title: string; props: CardProps }
  | { type: 'BAR_CHART'; title: string; props: BarChartProps }
  | { type: 'LINE_CHART'; title: string; props: LineChartProps }
  | { type: 'SCATTER_CHART'; title: string; props: ScatterChartProps };

export interface GeneratedLayout {
  blurb: string;
  imagePrompt: string;
  uiComponents: UiComponentConfig[];
}