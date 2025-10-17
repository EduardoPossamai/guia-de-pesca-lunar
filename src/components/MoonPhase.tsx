import { Moon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MoonPhaseProps {
  date?: Date;
}

export function MoonPhase({ date = new Date() }: MoonPhaseProps) {
  // Cálculo simplificado da fase da lua
  const getMoonPhase = (date: Date) => {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();

    let c = 0;
    let e = 0;
    let jd = 0;
    let b = 0;

    if (month < 3) {
      year--;
      month += 12;
    }

    ++month;
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09;
    jd /= 29.5305882;
    b = parseInt(jd.toString());
    jd -= b;
    b = Math.round(jd * 8);

    if (b >= 8) {
      b = 0;
    }

    return b;
  };

  const phase = getMoonPhase(date);
  
  const phaseNames = [
    "Lua Nova",
    "Crescente",
    "Quarto Crescente",
    "Crescente Gibosa",
    "Lua Cheia",
    "Minguante Gibosa",
    "Quarto Minguante",
    "Minguante",
  ];

  const fishingQuality = [
    { quality: "Boa", color: "default" },
    { quality: "Moderada", color: "secondary" },
    { quality: "Boa", color: "default" },
    { quality: "Excelente", color: "default" },
    { quality: "Excelente", color: "default" },
    { quality: "Excelente", color: "default" },
    { quality: "Boa", color: "default" },
    { quality: "Moderada", color: "secondary" },
  ];

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-card/50 backdrop-blur">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-lunar" />
              Fase da Lua
            </CardTitle>
            <CardDescription>
              {date.toLocaleDateString("pt-BR", { 
                day: "numeric", 
                month: "long", 
                year: "numeric" 
              })}
            </CardDescription>
          </div>
          <div className="text-4xl">🌙</div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground">
            {phaseNames[phase]}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Atividade de Pesca:
          </span>
          <Badge 
            variant={fishingQuality[phase].color as any}
            className="bg-primary/20 text-primary hover:bg-primary/30"
          >
            {fishingQuality[phase].quality}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {phase >= 3 && phase <= 5 
            ? "Período excelente para pesca! Lua cheia aumenta atividade dos peixes."
            : phase === 0 
            ? "Período bom para pesca. Lua nova favorece peixes de fundo."
            : "Período moderado. Melhor pescar ao amanhecer ou entardecer."}
        </p>
      </CardContent>
    </Card>
  );
}
