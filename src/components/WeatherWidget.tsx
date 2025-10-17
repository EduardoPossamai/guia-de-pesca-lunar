import { Cloud, Wind, Droplets } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WeatherWidget() {
  // Mock data - em produção, usar API de clima real
  const weather = {
    temp: 24,
    wind: 15,
    humidity: 65,
    condition: "Parcialmente Nublado",
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          Condições Atuais
        </CardTitle>
        <CardDescription>Previsão para pesca</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold">{weather.temp}°C</p>
            <p className="text-sm text-muted-foreground">{weather.condition}</p>
          </div>
          <div className="text-5xl">⛅</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Wind className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Vento</p>
              <p className="text-sm font-semibold">{weather.wind} km/h</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Droplets className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Umidade</p>
              <p className="text-sm font-semibold">{weather.humidity}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
