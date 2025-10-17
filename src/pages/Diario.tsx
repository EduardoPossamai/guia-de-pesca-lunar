import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Fish, Trash2, Camera } from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface Captura {
  id: number;
  especie_peixe: string;
  peso_kg: number | null;
  tamanho_cm: number | null;
  isca_utilizada: string | null;
  image_url: string | null;
  is_public: boolean;
  created_at: string;
  observacoes: string | null;
}

export default function Diario() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [capturas, setCapturas] = useState<Captura[]>([]);
  const [loadingCapturas, setLoadingCapturas] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    especie_peixe: "",
    peso_kg: "",
    tamanho_cm: "",
    isca_utilizada: "",
    observacoes: "",
    is_public: false,
  });

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Você precisa estar logado para acessar o diário");
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadCapturas();
    }
  }, [user]);

  const loadCapturas = async () => {
    try {
      const { data, error } = await supabase
        .from("capturas")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCapturas(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar capturas: " + error.message);
    } finally {
      setLoadingCapturas(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      let imageUrl = null;

      // Upload da imagem se houver
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("capturas-fotos")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("capturas-fotos")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Inserir captura
      const { error } = await supabase.from("capturas").insert({
        user_id: user.id,
        especie_peixe: formData.especie_peixe,
        peso_kg: formData.peso_kg ? parseFloat(formData.peso_kg) : null,
        tamanho_cm: formData.tamanho_cm ? parseFloat(formData.tamanho_cm) : null,
        isca_utilizada: formData.isca_utilizada || null,
        observacoes: formData.observacoes || null,
        image_url: imageUrl,
        is_public: formData.is_public,
      });

      if (error) throw error;

      toast.success("Captura registrada com sucesso!");
      setDialogOpen(false);
      resetForm();
      loadCapturas();
    } catch (error: any) {
      toast.error("Erro ao salvar captura: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from("capturas")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Captura excluída com sucesso!");
      loadCapturas();
    } catch (error: any) {
      toast.error("Erro ao excluir captura: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      especie_peixe: "",
      peso_kg: "",
      tamanho_cm: "",
      isca_utilizada: "",
      observacoes: "",
      is_public: false,
    });
    setImageFile(null);
    setImagePreview(null);
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meu Diário de Pesca</h1>
            <p className="text-muted-foreground">Registre suas capturas e acompanhe seu progresso</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Captura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nova Captura</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes da sua pescaria
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="especie">Espécie do Peixe *</Label>
                  <Input
                    id="especie"
                    value={formData.especie_peixe}
                    onChange={(e) => setFormData({ ...formData, especie_peixe: e.target.value })}
                    placeholder="Ex: Tucunaré, Dourado, Traíra..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      value={formData.peso_kg}
                      onChange={(e) => setFormData({ ...formData, peso_kg: e.target.value })}
                      placeholder="2.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tamanho">Tamanho (cm)</Label>
                    <Input
                      id="tamanho"
                      type="number"
                      step="0.1"
                      value={formData.tamanho_cm}
                      onChange={(e) => setFormData({ ...formData, tamanho_cm: e.target.value })}
                      placeholder="45"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isca">Isca Utilizada</Label>
                  <Input
                    id="isca"
                    value={formData.isca_utilizada}
                    onChange={(e) => setFormData({ ...formData, isca_utilizada: e.target.value })}
                    placeholder="Ex: Minhoca, Isca artificial..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Condições do dia, local, horário..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foto">Foto da Captura</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="foto"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1"
                    />
                    <Camera className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-2 h-40 w-full rounded-lg object-cover"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="public">Tornar pública no mural</Label>
                    <p className="text-sm text-muted-foreground">
                      Outros pescadores poderão ver esta captura
                    </p>
                  </div>
                  <Switch
                    id="public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_public: checked })
                    }
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Salvando..." : "Salvar Captura"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loadingCapturas ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-40 w-full rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : capturas.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Fish className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Nenhuma captura registrada</h3>
              <p className="mb-4 text-center text-muted-foreground">
                Comece registrando sua primeira pescaria
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Captura
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capturas.map((captura) => (
              <Card key={captura.id} className="overflow-hidden">
                {captura.image_url && (
                  <img
                    src={captura.image_url}
                    alt={captura.especie_peixe}
                    className="h-48 w-full object-cover"
                  />
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Fish className="h-5 w-5 text-primary" />
                        {captura.especie_peixe}
                      </CardTitle>
                      <CardDescription>
                        {new Date(captura.created_at).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(captura.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
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
                  {captura.is_public && (
                    <p className="text-xs text-primary">✓ Pública no mural</p>
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
