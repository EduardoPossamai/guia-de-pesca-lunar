import { Cloud, Wind, Droplets, MapPin, Gauge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeather } from "@/hooks/useWeather";
import { useState } from "react";

export function WeatherWidget() {
  const { weatherData, loading, error, fetchWeatherByCity, locationDenied } = useWeather();
  const [citySearch, setCitySearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (citySearch.trim()) {
      fetchWeatherByCity(citySearch);
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Condições Atuais
          </CardTitle>
          <CardDescription>Carregando previsão...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          Condições Atuais
        </CardTitle>
        {weatherData && (
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {weatherData.location.name}, {weatherData.location.region}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {locationDenied && (
          <form onSubmit={handleSearch} className="mb-4">
            <Input
              type="text"
              placeholder="Digite o nome da cidade..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className="bg-background/50"
            />
          </form>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        {weatherData && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">{Math.round(weatherData.current.temp_c)}°C</p>
                <p className="text-sm text-muted-foreground">{weatherData.current.condition.text}</p>
              </div>
              <img 
                src={weatherData.current.condition.icon} 
                alt={weatherData.current.condition.text}
                className="w-16 h-16"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <Wind className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Vento</p>
                  <p className="text-sm font-semibold">{Math.round(weatherData.current.wind_kph)} km/h</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <Droplets className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Umidade</p>
                  <p className="text-sm font-semibold">{weatherData.current.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <Gauge className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Pressão</p>
                  <p className="text-sm font-semibold">{Math.round(weatherData.current.pressure_mb)} mb</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <Cloud className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Lua</p>
                  <p className="text-sm font-semibold">{weatherData.forecast.forecastday[0].astro.moon_phase}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
