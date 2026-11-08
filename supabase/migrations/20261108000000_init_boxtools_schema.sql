-- ==============================================================================
-- BOXTOOLS // ESQUEMA RELACIONAL POSTGRESQL (SUPABASE CLOUD - 100% SIN DOCKER)
-- Protocolo: PEVC V5 (Fase 3 - Paso 1)
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla: categories (6 Categorías Oficiales del Baúl)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color_hex TEXT NOT NULL,
    icon_name TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla: tools (Fichas del Baúl: Modo Criollo + Modo Técnico)
CREATE TABLE IF NOT EXISTS public.tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    code_id TEXT NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    emoji TEXT DEFAULT '📦',
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    phase_number INT DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    criollo_analogy TEXT NOT NULL,
    criollo_without_with JSONB DEFAULT '{"without": [], "with": []}'::jsonb,
    criollo_semaforo JSONB DEFAULT '{"green": [], "red": []}'::jsonb,
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    mermaid_diagram TEXT,
    svg_infographic_config JSONB,
    install_commands JSONB DEFAULT '{}'::jsonb,
    mcp_config_json TEXT,
    raw_markdown TEXT NOT NULL,
    repo_url TEXT,
    compatibility_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla: tool_media (Imágenes, capturas y gráficos en Supabase Storage)
CREATE TABLE IF NOT EXISTS public.tool_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    caption TEXT,
    media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'gif', 'svg')),
    is_ai_generated BOOLEAN DEFAULT false,
    prompt_used TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla: combos (Stacks y Recetas prearmadas)
CREATE TABLE IF NOT EXISTS public.combos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    badge_color TEXT DEFAULT 'orange',
    criollo_summary TEXT NOT NULL,
    workflow_note TEXT,
    phase_workflow_mermaid TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla intermedia: combo_tools
CREATE TABLE IF NOT EXISTS public.combo_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combo_id UUID REFERENCES public.combos(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
    step_order INT DEFAULT 0,
    usage_note TEXT,
    UNIQUE(combo_id, tool_id)
);

-- 7. Tabla: ai_settings (Configuración de API Keys protegida)
CREATE TABLE IF NOT EXISTS public.ai_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT DEFAULT 'gemini' CHECK (provider IN ('gemini', 'openai', 'openrouter')),
    model_text TEXT DEFAULT 'gemini-2.5-flash',
    model_image TEXT DEFAULT 'imagen-3.0-generate-002',
    enable_svg_fallback BOOLEAN DEFAULT true,
    api_key_encrypted TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ==============================================================================
-- POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combo_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Catálogo Público: Lectura para todos sin login
CREATE POLICY "Public read for published tools" ON public.tools
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public read for categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Public read for tool media" ON public.tool_media
    FOR SELECT USING (true);

CREATE POLICY "Public read for combos" ON public.combos
    FOR SELECT USING (true);

CREATE POLICY "Public read for combo_tools" ON public.combo_tools
    FOR SELECT USING (true);

-- Admin Privado: CRUD completo solo para usuarios autenticados
CREATE POLICY "Admin full access for tools" ON public.tools
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access for categories" ON public.categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access for tool_media" ON public.tool_media
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access for combos" ON public.combos
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access for combo_tools" ON public.combo_tools
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- AI Settings: Estricto por usuario propietario
CREATE POLICY "Strict user owner for ai_settings" ON public.ai_settings
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- BUCKET DE STORAGE EN SUPABASE: tool-illustrations
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('tool-illustrations', 'tool-illustrations', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read tool-illustrations" ON storage.objects
    FOR SELECT USING (bucket_id = 'tool-illustrations');

CREATE POLICY "Authenticated Upload tool-illustrations" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tool-illustrations');
