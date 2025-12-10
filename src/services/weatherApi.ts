const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_URL =
  'https://air-quality-api.open-meteo.com/v1/air-quality';

export interface CityLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  precipitation: number;
}

export interface HourlyPoint {
  time: string; // ISO
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  precipitationProb: number;
  uvIndex: number;
}

export interface DailyPoint {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
}

export interface AirQuality {
  usAqi: number | null;
}

export interface CityWeather {
  location: CityLocation;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  airQuality: AirQuality;
}

// 1) Search city → coordinates
export async function searchCity(name: string): Promise<CityLocation | null> {
  if (!name.trim()) return null;

  const url = `${GEOCODE_URL}?name=${encodeURIComponent(
    name.trim()
  )}&count=1&language=en`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to search for city');
  }
  const data = await res.json();

  if (!data.results || data.results.length === 0) return null;

  const city = data.results[0];

  return {
    name: city.name,
    country: city.country,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
  };
}

// Get forecast + air quality for given coordinates
export async function getCityWeather(
  location: CityLocation
): Promise<CityWeather> {
  const { latitude, longitude, timezone } = location;

  // Forecast URL – current + hourly + daily
  const forecastUrl =
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation` +
    `&hourly=temperature_2m,weather_code,uv_index,precipitation_probability,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum` +
    `&timezone=${encodeURIComponent(timezone || 'auto')}`;

  // Air quality URL – we only need US AQI
  const airUrl =
    `${AIR_QUALITY_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&hourly=us_aqi&timezone=${encodeURIComponent(timezone || 'auto')}`;

  // Fetch both in parallel
  const [forecastRes, airRes] = await Promise.all([
    fetch(forecastUrl),
    fetch(airUrl),
  ]);

  if (!forecastRes.ok) throw new Error('Failed to fetch forecast');
  if (!airRes.ok) throw new Error('Failed to fetch air quality');

  const forecastData = await forecastRes.json();
  const airData = await airRes.json();

  // Build current
  const current: CurrentWeather = {
    temperature: forecastData.current.temperature_2m,
    apparentTemperature: forecastData.current.apparent_temperature,
    weatherCode: forecastData.current.weather_code,
    windSpeed: forecastData.current.wind_speed_10m,
    precipitation: forecastData.current.precipitation,
  };

  // Build hourly (limit to next ~12 entries so it’s not crazy long)
  const hourly: HourlyPoint[] = forecastData.hourly.time.map(
  (_: string, idx: number): HourlyPoint => ({
    time: forecastData.hourly.time[idx],
    temperature: forecastData.hourly.temperature_2m[idx],
    weatherCode: forecastData.hourly.weather_code[idx],
    windSpeed: forecastData.hourly.wind_speed_10m[idx],
    precipitationProb: forecastData.hourly.precipitation_probability[idx],
    uvIndex: forecastData.hourly.uv_index[idx],
  })
);

  // Build daily (7 days)
  const daily: DailyPoint[] = forecastData.daily.time.map(
    (date: string, idx: number) => ({
      date,
      maxTemp: forecastData.daily.temperature_2m_max[idx],
      minTemp: forecastData.daily.temperature_2m_min[idx],
      weatherCode: forecastData.daily.weather_code[idx],
      sunrise: forecastData.daily.sunrise[idx],
      sunset: forecastData.daily.sunset[idx],
      uvIndexMax: forecastData.daily.uv_index_max[idx],
      precipitationSum: forecastData.daily.precipitation_sum[idx],
    })
  );

  // Air quality – pick the first hourly value
  let usAqi: number | null = null;
  if (airData.hourly && airData.hourly.us_aqi && airData.hourly.us_aqi.length) {
    usAqi = airData.hourly.us_aqi[0];
  }

  const airQuality: AirQuality = {
    usAqi,
  };

  return {
    location,
    current,
    hourly,
    daily,
    airQuality,
  };
}
