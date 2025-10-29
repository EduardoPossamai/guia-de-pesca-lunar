import { Navbar } from "@/components/Navbar";
import { MoonPhase } from "@/components/MoonPhase";
import { WeatherWidget } from "@/components/WeatherWidget";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Waves, Moon, Sunrise, Sunset, Fish } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { weatherData, loading, error, fetchWeatherByDate } = useWeather();

  useEffect(() => {
    if (date && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByDate(`${latitude},${longitude}`, date);
        },
        () => {
          fetchWeatherByDate('Sao Paulo', date);
        }
      );
    }
  }, [date]);

  const getFishingForecast = (moonPhase: string) => {
    const excellentPhases = ['New Moon', 'Full Moon', 'Lua Nova', 'Lua Cheia'];
    return excellentPhases.some(phase => moonPhase.includes(phase))
      ? 'Excelente para Pesca'
      : 'Regular';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background via-background to-primary/5 px-4 py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9ImhzbCgxOTAgOTUlIDQ1JSAvIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        
        <div className="container relative mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Waves className="h-10 w-10 text-primary" />
              <h1 className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
                Guia de Pesca Lunar
              </h1>
            </div>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Acompanhe as fases da lua, condições climáticas e encontre os melhores dias para pescar
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <MoonPhase />
            <WeatherWidget />
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Calendário Lunar</CardTitle>
              <CardDescription>
                Selecione uma data para ver a fase da lua e previsão de pesca
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-lg border border-border/40 bg-background/50 p-4"
              />
            </CardContent>
          </Card>

          {/* Detailed Forecast Card */}
          {date && (
            <Card className="mt-6 border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl">
                  Previsão para {format(date, "d 'de' MMMM", { locale: ptBR })}
                </CardTitle>
                <CardDescription>
                  Detalhes da fase lunar e condições de pesca
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : error ? (
                  <div className="text-center text-sm text-destructive">
                    {error}
                  </div>
                ) : weatherData ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/40 bg-background/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Moon className="h-5 w-5 text-primary" />
                          Fase da Lua
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold text-foreground">
                          {weatherData.forecast.forecastday[0].astro.moon_phase}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Iluminação: {weatherData.forecast.forecastday[0].astro.moon_illumination}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-border/40 bg-background/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Fish className="h-5 w-5 text-accent" />
                          Previsão de Pesca
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold text-accent">
                          {getFishingForecast(weatherData.forecast.forecastday[0].astro.moon_phase)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-border/40 bg-background/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Sunrise className="h-5 w-5 text-primary" />
                          Nascer da Lua
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold text-foreground">
                          {weatherData.forecast.forecastday[0].astro.moonrise}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-border/40 bg-background/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Sunset className="h-5 w-5 text-primary" />
                          Pôr da Lua
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold text-foreground">
                          {weatherData.forecast.forecastday[0].astro.moonset}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="border-t border-border/40 px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌑 Lua Nova
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Período bom para pesca. Peixes de fundo são mais ativos. Melhor pescar à noite.
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌕 Lua Cheia
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Excelente período! Atividade dos peixes aumenta significativamente durante a noite.
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌓 Quartos
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Período moderado. Melhor pescar ao amanhecer ou entardecer.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
