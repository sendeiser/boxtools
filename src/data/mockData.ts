import { ToolItem, ComboPreset } from '../types/boxtools';

export const INITIAL_TOOLS: readonly ToolItem[] = [
  {
    id: 't-superpowers',
    slug: 'superpowers',
    codeId: 'SKILL-001',
    title: 'superpowers (SDLC & Brainstorming)',
    tagline: 'Metodología completa SDLC: Brainstorming socrático, Git Worktrees, TDD estricto y Debugging sistemático.',
    emoji: '🦸',
    category: 'skill',
    categoryLabel: '⚡ SKILL AGÉNTICA',
    phase: 'fase0',
    phaseLabel: 'FASE 0 // ARQ & SETUP',
    status: 'published',
    isFeatured: true,
    criolloAnalogy: 'Es como contratar a un capataz de obra veterano que antes de dejarte tocar un ladrillo te exige los planos firmados, aísla la zona con conos y te obliga a medir dos veces antes de cortar una.',
    criolloWithout: [
      'El modelo empieza a escribir código adivinando requisitos y rompe la rama principal.',
      'Commits monstruosos imposibles de testear y bugs lógicos invisibles.',
    ],
    criolloWith: [
      'Entrevista socrática que tapa todos los huecos antes de empezar.',
      'Trabajo aislado en Git Worktrees con semáforo TDD (Rojo ➔ Verde ➔ Azul).',
    ],
    semaforoGreen: [
      'Al arrancar cualquier funcionalidad nueva, refactor o subsistema.',
      'Cuando necesitas especificar un proyecto sin dejar cabos sueltos.',
    ],
    semaforoRed: [
      'Para preguntas teóricas rápidas de 1 solo turno sin cambios en el repo.',
    ],
    riskLevel: 'low',
    mermaidCode: `flowchart LR
    A[💡 Idea Cruda] --> B[🧠 Brainstorming Socrático]
    B --> C[📄 Spec Aprobada]
    C --> D[🌲 Git Worktree Aislado]
    D --> E[🚦 TDD Rojo-Verde-Azul]`,
    svgConfig: {
      title: 'Flujo de Blindaje SDLC',
      badge: 'PROCESO DETERMINISTA',
      steps: [
        { icon: '💡', label: 'Idea o Feature', sublabel: 'Sin asumir nada', tone: 'orange' },
        { icon: '🌲', label: 'Worktree + Spec', sublabel: 'Aislamiento total', tone: 'cyan' },
        { icon: '🚀', label: 'TDD Verificado', sublabel: 'Cero alucinaciones', tone: 'emerald' },
      ],
      summaryNote: 'Garantiza que la IA nunca toque código productivo sin contrato previo.',
    },
    mediaGallery: [
      {
        id: 'm-sp-1',
        url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Diagrama de Arquitectura y Flujo SDLC con Superpowers',
        isAiGenerated: false,
      },
    ],
    cliQuickCommand: 'npx skills add https://github.com/obra/superpowers',
    installCommands: {
      antigravity: 'agy plugin install https://github.com/obra/superpowers',
      opencode: 'npx skills add https://github.com/obra/superpowers',
      cursor: 'npx skills add https://github.com/obra/superpowers',
      claudeCode: 'npx skills add https://github.com/obra/superpowers',
    },
    rawMarkdown: `# Superpowers

Suite de metodologías agénticas para desarrollo de software profesional.

## Habilidades incluidas:
- \`brainstorming\`: Entrevista socrática para tapar huecos antes de diseñar.
- \`using-git-worktrees\`: Entorno aislado por feature.
- \`writing-plans\`: Desglose en micro-tareas de 2-5 minutos.
- \`test-driven-development\`: Red-Green-Refactor.
- \`systematic-debugging\`: Rastreo de causa raíz sin adivinar.
`,
    repoUrl: 'https://github.com/obra/superpowers',
    compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
  },
  {
    id: 't-stitch-mcp',
    slug: 'stitch-mcp',
    codeId: 'MCP-001',
    title: 'Google Stitch MCP & Skills',
    tagline: 'Diseño visual y generación de pantallas frontend conectado a Google Stitch Studio.',
    emoji: '🧵',
    category: 'mcp',
    categoryLabel: '🔌 SERVIDOR MCP',
    phase: 'fase2',
    phaseLabel: 'FASE 2 // VIBE UI',
    status: 'published',
    isFeatured: true,
    criolloAnalogy: 'Es como tener un taller de maquetación de alta costura: le mandás el molde y las medidas, y te devuelve las telas ya cortadas y listas para armar sin que tengas que dibujar pixel por pixel.',
    criolloWithout: [
      'Interfaces genéricas y aburridas hechas con componentes estándar sin personalidad.',
      'Horas maquetando CSS a mano desde cero para prototipar.',
    ],
    criolloWith: [
      'Diseño visual profesional exportable directamente a código React o HTML.',
      'Sistemas de diseño centralizados con tokens de color, tipografía y formas.',
    ],
    semaforoGreen: [
      'Para maquetar pantallas completas, dashboards y landings antes de codificar la lógica.',
      'Cuando querés iterar variantes visuales en segundos.',
    ],
    semaforoRed: [
      'Para lógica de backend, bases de datos o APIs.',
    ],
    riskLevel: 'medium',
    mermaidCode: `flowchart LR
    A[📝 Prompt Estructural] --> B[🎨 Stitch MCP Server]
    B --> C[🖼️ Screenshot 3280px]
    C --> D[💻 HTML + Tailwind Puro]
    D --> E[⚛️ Componentes React]`,
    svgConfig: {
      title: 'Tubería de Generación UI',
      badge: 'STITCH ENGINE',
      steps: [
        { icon: '📝', label: 'Prompt Maestro', sublabel: 'Layout & Estructura', tone: 'orange' },
        { icon: '🎨', label: 'Stitch Studio', sublabel: 'Generación Canvas', tone: 'purple' },
        { icon: '💻', label: 'Código React', sublabel: 'Tailwind + Tokens', tone: 'cyan' },
      ],
      summaryNote: 'Convierte descripciones estructurales en maquetas visuales listas para producción.',
    },
    mediaGallery: [
      {
        id: 'm-st-1',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        caption: 'Lienzo de Stitch generando interfaces en alta resolución',
        isAiGenerated: false,
      },
    ],
    cliQuickCommand: 'npx skills add https://github.com/google-labs-code/stitch-skills',
    installCommands: {
      antigravity: 'agy plugin install https://github.com/google-labs-code/stitch-skills',
      opencode: 'npx skills add https://github.com/google-labs-code/stitch-skills',
      cursor: 'npx skills add https://github.com/google-labs-code/stitch-skills',
      claudeCode: 'npx skills add https://github.com/google-labs-code/stitch-skills',
    },
    mcpConfigJson: `{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "@google-labs/stitch-mcp"]
    }
  }
}`,
    rawMarkdown: `# Stitch MCP & Skills

Conecta tu agente directamente con el motor de generación visual de Google Stitch.

Permite:
- \`generate_screen_from_text\`
- \`create_design_system\`
- \`download_file\` (HTML y capturas en alta fidelidad)
`,
    repoUrl: 'https://github.com/google-labs-code/stitch-skills',
    compatibilityTags: ['Antigravity', 'Cursor', 'OpenCode'],
  },
  {
    id: 't-impeccable',
    slug: 'impeccable',
    codeId: 'SKILL-002',
    title: 'impeccable (Auditoría UI/UX Multimodal)',
    tagline: 'Inspección de capturas Playwright + código CSS para erradicar defectos de diseño y mobile.',
    emoji: '🔍',
    category: 'skill',
    categoryLabel: '⚡ SKILL AGÉNTICA',
    phase: 'fase2',
    phaseLabel: 'FASE 2 // VIBE UI',
    status: 'published',
    isFeatured: true,
    criolloAnalogy: 'Es el inspector implacable con lupa que mira la foto de la obra terminada y los planos a la vez: si una ventana quedó 2 milímetros torcida o un texto no se lee en el celular, te marca el arreglo exacto.',
    criolloWithout: [
      'Menús mobile rotos, textos cortados y botones desalineados que saltan a producción.',
      'Diseños planos que parecen plantillas genéricas de IA.',
    ],
    criolloWith: [
      'Alineación milimétrica analizando capturas reales a 1440px, 768px y 375px.',
      'Perfeccionamiento de jerarquía tipográfica, espaciados y estados interactivos.',
    ],
    semaforoGreen: [
      'Inmediatamente después de maquetar con Stitch y antes de programar la lógica.',
      'Para auditorías de accesibilidad, contraste y modo responsive.',
    ],
    semaforoRed: [
      'Para tareas exclusivas de backend sin interfaz visual.',
    ],
    riskLevel: 'low',
    mermaidCode: `flowchart LR
    A[📸 Capturas Playwright] --> C[👁️ Impeccable Multimodal]
    B[💻 Código JSX/CSS] --> C
    C --> D[🛠️ Corrección Quirúrgica]
    D --> E[✨ UI 10/10 Verificada]`,
    svgConfig: {
      title: 'Bucle de Pulido Visual',
      badge: 'MULTIMODAL AUDIT',
      steps: [
        { icon: '📸', label: 'Captura Real', sublabel: 'Desktop + Mobile', tone: 'cyan' },
        { icon: '👁️', label: 'Análisis Visual', sublabel: 'Foto + Código CSS', tone: 'purple' },
        { icon: '✨', label: 'Ajuste Impecable', sublabel: 'Cero defectos', tone: 'emerald' },
      ],
      summaryNote: 'Verifica la estética cruzando la imagen renderizada con el código fuente.',
    },
    mediaGallery: [
      {
        id: 'm-imp-1',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        caption: 'Inspección visual y detección de colisiones de layout',
        isAiGenerated: false,
      },
    ],
    cliQuickCommand: 'npx skills add impeccable',
    installCommands: {
      antigravity: 'agy plugin install impeccable',
      opencode: 'npx skills add impeccable',
      cursor: 'npx skills add impeccable',
      claudeCode: 'npx skills add impeccable',
    },
    rawMarkdown: `# Impeccable UI/UX Auditor

Habilidad especializada en llevar el diseño frontend a nivel artesanal de alta gama.

Comandos disponibles:
- \`audit\`: Inspección técnica (accesibilidad, contraste, responsive).
- \`polish\`: Refinamiento visual final.
- \`typeset\`: Jerarquía tipográfica y legibilidad.
- \`adapt\`: Adaptación móvil y pantallas táctiles.
`,
    repoUrl: 'https://skillsllm.com/skill/impeccable',
    compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
  },
  {
    id: 't-ui-ux-pro-max',
    slug: 'ui-ux-pro-max',
    codeId: 'SKILL-003',
    title: 'ui-ux-pro-max (Inteligencia de Diseño UI/UX)',
    tagline: 'Motor de decisiones UI/UX local: 79 estilos, 192 paletas de producto, 74 font pairings y 119 reglas heurísticas de accesibilidad y microinteracciones.',
    emoji: '✨',
    category: 'skill',
    categoryLabel: '⚡ SKILL AGÉNTICA',
    phase: 'fase2',
    phaseLabel: 'FASE 2 // VIBE UI',
    status: 'published',
    isFeatured: true,
    criolloAnalogy: 'Es como tener a un Director de Arte y Diseñador UX Senior sentado al lado tuyo que te canta la posta: te dice la paleta cromática exacta para tu nicho, los tamaños de tipografía según la jerarquía visual y las reglas para que la app no parezca un engendro hecho con Tailwind genérico.',
    criolloWithout: [
      'Interfaces con "olor a IA": grises lavados sin contraste, tipografías desproporcionadas y botones sin estados hover o focus.',
      'Perder horas probando colores al azar en Coolors o inventando reglas de accesibilidad que se rompen en celulares.',
    ],
    criolloWith: [
      'Recomendaciones deterministas basadas en 192 perfiles de producto y 79 estilos (Neobrutalismo, Minimal, Glassmorphism, Bento, etc.).',
      'Auditoría heurística con 119 reglas de accesibilidad WCAG (contraste 4.5:1, targets táctiles de 44px, navegación por teclado).',
    ],
    semaforoGreen: [
      'Al idear el Design System de una nueva web, landing o producto SaaS.',
      'Cuando necesitas resolver paletas de color con fundamento psicológico y pairings tipográficos sólidos.',
      'Para consultar reglas específicas de accesibilidad, microinteracciones GSAP o visualización de gráficos.',
    ],
    semaforoRed: [
      'Para diseñar tablas de base de datos Postgres o escribir queries SQL.',
      'Para infraestructura DevOps, Dockerfiles o endpoints de backend puros.',
    ],
    riskLevel: 'low',
    mermaidCode: `flowchart LR
    A[🎯 Tipo de Producto + Nicho] --> B[🔍 Search Script ui-ux-pro-max]
    B --> C[🎨 Design System Master]
    C --> D[📐 Tokens: Colores + Tipografía + Reglas]
    D --> E[🚀 Componentes Frontend Alta Fidelidad]`,
    svgConfig: {
      title: 'Motor de Inteligencia de Diseño',
      badge: 'DESIGN SYSTEM DETERMINISTA',
      steps: [
        { icon: '🎯', label: 'Tipo & Nicho', sublabel: 'Contexto de producto', tone: 'orange' },
        { icon: '🎨', label: '79 Estilos & 192 Paletas', sublabel: 'Razonamiento visual', tone: 'purple' },
        { icon: '📐', label: 'Design System Master', sublabel: 'Tokens + 119 Reglas UX', tone: 'emerald' },
      ],
      summaryNote: 'Elimina el diseño genérico de IA dotando al agente de criterios estéticos y heurísticos profesionales.',
    },
    mediaGallery: [
      {
        id: 'm-uiux-1',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        caption: 'Catálogo de estilos, paletas y tipografías para interfaces de usuario modernas',
        isAiGenerated: false,
      },
    ],
    cliQuickCommand: 'python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system',
    installCommands: {
      antigravity: 'npx skills add ui-ux-pro-max',
      opencode: 'npx skills add ui-ux-pro-max',
      cursor: 'npx skills add ui-ux-pro-max',
      claudeCode: 'npx skills add ui-ux-pro-max',
    },
    rawMarkdown: `# UI/UX Pro Max - Design Intelligence

Inteligencia de diseño UI/UX local y determinista para Web, Mobile y Desktop.

## Base de conocimiento indexada:
- 79 estilos visuales (Minimalismo, Neo-brutalismo, Bento Grid, Dark Mode, etc.).
- 192 paletas de producto con justificación y roles de color (60-30-10).
- 74 pairings tipográficos balanceados para lectura y display.
- 119 reglas heurísticas de UX clasificadas por prioridad (Accesibilidad WCAG, Táctil 44px, Performance, Animación).
- 105 iconos curados, 17 presets de animación GSAP y 25 tipos de gráficos.

## Modos de búsqueda disponibles:
\`\`\`bash
# 1. Generar sistema de diseño completo para un nicho
python .agents/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard" --design-system -p "MiProyecto"

# 2. Consultar reglas de accesibilidad o interacción
python .agents/skills/ui-ux-pro-max/scripts/search.py "touch target size" --domain ux

# 3. Consultar paletas y armonías cromáticas
python .agents/skills/ui-ux-pro-max/scripts/search.py "saas analytics" --domain color

# 4. Consultar pairings tipográficos
python .agents/skills/ui-ux-pro-max/scripts/search.py "editorial modern" --domain typography
\`\`\`
`,
    repoUrl: 'https://github.com/obra/ui-ux-pro-max',
    compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
  },
  {
    id: 't-supabase-cloud',
    slug: 'supabase-cloud',
    codeId: 'MCP-002',
    title: 'Supabase Cloud MCP (100% Sin Docker)',
    tagline: 'Control DDL/DML directo sobre Postgres en la nube: Tablas, RLS, Storage y tipos TypeScript.',
    emoji: '⚡',
    category: 'mcp',
    categoryLabel: '🔌 SERVIDOR MCP',
    phase: 'fase3',
    phaseLabel: 'FASE 3 // DB & TDD',
    status: 'published',
    isFeatured: true,
    criolloAnalogy: 'Es una línea directa y segura con la bóveda en la nube: sin levantar Docker en tu máquina ni prender fuego la memoria RAM, el agente crea las tablas, ajusta los permisos y te devuelve los tipos listos.',
    criolloWithout: [
      'Docker consumiendo 8 GB de RAM y trabando la máquina con contenedores caídos.',
      'Escribir a mano interfaces TypeScript desincronizadas con la base de datos.',
    ],
    criolloWith: [
      'Cero overhead local: conexión remota directa vía API Cloud oficial.',
      'Generación instantánea de types TypeScript y migraciones SQL seguras.',
    ],
    semaforoGreen: [
      'Para crear esquemas relacionales, políticas RLS y buckets de Storage en vivo.',
      'En la Fase 3 del flujo PEVC V5.',
    ],
    semaforoRed: [
      'PROHIBIDO correr supabase start o exigir Docker local.',
    ],
    riskLevel: 'high',
    mermaidCode: `flowchart LR
    A[🤖 Agente IA] --> B[🔌 Supabase MCP]
    B -->|API HTTPS Cloud| C[☁️ Supabase PostgreSQL]
    C --> D[🛡️ RLS Policies]
    C --> E[📦 Storage Buckets]
    C --> F[📄 database.types.ts]`,
    svgConfig: {
      title: 'Arquitectura Cloud Directa',
      badge: 'ZERO DOCKER',
      steps: [
        { icon: '🤖', label: 'Sentencia SQL / DDL', sublabel: 'apply_migration', tone: 'orange' },
        { icon: '☁️', label: 'Supabase Cloud', sublabel: 'Conexión SSL Remota', tone: 'emerald' },
        { icon: '📄', label: 'Types TypeScript', sublabel: 'Autogenerados', tone: 'cyan' },
      ],
      summaryNote: 'Control total de la base de datos sin fricción de infraestructura local.',
    },
    mediaGallery: [
      {
        id: 'm-sup-1',
        url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
        caption: 'Base de datos relacional y políticas de seguridad RLS en la nube',
        isAiGenerated: false,
      },
    ],
    cliQuickCommand: 'npx -y @supabase/mcp-server-supabase@latest --access-token <TOKEN> --project-ref <REF>',
    installCommands: {
      antigravity: 'Configurar en mcp.json con SUPABASE_ACCESS_TOKEN',
      opencode: 'npx -y @supabase/mcp-server-supabase@latest',
      cursor: 'Configurar en cursor settings mcpServers',
      claudeCode: 'claude mcp add supabase @supabase/mcp-server-supabase',
    },
    mcpConfigJson: `{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "\${SUPABASE_ACCESS_TOKEN}",
        "--project-ref",
        "\${SUPABASE_PROJECT_REF}"
      ]
    }
  }
}`,
    rawMarkdown: `# Supabase Cloud MCP (Zero Docker)

Conector oficial para operar proyectos Supabase Cloud de forma remota.

### Capacidades:
- \`execute_sql\` / \`apply_migration\`
- \`list_tables\` / \`list_migrations\`
- \`generate_typescript_types\`
- Configuración de RLS y storage
`,
    repoUrl: 'https://github.com/supabase/agent-skills',
    compatibilityTags: ['Antigravity', 'Cursor', 'Claude Code', 'OpenCode'],
  },
  {
    id: 't-playwright-mcp',
    slug: 'playwright-mcp',
    codeId: 'MCP-003',
    title: 'Playwright Browser MCP & Testing',
    tagline: 'Ojos mecánicos y navegador real para inspección DOM, capturas y pruebas funcionales E2E.',
    emoji: '🎭',
    category: 'mcp',
    categoryLabel: '🔌 SERVIDOR MCP',
    phase: 'fase3',
    phaseLabel: 'FASE 3 // QA & E2E',
    status: 'published',
    isFeatured: true,
    criolloAnalogy: 'Es como ponerle una cámara de alta velocidad y dedos de robot al asistente: abre el navegador posta, hace click en cada botón, saca la foto para ver si algo se rompió y te avisa en el acto.',
    criolloWithout: [
      'Probar la web haciendo clicks manuales como en el 2005.',
      'Ignorar desbordamientos horizontales o botones que se solapan en pantallas chicas.',
    ],
    criolloWith: [
      'Capturas automáticas en 1440px, 768px y 375px en cada cambio.',
      'Detección inmediata de errores de consola y fallas de renderizado.',
    ],
    semaforoGreen: [
      'Para validar visualmente la UI con Impeccable (Fase 2).',
      'Para verificar flujos completos de punta a punta con datos reales (Fases 3 y 4).',
    ],
    semaforoRed: [
      'No usar para tests unitarios puros donde basta con Vitest.',
    ],
    riskLevel: 'medium',
    mermaidCode: `flowchart LR
    A[💻 Servidor Local 5173] --> B[🎭 Playwright Headless]
    B --> C[📸 Captura Desktop 1440px]
    B --> D[📸 Captura Tablet 768px]
    B --> E[📸 Captura Mobile 375px]
    C & D & E --> F[🔍 Detección DOM scrollWidth]`,
    svgConfig: {
      title: 'Diagnóstico en Navegador Real',
      badge: 'HEADLESS CHROMIUM',
      steps: [
        { icon: '🌐', label: 'Levanta Servidor', sublabel: 'Vite en puerto local', tone: 'yellow' },
        { icon: '🎭', label: 'Playwright Visor', sublabel: 'Click, scroll & DOM', tone: 'cyan' },
        { icon: '📸', label: 'Capturas 3 Resoluciones', sublabel: '1440px / 768px / 375px', tone: 'emerald' },
      ],
      summaryNote: 'Permite al agente ver exactamente lo que ve el usuario final.',
    },
    mediaGallery: [
      {
        id: 'm-pw-1',
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        caption: 'Ejecución de pruebas E2E e inspección de pantalla completa',
        isAiGenerated: false,
      },
    ],
    cliQuickCommand: 'npx skills add https://github.com/anthropics/skills --skill webapp-testing',
    installCommands: {
      antigravity: 'npx skills add https://github.com/anthropics/skills --skill webapp-testing',
      opencode: 'npx skills add webapp-testing',
      cursor: 'npx skills add webapp-testing',
      claudeCode: 'npx skills add webapp-testing',
    },
    rawMarkdown: `# Playwright WebApp Testing

Herramientas para interactuar y validar aplicaciones web mediante Chromium Headless.

Incluye soporte para:
- Capturas de pantalla diagnósticas
- Detección de overflow horizontal
- Simulación de clicks, inputs y navegación
`,
    repoUrl: 'https://github.com/microsoft/playwright-mcp',
    compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
  },
  {
    id: 't-pevc-v5',
    slug: 'pevc-v5-workflow',
    codeId: 'MD-001',
    title: 'PEVC V5: Metodología Vibe Coding (.md)',
    tagline: 'El workflow maestro con las 5 fases obligatorias para construir sin alucinaciones ni deuda técnica.',
    emoji: '📘',
    category: 'markdown',
    categoryLabel: '📝 WORKFLOW MARKDOWN',
    phase: 'fase1',
    phaseLabel: 'FASE 1 // PROTOCOLO',
    status: 'published',
    isFeatured: true,
    criolloAnalogy: 'Es la biblia y reglamento del equipo: define las reglas del juego para que nadie mande a picar código a lo loco sin antes pasar por el arquitecto, el diseñador y el auditor.',
    criolloWithout: [
      'Proyectos caóticos donde cada programador usa un prompt distinto y todo explota en producción.',
      'Docker colgando las máquinas y código que nadie sabe si fue testeado.',
    ],
    criolloWith: [
      'Paso a paso estricto desde la entrevista hasta la entrega final con git limpio.',
      'Checkpoints de aprobación humana obligatorios antes de escribir lógica.',
    ],
    semaforoGreen: [
      'Al iniciar cualquier proyecto nuevo en el equipo.',
      'Como system prompt base para cualquier agente de codificación.',
    ],
    semaforoRed: [
      'No saltear ninguna fase ni programar antes de aprobar capturas.',
    ],
    riskLevel: 'low',
    mermaidCode: `flowchart TD
    F0[Fase 0: Setup 11 Skills & MCPs] --> F1[Fase 1: Entrevista Brainstorming]
    F1 --> F2[Fase 2: Stitch + Playwright + Impeccable]
    F2 -->|Aprobación Visual| F3[Fase 3: Supabase Cloud & TDD]
    F3 --> F4[Fase 4: QA E2E, AgentShield & Merge]`,
    svgConfig: {
      title: 'Las 5 Fases de PEVC V5',
      badge: 'METODOLOGÍA OFICIAL',
      steps: [
        { icon: '🛠️', label: 'F0 & F1: Setup & Spec', sublabel: 'Cero huecos', tone: 'orange' },
        { icon: '🎨', label: 'F2: Diseño & Impeccable', sublabel: 'Aprobación visual', tone: 'purple' },
        { icon: '🚀', label: 'F3 & F4: DB & Deploy', sublabel: 'TDD + Cierre limpio', tone: 'emerald' },
      ],
      summaryNote: 'El protocolo estandarizado de ingeniería asistida por IA.',
    },
    mediaGallery: [
      {
        id: 'm-pevc-1',
        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
        caption: 'Planificación de sprint y control de calidad bajo PEVC V5',
        isAiGenerated: false,
      },
    ],
    cliQuickCommand: 'curl -sO https://boxtools.dev/specs/pevc-v5.md',
    installCommands: {
      antigravity: 'Copiar a la raíz del proyecto como PEVC V5.md y activar',
      opencode: 'Guardar en .opencode/instructions.md',
      cursor: 'Pegar en .cursorrules o Project Rules',
      claudeCode: 'Guardar como CLAUDE.md',
    },
    rawMarkdown: `# PEVC V5: Protocolo de Ingeniería Vibe Coding Profesional

1. Fase 0: Verificación de 11 skills y servidores MCP.
2. Fase 1: Entrevista socrática exhaustiva y generación de spec maestro.
3. Fase 2: Generación visual con Stitch, capturas Playwright y pulido con Impeccable.
4. Fase 3: Conexión Supabase Cloud (sin Docker) y desarrollo guiado por pruebas TDD.
5. Fase 4: Pruebas integrales, auditoría de seguridad ECC AgentShield y cierre.
`,
    repoUrl: 'https://github.com/boxtools/pevc-v5',
    compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
  },
  {
    id: 't-system-rol-repomix',
    slug: 'system-rol-repomix-v7',
    codeId: 'MD-002',
    title: 'Workflow Continuidad V7: Contexto Profundo con Repomix (.md)',
    tagline: 'Protocolo de continuidad agéntica autónomo: absorción con Repomix (Fase -1), auditoría de issues y cero roturas al retomar proyectos.',
    emoji: '📦',
    category: 'markdown',
    categoryLabel: '📝 WORKFLOW AUTÓNOMO',
    phase: 'fase0',
    phaseLabel: 'WORKFLOW CONTINUO // V7',
    status: 'published',
    isFeatured: true,
    criolloAnalogy: 'Es como cuando llamás a un mecánico de confianza para que le meta mano a un auto que ya tocó otro taller: lo primero que hace no es desarmar el motor a lo loco, sino conectar el scanner Repomix para leer la computadora de a bordo, revisar el manual y preguntarte "Mirá, encontré esto así, ¿arrancamos por acá?" antes de tocar un solo tornillo.',
    criolloWithout: [
      'El agente arranca a escribir código a ciegas, borra funciones que ya estaban hechas, cambia librerías a la mitad del proyecto y rompe todo lo que andaba.',
      'Tener que explicarle en cada prompt toda la estructura del proyecto una y otra vez porque pierde el hilo de lo que ya se programó.',
    ],
    criolloWith: [
      'Empaquetado quirúrgico con repomix que le da al agente la foto 360° del repo en segundos: dependencias, specs, componentes e issues abiertos.',
      'Checkpoint obligatorio de diagnóstico de continuidad para acordar el siguiente paso antes de tocar una sola línea de código.',
    ],
    semaforoGreen: [
      'Al retomar cualquier proyecto existente o branch en curso.',
      'Para auditar repositorios heredados, resolver issues sin romper código previo y mapear deuda técnica.',
    ],
    semaforoRed: [
      'PROHIBIDO alterar la arquitectura base, la pila tecnológica o estilos visuales existentes sin justificación estricta.',
      'PROHIBIDO codificar antes de presentar el diagnóstico de la Fase 1 y recibir confirmación.',
    ],
    riskLevel: 'low',
    mermaidCode: `flowchart TD
    A[📂 Repo Existente] --> B[📦 Repomix Packager: Fase -1]
    B --> C[🧠 Ingesta de Contexto Profundo]
    C --> D[🛠️ Verificación Skills & MCPs: Fase 0]
    D --> E[📋 Diagnóstico Ejecutivo & Checkpoint: Fase 1]
    E -->|Confirmación del Usuario| F[🌲 Worktree + TDD + Impeccable: Fase 2]
    F --> G[🛡️ E2E + AgentShield + Merge: Fase 3]`,
    svgConfig: {
      title: 'Protocolo de Continuidad V7',
      badge: 'CONTEXTO PROFUNDO & REPOMIX',
      steps: [
        { icon: '📦', label: 'Fase -1: Repomix Pack', sublabel: 'Empaquetado total', tone: 'orange' },
        { icon: '📋', label: 'Fase 0 & 1: Diagnóstico', sublabel: 'Pregunta de continuidad', tone: 'cyan' },
        { icon: '🚀', label: 'Fase 2 & 3: TDD + Cierre', sublabel: 'Cero regresiones', tone: 'emerald' },
      ],
      summaryNote: 'Garantiza la continuidad absoluta al retomar proyectos sin alterar la arquitectura previa.',
    },
    mediaGallery: [
      {
        id: 'm-repo-1',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Auditoría contextual profunda de repositorio y empaquetado con Repomix',
        isAiGenerated: false,
      },
    ],
    cliQuickCommand: 'npx repomix',
    installCommands: {
      antigravity: 'Copiar como system_rol_and_analysis_spec.md y referenciar en el prompt inicial',
      opencode: 'Guardar en .opencode/instructions.md o como prompt de inicio de sesión',
      cursor: 'Agregar al context prompt de Cursor o .cursorrules',
      claudeCode: 'Incluir en CLAUDE.md como directiva de sesión continua',
    },
    rawMarkdown: `# ROL Y CONFIGURACIÓN DEL SISTEMA AGÉNTICO CONTINUO (V7 - CONTEXTO PROFUNDO CON REPOMIX)

Actúa como un Arquitecto de Software Senior, Diseñador UI/UX Principal e Ingeniero QA operando bajo la metodología de "Vibe Coding Profesional".

Tienes **ESTRICTAMENTE PROHIBIDO** alterar la arquitectura base, la pila tecnológica existente, el estilo visual aprobado o los flujos de trabajo previos a menos que sea estrictamente necesario para la continuidad del proyecto.

## FASE -1: ANÁLISIS EXHAUSTIVO DEL REPOSITORIO CON REPOMIX
1. \`npx repomix\`: Empaquetar el repo en un único archivo consolidado de contexto.
2. Ingesta y auditoría: Pila real, arquitectura de carpetas, specs previas e issues abiertos.

## FASE 0: VERIFICACIÓN DE SKILLS Y MCPS
- repomix, superpowers, ECC, find skills, frontend design, stitch MCP, impeccable, supabase MCP (Cloud sin Docker), playwright.

## FASE 1: DIAGNÓSTICO EJECUTIVO Y EMPALME DE CONTINUIDAD
- Pregunta de continuidad obligatoria antes de avanzar:
  *"He completado el análisis exhaustivo del repositorio utilizando Repomix y revisado las especificaciones previas..."*

## FASE 2: WORKFLOW DE DESARROLLO, RESOLUCIÓN DE ISSUES Y TDD
- Worktrees aislados (\`using-git-worktrees\`).
- Ciclo TDD sistemático (Rojo ➔ Verde ➔ Azul).
- Control visual estricto con Playwright + Impeccable (Desktop, Tablet, Mobile).

## FASE 3: PRUEBAS INTEGRALES, SEGURIDAD Y CIERRE
- Validación E2E, auditoría de seguridad con AgentShield y merge limpio.
`,
    repoUrl: 'https://github.com/yamadashy/repomix',
    compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
  },
];

