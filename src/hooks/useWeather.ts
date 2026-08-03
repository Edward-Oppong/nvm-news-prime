import { useState, useEffect } from 'react';

export interface WeatherCity {
  city: string;
  temp: string;
  icon: string;
  condition: string;
}

// WMO weather code → emoji + label
function wmoToWeather(code: number): { icon: string; condition: string } {
  if (code === 0) return { icon: '☀️', condition: 'Clear' };
  if (code <= 2) return { icon: '🌤️', condition: 'Mostly Clear' };
  if (code === 3) return { icon: '☁️', condition: 'Overcast' };
  if (code <= 49) return { icon: '🌫️', condition: 'Foggy' };
  if (code <= 59) return { icon: '🌦️', condition: 'Drizzle' };
  if (code <= 69) return { icon: '🌧️', condition: 'Rain' };
  if (code <= 79) return { icon: '❄️', condition: 'Snow' };
  if (code <= 84) return { icon: '🌦️', condition: 'Showers' };
  if (code <= 99) return { icon: '⛈️', condition: 'Thunderstorm' };
  return { icon: '⛅', condition: 'Cloudy' };
}

const CITIES = [
  { city: 'Accra', lat: 5.5502, lon: -0.2174 },
  { city: 'London', lat: 51.5074, lon: -0.1278 },
  { city: 'New York', lat: 40.7128, lon: -74.006 },
  { city: 'Lagos', lat: 6.5244, lon: 3.3792 },
];

const CACHE_KEY = 'nvm_weather_cache';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CachedWeather {
  data: WeatherCity[];
  timestamp: number;
}

// Static fallback in case all APIs fail
const FALLBACK: WeatherCity[] = [
  { city: 'Accra', temp: '29°C', icon: '⛅', condition: 'Partly Cloudy' },
  { city: 'London', temp: '18°C', icon: '🌧️', condition: 'Rain' },
  { city: 'New York', temp: '24°C', icon: '☀️', condition: 'Clear' },
  { city: 'Lagos', temp: '31°C', icon: '⛅', condition: 'Partly Cloudy' },
];

async function fetchWeatherForCity(lat: number, lon: number): Promise<{ temp: string; icon: string; condition: string }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&temperature_unit=celsius&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather API error');
  const json = await res.json();
  const temp = Math.round(json.current.temperature_2m);
  const code = json.current.weathercode as number;
  const { icon, condition } = wmoToWeather(code);
  return { temp: `${temp}°C`, icon, condition };
}

async function fetchAllCitiesWeather(): Promise<WeatherCity[]> {
  const results = await Promise.allSettled(
    CITIES.map(async ({ city, lat, lon }) => {
      const weather = await fetchWeatherForCity(lat, lon);
      return { city, ...weather };
    })
  );

  const cities: WeatherCity[] = results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    // Use fallback for failed city
    return FALLBACK[i];
  });

  return cities;
}

export function useWeather() {
  const [cities, setCities] = useState<WeatherCity[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Check sessionStorage cache first
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: CachedWeather = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            if (!cancelled) {
              setCities(parsed.data);
              setLoading(false);
            }
            return;
          }
        }
      } catch {
        // ignore cache read errors
      }

      // Fetch fresh data
      try {
        const data = await fetchAllCitiesWeather();
        if (!cancelled) {
          setCities(data);
          setLoading(false);
          // Cache result
          try {
            const toCache: CachedWeather = { data, timestamp: Date.now() };
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(toCache));
          } catch {
            // ignore cache write errors
          }
        }
      } catch {
        // All failed — stay on fallback
        if (!cancelled) {
          setCities(FALLBACK);
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return { cities, loading };
}
