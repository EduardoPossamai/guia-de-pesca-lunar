import { useState, useEffect } from 'react';

const API_KEY = 'ca6aed2cd4614567872235713252810';

interface AstronomyData {
  astronomy: {
    astro: {
      moon_phase: string;
      moon_illumination: string;
      moonrise: string;
      moonset: string;
    };
  };
  location: {
    name: string;
    region: string;
    country: string;
  };
}

interface WeatherData {
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    pressure_mb: number;
    humidity: number;
  };
  forecast: {
    forecastday: Array<{
      astro: {
        moon_phase: string;
        moon_illumination: string;
        moonrise: string;
        moonset: string;
      };
    }>;
  };
  location: {
    name: string;
    region: string;
    country: string;
  };
}

interface UseWeatherReturn {
  weatherData: WeatherData | null;
  astronomyData: AstronomyData | null;
  loading: boolean;
  error: string | null;
  fetchWeatherByCity: (city: string) => Promise<void>;
  fetchWeatherByDate: (location: string, date: Date) => Promise<void>;
  fetchAstronomyByDate: (location: string, date: Date) => Promise<void>;
  locationDenied: boolean;
}

export function useWeather(): UseWeatherReturn {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [astronomyData, setAstronomyData] = useState<AstronomyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const fetchWeather = async (location: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=1&aqi=no&alerts=no&lang=pt`
      );
      
      if (!response.ok) {
        throw new Error('Localização não encontrada');
      }
      
      const data = await response.json();
      setWeatherData(data);
      setLocationDenied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados do tempo');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (city: string) => {
    await fetchWeather(city);
  };

  const fetchWeatherByDate = async (location: string, date: Date) => {
    setLoading(true);
    setError(null);
    
    const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&dt=${dateStr}&days=1&aqi=no&alerts=no&lang=pt`
      );
      
      if (!response.ok) {
        throw new Error('Dados não disponíveis para esta data');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar previsão');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAstronomyByDate = async (location: string, date: Date) => {
    setLoading(true);
    setError(null);
    
    const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    try {
      // PRIORIDADE 1: Buscar dados de astronomia (sempre funciona)
      const astronomyResponse = await fetch(
        `https://api.weatherapi.com/v1/astronomy.json?key=${API_KEY}&q=${location}&dt=${dateStr}`
      );
      
      if (!astronomyResponse.ok) {
        throw new Error('Dados astronômicos não disponíveis');
      }
      
      const astronomyDataResponse = await astronomyResponse.json();
      setAstronomyData(astronomyDataResponse);
      
      // PRIORIDADE 2: Tentar buscar dados do tempo (pode falhar silenciosamente)
      try {
        const weatherResponse = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&dt=${dateStr}&days=1&aqi=no&alerts=no&lang=pt`
        );
        
        if (weatherResponse.ok) {
          const weatherDataResponse = await weatherResponse.json();
          setWeatherData(weatherDataResponse);
        } else {
          // Se falhar, limpar dados do tempo mas manter astronomia
          setWeatherData(null);
        }
      } catch {
        // Ignorar erro silenciosamente - dados de astronomia já estão disponíveis
        setWeatherData(null);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
      setAstronomyData(null);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Tentar obter localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(`${latitude},${longitude}`);
        },
        (error) => {
          console.log('Geolocalização negada ou erro:', error);
          setLocationDenied(true);
          setLoading(false);
          // Buscar por cidade padrão (São Paulo) se negar
          fetchWeather('Sao Paulo');
        }
      );
    } else {
      setLocationDenied(true);
      setLoading(false);
      // Se não suportar geolocalização, buscar por cidade padrão
      fetchWeather('Sao Paulo');
    }
  }, []);

  return {
    weatherData,
    astronomyData,
    loading,
    error,
    fetchWeatherByCity,
    fetchWeatherByDate,
    fetchAstronomyByDate,
    locationDenied,
  };
}
