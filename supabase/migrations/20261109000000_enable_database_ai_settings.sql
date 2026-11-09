-- ==============================================================================
-- BOXTOOLS // MIGRACIÓN: ALMACENAMIENTO DE API KEYS DE IA EN SUPABASE CLOUD
-- Permite que las API Keys (Gemini, OpenRouter, OpenAI) se guarden en la base
-- de datos para todo el equipo y no dependan únicamente de localStorage.
-- ==============================================================================

-- 1. Asegurar columnas necesarias en ai_settings
DO $$
BEGIN
    ALTER TABLE public.ai_settings ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.ai_settings DROP CONSTRAINT IF EXISTS ai_settings_user_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.ai_settings DROP CONSTRAINT IF EXISTS ai_settings_user_id_key;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.ai_settings ADD COLUMN IF NOT EXISTS api_key TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.ai_settings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2. Asegurar restricción única por proveedor para que funcione el upsert
DO $$
BEGIN
    ALTER TABLE public.ai_settings ADD CONSTRAINT ai_settings_provider_unique UNIQUE (provider);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. Habilitar Row Level Security (RLS) y Políticas Públicas (anon)
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read for ai_settings" ON public.ai_settings;
CREATE POLICY "Public read for ai_settings" ON public.ai_settings
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public insert for ai_settings" ON public.ai_settings;
CREATE POLICY "Public insert for ai_settings" ON public.ai_settings
    FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Public update for ai_settings" ON public.ai_settings;
CREATE POLICY "Public update for ai_settings" ON public.ai_settings
    FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete for ai_settings" ON public.ai_settings;
CREATE POLICY "Public delete for ai_settings" ON public.ai_settings
    FOR DELETE TO public USING (true);

