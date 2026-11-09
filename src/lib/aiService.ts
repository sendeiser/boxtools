import { AiSettingsConfig, ToolItem, CategorySlug, PhaseSlug, SvgFlowStep } from '../types/boxtools';
import { ToolVariationOption } from '../components/AddToolModal';
import { supabase } from './supabase';

const LOCAL_STORAGE_AI_KEY = 'boxtools_ai_config_v2';

export const DEFAULT_AI_CONFIG: AiSettingsConfig = {
  provider: 'gemini',
  apiKey: '',
  modelText: 'gemini-2.0-flash',
  modelImage: 'imagen-3.0-generate-002',
  enableSvgFallback: true,
};

export function getAiConfig(): AiSettingsConfig {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AI_KEY);
    if (!raw) return DEFAULT_AI_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_AI_CONFIG,
      ...parsed,
    };
  } catch (err) {
    console.warn('Error al leer configuración de IA desde localStorage:', err);
    return DEFAULT_AI_CONFIG;
  }
}

export function saveAiConfig(config: AiSettingsConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_AI_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error al guardar configuración de IA en localStorage:', err);
  }
}

export async function fetchAiConfigFromDatabase(): Promise<AiSettingsConfig> {
  try {
    const { data, error } = await (supabase as any)
      .from('ai_settings')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Tomar la fila activa o la más recientemente actualizada
      const activeRow = (data as any[]).find((r: any) => r.is_active) || (data as any[])[0];
      const key = activeRow.api_key || activeRow.api_key_encrypted || '';

      if (key) {
        const loadedConfig: AiSettingsConfig = {
          provider: (activeRow.provider as any) || 'gemini',
          apiKey: key,
          modelText: activeRow.model_text || 'gemini-2.0-flash',
          modelImage: activeRow.model_image || 'imagen-3.0-generate-002',
          enableSvgFallback: activeRow.enable_svg_fallback ?? true,
        };
        saveAiConfig(loadedConfig);
        return loadedConfig;
      }
    }
  } catch (err) {
    console.warn('No se pudo leer ai_settings de Supabase Cloud, usando local:', err);
  }

  return getAiConfig();
}

export async function saveAiConfigToDatabase(
  config: AiSettingsConfig
): Promise<{ success: boolean; supabaseSuccess: boolean; error?: string }> {
  // 1. Siempre guardar en localStorage inmediatamente (doble capa de seguridad)
  saveAiConfig(config);

  // 2. Persistir en la tabla ai_settings de Supabase Cloud
  try {
    if (!config.apiKey.trim()) {
      return { success: true, supabaseSuccess: false };
    }

    const payload: any = {
      provider: config.provider,
      model_text: config.modelText,
      api_key: config.apiKey,
      api_key_encrypted: config.apiKey,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await (supabase as any)
      .from('ai_settings')
      .upsert(payload, { onConflict: 'provider' });

    if (error) {
      console.warn('Aviso al guardar en Supabase ai_settings:', error.message);
      return { success: true, supabaseSuccess: false, error: error.message };
    }

    return { success: true, supabaseSuccess: true };
  } catch (err: any) {
    console.error('Error al sincronizar con Supabase ai_settings:', err);
    return { success: true, supabaseSuccess: false, error: err?.message };
  }
}

export async function testAiApiKey(
  provider: 'gemini' | 'openai' | 'openrouter',
  apiKey: string
): Promise<{ success: boolean; message: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, message: 'La API Key no puede estar vacía' };
  }

  try {
    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Responde únicamente con la palabra: OK' }] }],
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        return { success: false, message: `Error Gemini: ${errMsg}` };
      }

      return { success: true, message: '✓ Gemini API Key conectada y operativa' };
    }

    if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cleanKey}`,
        },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
        return { success: false, message: `Error OpenRouter: ${errMsg}` };
      }

      const data = await res.json();
      const limit = data?.data?.limit_remaining ?? 'Activo';
      return { success: true, message: `✓ OpenRouter Key válida (Límite: ${limit})` };
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${cleanKey}` },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
        return { success: false, message: `Error OpenAI: ${errMsg}` };
      }

      return { success: true, message: '✓ OpenAI API Key conectada y operativa' };
    }

    return { success: false, message: 'Proveedor no soportado' };
  } catch (err: any) {
    return { success: false, message: `Error de red al conectar: ${err?.message || err}` };
  }
}


