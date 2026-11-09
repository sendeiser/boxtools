import React, { useState } from 'react';
import { ToolItem, CategorySlug, PhaseSlug } from '../types/boxtools';
import { MermaidViewer } from './MermaidViewer';
import { SvgInfographic } from './SvgInfographic';

export interface ToolVariationOption {
  readonly id: string;
  readonly name: string;
  readonly badge: string;
  readonly badgeColor: 'orange' | 'cyan' | 'purple';
  readonly icon: string;
  readonly description: string;
  tool: ToolItem;
}

export interface AddToolModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onAddTool: (tool: ToolItem) => void;
  readonly onShowToast: (msg: string) => void;
}

export const AddToolModal: React.FC<AddToolModalProps> = ({
  isOpen,
  onClose,
  onAddTool,
  onShowToast,
}) => {
  const [sourceType, setSourceType] = useState<'link' | 'file'>('link');
  const [inputUrl, setInputUrl] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Variations state: Array of 3 AI-generated variations
  const [variations, setVariations] = useState<ToolVariationOption[]>([]);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      onShowToast(`✓ Archivo cargado: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const synthesizeToolWithAi = () => {
    const rawInput = sourceType === 'link' ? inputUrl.trim() : fileContent.trim();
    if (!rawInput) {
      onShowToast('⚠️ Ingresa una URL o selecciona un archivo para procesar');
      return;
    }

    setIsSynthesizing(true);

    setTimeout(() => {
      let candidateName = 'Nueva Herramienta Agéntica';
      let defaultCategory: Exclude<CategorySlug, 'all' | 'combo'> = 'skill';
      let defaultCategoryLabel = '⚡ SKILL AGÉNTICA';
      let repoUrl = 'https://github.com/boxtools/vault';

      if (sourceType === 'link') {
        repoUrl = inputUrl;
        const parts = inputUrl.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1] || 'herramienta';
        candidateName = lastPart.replace(/[-_]/g, ' ').replace(/\.git$/, '');

        if (inputUrl.includes('mcp') || candidateName.toLowerCase().includes('mcp')) {
          defaultCategory = 'mcp';
          defaultCategoryLabel = '🔌 SERVIDOR MCP';
        } else if (inputUrl.endsWith('.md') || candidateName.toLowerCase().includes('workflow')) {
          defaultCategory = 'markdown';
          defaultCategoryLabel = '📝 WORKFLOW MARKDOWN';
        }
      } else {
        const titleMatch = fileContent.match(/^#\s+(.+)$/m);
        if (titleMatch && titleMatch[1]) {
          candidateName = titleMatch[1].trim();
        } else if (fileName) {
          candidateName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        }

        if (fileName.endsWith('.md') || fileContent.toLowerCase().includes('workflow')) {
          defaultCategory = 'markdown';
          defaultCategoryLabel = '📝 WORKFLOW MARKDOWN';
        }
      }

      const slugBase = candidateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `tool-${Date.now()}`;
      const titleFormatted = candidateName.charAt(0).toUpperCase() + candidateName.slice(1);
      const randomSuffix = Math.floor(Math.random() * 90 + 10);

      // VARIACIÓN 1: Criollo & Velocidad Práctica 🛠️
      const toolVar1: ToolItem = {
        id: `t-${slugBase}-criollo-${Date.now()}`,
        slug: `${slugBase}-practico`,
        codeId: defaultCategory === 'mcp' ? `MCP-0${randomSuffix}` : defaultCategory === 'markdown' ? `MD-0${randomSuffix}` : `SKILL-0${randomSuffix}`,
        title: `${titleFormatted} (Enfoque Práctico)`,
        tagline: `Solución directa sin vueltas: automatización agéntica para no perder tiempo renegando con código manual en ${titleFormatted}.`,
        emoji: '🛠️',
        category: defaultCategory,
        categoryLabel: defaultCategoryLabel,
        phase: 'fase2' as Exclude<PhaseSlug, 'all'>,
        phaseLabel: 'FASE 2 // VIBE CODING',
        status: 'published',
        isFeatured: false,
        criolloAnalogy: `Es como cuando llamás al mecánico del barrio que viene con la llave justa: en vez de pasarte horas adivinando con el capó abierto, te ajusta la tuerca exacta y te deja el auto regulando en 5 minutos.`,
        criolloWithout: [
          `Perder horas buscando ejemplos rotos en StackOverflow y renegando con configuraciones manuales.`,
          `Picar código repetitivo para ${titleFormatted} que la IA podría resolver en un parpadeo.`,
        ],
        criolloWith: [
          `Automatización directa y comandos estandarizados listos para correr sin fricción.`,
          `El agente sabe exactamente qué tocar sin romper lo que ya andaba bien.`,
        ],
        semaforoGreen: [
          `Cuando necesitás velocidad inmediata para integrar ${titleFormatted} en tu flujo diario.`,
          `Para resolver tareas rutinarias sin inventar la rueda de nuevo.`,
        ],
        semaforoRed: [
          `No usar si la tarea no involucra directamente este subsistema para no sobrecargar el contexto.`,
        ],
        riskLevel: 'low',
        mermaidCode: `flowchart LR
    A[💡 Idea o Bug] --> B[🛠️ ${titleFormatted}]
    B --> C[⚡ Ajuste Directo]
    C --> D[🚀 Listo y Andando]`,
        svgConfig: {
          title: `Flujo Práctico: ${titleFormatted}`,
          badge: 'VELOCIDAD & CERO VUELTAS',
          steps: [
            { icon: '💡', label: 'Detección', sublabel: 'Cero demora', tone: 'orange' },
            { icon: '🛠️', label: 'Ajuste Inmediato', sublabel: 'Sin burocracia', tone: 'cyan' },
            { icon: '🚀', label: 'Entrega Rápida', sublabel: 'Producción', tone: 'emerald' },
          ],
          summaryNote: `Optimizado para velocidad de desarrollo y resolución pragmática en el día a día.`,
        },
        mediaGallery: [
          {
            id: `m-${slugBase}-1`,
            url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
            caption: `Esquema de integración práctica para ${titleFormatted}`,
            isAiGenerated: false,
          },
        ],
        cliQuickCommand: `npx skills add ${repoUrl}`,
        installCommands: {
          antigravity: `agy plugin install ${repoUrl}`,
          opencode: `npx skills add ${repoUrl}`,
          cursor: `npx skills add ${repoUrl}`,
          claudeCode: `npx skills add ${repoUrl}`,
        },
        rawMarkdown: `# ${titleFormatted} (Enfoque Práctico)
Automatización y comandos para ejecución rápida.

## Comandos rápidos:
- Instalar: \`npx skills add ${repoUrl}\`
- Objetivo: Reducir fricción y resolver en minutos.
`,
        repoUrl,
        compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
      };

      // VARIACIÓN 2: Arquitectura Enterprise & Blindaje 🛡️
      const toolVar2: ToolItem = {
        id: `t-${slugBase}-enterprise-${Date.now()}`,
        slug: `${slugBase}-enterprise`,
        codeId: defaultCategory === 'mcp' ? `MCP-E${randomSuffix}` : defaultCategory === 'markdown' ? `MD-E${randomSuffix}` : `SKILL-E${randomSuffix}`,
        title: `${titleFormatted} (Arquitectura Enterprise)`,
        tagline: `Integración determinista de grado empresarial con contratos semánticos, aislamiento y tolerancia cero a regresiones para ${titleFormatted}.`,
        emoji: '🛡️',
        category: defaultCategory,
        categoryLabel: defaultCategoryLabel,
        phase: 'fase0' as Exclude<PhaseSlug, 'all'>,
        phaseLabel: 'FASE 0 // ARQUITECTURA & SEGURIDAD',
        status: 'published',
        isFeatured: true,
        criolloAnalogy: `Es como el sistema de chequeo de despegue en la cabina de un avión comercial: ningún parámetro se modifica a ciegas, cada función tiene su contrato firmado y si un sensor marca rojo, el sistema aísla la falla antes de que afecte a producción.`,
        criolloWithout: [
          `Inconsistencias de contratos, tipos desincronizados y deuda técnica silenciosa en ${titleFormatted}.`,
          `Commits gigantescos sin cobertura de tests que rompen entornos críticos de producción.`,
        ],
        criolloWith: [
          `Blindaje integral mediante tipado TypeScript estricto, políticas de seguridad y contratos inmutables.`,
          `Pruebas TDD automatizadas y auditoría de seguridad previa a cualquier despliegue.`,
        ],
        semaforoGreen: [
          `En sistemas empresariales, aplicaciones financieras o código donde un fallo cueste dinero real.`,
          `Cuando se requiere compliance de seguridad, trazabilidad de logs y arquitectura desacoplada.`,
        ],
        semaforoRed: [
          `PROHIBIDO modificar la arquitectura base sin test previo en rojo y aprobación del responsable técnico.`,
        ],
        riskLevel: 'medium',
        mermaidCode: `flowchart TD
    A[📄 Contrato Semántico] --> B[🛡️ ${titleFormatted}]
    B --> C[🧪 Validación TDD Estricta]
    C --> D[🔒 Auditoría de Seguridad]
    D --> E[📦 Despliegue Inmutable]`,
        svgConfig: {
          title: `Protocolo Enterprise: ${titleFormatted}`,
          badge: 'BLINDAJE & CONTRATOS ESTRICTOS',
          steps: [
            { icon: '📄', label: 'Contrato y Tipos', sublabel: 'Cero ambigüedad', tone: 'cyan' },
            { icon: '🛡️', label: 'Aislamiento Worktree', sublabel: 'TDD estricto', tone: 'purple' },
            { icon: '🔒', label: 'Auditoría Final', sublabel: '100% blindado', tone: 'emerald' },
          ],
          summaryNote: `Diseñado para ambientes de misión crítica con contratos estrictos y verificación continua.`,
        },
        mediaGallery: [
          {
            id: `m-${slugBase}-2`,
            url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
            caption: `Arquitectura de seguridad y contratos para ${titleFormatted}`,
            isAiGenerated: false,
          },
        ],
        cliQuickCommand: `npx skills add ${repoUrl}`,
        installCommands: {
          antigravity: `agy plugin install ${repoUrl}`,
          opencode: `npx skills add ${repoUrl}`,
          cursor: `npx skills add ${repoUrl}`,
          claudeCode: `npx skills add ${repoUrl}`,
        },
        rawMarkdown: `# ${titleFormatted} (Enterprise Edition)
Especificación de arquitectura y protocolos de seguridad.

## Directivas Mandatorias:
1. Validar tipos de entrada y salida con esquemas estrictos.
2. Comprobar semáforo TDD (Rojo ➔ Verde ➔ Azul) antes de hacer merge.
3. Prohibido alterar componentes del core sin documentación en docs/specs/.
`,
        repoUrl,
        compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
      };

      // VARIACIÓN 3: Vibe UI & Prototipado Ágil ✨
      const toolVar3: ToolItem = {
        id: `t-${slugBase}-vibe-${Date.now()}`,
        slug: `${slugBase}-vibe-ui`,
        codeId: defaultCategory === 'mcp' ? `MCP-V${randomSuffix}` : defaultCategory === 'markdown' ? `MD-V${randomSuffix}` : `SKILL-V${randomSuffix}`,
        title: `${titleFormatted} (Vibe UI & Prototipado)`,
        tagline: `Acelerador visual de alta fidelidad: iteración estética instantánea, paletas y componentes de vanguardia para ${titleFormatted}.`,
        emoji: '✨',
        category: defaultCategory,
        categoryLabel: defaultCategoryLabel,
        phase: 'fase2' as Exclude<PhaseSlug, 'all'>,
        phaseLabel: 'FASE 2 // VIBE UI & DESIGN',
        status: 'published',
        isFeatured: false,
        criolloAnalogy: `Es como tener un taller de maquetación de alta costura trabajando a tu ritmo: le pasás las dimensiones de la pantalla y te devuelve los componentes ya planchados, con la paleta de colores armónica y el acabado artesanal listo para deslumbrar.`,
        criolloWithout: [
          `Interfaces planas, desabridas y con "olor a IA" hechas con estilos genéricos sin personalidad.`,
          `Perder horas maquetando CSS a mano y renegando con el responsive en celulares.`,
        ],
        criolloWith: [
          `Prototipado a la velocidad del pensamiento con acabados artesanales Neo-Brutalistas o Minimal.`,
          `Auditoría visual multimodal cruzando capturas reales a 375px con el código Tailwind.`,
        ],
        semaforoGreen: [
          `Al idear pantallas, dashboards, landing pages y componentes de alto impacto visual.`,
          `Para iterar variantes estéticas y pulir la experiencia táctil en dispositivos móviles.`,
        ],
        semaforoRed: [
          `Para lógica pura de backend, migraciones SQL o tareas de infraestructura DevOps.`,
        ],
        riskLevel: 'low',
        mermaidCode: `flowchart LR
    A[🎨 Concepto Visual] --> B[✨ ${titleFormatted}]
    B --> C[🖼️ Captura Playwright]
    C --> D[👁️ Impeccable Audit]
    D --> E[💎 UI 10/10 Publicada]`,
        svgConfig: {
          title: `Tubería Vibe UI: ${titleFormatted}`,
          badge: 'DISEÑO & MULTIMODAL',
          steps: [
            { icon: '🎨', label: 'Concepto & Tokens', sublabel: 'Paleta & Jerarquía', tone: 'orange' },
            { icon: '✨', label: 'Generación Canvas', sublabel: 'Stitch / Tailwind', tone: 'purple' },
            { icon: '💎', label: 'Acabado Impeccable', sublabel: 'Perfección 375px', tone: 'emerald' },
          ],
          summaryNote: `Optimizado para crear interfaces memorables con terminaciones artesanales y diseño moderno.`,
        },
        mediaGallery: [
          {
            id: `m-${slugBase}-3`,
            url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
            caption: `Lienzo de diseño y componentes para ${titleFormatted}`,
            isAiGenerated: false,
          },
        ],
        cliQuickCommand: `npx skills add ${repoUrl}`,
        installCommands: {
          antigravity: `agy plugin install ${repoUrl}`,
          opencode: `npx skills add ${repoUrl}`,
          cursor: `npx skills add ${repoUrl}`,
          claudeCode: `npx skills add ${repoUrl}`,
        },
        rawMarkdown: `# ${titleFormatted} (Vibe UI Edition)
Sistema de diseño y refinamiento estético multimodal.

## Principios:
- Jerarquía visual sólida y tipografía con buen contraste.
- Estados interactivos (hover, active, focus) siempre presentes.
- Verificación en resoluciones mobile (375px) obligatoria.
`,
        repoUrl,
        compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
      };

      const generatedList: ToolVariationOption[] = [
        {
          id: 'v-criollo',
          name: '1. Criollo & Velocidad',
          badge: 'PRÁCTICO & DIRECTO',
          badgeColor: 'orange',
          icon: '🛠️',
          description: 'Metáforas de la vida cotidiana, explicaciones sin vueltas y foco en productividad inmediata.',
          tool: toolVar1,
        },
        {
          id: 'v-enterprise',
          name: '2. Arquitectura Enterprise',
          badge: 'CONTRATOS & SEGURIDAD',
          badgeColor: 'cyan',
          icon: '🛡️',
          description: 'Máximo rigor de ingeniería, contratos de tipos estrictos, tolerancia cero a regresiones y testing TDD.',
          tool: toolVar2,
        },
        {
          id: 'v-vibe',
          name: '3. Vibe UI & Prototipado',
          badge: 'DISEÑO & EXPERIENCIA',
          badgeColor: 'purple',
          icon: '✨',
          description: 'Enfocado en frontend, diseño artesanal de alta gama, auditoría multimodal y prototipado ágil.',
          tool: toolVar3,
        },
      ];

      setVariations(generatedList);
      setSelectedVariationIndex(0);
      setIsSynthesizing(false);
      onShowToast(`✨ IA generó 3 variaciones completas para "${titleFormatted}"`);
    }, 1200);
  };

  const currentOption = variations[selectedVariationIndex];
  const activeTool = currentOption?.tool;

  const handleConfirmAdd = () => {
    if (!activeTool) return;
    onAddTool(activeTool);
    onClose();
  };

  const handleUpdateActiveTool = (updated: ToolItem) => {
    const updatedList = [...variations];
    updatedList[selectedVariationIndex] = {
      ...updatedList[selectedVariationIndex],
      tool: updated,
    };
    setVariations(updatedList);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg shadow-brutal-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <header className="p-4 bg-brand-orange text-white border-b-2 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#121214] text-white border-2 border-white flex items-center justify-center font-display font-black text-sm">
              ➕
            </div>
            <div>
              <h3 className="font-display font-black text-base md:text-lg leading-none uppercase">
                Subir Herramienta al Baúl con Variaciones IA
              </h3>
              <span className="font-mono text-[10px] text-white/90 font-bold">
                GENERA MÚLTIPLES ENFOQUES: CRIOLLO, ENTERPRISE O VIBE UI
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border-2 border-black bg-white text-black font-mono font-bold text-sm shadow-brutal-sm hover:bg-neutral-100 flex items-center justify-center"
          >
            ✕
          </button>
        </header>

        {/* Modal Body */}
        <div className="p-4 md:p-6 flex-1 overflow-y-auto space-y-6">
          {/* Source Tabs */}
          <div className="space-y-3">
            <label className="font-display font-black text-xs uppercase tracking-wider block">
              1. Selecciona el Origen:
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSourceType('link')}
                className={`p-3 rounded border-2 border-black font-display font-bold text-xs flex items-center justify-center gap-2 transition ${
                  sourceType === 'link'
                    ? 'bg-[#FFD166] text-black shadow-brutal-sm'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <span>🔗</span>
                <span>Por Link o URL (GitHub, Docs, npm)</span>
              </button>

              <button
                onClick={() => setSourceType('file')}
                className={`p-3 rounded border-2 border-black font-display font-bold text-xs flex items-center justify-center gap-2 transition ${
                  sourceType === 'file'
                    ? 'bg-[#FFD166] text-black shadow-brutal-sm'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <span>📁</span>
                <span>Por Archivo (.md, .json, .txt)</span>
              </button>
            </div>
          </div>

          {/* Input based on source */}
          {sourceType === 'link' ? (
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold block">
                URL del repositorio o documentación:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://github.com/usuario/nombre-skill-o-mcp..."
                  className="flex-1 p-2.5 border-2 border-black rounded font-mono text-xs bg-neutral-50 dark:bg-neutral-900 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-500 pt-1">
                <span>Ejemplos rápidos:</span>
                <button
                  type="button"
                  onClick={() => setInputUrl('https://github.com/astral-sh/uv')}
                  className="underline hover:text-black dark:hover:text-white"
                >
                  astral-sh/uv
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setInputUrl('https://github.com/shadcn-ui/ui')}
                  className="underline hover:text-black dark:hover:text-white"
                >
                  shadcn-ui/ui
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setInputUrl('https://github.com/modelcontextprotocol/servers')}
                  className="underline hover:text-black dark:hover:text-white"
                >
                  mcp/servers
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold block">
                Arrastra o selecciona el archivo local:
              </label>
              <div className="border-2 border-dashed border-black dark:border-neutral-700 rounded-lg p-5 text-center bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 transition relative">
                <input
                  type="file"
                  accept=".md,.json,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-1">
                  <span className="text-2xl">📄</span>
                  <p className="font-display font-bold text-xs">
                    {fileName ? `Archivo seleccionado: ${fileName}` : 'Haz click para subir o arrastra tu archivo aquí'}
                  </p>
                  <p className="font-mono text-[10px] text-neutral-500">
                    Formatos soportados: Markdown (.md), JSON (.json), Texto plano (.txt)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Trigger Button */}
          <div className="pt-2">
            <button
              onClick={synthesizeToolWithAi}
              disabled={isSynthesizing}
              className="w-full py-3 bg-brand-orange text-white font-display font-black text-xs md:text-sm uppercase rounded border-2 border-black shadow-brutal-md hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isSynthesizing ? '⏳' : '🤖'}</span>
              <span>
                {isSynthesizing
                  ? 'La IA está sintetizando 3 variaciones de ficha (Criollo, Enterprise y Vibe UI)...'
                  : 'Desarrollar con IA (Generar 3 Variaciones)'}
              </span>
            </button>
          </div>

          {/* VARIATIONS SELECTOR & PREVIEW */}
          {variations.length > 0 && activeTool && (
            <div className="space-y-4 pt-2 border-t-2 border-black animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="font-display font-black text-xs uppercase tracking-wider block">
                    2. Elige el Enfoque / Variación que Prefieras:
                  </label>
                  <span className="text-[11px] font-mono text-neutral-500">
                    Cada variación adapta la analogía, el diagrama, el semáforo y los comandos al perfil del equipo.
                  </span>
                </div>
                <button
                  onClick={synthesizeToolWithAi}
                  className="text-xs font-mono font-bold text-brand-orange underline self-start sm:self-auto hover:text-orange-600"
                >
                  🔄 Regenerar Variantes
                </button>
              </div>

              {/* Variation Tabs Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {variations.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariationIndex(idx)}
                    className={`p-3 rounded border-2 border-black text-left transition flex flex-col justify-between gap-2 ${
                      selectedVariationIndex === idx
                        ? 'bg-[#FFD166] text-black shadow-brutal-sm scale-[1.01]'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-xs flex items-center gap-1.5">
                        <span>{v.icon}</span>
                        <span>{v.name}</span>
                      </span>
                      <span className="font-mono text-[8px] bg-black text-white px-1 py-0.5 rounded font-bold">
                        {v.badge}
                      </span>
                    </div>
                    <p className="text-[10px] leading-tight opacity-90 line-clamp-2">
                      {v.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Active Variation Detailed Card Preview */}
              <div className="border-2 border-black rounded-lg p-4 bg-[#FFFDF7] dark:bg-[#1A1C22] shadow-brutal-sm space-y-4">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeTool.emoji}</span>
                    <div>
                      <h4 className="font-display font-black text-sm">{activeTool.title}</h4>
                      <span className="font-mono text-[10px] text-brand-orange font-bold">
                        {activeTool.codeId} // {activeTool.phaseLabel}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-800 px-2 py-0.5 rounded font-black">
                    VARIANTE SELECCIONADA
                  </span>
                </div>

                {/* Editable Title & Tagline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1">Título:</label>
                    <input
                      type="text"
                      value={activeTool.title}
                      onChange={(e) =>
                        handleUpdateActiveTool({ ...activeTool, title: e.target.value })
                      }
                      className="w-full p-2 border border-black rounded text-xs bg-white dark:bg-neutral-900 font-display font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1">Tagline Breve:</label>
                    <input
                      type="text"
                      value={activeTool.tagline}
                      onChange={(e) =>
                        handleUpdateActiveTool({ ...activeTool, tagline: e.target.value })
                      }
                      className="w-full p-2 border border-black rounded text-xs bg-white dark:bg-neutral-900 font-sans"
                    />
                  </div>
                </div>

                {/* Editable Analogia */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-brand-orangeDark dark:text-brand-orange font-mono">
                    💡 Modo Criollo (La Analogía de esta Variante):
                  </label>
                  <textarea
                    rows={2}
                    value={activeTool.criolloAnalogy}
                    onChange={(e) =>
                      handleUpdateActiveTool({ ...activeTool, criolloAnalogy: e.target.value })
                    }
                    className="w-full p-2 border border-black rounded text-xs bg-orange-50/50 dark:bg-orange-950/20 font-sans leading-relaxed"
                  />
                </div>

                {/* Without / With Lists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-300 rounded space-y-1">
                    <span className="font-bold text-red-800 dark:text-red-300 block font-mono text-[11px]">
                      Sin esta herramienta 💀:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-neutral-700 dark:text-neutral-300">
                      {activeTool.criolloWithout.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 rounded space-y-1">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block font-mono text-[11px]">
                      Con esta herramienta 🚀:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-neutral-700 dark:text-neutral-300">
                      {activeTool.criolloWith.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Mermaid & Infographic Previews */}
                <div className="space-y-2">
                  <span className="font-mono text-[11px] font-bold block text-neutral-500 uppercase">
                    Infografía SVG de la Variante:
                  </span>
                  <SvgInfographic config={activeTool.svgConfig} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="p-4 bg-neutral-100 dark:bg-[#121316] border-t-2 border-black flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-neutral-800 font-display font-bold text-xs rounded border-2 border-black shadow-brutal-sm hover:bg-neutral-100"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmAdd}
            disabled={!activeTool}
            className="px-6 py-2 bg-[#FFD166] text-[#121214] font-display font-black text-xs md:text-sm rounded border-2 border-black shadow-brutal-sm hover:bg-yellow-400 transition disabled:opacity-50"
          >
            🚀 Elegir esta Variante y Agregar al Baúl
          </button>
        </footer>
      </div>
    </div>
  );
};
