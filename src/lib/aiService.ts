import { AiSettingsConfig, ToolItem, CategorySlug, PhaseSlug } from '../types/boxtools';
import { ToolVariationOption } from '../components/AddToolModal';

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

export async function callRealAiSynthesis(params: {
  sourceType: 'link' | 'file';
  rawInput: string;
  fileName?: string;
}): Promise<ToolVariationOption[] | null> {
  const config = getAiConfig();
  const apiKey = config.apiKey.trim();

  // Si no hay API Key configurada, retornar null para usar el fallback determinista local
  if (!apiKey) {
    return null;
  }

  const promptText = `Eres el Agente Oficial de BoxTools (Vibe Coding Profesional).
Tu tarea es analizar el siguiente recurso y estructurar una herramienta agéntica completa generando 3 variaciones distintas.

RECURSO PROPORCIONADO (${params.sourceType === 'link' ? 'URL' : 'Archivo ' + (params.fileName || '')}):
"""
${params.rawInput.slice(0, 4000)}
"""

Genera EXACTAMENTE un JSON válido con la siguiente estructura (sin texto antes ni después, solo el JSON):
{
  "candidateName": "Nombre legible de la herramienta",
  "category": "skill", // o "mcp" o "markdown"
  "repoUrl": "URL deducida o del recurso",
  "var1": {
    "title": "Nombre (Enfoque Práctico)",
    "tagline": "Una frase corta contundente",
    "criolloAnalogy": "Analogía criolla de la vida cotidiana sin pelos en la lengua",
    "criolloWithout": ["Problema 1 sin la herramienta", "Problema 2 sin la herramienta"],
    "criolloWith": ["Solución 1 con la herramienta", "Solución 2 con la herramienta"],
    "semaforoGreen": ["Caso 1 dónde sí usarla", "Caso 2 dónde sí usarla"],
    "semaforoRed": ["Caso 1 dónde jamás usarla", "Caso 2 dónde jamás usarla"],
    "mermaid": "flowchart LR\\n  A[Inicio] --> B[Fin]"
  },
  "var2": {
    "title": "Nombre (Arquitectura Enterprise)",
    "tagline": "Enfoque de máxima seguridad y contratos estrictos",
    "criolloAnalogy": "Analogía criolla sobre contratos y normas estrictas",
    "criolloWithout": ["Riesgo 1", "Riesgo 2"],
    "criolloWith": ["Blindaje 1", "Blindaje 2"],
    "semaforoGreen": ["Uso crítico 1", "Uso crítico 2"],
    "semaforoRed": ["No apto 1", "No apto 2"],
    "mermaid": "flowchart TD\\n  A[Contrato] --> B[Validación]"
  },
  "var3": {
    "title": "Nombre (Vibe UI & Prototipado)",
    "tagline": "Enfoque de vanguardia visual y prototipado ágil",
    "criolloAnalogy": "Analogía criolla sobre maquetación de alta costura",
    "criolloWithout": ["Defecto visual 1", "Defecto visual 2"],
    "criolloWith": ["Ventaja visual 1", "Ventaja visual 2"],
    "semaforoGreen": ["Uso UI 1", "Uso UI 2"],
    "semaforoRed": ["No usar en backend 1", "No usar en backend 2"],
    "mermaid": "flowchart LR\\n  A[Concepto] --> B[Diseño 10/10]"
  }
}`;

  try {
    let rawResponse = '';

    if (config.provider === 'gemini') {
      const model = config.modelText || 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Gemini API respondió con error ${res.status}`);
      }
      const data = await res.json();
      rawResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (config.provider === 'openrouter') {
      const model = config.modelText.includes('/')
        ? config.modelText
        : 'google/gemini-2.0-flash-001';

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://baultools.netlify.app',
          'X-Title': 'BoxTools Vault',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        throw new Error(`OpenRouter respondió con error ${res.status}`);
      }
      const data = await res.json();
      rawResponse = data?.choices?.[0]?.message?.content || '';
    } else if (config.provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) {
        throw new Error(`OpenAI respondió con error ${res.status}`);
      }
      const data = await res.json();
      rawResponse = data?.choices?.[0]?.message?.content || '';
    }

    if (!rawResponse) return null;

    // Limpiar posibles bloques markdown ```json ... ```
    const cleanedJson = rawResponse.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanedJson);

    const candidateName = parsed.candidateName || 'Herramienta Agéntica';
    const defaultCategory: Exclude<CategorySlug, 'all' | 'combo'> =
      parsed.category === 'mcp' ? 'mcp' : parsed.category === 'markdown' ? 'markdown' : 'skill';
    const defaultCategoryLabel =
      defaultCategory === 'mcp'
        ? '🔌 SERVIDOR MCP'
        : defaultCategory === 'markdown'
        ? '📝 WORKFLOW MARKDOWN'
        : '⚡ SKILL AGÉNTICA';

    const repoUrl = parsed.repoUrl || (params.sourceType === 'link' ? params.rawInput : 'https://github.com/boxtools/vault');
    const slugBase =
      candidateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
      `tool-${Date.now()}`;
    const randomSuffix = Math.floor(Math.random() * 90 + 10);

    const buildTool = (vKey: 'var1' | 'var2' | 'var3', suffix: string, badgeTone: 'orange' | 'cyan' | 'purple'): ToolItem => {
      const v = parsed[vKey] || {};
      const codePrefix = defaultCategory === 'mcp' ? 'MCP' : defaultCategory === 'markdown' ? 'MD' : 'SKILL';
      return {
        id: `t-${slugBase}-${suffix}-${Date.now()}`,
        slug: `${slugBase}-${suffix}`,
        codeId: `${codePrefix}-0${randomSuffix}`,
        title: v.title || `${candidateName} (${suffix})`,
        tagline: v.tagline || 'Procesado con Inteligencia Artificial BoxTools',
        emoji: suffix === 'practico' ? '🛠️' : suffix === 'enterprise' ? '🛡️' : '✨',
        category: defaultCategory,
        categoryLabel: defaultCategoryLabel,
        phase: 'fase2' as Exclude<PhaseSlug, 'all'>,
        phaseLabel: 'FASE 2 // VIBE CODING',
        status: 'published',
        isFeatured: false,
        criolloAnalogy: v.criolloAnalogy || 'Analogía generada por IA',
        criolloWithout: v.criolloWithout || ['Sin la herramienta'],
        criolloWith: v.criolloWith || ['Con la herramienta'],
        semaforoGreen: v.semaforoGreen || ['Casos de uso autorizados'],
        semaforoRed: v.semaforoRed || ['Prohibido su uso no especificado'],
        riskLevel: suffix === 'enterprise' ? 'medium' : 'low',
        mermaidCode: v.mermaid || 'flowchart LR\n A[Inicio] --> B[Fin]',
        svgConfig: {
          title: v.title || candidateName,
          badge: badgeTone.toUpperCase(),
          steps: [
            { icon: '💡', label: 'Ingesta', sublabel: 'Input analizado', tone: 'orange' },
            { icon: '⚙️', label: 'Proceso IA', sublabel: config.provider.toUpperCase(), tone: 'cyan' },
            { icon: '🚀', label: 'Listo', sublabel: 'Producción', tone: 'emerald' },
          ],
          summaryNote: v.tagline || '',
        },
        mediaGallery: [
          {
            id: `m-${slugBase}-${suffix}`,
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            caption: `Esquema generado por ${config.provider.toUpperCase()} para ${candidateName}`,
            isAiGenerated: true,
          },
        ],
        cliQuickCommand: `npx skills add ${repoUrl}`,
        installCommands: {
          antigravity: `agy plugin install ${repoUrl}`,
          opencode: `npx skills add ${repoUrl}`,
          cursor: `npx skills add ${repoUrl}`,
          claudeCode: `npx skills add ${repoUrl}`,
        },
        rawMarkdown: `# ${candidateName} (${suffix})
Generado mediante API real de ${config.provider.toUpperCase()}.

## Resumen:
${v.tagline}

## Analogía:
${v.criolloAnalogy}
`,
        repoUrl,
        compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
      };
    };

    return [
      {
        id: 'v-criollo',
        name: '1. Criollo & Velocidad',
        badge: 'PRÁCTICO & DIRECTO',
        badgeColor: 'orange',
        icon: '🛠️',
        description: 'Metáforas de la vida cotidiana y foco en productividad inmediata.',
        tool: buildTool('var1', 'practico', 'orange'),
      },
      {
        id: 'v-enterprise',
        name: '2. Arquitectura Enterprise',
        badge: 'CONTRATOS & SEGURIDAD',
        badgeColor: 'cyan',
        icon: '🛡️',
        description: 'Máximo rigor de ingeniería, contratos de tipos estrictos y testing TDD.',
        tool: buildTool('var2', 'enterprise', 'cyan'),
      },
      {
        id: 'v-vibe',
        name: '3. Vibe UI & Prototipado',
        badge: 'DISEÑO & EXPERIENCIA',
        badgeColor: 'purple',
        icon: '✨',
        description: 'Frontend de alta costura, paletas cromáticas y prototipado ágil.',
        tool: buildTool('var3', 'vibe-ui', 'purple'),
      },
    ];
  } catch (err) {
    console.warn('Error en llamada a API de IA, usando fallback local:', err);
    return null;
  }
}

