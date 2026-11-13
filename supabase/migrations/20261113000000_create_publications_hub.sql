-- ==============================================================================
-- BOXTOOLS // HUB DE PUBLICACIONES, LINKS & APARTADOS TEMÁTICOS (SUPABASE CLOUD)
-- Persistencia en la nube 100% sincronizada + RLS pública de equipo
-- ==============================================================================

-- 1. Tabla: publication_sections (Apartados / Colecciones personalizables)
CREATE TABLE IF NOT EXISTS public.publication_sections (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '📁',
    description TEXT NOT NULL DEFAULT '',
    tone TEXT NOT NULL DEFAULT 'orange' CHECK (tone IN ('orange', 'cyan', 'yellow', 'emerald', 'purple', 'rose', 'neutral')),
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabla: publications (Publicaciones: Repositorios GitHub, Videos, Tutoriales, Links)
CREATE TABLE IF NOT EXISTS public.publications (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    criollo_takeaway TEXT NOT NULL DEFAULT '',
    technical_notes TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL,
    resource_type TEXT NOT NULL DEFAULT 'link' CHECK (resource_type IN ('github', 'video', 'tutorial', 'link', 'articulo', 'herramienta')),
    section_id TEXT NOT NULL DEFAULT 'sec-links',
    emoji TEXT NOT NULL DEFAULT '📌',
    author_or_channel TEXT NOT NULL DEFAULT 'Equipo BoxTools',
    thumbnail_url TEXT,
    video_embed_url TEXT,
    github_stars INTEGER,
    github_language TEXT,
    key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    tutorial_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    difficulty TEXT NOT NULL DEFAULT 'intermedio' CHECK (difficulty IN ('inicial', 'intermedio', 'avanzado')),
    estimated_time TEXT NOT NULL DEFAULT '10 min',
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_by_ai BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_publications_section_id ON public.publications(section_id);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON public.publications(created_at DESC);

-- 3. Habilitar Row Level Security (RLS) con políticas de equipo abiertas
ALTER TABLE public.publication_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read publication_sections" ON public.publication_sections;
CREATE POLICY "Public read publication_sections" ON public.publication_sections
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public insert publication_sections" ON public.publication_sections;
CREATE POLICY "Public insert publication_sections" ON public.publication_sections
    FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Public update publication_sections" ON public.publication_sections;
CREATE POLICY "Public update publication_sections" ON public.publication_sections
    FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete publication_sections" ON public.publication_sections;
CREATE POLICY "Public delete publication_sections" ON public.publication_sections
    FOR DELETE TO public USING (true);

DROP POLICY IF EXISTS "Public read publications" ON public.publications;
CREATE POLICY "Public read publications" ON public.publications
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public insert publications" ON public.publications;
CREATE POLICY "Public insert publications" ON public.publications
    FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Public update publications" ON public.publications;
CREATE POLICY "Public update publications" ON public.publications
    FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete publications" ON public.publications;
CREATE POLICY "Public delete publications" ON public.publications
    FOR DELETE TO public USING (true);

-- 4. Semilla inicial idempotente de Apartados Base
INSERT INTO public.publication_sections (id, slug, name, emoji, description, tone, is_system, created_at)
VALUES
    ('sec-github', 'repositorios-github', 'Repositorios GitHub', '🐙', 'Repositorios open-source, librerías, starters, agentes y herramientas listas para clonar.', 'purple', true, '2026-01-01T00:00:00.000Z'),
    ('sec-videos', 'videos-y-charlas', 'Videos & YouTube', '🎬', 'Videos explicativos, demos en vivo, conferencias y clases con reproductor integrado.', 'rose', true, '2026-01-01T00:00:00.000Z'),
    ('sec-tutoriales', 'tutoriales-y-guias', 'Tutoriales Paso a Paso', '🎓', 'Guías prácticas, laboratorios paso a paso y recetas de implementación para el equipo.', 'emerald', true, '2026-01-01T00:00:00.000Z'),
    ('sec-links', 'links-y-recursos', 'Links & Documentación', '🔗', 'Artículos técnicos, páginas web útiles, blogs de ingeniería y referencias oficiales.', 'cyan', true, '2026-01-01T00:00:00.000Z'),
    ('sec-prompts', 'prompts-y-agentes', 'Prompts & Flujos IA', '🧠', 'System prompts, arquitecturas de agentes, servidores MCP y experimentos de Vibe Coding.', 'orange', false, '2026-01-01T00:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- 5. Semilla inicial idempotente de Publicaciones Base
INSERT INTO public.publications (
    id, slug, title, summary, criollo_takeaway, technical_notes, url, resource_type, section_id,
    emoji, author_or_channel, thumbnail_url, video_embed_url, github_stars, github_language,
    key_points, tutorial_steps, tags, difficulty, estimated_time, is_pinned, is_favorite, created_by_ai, created_at
)
VALUES
(
    'pub-init-1',
    'modelcontextprotocol-servers-repo',
    'Model Context Protocol (MCP) — Repositorio Oficial de Servidores',
    'Colección oficial mantenida por Anthropic y la comunidad con decenas de implementaciones de servidores MCP listos para conectar tus agentes (Claude Code, Cursor, Antigravity) con bases de datos, Git, navegadores web, APIs empresariales y sistemas de archivos.',
    'Es como la ferretería industrial donde están todos los adaptadores y enchufes homologados para tu agente de IA: en vez de fabricar un cable a mano para conectar la IA a Postgres, GitHub o Playwright, entrás acá y agarrás el enchufe oficial probado.',
    E'### Arquitectura de los Servidores de Referencia\n- Basados en los SDKs oficiales de **TypeScript** (`@modelcontextprotocol/sdk`) y **Python** (`mcp`).\n- Soportan transporte vía `stdio` para ejecución local rápida con `npx` o `uvx`, y `SSE` para despliegues remotos.\n- Incluye servidores clave como **Filesystem**, **Git**, **PostgreSQL**, **Memory**, **Fetch** y **Puppeteer/Playwright**.',
    'https://github.com/modelcontextprotocol/servers',
    'github',
    'sec-github',
    '🔌',
    'modelcontextprotocol',
    'https://opengraph.githubassets.com/1/modelcontextprotocol/servers',
    NULL,
    38500,
    'TypeScript',
    '["Repositorio central con implementaciones oficiales y comunitarias de servidores MCP.", "Ejecución directa sin instalación global usando npx -y @modelcontextprotocol/server-* o uvx.", "Código abierto ideal como plantilla para programar tus propios servidores MCP a medida.", "Compatible con Antigravity, Claude Code, Cursor, Windsurf y OpenCode."]'::jsonb,
    '["Elegir el servidor necesario dentro de la carpeta src/ del repositorio.", "Copiar el bloque JSON de configuración con el comando npx o uvx.", "Pegarlo en el archivo de configuración MCP de tu IDE o agente.", "Verificar que las herramientas aparezcan activas en el panel del agente."]'::jsonb,
    ARRAY['MCP', 'Anthropic', 'Agentes IA', 'TypeScript', 'Open Source'],
    'intermedio',
    '10 min de lectura',
    true,
    true,
    true,
    '2026-11-10T14:30:00.000Z'
),
(
    'pub-init-2',
    'repomix-empaquetador-contexto-ia',
    'Repomix — Empaqueta cualquier Repositorio en un solo Archivo para IA',
    'Herramienta CLI ultrarrápida que empaqueta todo tu código fuente en un único archivo estructurado (XML, Markdown o texto plano) optimizado para que los modelos de lenguaje comprendan el 100% de la arquitectura sin alucinar.',
    'Imaginate que tenés que mostrarle toda una obra en construcción a un ingeniero nuevo: en vez de hacerlo caminar cuarto por cuarto a oscuras, Repomix le saca una radiografía 3D completa con el plano, el conteo de ladrillos y las medidas exactas en una sola carpeta prolija.',
    E'### Por qué es clave en nuestro Workflow V7\n- Respeta automáticamente tus reglas de `.gitignore` y permite filtros personalizados.\n- Cuenta tokens por archivo para evitar desbordar la ventana de contexto del LLM.\n- Incluye chequeo de seguridad con **Secretlint** para no filtrar claves ni credenciales por error.',
    'https://github.com/yamadashy/repomix',
    'tutorial',
    'sec-tutoriales',
    '📦',
    'yamadashy',
    'https://opengraph.githubassets.com/1/yamadashy/repomix',
    NULL,
    14200,
    'TypeScript',
    '["Genera un mapa completo del árbol de directorios junto con el contenido de cada archivo.", "Detecta y bloquea automáticamente API keys o secretos antes de exportar.", "Soporta descarga y empaquetado de repositorios remotos sin necesidad de clonarlos.", "Formato XML nativo optimizado para prompts de Claude, Gemini y GPT."]'::jsonb,
    '["Abrir la terminal en la raíz del proyecto que quieras auditar o retomar.", "Ejecutar npx repomix para generar el archivo repomix-output.xml.", "Para analizar un repositorio remoto directamente: npx repomix --remote usuario/repo.", "Entregar el archivo generado al agente como ancla de contexto antes de pedir cambios."]'::jsonb,
    ARRAY['Repomix', 'Contexto IA', 'CLI', 'Workflow V7', 'Productividad'],
    'inicial',
    '5 min práctico',
    true,
    false,
    true,
    '2026-11-11T10:15:00.000Z'
),
(
    'pub-init-3',
    'andrej-karpathy-deep-dive-llms',
    'Deep Dive into LLMs like ChatGPT — Clase Magistral Completa',
    'Explicación visual y práctica de punta a punta sobre cómo se entrenan, refinan y operan por dentro los Grandes Modelos de Lenguaje modernos: pre-entrenamiento, tokenización, post-entrenamiento (SFT), RLHF, razonamiento y uso de herramientas.',
    'Es como abrir el capó de un auto de Fórmula 1 con el jefe de mecánicos explicándote pieza por pieza sin palabras raras: entendés por qué a veces el modelo derrapa (alucina), cómo piensa con tokens y cómo hablarle para sacarle el máximo rendimiento.',
    E'### Conceptos Técnicos Cubiertos\n- **Tokenización y Ventana de Contexto:** Por qué los modelos ven números de sub-palabras y no caracteres sueltos.\n- **Pre-training vs Post-training:** La diferencia entre el documento base de internet y el asistente entrenado para seguir instrucciones.\n- **Reasoning & Tool Use:** Cómo los modelos de razonamiento usan cadenas de pensamiento (CoT) y llamadas a herramientas externas.',
    'https://www.youtube.com/watch?v=7xTGNNLPyMI',
    'video',
    'sec-videos',
    '🎬',
    'Andrej Karpathy',
    'https://img.youtube.com/vi/7xTGNNLPyMI/hqdefault.jpg',
    'https://www.youtube.com/embed/7xTGNNLPyMI',
    NULL,
    NULL,
    '["Diferencia clara entre conocimiento parametrizado (memoria vaga) y contexto en el prompt (memoria de trabajo exacta).", "Por qué darle contexto real (archivos, docs, código) reduce drásticamente las alucinaciones.", "Cómo funcionan los modelos de razonamiento (Thinking / RL) frente a los modelos estándar.", "Buenas prácticas para estructurar prompts técnicos y flujos de trabajo con agentes."]'::jsonb,
    '["Mirar el bloque de Psicología del Modelo y Alucinaciones para entender cómo inyectar contexto.", "Aplicar la regla de oro: siempre adjuntar la documentación o código fuente en el contexto activo.", "Dividir tareas complejas de arquitectura en pasos verificables."]'::jsonb,
    ARRAY['Video', 'LLMs', 'Andrej Karpathy', 'Fundamentos IA', 'Prompt Engineering'],
    'inicial',
    'Video / Clase',
    false,
    true,
    true,
    '2026-11-11T18:00:00.000Z'
),
(
    'pub-init-4',
    'playwright-docs-testing-e2e',
    'Playwright Docs — Automatización y Auditoría Visual E2E Moderna',
    'Documentación oficial e interactiva de Playwright para pruebas End-to-End multi-navegador, capturas de pantalla en múltiples viewports (1440px, 768px, 375px), trazas de red e inspección automática para agentes de IA.',
    'Es el inspector de obra robotizado que entra a tu aplicación con celular, tablet y monitor gigante, toca todos los botones, saca fotos de cada rincón y te avisa si algo quedó torcido antes de que lo vea el cliente.',
    E'### Comandos Esenciales en el Equipo\n- `npx playwright test` para correr toda la suite de validación.\n- `npx playwright codegen http://localhost:5173` para grabar interacciones automáticamente.\n- Uso de locators semánticos (`getByRole`, `getByTestId`) para evitar tests frágiles.',
    'https://playwright.dev/docs/intro',
    'link',
    'sec-links',
    '🎭',
    'Microsoft / Playwright',
    NULL,
    NULL,
    NULL,
    NULL,
    '["Auto-waiting nativo: espera a que los elementos sean visibles e interactuables antes de hacer click.", "Trace Viewer completo con capturas DOM, consola y red paso a paso.", "Pilar fundamental de la Fase 2 y Fase 4 de nuestra metodología PEVC V5."]'::jsonb,
    '["Instalar con npm init playwright@latest en el repositorio.", "Definir los viewports de prueba (Desktop 1440px y Mobile 375px).", "Ejecutar pruebas de humo y verificar cero errores en consola."]'::jsonb,
    ARRAY['Playwright', 'Testing E2E', 'QA Visual', 'Documentación', 'Frontend'],
    'intermedio',
    '15 min de lectura',
    false,
    false,
    false,
    '2026-11-12T09:00:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

