import {
  PublicationItem,
  PublicationSection,
  PublicationResourceType,
  PublicationDifficulty,
  SectionTone,
  AiSettingsConfig,
} from '../types/boxtools';
import { getAiConfig } from './aiService';
import { supabase } from './supabase';

const STORAGE_SECTIONS_KEY = 'boxtools_publication_sections_v1';
const STORAGE_ITEMS_KEY = 'boxtools_publications_v1';
const PENDING_SEC_UPSERTS_KEY = 'boxtools_pending_sec_upserts_v1';
const PENDING_SEC_DELETES_KEY = 'boxtools_pending_sec_deletes_v1';
const PENDING_PUB_UPSERTS_KEY = 'boxtools_pending_pub_upserts_v1';
const PENDING_PUB_DELETES_KEY = 'boxtools_pending_pub_deletes_v1';
const MIGRATED_CLOUD_KEY = 'boxtools_pubs_cloud_migrated_v1';

export const DEFAULT_PUBLICATION_SECTIONS: PublicationSection[] = [
  {
    id: 'sec-github',
    slug: 'repositorios-github',
    name: 'Repositorios GitHub',
    emoji: '🐙',
    description: 'Repositorios open-source, librerías, starters, agentes y herramientas listas para clonar.',
    tone: 'purple',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'sec-videos',
    slug: 'videos-y-charlas',
    name: 'Videos & YouTube',
    emoji: '🎬',
    description: 'Videos explicativos, demos en vivo, conferencias y clases con reproductor integrado.',
    tone: 'rose',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'sec-tutoriales',
    slug: 'tutoriales-y-guias',
    name: 'Tutoriales Paso a Paso',
    emoji: '🎓',
    description: 'Guías prácticas, laboratorios paso a paso y recetas de implementación para el equipo.',
    tone: 'emerald',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'sec-links',
    slug: 'links-y-recursos',
    name: 'Links & Documentación',
    emoji: '🔗',
    description: 'Artículos técnicos, páginas web útiles, blogs de ingeniería y referencias oficiales.',
    tone: 'cyan',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'sec-prompts',
    slug: 'prompts-y-agentes',
    name: 'Prompts & Flujos IA',
    emoji: '🧠',
    description: 'System prompts, arquitecturas de agentes, servidores MCP y experimentos de Vibe Coding.',
    tone: 'orange',
    isSystem: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_PUBLICATIONS: PublicationItem[] = [
  {
    id: 'pub-init-1',
    slug: 'modelcontextprotocol-servers-repo',
    title: 'Model Context Protocol (MCP) — Repositorio Oficial de Servidores',
    summary:
      'Colección oficial mantenida por Anthropic y la comunidad con decenas de implementaciones de servidores MCP listos para conectar tus agentes (Claude Code, Cursor, Antigravity) con bases de datos, Git, navegadores web, APIs empresariales y sistemas de archivos.',
    criolloTakeaway:
      'Es como la ferretería industrial donde están todos los adaptadores y enchufes homologados para tu agente de IA: en vez de fabricar un cable a mano para conectar la IA a Postgres, GitHub o Playwright, entrás acá y agarrás el enchufe oficial probado.',
    technicalNotes: `### Arquitectura de los Servidores de Referencia\n- Basados en los SDKs oficiales de **TypeScript** (\`@modelcontextprotocol/sdk\`) y **Python** (\`mcp\`).\n- Soportan transporte vía \`stdio\` para ejecución local rápida con \`npx\` o \`uvx\`, y \`SSE\` para despliegues remotos.\n- Incluye servidores clave como **Filesystem**, **Git**, **PostgreSQL**, **Memory**, **Fetch** y **Puppeteer/Playwright**.`,
    url: 'https://github.com/modelcontextprotocol/servers',
    resourceType: 'github',
    sectionId: 'sec-github',
    emoji: '🔌',
    authorOrChannel: 'modelcontextprotocol',
    thumbnailUrl: 'https://opengraph.githubassets.com/1/modelcontextprotocol/servers',
    githubStars: 38500,
    githubLanguage: 'TypeScript',
    keyPoints: [
      'Repositorio central con implementaciones oficiales y comunitarias de servidores MCP.',
      'Ejecución directa sin instalación global usando npx -y @modelcontextprotocol/server-* o uvx.',
      'Código abierto ideal como plantilla para programar tus propios servidores MCP a medida.',
      'Compatible con Antigravity, Claude Code, Cursor, Windsurf y OpenCode.',
    ],
    tutorialSteps: [
      'Elegir el servidor necesario dentro de la carpeta src/ del repositorio.',
      'Copiar el bloque JSON de configuración con el comando npx o uvx.',
      'Pegarlo en el archivo de configuración MCP de tu IDE o agente.',
      'Verificar que las herramientas aparezcan activas en el panel del agente.',
    ],
    tags: ['MCP', 'Anthropic', 'Agentes IA', 'TypeScript', 'Open Source'],
    difficulty: 'intermedio',
    estimatedTime: '10 min de lectura',
    isPinned: true,
    isFavorite: true,
    createdByAi: true,
    createdAt: '2026-11-10T14:30:00.000Z',
  },
  {
    id: 'pub-init-2',
    slug: 'repomix-empaquetador-contexto-ia',
    title: 'Repomix — Empaqueta cualquier Repositorio en un solo Archivo para IA',
    summary:
      'Herramienta CLI ultrarrápida que empaqueta todo tu código fuente en un único archivo estructurado (XML, Markdown o texto plano) optimizado para que los modelos de lenguaje comprendan el 100% de la arquitectura sin alucinar.',
    criolloTakeaway:
      'Imaginate que tenés que mostrarle toda una obra en construcción a un ingeniero nuevo: en vez de hacerlo caminar cuarto por cuarto a oscuras, Repomix le saca una radiografía 3D completa con el plano, el conteo de ladrillos y las medidas exactas en una sola carpeta prolija.',
    technicalNotes: `### Por qué es clave en nuestro Workflow V7\n- Respeta automáticamente tus reglas de \`.gitignore\` y permite filtros personalizados.\n- Cuenta tokens por archivo para evitar desbordar la ventana de contexto del LLM.\n- Incluye chequeo de seguridad con **Secretlint** para no filtrar claves ni credenciales por error.`,
    url: 'https://github.com/yamadashy/repomix',
    resourceType: 'tutorial',
    sectionId: 'sec-tutoriales',
    emoji: '📦',
    authorOrChannel: 'yamadashy',
    thumbnailUrl: 'https://opengraph.githubassets.com/1/yamadashy/repomix',
    githubStars: 14200,
    githubLanguage: 'TypeScript',
    keyPoints: [
      'Genera un mapa completo del árbol de directorios junto con el contenido de cada archivo.',
      'Detecta y bloquea automáticamente API keys o secretos antes de exportar.',
      'Soporta descarga y empaquetado de repositorios remotos sin necesidad de clonarlos.',
      'Formato XML nativo optimizado para prompts de Claude, Gemini y GPT.',
    ],
    tutorialSteps: [
      'Abrir la terminal en la raíz del proyecto que quieras auditar o retomar.',
      'Ejecutar npx repomix para generar el archivo repomix-output.xml.',
      'Para analizar un repositorio remoto directamente: npx repomix --remote usuario/repo.',
      'Entregar el archivo generado al agente como ancla de contexto antes de pedir cambios.',
    ],
    tags: ['Repomix', 'Contexto IA', 'CLI', 'Workflow V7', 'Productividad'],
    difficulty: 'inicial',
    estimatedTime: '5 min práctico',
    isPinned: true,
    isFavorite: false,
    createdByAi: true,
    createdAt: '2026-11-11T10:15:00.000Z',
  },
  {
    id: 'pub-init-3',
    slug: 'andrej-karpathy-deep-dive-llms',
    title: 'Deep Dive into LLMs like ChatGPT — Clase Magistral Completa',
    summary:
      'Explicación visual y práctica de punta a punta sobre cómo se entrenan, refinan y operan por dentro los Grandes Modelos de Lenguaje modernos: pre-entrenamiento, tokenización, post-entrenamiento (SFT), RLHF, razonamiento y uso de herramientas.',
    criolloTakeaway:
      'Es como abrir el capó de un auto de Fórmula 1 con el jefe de mecánicos explicándote pieza por pieza sin palabras raras: entendés por qué a veces el modelo derrapa (alucina), cómo piensa con tokens y cómo hablarle para sacarle el máximo rendimiento.',
    technicalNotes: `### Conceptos Técnicos Cubiertos\n- **Tokenización y Ventana de Contexto:** Por qué los modelos ven números de sub-palabras y no caracteres sueltos.\n- **Pre-training vs Post-training:** La diferencia entre el documento base de internet y el asistente entrenado para seguir instrucciones.\n- **Reasoning & Tool Use:** Cómo los modelos de razonamiento usan cadenas de pensamiento (CoT) y llamadas a herramientas externas.`,
    url: 'https://www.youtube.com/watch?v=7xTGNNLPyMI',
    resourceType: 'video',
    sectionId: 'sec-videos',
    emoji: '🎬',
    authorOrChannel: 'Andrej Karpathy',
    thumbnailUrl: 'https://img.youtube.com/vi/7xTGNNLPyMI/hqdefault.jpg',
    videoEmbedUrl: 'https://www.youtube.com/embed/7xTGNNLPyMI',
    keyPoints: [
      'Diferencia clara entre conocimiento parametrizado (memoria vaga) y contexto en el prompt (memoria de trabajo exacta).',
      'Por qué darle contexto real (archivos, docs, código) reduce drásticamente las alucinaciones.',
      'Cómo funcionan los modelos de razonamiento (Thinking / RL) frente a los modelos estándar.',
      'Buenas prácticas para estructurar prompts técnicos y flujos de trabajo con agentes.',
    ],
    tutorialSteps: [
      'Mirar el bloque de Psicología del Modelo y Alucinaciones para entender cómo inyectar contexto.',
      'Aplicar la regla de oro: siempre adjuntar la documentación o código fuente en el contexto activo.',
      'Dividir tareas complejas de arquitectura en pasos verificables.',
    ],
    tags: ['Video', 'LLMs', 'Andrej Karpathy', 'Fundamentos IA', 'Prompt Engineering'],
    difficulty: 'inicial',
    estimatedTime: 'Video / Clase',
    isPinned: false,
    isFavorite: true,
    createdByAi: true,
    createdAt: '2026-11-11T18:00:00.000Z',
  },
  {
    id: 'pub-init-4',
    slug: 'playwright-docs-testing-e2e',
    title: 'Playwright Docs — Automatización y Auditoría Visual E2E Moderna',
    summary:
      'Documentación oficial e interactiva de Playwright para pruebas End-to-End multi-navegador, capturas de pantalla en múltiples viewports (1440px, 768px, 375px), trazas de red e inspección automática para agentes de IA.',
    criolloTakeaway:
      'Es el inspector de obra robotizado que entra a tu aplicación con celular, tablet y monitor gigante, toca todos los botones, saca fotos de cada rincón y te avisa si algo quedó torcido antes de que lo vea el cliente.',
    technicalNotes: `### Comandos Esenciales en el Equipo\n- \`npx playwright test\` para correr toda la suite de validación.\n- \`npx playwright codegen http://localhost:5173\` para grabar interacciones automáticamente.\n- Uso de locators semánticos (\`getByRole\`, \`getByTestId\`) para evitar tests frágiles.`,
    url: 'https://playwright.dev/docs/intro',
    resourceType: 'link',
    sectionId: 'sec-links',
    emoji: '🎭',
    authorOrChannel: 'Microsoft / Playwright',
    keyPoints: [
      'Auto-waiting nativo: espera a que los elementos sean visibles e interactuables antes de hacer click.',
      'Trace Viewer completo con capturas DOM, consola y red paso a paso.',
      'Pilar fundamental de la Fase 2 y Fase 4 de nuestra metodología PEVC V5.',
    ],
    tutorialSteps: [
      'Instalar con npm init playwright@latest en el repositorio.',
      'Definir los viewports de prueba (Desktop 1440px y Mobile 375px).',
      'Ejecutar pruebas de humo y verificar cero errores en consola.',
    ],
    tags: ['Playwright', 'Testing E2E', 'QA Visual', 'Documentación', 'Frontend'],
    difficulty: 'intermedio',
    estimatedTime: '15 min de lectura',
    isPinned: false,
    isFavorite: false,
    createdByAi: false,
    createdAt: '2026-11-12T09:00:00.000Z',
  },
];

// ============================================================================
// HELPERS DE SINCRONIZACIÓN LOCAL + SUPABASE CLOUD
// ============================================================================

function readIdQueue(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeIdQueue(key: string, ids: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    /* ignore storage errors */
  }
}

function enqueueId(key: string, id: string): void {
  const curr = readIdQueue(key);
  if (!curr.includes(id)) {
    writeIdQueue(key, [...curr, id]);
  }
}

function dequeueId(key: string, id: string): void {
  const curr = readIdQueue(key);
  if (curr.includes(id)) {
    writeIdQueue(key, curr.filter((x) => x !== id));
  }
}

function ensureSystemSections(list: PublicationSection[]): PublicationSection[] {
  const existingIds = new Set(list.map((s) => s.id));
  const merged = [...list];
  for (const def of DEFAULT_PUBLICATION_SECTIONS) {
    if (def.isSystem && !existingIds.has(def.id)) {
      merged.push(def);
    }
  }
  return merged;
}

function mapRowToPublicationSection(row: any): PublicationSection {
  return {
    id: String(row.id),
    slug: String(row.slug || row.id),
    name: String(row.name || 'Apartado'),
    emoji: String(row.emoji || '📁'),
    description: String(row.description || ''),
    tone: (row.tone as SectionTone) || 'orange',
    isSystem: Boolean(row.is_system),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

function mapPublicationSectionToRow(section: PublicationSection) {
  return {
    id: section.id,
    slug: section.slug,
    name: section.name,
    emoji: section.emoji,
    description: section.description,
    tone: section.tone,
    is_system: Boolean(section.isSystem),
    created_at: section.createdAt,
    updated_at: new Date().toISOString(),
  };
}

function mapRowToPublication(row: any): PublicationItem {
  return {
    id: String(row.id),
    slug: String(row.slug || row.id),
    title: String(row.title || 'Publicación'),
    summary: String(row.summary || ''),
    criolloTakeaway: String(row.criollo_takeaway || ''),
    technicalNotes: String(row.technical_notes || ''),
    url: String(row.url || ''),
    resourceType: (row.resource_type as PublicationResourceType) || 'link',
    sectionId: String(row.section_id || 'sec-links'),
    emoji: String(row.emoji || '📌'),
    authorOrChannel: String(row.author_or_channel || 'Equipo BoxTools'),
    thumbnailUrl: row.thumbnail_url || undefined,
    videoEmbedUrl: row.video_embed_url || undefined,
    githubStars: typeof row.github_stars === 'number' ? row.github_stars : undefined,
    githubLanguage: row.github_language || undefined,
    keyPoints: Array.isArray(row.key_points) ? row.key_points.map(String) : [],
    tutorialSteps: Array.isArray(row.tutorial_steps) ? row.tutorial_steps.map(String) : [],
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    difficulty: (row.difficulty as PublicationDifficulty) || 'intermedio',
    estimatedTime: String(row.estimated_time || '10 min'),
    isPinned: Boolean(row.is_pinned),
    isFavorite: Boolean(row.is_favorite),
    createdByAi: Boolean(row.created_by_ai),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

function mapPublicationToRow(item: PublicationItem) {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    criollo_takeaway: item.criolloTakeaway,
    technical_notes: item.technicalNotes,
    url: item.url,
    resource_type: item.resourceType,
    section_id: item.sectionId,
    emoji: item.emoji,
    author_or_channel: item.authorOrChannel,
    thumbnail_url: item.thumbnailUrl || null,
    video_embed_url: item.videoEmbedUrl || null,
    github_stars:
      typeof item.githubStars === 'number' && !isNaN(item.githubStars) ? item.githubStars : null,
    github_language: item.githubLanguage || null,
    key_points: [...item.keyPoints],
    tutorial_steps: [...item.tutorialSteps],
    tags: [...item.tags],
    difficulty: item.difficulty,
    estimated_time: item.estimatedTime,
    is_pinned: Boolean(item.isPinned),
    is_favorite: Boolean(item.isFavorite),
    created_by_ai: Boolean(item.createdByAi),
    created_at: item.createdAt,
    updated_at: new Date().toISOString(),
  };
}

async function upsertWithUniqueSlugRetry(
  table: 'publication_sections' | 'publications',
  row: Record<string, any>
): Promise<{ error: any }> {
  const firstAttempt = await (supabase as any).from(table).upsert(row, { onConflict: 'id' });
  if (!firstAttempt.error) return { error: null };

  // Si colisiona únicamente el slug UNIQUE, sufijar aleatoriamente y reintentar
  const msg = String(firstAttempt.error?.message || '').toLowerCase();
  if (firstAttempt.error?.code === '23505' && msg.includes('slug')) {
    const retryRow = { ...row, slug: `${row.slug}-${Math.floor(Math.random() * 9000 + 1000)}` };
    const secondAttempt = await (supabase as any)
      .from(table)
      .upsert(retryRow, { onConflict: 'id' });
    return { error: secondAttempt.error || null };
  }

  return { error: firstAttempt.error };
}

// ============================================================================
// GESTIÓN DE APARTADOS (SECCIONES PERSONALIZADAS)
// ============================================================================

export function getPublicationSections(): PublicationSection[] {
  try {
    const raw = localStorage.getItem(STORAGE_SECTIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SECTIONS_KEY, JSON.stringify(DEFAULT_PUBLICATION_SECTIONS));
      return DEFAULT_PUBLICATION_SECTIONS;
    }
    const parsed = JSON.parse(raw) as PublicationSection[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PUBLICATION_SECTIONS;
    return ensureSystemSections(parsed);
  } catch (err) {
    console.warn('Error leyendo apartados de publicaciones:', err);
    return DEFAULT_PUBLICATION_SECTIONS;
  }
}

export function savePublicationSection(section: PublicationSection): PublicationSection[] {
  const current = getPublicationSections();
  const exists = current.some((s) => s.id === section.id);
  const updated = exists
    ? current.map((s) => (s.id === section.id ? section : s))
    : [...current, section];
  try {
    localStorage.setItem(STORAGE_SECTIONS_KEY, JSON.stringify(updated));
    enqueueId(PENDING_SEC_UPSERTS_KEY, section.id);
    dequeueId(PENDING_SEC_DELETES_KEY, section.id);
  } catch (err) {
    console.error('Error guardando apartado en localStorage:', err);
  }
  return updated;
}

export async function persistPublicationSection(
  section: PublicationSection
): Promise<{ sections: PublicationSection[]; supabaseSuccess: boolean; error?: string }> {
  const sections = savePublicationSection(section);

  try {
    const { error } = await upsertWithUniqueSlugRetry(
      'publication_sections',
      mapPublicationSectionToRow(section)
    );
    if (error) {
      console.warn('Aviso al guardar apartado en Supabase:', error.message);
      return { sections, supabaseSuccess: false, error: error.message };
    }
    dequeueId(PENDING_SEC_UPSERTS_KEY, section.id);
    return { sections, supabaseSuccess: true };
  } catch (err: any) {
    console.error('Error sincronizando apartado con Supabase:', err);
    return { sections, supabaseSuccess: false, error: err?.message || 'Error de red' };
  }
}

export function deletePublicationSection(sectionId: string): PublicationSection[] {
  const current = getPublicationSections();
  const updated = current.filter((s) => s.id !== sectionId);
  try {
    localStorage.setItem(STORAGE_SECTIONS_KEY, JSON.stringify(updated));
    dequeueId(PENDING_SEC_UPSERTS_KEY, sectionId);
    enqueueId(PENDING_SEC_DELETES_KEY, sectionId);
  } catch (err) {
    console.error('Error eliminando apartado de localStorage:', err);
  }
  return updated;
}

export async function removePublicationSection(sectionId: string): Promise<{
  sections: PublicationSection[];
  publications: PublicationItem[];
  supabaseSuccess: boolean;
  error?: string;
}> {
  const sections = deletePublicationSection(sectionId);

  // Reasignar localmente las publicaciones de este apartado hacia sec-links para no perderlas
  const currentPubs = getPublications();
  let pubsChanged = false;
  const updatedPubs = currentPubs.map((p) => {
    if (p.sectionId === sectionId) {
      pubsChanged = true;
      return { ...p, sectionId: 'sec-links' };
    }
    return p;
  });
  if (pubsChanged) {
    try {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(updatedPubs));
    } catch {
      /* ignore */
    }
  }

  try {
    await (supabase as any)
      .from('publications')
      .update({ section_id: 'sec-links', updated_at: new Date().toISOString() })
      .eq('section_id', sectionId);

    const { error } = await (supabase as any)
      .from('publication_sections')
      .delete()
      .eq('id', sectionId);

    if (error) {
      return { sections, publications: updatedPubs, supabaseSuccess: false, error: error.message };
    }
    dequeueId(PENDING_SEC_DELETES_KEY, sectionId);
    return { sections, publications: updatedPubs, supabaseSuccess: true };
  } catch (err: any) {
    return {
      sections,
      publications: updatedPubs,
      supabaseSuccess: false,
      error: err?.message || 'Error de red',
    };
  }
}

// ============================================================================
// GESTIÓN DE PUBLICACIONES (POSTS / RECURSOS)
// ============================================================================

export function getPublications(): PublicationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(INITIAL_PUBLICATIONS));
      return INITIAL_PUBLICATIONS;
    }
    const parsed = JSON.parse(raw) as PublicationItem[];
    if (!Array.isArray(parsed)) return INITIAL_PUBLICATIONS;
    return parsed;
  } catch (err) {
    console.warn('Error leyendo publicaciones:', err);
    return INITIAL_PUBLICATIONS;
  }
}

export function savePublication(item: PublicationItem): PublicationItem[] {
  const current = getPublications();
  const exists = current.some((p) => p.id === item.id);
  const updated = exists
    ? current.map((p) => (p.id === item.id ? item : p))
    : [item, ...current];
  try {
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(updated));
    enqueueId(PENDING_PUB_UPSERTS_KEY, item.id);
    dequeueId(PENDING_PUB_DELETES_KEY, item.id);
  } catch (err) {
    console.error('Error guardando publicación en localStorage:', err);
  }
  return updated;
}

export async function persistPublication(
  item: PublicationItem,
  availableSections?: PublicationSection[]
): Promise<{ publications: PublicationItem[]; supabaseSuccess: boolean; error?: string }> {
  const publications = savePublication(item);

  try {
    // Asegurar que un apartado custom recién creado exista también en Supabase
    const secSource = availableSections || getPublicationSections();
    const targetSec = secSource.find((s) => s.id === item.sectionId);
    if (targetSec) {
      await upsertWithUniqueSlugRetry(
        'publication_sections',
        mapPublicationSectionToRow(targetSec)
      );
      dequeueId(PENDING_SEC_UPSERTS_KEY, targetSec.id);
    }

    const { error } = await upsertWithUniqueSlugRetry('publications', mapPublicationToRow(item));
    if (error) {
      console.warn('Aviso al guardar publicación en Supabase:', error.message);
      return { publications, supabaseSuccess: false, error: error.message };
    }
    dequeueId(PENDING_PUB_UPSERTS_KEY, item.id);
    return { publications, supabaseSuccess: true };
  } catch (err: any) {
    console.error('Error sincronizando publicación con Supabase:', err);
    return { publications, supabaseSuccess: false, error: err?.message || 'Error de red' };
  }
}

export function deletePublication(id: string): PublicationItem[] {
  const current = getPublications();
  const updated = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(updated));
    dequeueId(PENDING_PUB_UPSERTS_KEY, id);
    enqueueId(PENDING_PUB_DELETES_KEY, id);
  } catch (err) {
    console.error('Error eliminando publicación de localStorage:', err);
  }
  return updated;
}

export async function removePublication(
  id: string
): Promise<{ publications: PublicationItem[]; supabaseSuccess: boolean; error?: string }> {
  const publications = deletePublication(id);

  try {
    const { error } = await (supabase as any).from('publications').delete().eq('id', id);
    if (error) {
      return { publications, supabaseSuccess: false, error: error.message };
    }
    dequeueId(PENDING_PUB_DELETES_KEY, id);
    return { publications, supabaseSuccess: true };
  } catch (err: any) {
    return { publications, supabaseSuccess: false, error: err?.message || 'Error de red' };
  }
}

async function flushDeleteQueue(
  queueKey: string,
  table: 'publication_sections' | 'publications'
): Promise<Set<string>> {
  const remaining = new Set(readIdQueue(queueKey));
  for (const id of Array.from(remaining)) {
    const { error } = await (supabase as any).from(table).delete().eq('id', id);
    if (!error) {
      dequeueId(queueKey, id);
      remaining.delete(id);
    }
  }
  return remaining;
}

async function flushUpsertQueue<T extends { id: string }>(
  queueKey: string,
  table: 'publication_sections' | 'publications',
  localMap: Map<string, T>,
  pendingDeletes: Set<string>,
  mapper: (item: T) => Record<string, any>
): Promise<string[]> {
  const queuedIds = readIdQueue(queueKey);
  for (const id of queuedIds) {
    if (pendingDeletes.has(id)) continue;
    const localItem = localMap.get(id);
    if (!localItem) {
      dequeueId(queueKey, id);
      continue;
    }
    const { error } = await upsertWithUniqueSlugRetry(table, mapper(localItem));
    if (!error) {
      dequeueId(queueKey, id);
    }
  }
  return queuedIds;
}

function mergeCloudAndPending<T extends { id: string }>(
  cloudRows: T[],
  pendingUpsertIds: string[],
  localMap: Map<string, T>,
  pendingDeletes: Set<string>
): T[] {
  const map = new Map<string, T>();
  for (const row of cloudRows) {
    if (!pendingDeletes.has(row.id)) map.set(row.id, row);
  }
  for (const id of pendingUpsertIds) {
    const localItem = localMap.get(id);
    if (localItem && !pendingDeletes.has(id)) map.set(localItem.id, localItem);
  }
  return Array.from(map.values());
}

export async function fetchPublicationsDataFromCloud(): Promise<{
  sections: PublicationSection[];
  publications: PublicationItem[];
  cloudSynced: boolean;
  error?: string;
}> {
  const localSections = getPublicationSections();
  const localPublications = getPublications();

  try {
    const [secRes, pubRes] = await Promise.all([
      (supabase as any)
        .from('publication_sections')
        .select('*')
        .order('created_at', { ascending: true }),
      (supabase as any).from('publications').select('*').order('created_at', { ascending: false }),
    ]);

    if (secRes.error || pubRes.error) {
      const errMsg = secRes.error?.message || pubRes.error?.message || 'Error leyendo Supabase';
      return {
        sections: localSections,
        publications: localPublications,
        cloudSynced: false,
        error: errMsg,
      };
    }

    const cloudSectionsRaw: PublicationSection[] = (secRes.data || []).map(
      mapRowToPublicationSection
    );
    const cloudPubsRaw: PublicationItem[] = (pubRes.data || []).map(mapRowToPublication);

    // Migración única de elementos creados en LocalStorage antes de la integración con Supabase
    if (localStorage.getItem(MIGRATED_CLOUD_KEY) !== 'true') {
      const cloudSecIds = new Set(cloudSectionsRaw.map((s) => s.id));
      const cloudPubIds = new Set(cloudPubsRaw.map((p) => p.id));

      for (const s of localSections) {
        if (!cloudSecIds.has(s.id)) enqueueId(PENDING_SEC_UPSERTS_KEY, s.id);
      }
      for (const p of localPublications) {
        if (!cloudPubIds.has(p.id) && !p.id.startsWith('pub-init-')) {
          enqueueId(PENDING_PUB_UPSERTS_KEY, p.id);
        }
      }
      try {
        localStorage.setItem(MIGRATED_CLOUD_KEY, 'true');
      } catch {
        /* ignore */
      }
    }

    const pendingSecDeletes = await flushDeleteQueue(PENDING_SEC_DELETES_KEY, 'publication_sections');
    const pendingPubDeletes = await flushDeleteQueue(PENDING_PUB_DELETES_KEY, 'publications');

    const localSecMap = new Map(localSections.map((s) => [s.id, s]));
    const pendingSecUpserts = await flushUpsertQueue(
      PENDING_SEC_UPSERTS_KEY,
      'publication_sections',
      localSecMap,
      pendingSecDeletes,
      mapPublicationSectionToRow
    );

    const localPubMap = new Map(localPublications.map((p) => [p.id, p]));
    const pendingPubUpserts = await flushUpsertQueue(
      PENDING_PUB_UPSERTS_KEY,
      'publications',
      localPubMap,
      pendingPubDeletes,
      mapPublicationToRow
    );

    const mergedSections = mergeCloudAndPending(
      cloudSectionsRaw,
      pendingSecUpserts,
      localSecMap,
      pendingSecDeletes
    );
    const finalSections = ensureSystemSections(
      mergedSections.length > 0 ? mergedSections : DEFAULT_PUBLICATION_SECTIONS
    );

    const finalPublications = mergeCloudAndPending(
      cloudPubsRaw,
      pendingPubUpserts,
      localPubMap,
      pendingPubDeletes
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    try {
      localStorage.setItem(STORAGE_SECTIONS_KEY, JSON.stringify(finalSections));
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(finalPublications));
    } catch {
      /* ignore */
    }

    return {
      sections: finalSections,
      publications: finalPublications,
      cloudSynced: true,
    };
  } catch (err: any) {
    console.warn('Error de red al sincronizar publicaciones con Supabase:', err);
    return {
      sections: localSections,
      publications: localPublications,
      cloudSynced: false,
      error: err?.message || 'Error de conexión',
    };
  }
}

// ============================================================================
// DETECCIÓN INTELIGENTE DE LINKS + EXTRACCIÓN DE METADATOS + GENERACIÓN IA
// ============================================================================

export interface ExtractedLinkMetadata {
  readonly url: string;
  readonly detectedType: PublicationResourceType;
  readonly suggestedSectionId: string;
  readonly title: string;
  readonly description: string;
  readonly authorOrChannel: string;
  readonly thumbnailUrl?: string;
  readonly videoEmbedUrl?: string;
  readonly githubStars?: number;
  readonly githubLanguage?: string;
  readonly githubTopics: string[];
  readonly rawContent: string;
  readonly sourceLabel: string;
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/i,
  ];
  for (const reg of patterns) {
    const m = url.match(reg);
    if (m && m[1]) return m[1];
  }
  return null;
}

export function extractLoomId(url: string): string | null {
  const m = url.match(/loom\.com\/(?:share|embed)\/([a-f0-9]{32})/i);
  return m ? m[1] : null;
}

function parseGithubRepo(url: string): { owner: string; repo: string; path?: string; branch?: string } | null {
  const m = url.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)(?:\/(?:tree|blob)\/([^/\s]+)\/?(.*))?/i);
  if (!m) return null;
  return {
    owner: m[1],
    repo: m[2].replace(/\.git$/, ''),
    branch: m[3],
    path: m[4] || undefined,
  };
}

async function safeFetchText(url: string, headers: Record<string, string> = {}): Promise<string | null> {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function inspectLinkMetadata(rawUrl: string): Promise<ExtractedLinkMetadata> {
  const url = rawUrl.trim();
  const ytId = extractYoutubeId(url);
  const loomId = extractLoomId(url);
  const gh = parseGithubRepo(url);

  // 1. CASO VIDEO (YouTube o Loom)
  if (ytId) {
    let videoTitle = `Video de YouTube (${ytId})`;
    let authorName = 'Canal de YouTube';
    const thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    const videoEmbedUrl = `https://www.youtube.com/embed/${ytId}`;

    // Obtener título y autor real vía noembed (CORS habilitado y sin API key)
    const oembedRaw = await safeFetchText(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    if (oembedRaw) {
      try {
        const oembed = JSON.parse(oembedRaw);
        if (oembed.title) videoTitle = oembed.title;
        if (oembed.author_name) authorName = oembed.author_name;
      } catch {
        /* ignore */
      }
    }

    // Intentar leer contexto adicional con Jina Reader
    const readerText = await safeFetchText(`https://r.jina.ai/${url}`);
    const cleanedContent = [
      `TIPO: Video de YouTube`,
      `TÍTULO DEL VIDEO: ${videoTitle}`,
      `CANAL / AUTOR: ${authorName}`,
      `URL: ${url}`,
      readerText ? `CONTENIDO EXTRAÍDO DE LA PÁGINA:\n${readerText.slice(0, 10000)}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    return {
      url,
      detectedType: 'video',
      suggestedSectionId: 'sec-videos',
      title: videoTitle,
      description: `Video técnico publicado por ${authorName}.`,
      authorOrChannel: authorName,
      thumbnailUrl,
      videoEmbedUrl,
      githubTopics: ['YouTube', 'Video', authorName],
      rawContent: cleanedContent,
      sourceLabel: `YouTube: ${videoTitle}`,
    };
  }

  if (loomId) {
    const videoEmbedUrl = `https://www.loom.com/embed/${loomId}`;
    const readerText = await safeFetchText(`https://r.jina.ai/${url}`);
    return {
      url,
      detectedType: 'video',
      suggestedSectionId: 'sec-videos',
      title: 'Grabación / Demo en Loom',
      description: 'Video demostrativo grabado en Loom.',
      authorOrChannel: 'Loom Video',
      videoEmbedUrl,
      githubTopics: ['Loom', 'Video', 'Demo'],
      rawContent: readerText ? readerText.slice(0, 10000) : `Video Loom: ${url}`,
      sourceLabel: `Loom Video (${loomId.slice(0, 8)})`,
    };
  }

  // 2. CASO REPOSITORIO GITHUB
  if (gh) {
    const parts: string[] = [];
    let repoTitle = `${gh.owner}/${gh.repo}`;
    let repoDesc = '';
    let stars: number | undefined = undefined;
    let language: string | undefined = undefined;
    let topics: string[] = [];
    const thumbnailUrl = `https://opengraph.githubassets.com/1/${gh.owner}/${gh.repo}`;

    const metaRaw = await safeFetchText(`https://api.github.com/repos/${gh.owner}/${gh.repo}`);
    if (metaRaw) {
      try {
        const meta = JSON.parse(metaRaw);
        repoTitle = meta.name
          ? `${meta.name.charAt(0).toUpperCase() + meta.name.slice(1)} (${meta.full_name})`
          : meta.full_name;
        repoDesc = meta.description || '';
        stars = typeof meta.stargazers_count === 'number' ? meta.stargazers_count : undefined;
        language = meta.language || undefined;
        topics = Array.isArray(meta.topics) ? meta.topics : [];

        parts.push(
          [
            `REPOSITORIO GITHUB: ${meta.full_name}`,
            `DESCRIPCIÓN OFICIAL: ${repoDesc || '(sin descripción)'}`,
            `LENGUAJE PRINCIPAL: ${language || 'Multi-lenguaje'}`,
            `ESTRELLAS: ${stars ?? 'N/D'}`,
            `TOPICS: ${topics.join(', ') || 'N/D'}`,
            `HOMEPAGE: ${meta.homepage || 'N/D'}`,
          ].join('\n')
        );
      } catch {
        /* ignore */
      }
    }

    let readme: string | null = null;
    if (gh.path && gh.branch) {
      readme = await safeFetchText(
        `https://raw.githubusercontent.com/${gh.owner}/${gh.repo}/${gh.branch}/${gh.path}`
      );
      if (!readme) {
        readme = await safeFetchText(
          `https://raw.githubusercontent.com/${gh.owner}/${gh.repo}/${gh.branch}/${gh.path.replace(/\/$/, '')}/README.md`
        );
      }
    }
    if (!readme) {
      readme = await safeFetchText(`https://api.github.com/repos/${gh.owner}/${gh.repo}/readme`, {
        Accept: 'application/vnd.github.raw',
      });
    }

    if (readme) {
      const cleanedReadme = readme
        .replace(/<img[^>]*>/gi, '')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .slice(0, 12000);
      parts.push(`CONTENIDO DEL README:\n${cleanedReadme}`);
    }

    return {
      url,
      detectedType: 'github',
      suggestedSectionId: 'sec-github',
      title: repoTitle,
      description: repoDesc || `Repositorio de código abierto ${gh.owner}/${gh.repo} en GitHub.`,
      authorOrChannel: gh.owner,
      thumbnailUrl,
      githubStars: stars,
      githubLanguage: language,
      githubTopics: topics.length > 0 ? topics.slice(0, 6) : ['GitHub', language || 'Open Source'].filter(Boolean),
      rawContent: parts.join('\n\n') || `GitHub Repo: ${url}`,
      sourceLabel: `GitHub ${gh.owner}/${gh.repo}`,
    };
  }

  // 3. CASO WEB GENERAL / TUTORIAL / ARTÍCULO / DOCS
  let hostname = 'Recurso Web';
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    /* ignore */
  }

  const isTutorialUrl = /tutorial|guide|guia|docs|learn|course|how-to|blog/i.test(url);
  const detectedType: PublicationResourceType = isTutorialUrl ? 'tutorial' : 'link';
  const suggestedSectionId = isTutorialUrl ? 'sec-tutoriales' : 'sec-links';

  const readerText = await safeFetchText(`https://r.jina.ai/${url}`);
  let extractedTitle = `Recurso en ${hostname}`;
  let extractedDesc = `Recurso técnico extraído de ${hostname}.`;

  if (readerText) {
    const titleLine = readerText.match(/^Title:\s*(.+)$/m) || readerText.match(/^#\s+(.+)$/m);
    if (titleLine && titleLine[1]) {
      extractedTitle = titleLine[1].trim();
    }
    const paragraphs = readerText
      .split('\n')
      .map((l) => l.trim())
      .filter(
        (l) =>
          l.length > 60 &&
          !l.startsWith('Title:') &&
          !l.startsWith('URL Source:') &&
          !l.startsWith('Markdown Content:') &&
          !l.startsWith('#') &&
          !l.startsWith('![') &&
          !l.startsWith('[')
      );
    if (paragraphs[0]) {
      extractedDesc = paragraphs[0].slice(0, 320);
    }
  }

  return {
    url,
    detectedType,
    suggestedSectionId,
    title: extractedTitle,
    description: extractedDesc,
    authorOrChannel: hostname,
    githubTopics: [hostname, isTutorialUrl ? 'Tutorial' : 'Recurso Web'],
    rawContent: readerText ? readerText.slice(0, 12000) : `URL: ${url}`,
    sourceLabel: `Web (${hostname})`,
  };
}

// ============================================================================
// GENERACIÓN CON IA (O SÍNTESIS INTELIGENTE DESDE METADATOS REALES)
// ============================================================================

const PUBLICATION_AI_SYSTEM_PROMPT = `Eres el Editor Técnico Principal del Hub de Publicaciones y Recursos de BoxTools (plataforma de ingeniería y IA de un equipo de desarrollo argentino).
Tu tarea es recibir la información extraída de un link (puede ser un repositorio de GitHub, un video de YouTube, un tutorial, un artículo o una herramienta web) junto con las notas opcionales del usuario, y generar una PUBLICACIÓN COMPLETA, RICA, DIDÁCTICA y ACCIONABLE.

REGLAS DE CALIDAD:
1. "title": Título claro, atractivo y descriptivo de la publicación (sin clickbait vacío, explicando qué es).
2. "resourceType": Uno de "github" | "video" | "tutorial" | "link" | "articulo" | "herramienta".
3. "emoji": Un emoji muy representativo del recurso.
4. "summary": Resumen ejecutivo completo y rico de 3 a 4 oraciones (280 a 500 caracteres) explicando qué contiene este recurso, qué problema resuelve y por qué vale la pena guardarlo o estudiarlo.
5. "criolloTakeaway": Explicación bien "En Criollo" (estilo argentino claro, cercano y con analogía de taller/obra/cocina/vida real, de 2 a 4 oraciones) contando para qué sirve en la práctica y qué te ahorra.
6. "technicalNotes": Notas técnicas estructuradas en Markdown (usando subtítulos ###, listas y bloques de código o comandos si corresponden al recurso).
7. "keyPoints": Array de 4 puntos clave o aprendizajes principales (oraciones completas y útiles).
8. "tutorialSteps": Array de 3 a 5 pasos concretos para aplicar, instalar, probar o aprovechar este recurso.
9. "tags": Array de 4 a 6 etiquetas cortas relevantes (ej: ["MCP", "TypeScript", "Agentes IA", "GitHub"]).
10. "difficulty": "inicial" | "intermedio" | "avanzado".
11. "estimatedTime": Tiempo estimado de lectura, video o práctica (ej: "8 min de lectura", "15 min práctico", "Video 25 min").
12. Responde ÚNICAMENTE con un objeto JSON válido sin bloques markdown alrededor.`;

async function callAiForPublication(
  config: AiSettingsConfig,
  meta: ExtractedLinkMetadata,
  userNotes: string,
  sections: PublicationSection[]
): Promise<any> {
  const apiKey = config.apiKey.trim();
  const sectionOptions = sections.map((s) => `${s.id} (${s.name}: ${s.description})`).join('\n- ');

  const userPrompt = `RECURSO A PUBLICAR:
URL: ${meta.url}
TIPO DETECTADO: ${meta.detectedType}
TÍTULO DETECTADO: ${meta.title}
AUTOR / CANAL / FUENTE: ${meta.authorOrChannel}
${meta.githubStars !== undefined ? `ESTRELLAS GITHUB: ${meta.githubStars}` : ''}
${meta.githubLanguage ? `LENGUAJE: ${meta.githubLanguage}` : ''}
${userNotes.trim() ? `\nINDICACIONES O NOTAS DEL USUARIO:\n${userNotes.trim()}\n` : ''}

APARTADOS DISPONIBLES EN LA PLATAFORMA (elige el ID más adecuado en "suggestedSectionId"):
- ${sectionOptions}

=== CONTENIDO EXTRAÍDO DEL LINK ===
${meta.rawContent}
=== FIN DEL CONTENIDO ===

Devuelve exactamente este JSON:
{
  "title": "string",
  "resourceType": "github | video | tutorial | link | articulo | herramienta",
  "suggestedSectionId": "ID de uno de los apartados disponibles",
  "emoji": "emoji",
  "authorOrChannel": "string",
  "summary": "string (resumen rico de 3 a 4 oraciones)",
  "criolloTakeaway": "string (analogía y conclusión en criollo argentino de 2 a 4 oraciones)",
  "technicalNotes": "string en Markdown con ### subtítulos, detalles técnicos y comandos si aplica",
  "keyPoints": ["Punto clave 1", "Punto clave 2", "Punto clave 3", "Punto clave 4"],
  "tutorialSteps": ["Paso 1", "Paso 2", "Paso 3", "Paso 4"],
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "difficulty": "inicial | intermedio | avanzado",
  "estimatedTime": "ej: 10 min de lectura"
}`;

  if (config.provider === 'gemini') {
    const model = config.modelText || 'gemini-2.0-flash';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: PUBLICATION_AI_SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.4, responseMimeType: 'application/json', maxOutputTokens: 6000 },
        }),
      }
    );
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${data?.error?.message || res.statusText}`);
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
    return parseJsonSafe(text);
  }

  if (config.provider === 'openrouter') {
    const model = config.modelText.includes('/') ? config.modelText : 'google/gemini-2.0-flash-001';
    const send = async (withJson: boolean) => {
      const body: any = {
        model,
        messages: [
          { role: 'system', content: PUBLICATION_AI_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 6000,
      };
      if (withJson) body.response_format = { type: 'json_object' };
      return fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://baultools.netlify.app',
          'X-Title': 'BoxTools Vault',
        },
        body: JSON.stringify(body),
      });
    };
    let res = await send(true);
    if (res.status === 400 || res.status === 422) res = await send(false);
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.error) throw new Error(`OpenRouter: ${data?.error?.message || res.statusText}`);
    return parseJsonSafe(data?.choices?.[0]?.message?.content || '');
  }

  // OpenAI
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.modelText || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: PUBLICATION_AI_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`OpenAI: ${data?.error?.message || res.statusText}`);
  return parseJsonSafe(data?.choices?.[0]?.message?.content || '');
}

function parseJsonSafe(raw: string): any {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    throw new Error('La respuesta de IA no contenía un JSON válido');
  }
  return JSON.parse(cleaned.slice(first, last + 1));
}

function buildSmartFallbackFromMetadata(
  meta: ExtractedLinkMetadata,
  userNotes: string,
  preferredSectionId?: string
): Omit<PublicationItem, 'id' | 'slug' | 'createdAt' | 'isPinned' | 'isFavorite'> {
  const sectionId = preferredSectionId || meta.suggestedSectionId || 'sec-links';

  // Extraer subtítulos reales del contenido si existen
  const headings = Array.from(meta.rawContent.matchAll(/^#{1,3}\s+(.+)$/gm))
    .map((m) => m[1].replace(/[#*`]/g, '').trim())
    .filter((h) => h.length > 3 && h.length < 90)
    .slice(0, 4);

  const emojiMap: Record<PublicationResourceType, string> = {
    github: '🐙',
    video: '🎬',
    tutorial: '🎓',
    link: '🔗',
    articulo: '📰',
    herramienta: '🛠️',
  };

  const summary =
    userNotes.trim() ||
    (meta.description && meta.description.length > 40
      ? `${meta.description} Recurso indexado desde ${meta.authorOrChannel} listo para consultar y aplicar en los proyectos del equipo.`
      : `Publicación técnica sobre "${meta.title}" (${meta.sourceLabel}). Incluye acceso directo al recurso original, puntos clave extraídos y guía rápida de aplicación práctica.`);

  const criolloTakeaway =
    meta.detectedType === 'github'
      ? `Es como tener los planos y las piezas de "${meta.title}" abiertas sobre el banco de trabajo: en vez de arrancar desde cero, podés clonar el repositorio de ${meta.authorOrChannel}, revisar cómo resolvieron la arquitectura y sumarlo directo a tu flujo.`
      : meta.detectedType === 'video'
      ? `Ideal para ver en pantalla completa o mientras configurás el entorno: ${meta.authorOrChannel} explica de forma visual cómo encarar "${meta.title}" ahorrándote horas de prueba y error.`
      : `Tener este recurso a mano en el baúl es como guardar el manual exacto de la máquina en la guantera: cuando necesites aplicar "${meta.title}", entrás directo a los puntos clave sin perder tiempo buscando en mil pestañas.`;

  const keyPoints =
    headings.length >= 2
      ? headings.map((h) => `Sección destacada del recurso: ${h}`)
      : [
          `Fuente original verificada: ${meta.sourceLabel} (${meta.authorOrChannel}).`,
          meta.githubLanguage
            ? `Desarrollado principalmente en ${meta.githubLanguage}${meta.githubStars ? ` con ${meta.githubStars.toLocaleString()} estrellas en GitHub` : ''}.`
            : `Recurso clasificado como ${meta.detectedType.toUpperCase()} listo para consulta del equipo.`,
          `Permite acelerar la implementación y estandarizar buenas prácticas en el proyecto.`,
          `Disponible tanto en vista Criolla (conceptual) como en vista Técnica (implementación).`,
        ];

  const tutorialSteps =
    meta.detectedType === 'github'
      ? [
          `Abrir el repositorio oficial en ${meta.url} y revisar los requisitos del README.`,
          `Clonar o instalar el paquete según el gestor del proyecto (npm, pnpm, uv o git clone).`,
          `Probar la configuración inicial en una rama aislada y validar con el agente.`,
        ]
      : meta.detectedType === 'video'
      ? [
          `Reproducir el video embebido directamente desde esta tarjeta o abrirlo en YouTube.`,
          `Tomar nota de los comandos, patrones o ejemplos mostrados por ${meta.authorOrChannel}.`,
          `Aplicar el flujo aprendido en tu repositorio local.`,
        ]
      : [
          `Acceder al enlace original (${meta.url}) para revisar la documentación completa.`,
          `Identificar los bloques de código o configuraciones aplicables a tu tarea actual.`,
          `Compartir o fijar esta publicación en el apartado correspondiente del equipo.`,
        ];

  const technicalNotes = [
    `### 📌 Ficha Técnica de la Fuente`,
    `- **Origen:** [${meta.sourceLabel}](${meta.url})`,
    `- **Autor / Canal:** ${meta.authorOrChannel}`,
    meta.githubLanguage ? `- **Lenguaje Principal:** \`${meta.githubLanguage}\`` : '',
    meta.githubStars !== undefined ? `- **Estrellas en GitHub:** ⭐ ${meta.githubStars.toLocaleString()}` : '',
    userNotes.trim() ? `\n### 📝 Notas del Autor\n${userNotes.trim()}` : '',
    headings.length > 0
      ? `\n### 📑 Tópicos Detectados en el Recurso\n${headings.map((h) => `- ${h}`).join('\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    title: meta.title,
    summary,
    criolloTakeaway,
    technicalNotes,
    url: meta.url,
    resourceType: meta.detectedType,
    sectionId,
    emoji: emojiMap[meta.detectedType] || '📌',
    authorOrChannel: meta.authorOrChannel,
    thumbnailUrl: meta.thumbnailUrl,
    videoEmbedUrl: meta.videoEmbedUrl,
    githubStars: meta.githubStars,
    githubLanguage: meta.githubLanguage,
    keyPoints,
    tutorialSteps,
    tags: meta.githubTopics.length > 0 ? meta.githubTopics : ['Recurso', meta.detectedType],
    difficulty: 'intermedio',
    estimatedTime: meta.detectedType === 'video' ? 'Video / Clase' : '10 min lectura',
    createdByAi: false,
  };
}

export interface GeneratePublicationFromLinkResult {
  readonly ok: boolean;
  readonly usedRealAi: boolean;
  readonly metadata: ExtractedLinkMetadata;
  readonly draft: Omit<PublicationItem, 'id' | 'slug' | 'createdAt' | 'isPinned' | 'isFavorite'>;
  readonly warning?: string;
}

export async function analyzeLinkAndGeneratePublication(params: {
  url: string;
  userNotes?: string;
  preferredSectionId?: string;
  sections: PublicationSection[];
}): Promise<GeneratePublicationFromLinkResult> {
  const metadata = await inspectLinkMetadata(params.url);
  const config = getAiConfig();
  const userNotes = params.userNotes || '';

  if (config.apiKey.trim()) {
    try {
      const aiData = await callAiForPublication(config, metadata, userNotes, params.sections);
      const validTypes: PublicationResourceType[] = [
        'github',
        'video',
        'tutorial',
        'link',
        'articulo',
        'herramienta',
      ];
      const resourceType: PublicationResourceType = validTypes.includes(aiData.resourceType)
        ? aiData.resourceType
        : metadata.detectedType;

      const validDifficulties: PublicationDifficulty[] = ['inicial', 'intermedio', 'avanzado'];
      const difficulty: PublicationDifficulty = validDifficulties.includes(aiData.difficulty)
        ? aiData.difficulty
        : 'intermedio';

      const sectionExists = params.sections.some((s) => s.id === aiData.suggestedSectionId);
      const sectionId =
        params.preferredSectionId ||
        (sectionExists ? aiData.suggestedSectionId : metadata.suggestedSectionId) ||
        params.sections[0]?.id ||
        'sec-links';

      const draft: Omit<PublicationItem, 'id' | 'slug' | 'createdAt' | 'isPinned' | 'isFavorite'> = {
        title: String(aiData.title || metadata.title).trim(),
        summary: String(aiData.summary || metadata.description).trim(),
        criolloTakeaway: String(aiData.criolloTakeaway || '').trim(),
        technicalNotes: String(aiData.technicalNotes || '').replace(/\\n/g, '\n').trim(),
        url: metadata.url,
        resourceType,
        sectionId,
        emoji: String(aiData.emoji || (resourceType === 'github' ? '🐙' : resourceType === 'video' ? '🎬' : '📌')),
        authorOrChannel: String(aiData.authorOrChannel || metadata.authorOrChannel).trim(),
        thumbnailUrl: metadata.thumbnailUrl,
        videoEmbedUrl: metadata.videoEmbedUrl,
        githubStars: metadata.githubStars,
        githubLanguage: metadata.githubLanguage,
        keyPoints: Array.isArray(aiData.keyPoints)
          ? aiData.keyPoints.map((x: any) => String(x).trim()).filter(Boolean)
          : [],
        tutorialSteps: Array.isArray(aiData.tutorialSteps)
          ? aiData.tutorialSteps.map((x: any) => String(x).trim()).filter(Boolean)
          : [],
        tags: Array.isArray(aiData.tags)
          ? aiData.tags.map((x: any) => String(x).trim()).filter(Boolean).slice(0, 8)
          : metadata.githubTopics,
        difficulty,
        estimatedTime: String(aiData.estimatedTime || '10 min').trim(),
        createdByAi: true,
      };

      return {
        ok: true,
        usedRealAi: true,
        metadata,
        draft,
      };
    } catch (err: any) {
      const fallbackDraft = buildSmartFallbackFromMetadata(metadata, userNotes, params.preferredSectionId);
      return {
        ok: true,
        usedRealAi: false,
        metadata,
        draft: fallbackDraft,
        warning: `No se pudo conectar con la IA (${err?.message || 'error'}), pero extrajimos los metadatos reales del link automáticamente.`,
      };
    }
  }

  // Sin API Key configurada: usar extracción inteligente de metadatos reales del link (GitHub API, YouTube oEmbed, Jina Reader)
  const fallbackDraft = buildSmartFallbackFromMetadata(metadata, userNotes, params.preferredSectionId);
  return {
    ok: true,
    usedRealAi: false,
    metadata,
    draft: fallbackDraft,
  };
}
