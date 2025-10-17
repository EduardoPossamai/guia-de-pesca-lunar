import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Fish, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface CapturaPublica {
  id: number;
  especie_peixe: string;
  peso_kg: number | null;
  tamanho_cm: number | null;
  isca_utilizada: string | null;
  image_url: string | null;
  created_at: string;
  observacoes: string | null;
  perfis: {
    username: string;
  };
}

export default function Mural() {
  const [capturas, setCapturas] = useState<CapturaPublica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCapturas();
  }, []);

  const loadCapturas = async () => {
    try {
      const { data, error } = await supabase
        .from("capturas")
        .select(`
          *,
          perfis (
            username
          )
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCapturas(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar capturas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mural da Galera</h1>
          <p className="text-muted-foreground">
            Confira as melhores capturas compartilhadas pela comunidade
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 w-full bg-muted" />
                <CardHeader className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 w-full rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : capturas.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Fish className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Nenhuma captura pública ainda</h3>
              <p className="text-center text-muted-foreground">
                Seja o primeiro a compartilhar sua pescaria!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capturas.map((captura) => (
              <Card key={captura.id} className="overflow-hidden transition-all hover:shadow-lg">
                {captura.image_url && (
                  <img
                    src={captura.image_url}
                    alt={captura.especie_peixe}
                    className="h-48 w-full object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fish className="h-5 w-5 text-primary" />
                    {captura.especie_peixe}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {captura.perfis.username}
                    <span className="ml-auto">
                      {new Date(captura.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-4">
                    {captura.peso_kg && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Peso:</span>{" "}
                        <span className="font-semibold">{captura.peso_kg} kg</span>
                      </p>
                    )}
                    {captura.tamanho_cm && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Tamanho:</span>{" "}
                        <span className="font-semibold">{captura.tamanho_cm} cm</span>
                      </p>
                    )}
                  </div>
                  {captura.isca_utilizada && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Isca:</span>{" "}
                      {captura.isca_utilizada}
                    </p>
                  )}
                  {captura.observacoes && (
                    <p className="text-sm text-muted-foreground">
                      {captura.observacoes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