export const INITIAL_COMBOS: readonly ComboPreset[] = [
  {
    id: 'c-full-pevc',
    slug: 'stack-pevc-v5-completo',
    title: 'Stack Completo PEVC V5 (Web + Cloud)',
    subtitle: 'El arsenal definitivo para arrancar y finalizar una web moderna con IA.',
    badgeColor: 'orange',
    criolloSummary: 'El combo completo con papas y gaseosa: tenés capataz, maquetador de lujo, auditor implacable, base de datos en la nube sin Docker y ojos mecánicos para probar todo.',
    toolSlugs: ['superpowers', 'ui-ux-pro-max', 'stitch-mcp', 'impeccable', 'supabase-cloud', 'playwright-mcp'],
    workflowNote: 'Cubre de la Fase 0 a la Fase 4 sin huecos.',
  },
  {
    id: 'c-design-trinity',
    slug: 'trinidad-diseno-vibe',
    title: 'Tríada Visual: Stitch + UI/UX Pro Max + Impeccable',
    subtitle: 'De la idea al diseño de alta costura con maquetación asistida y auditoría multimodal.',
    badgeColor: 'purple',
    criolloSummary: 'El dream team estético: UI/UX Pro Max te define la paleta y reglas para no inventar fruta, Stitch te genera la pantalla en minutos e Impeccable te audita hasta el último pixel para que quede perfecto.',
    toolSlugs: ['ui-ux-pro-max', 'stitch-mcp', 'impeccable'],
    workflowNote: 'El combo definitivo para la Fase 2 de PEVC V5 (Vibe UI & Design System).',
  },
  {
    id: 'c-visual-audit',
    slug: 'auditoria-visual-ui',
    title: 'Dúo Dinámico UI: Stitch + Impeccable',
    subtitle: 'Para maquetar pantallas y dejarlas con acabado artesanal 10/10.',
    badgeColor: 'cyan',
    criolloSummary: 'Stitch te arma la estructura visual a toda velocidad e Impeccable se encarga de que no quede ni un solo texto fuera de lugar ni un menú roto en celulares.',
    toolSlugs: ['stitch-mcp', 'impeccable', 'playwright-mcp'],
    workflowNote: 'Ideal para la Fase 2 de diseño y aprobación visual.',
  },
  {
    id: 'c-backend-cloud',
    slug: 'backend-cloud-tdd',
    title: 'Backend Relacional Cloud + TDD',
    subtitle: 'Persistencia en Postgres Supabase con tests funcionales automatizados.',
    badgeColor: 'yellow',
    criolloSummary: 'Conectás tu base de datos en la nube sin tocar Docker y el agente programa la lógica verificando cada paso con tests en verde.',
    toolSlugs: ['supabase-cloud', 'superpowers', 'playwright-mcp'],
    workflowNote: 'Ideal para la Fase 3 de implementación de datos y reglas de negocio.',
  },
  {
    id: 'c-continuous-v7',
    slug: 'continuidad-repomix-v7',
    title: 'Continuidad Agéntica V7 (Repomix + Superpowers)',
    subtitle: 'Para retomar proyectos existentes sin romper código anterior.',
    badgeColor: 'cyan',
    criolloSummary: 'El scanner total: empaqueta el repo con Repomix para que el agente entienda todo el contexto histórico, diagnostica lo que falta y trabaja aislado con Worktrees y TDD.',
    toolSlugs: ['system-rol-repomix-v7', 'superpowers', 'impeccable', 'playwright-mcp'],
    workflowNote: 'Protocolo de ingreso y continuidad agéntica bajo contexto profundo.',
  },
];

