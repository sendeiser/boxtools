-- ==============================================================================
-- BOXTOOLS // PERMITIR INSERCIÓN Y EDICIÓN DE HERRAMIENTAS DESDE LA WEB
-- Permite que cualquier miembro del equipo suba y guarde herramientas con la anon key
-- ==============================================================================

-- 1. Permitir que usuarios anónimos/públicos inserten nuevas herramientas
CREATE POLICY "Public insert for tools" ON public.tools
    FOR INSERT TO public WITH CHECK (true);

-- 2. Permitir que se actualicen herramientas existentes
CREATE POLICY "Public update for tools" ON public.tools
    FOR UPDATE TO public USING (true) WITH CHECK (true);
