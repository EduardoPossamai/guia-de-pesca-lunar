-- Criar tabela de perfis de usuário
CREATE TABLE public.perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  localizacao_padrao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de capturas
CREATE TABLE public.capturas (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  especie_peixe TEXT NOT NULL,
  peso_kg NUMERIC(5,2),
  tamanho_cm NUMERIC(5,2),
  isca_utilizada TEXT,
  image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  localizacao TEXT,
  observacoes TEXT
);

-- Habilitar RLS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capturas ENABLE ROW LEVEL SECURITY;

-- Políticas para perfis
CREATE POLICY "Perfis são visíveis para todos"
  ON public.perfis FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.perfis FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.perfis FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas para capturas
CREATE POLICY "Capturas públicas são visíveis para todos"
  ON public.capturas FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias capturas"
  ON public.capturas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias capturas"
  ON public.capturas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias capturas"
  ON public.capturas FOR DELETE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para perfis
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.perfis
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar perfil ao registrar
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Criar bucket de storage para fotos de capturas
INSERT INTO storage.buckets (id, name, public)
VALUES ('capturas-fotos', 'capturas-fotos', true);

-- Políticas de storage
CREATE POLICY "Fotos de capturas são públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'capturas-fotos');

CREATE POLICY "Usuários autenticados podem fazer upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'capturas-fotos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Usuários podem deletar suas próprias fotos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'capturas-fotos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );