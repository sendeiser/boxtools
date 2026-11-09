import { ToolItem, CategorySlug, PhaseSlug } from '../types/boxtools';
import { supabase } from './supabase';
import { INITIAL_TOOLS } from '../data/mockData';

const LOCAL_STORAGE_KEY = 'boxtools_custom_tools_v1';

export function getLocalTools(): ToolItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ToolItem[];
  } catch (err) {
    console.error('Error al leer de localStorage:', err);
    return [];
  }
}

export function saveLocalTool(tool: ToolItem): void {
  try {
    const current = getLocalTools();
    const filtered = current.filter((t) => t.slug !== tool.slug);
    const updated = [tool, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error al guardar en localStorage:', err);
  }
}

export function mapRowToTool(row: any): ToolItem {
  const withoutWith = row.criollo_without_with || { without: [], with: [] };
  const semaforo = row.criollo_semaforo || { green: [], red: [] };
  const installCmds = row.install_commands || {
    antigravity: `npx skills add ${row.repo_url || ''}`,
    opencode: `npx skills add ${row.repo_url || ''}`,
    cursor: `npx skills add ${row.repo_url || ''}`,
    claudeCode: `npx skills add ${row.repo_url || ''}`,
  };

  const phaseNum = row.phase_number ?? 2;
  const phase: Exclude<PhaseSlug, 'all'> =
    phaseNum === 0
      ? 'fase0'
      : phaseNum === 1
      ? 'fase1'
      : phaseNum === 3
      ? 'fase3'
      : phaseNum === 4
      ? 'fase4'
      : 'fase2';

  const isMcp = row.code_id?.startsWith('MCP');
  const isMd = row.code_id?.startsWith('MD');
  const category: Exclude<CategorySlug, 'all' | 'combo'> = isMcp
    ? 'mcp'
    : isMd
    ? 'markdown'
    : 'skill';

  return {
    id: row.id || `t-${row.slug}`,
    slug: row.slug,
    codeId: row.code_id || 'SKILL-099',
    title: row.title,
    tagline: row.tagline || '',
    emoji: row.emoji || '📦',
    category,
    categoryLabel: isMcp ? '🔌 SERVIDOR MCP' : isMd ? '📝 WORKFLOW MARKDOWN' : '⚡ SKILL AGÉNTICA',
    phase,
    phaseLabel: `FASE ${phaseNum} // VIBE CODING`,
    status: row.status === 'draft' ? 'draft' : 'published',
    isFeatured: Boolean(row.is_featured),
    criolloAnalogy: row.criollo_analogy || '',
    criolloWithout: withoutWith.without || [],
    criolloWith: withoutWith.with || [],
    semaforoGreen: semaforo.green || [],
    semaforoRed: semaforo.red || [],
    riskLevel: row.risk_level || 'low',
    mermaidCode: row.mermaid_diagram || `flowchart LR\n A[Inicio] --> B[Fin]`,
    svgConfig: row.svg_infographic_config || {
      title: row.title,
      badge: 'BOXTOOLS AI',
      steps: [
        { icon: '💡', label: 'Ingesta', sublabel: 'Inicio', tone: 'orange' },
        { icon: '⚙️', label: 'Proceso', sublabel: 'IA', tone: 'cyan' },
        { icon: '🚀', label: 'Listo', sublabel: 'Producción', tone: 'emerald' },
      ],
      summaryNote: row.tagline || '',
    },
    mediaGallery: [
      {
        id: `m-${row.slug}-1`,
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        caption: `Esquema de integración para ${row.title}`,
        isAiGenerated: false,
      },
    ],
    cliQuickCommand: row.repo_url ? `npx skills add ${row.repo_url}` : `npx skills add ${row.slug}`,
    installCommands: installCmds,
    mcpConfigJson: row.mcp_config_json || undefined,
    rawMarkdown: row.raw_markdown || `# ${row.title}`,
    repoUrl: row.repo_url || 'https://github.com/boxtools/vault',
    compatibilityTags: row.compatibility_tags || ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
  };
}

export function mapToolToRow(tool: ToolItem) {
  let phaseNum = 2;
  if (tool.phase === 'fase0') phaseNum = 0;
  else if (tool.phase === 'fase1') phaseNum = 1;
  else if (tool.phase === 'fase3') phaseNum = 3;
  else if (tool.phase === 'fase4') phaseNum = 4;

  return {
    slug: tool.slug,
    code_id: tool.codeId,
    title: tool.title,
    tagline: tool.tagline,
    emoji: tool.emoji,
    phase_number: phaseNum,
    status: tool.status as 'published' | 'draft',
    is_featured: tool.isFeatured,
    criollo_analogy: tool.criolloAnalogy,
    criollo_without_with: {
      without: tool.criolloWithout,
      with: tool.criolloWith,
    },
    criollo_semaforo: {
      green: tool.semaforoGreen,
      red: tool.semaforoRed,
    },
    risk_level: tool.riskLevel,
    mermaid_diagram: tool.mermaidCode,
    svg_infographic_config: tool.svgConfig as any,
    install_commands: tool.installCommands as any,
    mcp_config_json: tool.mcpConfigJson || null,
    raw_markdown: tool.rawMarkdown,
    repo_url: tool.repoUrl,
    compatibility_tags: [...tool.compatibilityTags],
  };
}

export async function fetchAllToolsMerged(): Promise<ToolItem[]> {
  const local = getLocalTools();

  try {
    const { data, error } = await supabase.from('tools').select('*');
    if (!error && data && data.length > 0) {
      const cloudTools = data.map(mapRowToTool);
      
      // Combinar: herramientas nube + locales + iniciales, deduplicadas por slug
      const slugMap = new Map<string, ToolItem>();
      
      // 1. Iniciales
      for (const t of INITIAL_TOOLS) {
        slugMap.set(t.slug, t);
      }
      // 2. Nube (tienen prioridad sobre iniciales si se actualizaron)
      for (const t of cloudTools) {
        slugMap.set(t.slug, t);
      }
      // 3. Locales (creadas recientemente)
      for (const t of local) {
        slugMap.set(t.slug, t);
      }

      return Array.from(slugMap.values());
    }
  } catch (err) {
    console.warn('No se pudo conectar con Supabase Cloud, usando almacenamiento local:', err);
  }

  // Fallback: Iniciales + locales
  const slugMap = new Map<string, ToolItem>();
  for (const t of INITIAL_TOOLS) {
    slugMap.set(t.slug, t);
  }
  for (const t of local) {
    slugMap.set(t.slug, t);
  }
  return Array.from(slugMap.values());
}

export async function persistNewTool(tool: ToolItem): Promise<{ supabaseSuccess: boolean; error?: string }> {
  // 1. Siempre guardar inmediatamente en LocalStorage (NUNCA desaparece al recargar)
  saveLocalTool(tool);

  // 2. Intentar guardar en Supabase Cloud
  try {
    const row = mapToolToRow(tool);
    const { error } = await supabase.from('tools').upsert(row as any, { onConflict: 'slug' });

    if (error) {
      console.warn('Aviso: Supabase RLS o error al insertar en la nube:', error.message);
      return { supabaseSuccess: false, error: error.message };
    }
    return { supabaseSuccess: true };
  } catch (err: any) {
    console.error('Error al conectar con Supabase:', err);
    return { supabaseSuccess: false, error: err?.message || 'Error de red' };
  }
}