// ==============================================================================
// 1. INGESTA REAL DEL CONTENIDO DEL LINK (la IA no puede navegar por sí sola)
// ==============================================================================

export interface SourceContext {
  readonly kind: 'github' | 'web' | 'file' | 'url-only';
  readonly label: string;
  readonly content: string;
  readonly repoUrl: string;
  readonly chars: number;
}

const MAX_CONTEXT_CHARS = 14000;

function parseGithubUrl(url: string): { owner: string; repo: string; path?: string; branch?: string } | null {
  const m = url.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)(?:\/(?:tree|blob)\/([^/\s]+)\/?(.*))?/i);
  if (!m) return null;
  return {
    owner: m[1],
    repo: m[2].replace(/\.git$/, ''),
    branch: m[3],
    path: m[4] || undefined,
  };
}

async function fetchText(url: string, headers: Record<string, string> = {}): Promise<string | null> {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function fetchSourceContext(params: {
  sourceType: 'link' | 'file';
  rawInput: string;
  fileName?: string;
}): Promise<SourceContext> {
  if (params.sourceType === 'file') {
    const content = params.rawInput.slice(0, MAX_CONTEXT_CHARS);
    return {
      kind: 'file',
      label: `Archivo ${params.fileName || 'subido'}`,
      content,
      repoUrl: 'https://github.com/boxtools/vault',
      chars: content.length,
    };
  }

  const url = params.rawInput.trim();
  const gh = parseGithubUrl(url);

  // A) Repositorio de GitHub: metadata + README (o archivo puntual si es /blob/)
  if (gh) {
    const parts: string[] = [];
    const repoUrl = `https://github.com/${gh.owner}/${gh.repo}`;

    const metaRaw = await fetchText(`https://api.github.com/repos/${gh.owner}/${gh.repo}`);
    if (metaRaw) {
      try {
        const meta = JSON.parse(metaRaw);
        parts.push(
          [
            `REPOSITORIO: ${meta.full_name}`,
            `DESCRIPCIÓN: ${meta.description || '(sin descripción)'}`,
            `LENGUAJE PRINCIPAL: ${meta.language || 'N/D'}`,
            `TOPICS: ${(meta.topics || []).join(', ') || 'N/D'}`,
            `ESTRELLAS: ${meta.stargazers_count ?? 'N/D'}`,
            `HOMEPAGE: ${meta.homepage || 'N/D'}`,
          ].join('\n')
        );
      } catch {
        /* ignorar */
      }
    }

    let mainDoc: string | null = null;
    if (gh.path && gh.branch) {
      // Archivo o carpeta específica dentro del repo
      mainDoc = await fetchText(
        `https://raw.githubusercontent.com/${gh.owner}/${gh.repo}/${gh.branch}/${gh.path}`
      );
      if (!mainDoc) {
        mainDoc = await fetchText(
          `https://raw.githubusercontent.com/${gh.owner}/${gh.repo}/${gh.branch}/${gh.path.replace(/\/$/, '')}/README.md`
        );
      }
      if (!mainDoc) {
        mainDoc = await fetchText(
          `https://raw.githubusercontent.com/${gh.owner}/${gh.repo}/${gh.branch}/${gh.path.replace(/\/$/, '')}/SKILL.md`
        );
      }
    }
    if (!mainDoc) {
      mainDoc = await fetchText(`https://api.github.com/repos/${gh.owner}/${gh.repo}/readme`, {
        Accept: 'application/vnd.github.raw',
      });
    }
    if (mainDoc) {
      // Limpiar badges/HTML ruidoso para ahorrar tokens
      const cleaned = mainDoc
        .replace(/<img[^>]*>/gi, '')
        .replace(/<a [^>]*>\s*<\/a>/gi, '')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\n{3,}/g, '\n\n');
      parts.push(`DOCUMENTACIÓN (README / archivo):\n${cleaned}`);
    }

    const content = parts.join('\n\n').slice(0, MAX_CONTEXT_CHARS);
    if (content.trim().length > 50) {
      return {
        kind: 'github',
        label: `GitHub ${gh.owner}/${gh.repo}${gh.path ? '/' + gh.path : ''}`,
        content,
        repoUrl,
        chars: content.length,
      };
    }
  }

  // B) Cualquier otra web: lector público que convierte la página a Markdown (con CORS)
  const readerText = await fetchText(`https://r.jina.ai/${url}`);
  if (readerText && readerText.trim().length > 100) {
    const content = readerText.slice(0, MAX_CONTEXT_CHARS);
    return { kind: 'web', label: `Web ${new URL(url).hostname}`, content, repoUrl: url, chars: content.length };
  }

  // C) Último recurso: sólo la URL (la IA deberá basarse en el nombre)
  return {
    kind: 'url-only',
    label: 'Sólo URL (no se pudo leer el contenido)',
    content: `URL: ${url}`,
    repoUrl: url,
    chars: url.length,
  };
}

// ==============================================================================
// 2. PROMPT + LLAMADA AL PROVEEDOR
// ==============================================================================

const SYSTEM_PROMPT = `Eres el Analista Técnico Oficial de BoxTools (catálogo interno de herramientas de IA de un equipo de desarrollo argentino).
Recibes el CONTENIDO REAL de un repositorio, documentación o archivo. Tu trabajo es leerlo con atención y producir 3 fichas distintas de la MISMA herramienta.

REGLAS ESTRICTAS:
1. Básate EXCLUSIVAMENTE en el contenido proporcionado. Menciona funcionalidades, comandos, conceptos y nombres REALES que aparecen en el texto. Prohibido inventar features.
2. Si el contenido trae comandos de instalación reales (npm, npx, pip, uv, brew, docker, etc.), úsalos en "installCommand".
3. Cada variación debe ser genuinamente diferente en enfoque, no sólo cambiar el título:
   - var1 "Práctico": uso diario, quick start, analogía criolla argentina de la vida cotidiana (mecánico, asado, obra, colectivo, etc.).
   - var2 "Arquitectura Enterprise": cómo se integra en una arquitectura seria: componentes internos, flujo de datos, seguridad, contratos, testing, riesgos.
   - var3 "Vibe UI & Prototipado": cómo acelera la iteración rápida, la experiencia de desarrollo y el prototipado (si aplica a frontend, enfocarlo ahí).
4. "architecture" de cada variación son 3 pasos (icon emoji, label corto ≤ 22 caracteres, sublabel ≤ 28 caracteres) que describen el flujo REAL de la herramienta desde esa perspectiva. Deben ser distintos entre variaciones.
5. "mermaid" debe ser un diagrama Mermaid válido que empiece con "flowchart LR" o "flowchart TD", entre 4 y 8 nodos, con TODAS las etiquetas entre comillas dobles escapadas, por ejemplo: flowchart LR\\n  A[\\"Usuario\\"] --> B[\\"CLI uv\\"]. Usa \\n para saltos de línea. Debe reflejar la arquitectura real descrita en el contenido.
6. "phase": número entero 0-4 según el flujo PEVC (0 setup/instalación, 1 especificación/brainstorming, 2 diseño UI/vibe coding, 3 backend/datos/TDD, 4 QA/deploy/cierre).
7. "category": "mcp" si es un servidor MCP, "markdown" si es un workflow/prompt/regla en markdown, "skill" en cualquier otro caso.
8. Escribe todo en español rioplatense claro. Listas de 2 a 3 ítems concretos.
9. Responde SOLO con un objeto JSON válido. Sin markdown, sin comentarios, sin texto adicional.`;

function buildUserPrompt(ctx: SourceContext): string {
  const variationSchema = `{
      "title": "string",
      "tagline": "string (máx 140 caracteres, concreto)",
      "emoji": "un emoji",
      "phase": 2,
      "riskLevel": "low | medium | high",
      "criolloAnalogy": "string",
      "criolloWithout": ["string", "string"],
      "criolloWith": ["string", "string"],
      "semaforoGreen": ["string", "string"],
      "semaforoRed": ["string", "string"],
      "architecture": [
        {"icon": "emoji", "label": "string", "sublabel": "string"},
        {"icon": "emoji", "label": "string", "sublabel": "string"},
        {"icon": "emoji", "label": "string", "sublabel": "string"}
      ],
      "architectureNote": "string (1 frase que resuma el flujo)",
      "mermaid": "flowchart LR\\n  A[\\"...\\"] --> B[\\"...\\"]",
      "markdown": "string en Markdown con secciones ## Qué es, ## Cómo se usa (con comandos reales), ## Cuándo usarla"
    }`;

  return `FUENTE ANALIZADA: ${ctx.label}
URL DE REFERENCIA: ${ctx.repoUrl}

=== CONTENIDO REAL (léelo completo) ===
${ctx.content}
=== FIN DEL CONTENIDO ===

Devuelve un JSON con exactamente esta forma:
{
  "candidateName": "nombre real de la herramienta",
  "category": "skill | mcp | markdown",
  "repoUrl": "${ctx.repoUrl}",
  "installCommand": "comando real de instalación encontrado en el contenido, o el más razonable",
  "var1": ${variationSchema},
  "var2": ${variationSchema},
  "var3": ${variationSchema}
}`;
}

function extractJson(raw: string): any {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    throw new Error('La IA no devolvió un JSON reconocible');
  }
  return JSON.parse(text.slice(first, last + 1));
}

async function callProvider(config: AiSettingsConfig, system: string, user: string): Promise<string> {
  const apiKey = config.apiKey.trim();

  if (config.provider === 'gemini') {
    const model = config.modelText || 'gemini-2.0-flash';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: { temperature: 0.4, responseMimeType: 'application/json', maxOutputTokens: 8192 },
        }),
      }
    );
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${data?.error?.message || res.statusText}`);
    return data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
  }

  if (config.provider === 'openrouter') {
    const model = config.modelText.includes('/') ? config.modelText : 'google/gemini-2.0-flash-001';
    const send = async (withJsonMode: boolean) => {
      const body: any = {
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.4,
        max_tokens: 8000,
      };
      if (withJsonMode) body.response_format = { type: 'json_object' };
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
    // Algunos modelos no soportan response_format: reintentar sin modo JSON
    if (res.status === 400 || res.status === 422) {
      res = await send(false);
    }
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.error) {
      throw new Error(`OpenRouter ${res.status}: ${data?.error?.message || res.statusText}`);
    }
    return data?.choices?.[0]?.message?.content || '';
  }

  // OpenAI
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.modelText || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${data?.error?.message || res.statusText}`);
  return data?.choices?.[0]?.message?.content || '';
}

// ==============================================================================
// 3. NORMALIZACIÓN DE LA RESPUESTA EN FICHAS ToolItem
// ==============================================================================

const PHASE_LABELS: Record<number, string> = {
  0: 'FASE 0 // ARQ & SETUP',
  1: 'FASE 1 // SPEC & BRAINSTORM',
  2: 'FASE 2 // VIBE UI',
  3: 'FASE 3 // DB & TDD',
  4: 'FASE 4 // QA & DEPLOY',
};

function toStringList(value: any, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const list = value.map((v) => String(v).trim()).filter(Boolean);
    if (list.length > 0) return list.slice(0, 4);
  }
  return fallback;
}

function sanitizeMermaid(raw: any, steps: { label: string }[]): string {
  let code = typeof raw === 'string' ? raw : '';
  code = code.replace(/\\n/g, '\n').replace(/```(?:mermaid)?/g, '').trim();
  if (!/^(flowchart|graph)\s+(LR|TD|TB|RL|BT)/i.test(code)) {
    code = '';
  }
  if (!code) {
    const safe = steps.map((s) => s.label.replace(/"/g, "'"));
    code = `flowchart LR\n  A["${safe[0] || 'Inicio'}"] --> B["${safe[1] || 'Proceso'}"]\n  B --> C["${safe[2] || 'Resultado'}"]`;
  }
  return code;
}

const STEP_TONES: Record<'var1' | 'var2' | 'var3', SvgFlowStep['tone'][]> = {
  var1: ['orange', 'yellow', 'emerald'],
  var2: ['cyan', 'purple', 'emerald'],
  var3: ['purple', 'rose', 'emerald'],
};

export interface AiSynthesisResult {
  readonly ok: boolean;
  readonly variations?: ToolVariationOption[];
  readonly source?: SourceContext;
  readonly error?: string;
}

export async function synthesizeWithRealAi(params: {
  sourceType: 'link' | 'file';
  rawInput: string;
  fileName?: string;
}): Promise<AiSynthesisResult> {
  const config = getAiConfig();
  if (!config.apiKey.trim()) {
    return { ok: false, error: 'No hay API Key configurada' };
  }

  // 1. Leer el contenido real del link / archivo
  const source = await fetchSourceContext(params);

  // 2. Pedir a la IA el análisis
  let parsed: any;
  try {
    const raw = await callProvider(config, SYSTEM_PROMPT, buildUserPrompt(source));
    if (!raw) throw new Error('La IA devolvió una respuesta vacía');
    parsed = extractJson(raw);
  } catch (err: any) {
    return { ok: false, source, error: err?.message || String(err) };
  }

  // 3. Normalizar
  const candidateName: string = String(parsed.candidateName || 'Herramienta Agéntica').trim();
  const category: Exclude<CategorySlug, 'all' | 'combo'> =
    parsed.category === 'mcp' ? 'mcp' : parsed.category === 'markdown' ? 'markdown' : 'skill';
  const categoryLabel =
    category === 'mcp' ? '🔌 SERVIDOR MCP' : category === 'markdown' ? '📝 WORKFLOW MARKDOWN' : '⚡ SKILL AGÉNTICA';
  const repoUrl: string = source.kind === 'file' ? parsed.repoUrl || source.repoUrl : source.repoUrl;
  const installCommand: string = String(parsed.installCommand || `npx skills add ${repoUrl}`).trim();
  const slugBase =
    candidateName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
    `tool-${Date.now()}`;
  const randomSuffix = Math.floor(Math.random() * 90 + 10);
  const codePrefix = category === 'mcp' ? 'MCP' : category === 'markdown' ? 'MD' : 'SKILL';

  const buildTool = (
    vKey: 'var1' | 'var2' | 'var3',
    suffix: string,
    badge: string,
    defaultEmoji: string
  ): ToolItem => {
    const v = parsed[vKey] || {};
    const phaseNum = Math.min(4, Math.max(0, parseInt(v.phase, 10) || 2));
    const phase = `fase${phaseNum}` as Exclude<PhaseSlug, 'all'>;
    const tones = STEP_TONES[vKey];

    const rawSteps: any[] = Array.isArray(v.architecture) ? v.architecture : [];
    const steps = [0, 1, 2].map((i) => ({
      icon: String(rawSteps[i]?.icon || ['💡', '⚙️', '🚀'][i]),
      label: String(rawSteps[i]?.label || ['Entrada', 'Proceso', 'Resultado'][i]).slice(0, 26),
      sublabel: String(rawSteps[i]?.sublabel || '').slice(0, 32),
      tone: tones[i],
    })) as unknown as [SvgFlowStep, SvgFlowStep, SvgFlowStep];

    const title = String(v.title || `${candidateName} (${suffix})`);
    const tagline = String(v.tagline || '');
    const riskLevel: ToolItem['riskLevel'] =
      v.riskLevel === 'high' ? 'high' : v.riskLevel === 'medium' ? 'medium' : 'low';

    return {
      id: `t-${slugBase}-${suffix}-${Date.now()}`,
      slug: `${slugBase}-${suffix}`,
      codeId: `${codePrefix}-${suffix === 'practico' ? '0' : suffix === 'enterprise' ? 'E' : 'V'}${randomSuffix}`,
      title,
      tagline,
      emoji: String(v.emoji || defaultEmoji),
      category,
      categoryLabel,
      phase,
      phaseLabel: PHASE_LABELS[phaseNum],
      status: 'published',
      isFeatured: false,
      criolloAnalogy: String(v.criolloAnalogy || ''),
      criolloWithout: toStringList(v.criolloWithout, ['—']),
      criolloWith: toStringList(v.criolloWith, ['—']),
      semaforoGreen: toStringList(v.semaforoGreen, ['—']),
      semaforoRed: toStringList(v.semaforoRed, ['—']),
      riskLevel,
      mermaidCode: sanitizeMermaid(v.mermaid, steps),
      svgConfig: {
        title: `${candidateName}: ${badge}`,
        badge,
        steps,
        summaryNote: String(v.architectureNote || tagline),
      },
      mediaGallery: [
        {
          id: `m-${slugBase}-${suffix}`,
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          caption: `Esquema de ${candidateName} (${badge})`,
          isAiGenerated: true,
        },
      ],
      cliQuickCommand: installCommand,
      installCommands: {
        antigravity: installCommand,
        opencode: installCommand,
        cursor: installCommand,
        claudeCode: installCommand,
      },
      rawMarkdown:
        typeof v.markdown === 'string' && v.markdown.trim()
          ? v.markdown.replace(/\\n/g, '\n')
          : `# ${title}\n\n${tagline}\n\n## Instalación\n\n\`\`\`bash\n${installCommand}\n\`\`\`\n`,
      repoUrl,
      compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
    };
  };

  const variations: ToolVariationOption[] = [
    {
      id: 'v-criollo',
      name: '1. Criollo & Velocidad',
      badge: 'PRÁCTICO & DIRECTO',
      badgeColor: 'orange',
      icon: '🛠️',
      description: 'Uso diario, quick start real y analogía criolla basada en el contenido analizado.',
      tool: buildTool('var1', 'practico', 'PRÁCTICO & DIRECTO', '🛠️'),
    },
    {
      id: 'v-enterprise',
      name: '2. Arquitectura Enterprise',
      badge: 'CONTRATOS & SEGURIDAD',
      badgeColor: 'cyan',
      icon: '🛡️',
      description: 'Componentes internos, flujo de datos, seguridad y riesgos de integración.',
      tool: buildTool('var2', 'enterprise', 'ARQUITECTURA ENTERPRISE', '🛡️'),
    },
    {
      id: 'v-vibe',
      name: '3. Vibe UI & Prototipado',
      badge: 'DISEÑO & EXPERIENCIA',
      badgeColor: 'purple',
      icon: '✨',
      description: 'Cómo acelera la iteración rápida y el prototipado según lo que realmente hace.',
      tool: buildTool('var3', 'vibe-ui', 'VIBE UI & PROTOTIPADO', '✨'),
    },
  ];

  return { ok: true, variations, source };
}

/** Compatibilidad: devuelve sólo las variaciones o null si falló. */
export async function callRealAiSynthesis(params: {
  sourceType: 'link' | 'file';
  rawInput: string;
  fileName?: string;
}): Promise<ToolVariationOption[] | null> {
  const res = await synthesizeWithRealAi(params);
  return res.ok && res.variations ? res.variations : null;
}
