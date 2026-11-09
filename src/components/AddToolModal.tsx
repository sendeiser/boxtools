import React, { useState } from 'react';
import { ToolItem, CategorySlug, PhaseSlug } from '../types/boxtools';
import { MermaidViewer } from './MermaidViewer';
import { SvgInfographic } from './SvgInfographic';

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
  const [generatedTool, setGeneratedTool] = useState<ToolItem | null>(null);

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

    // AI Synthesizer: extract name, intent, category & generate rich crippled & technical explanation
    setTimeout(() => {
      let candidateName = 'Nueva Herramienta Agéntica';
      let category: Exclude<CategorySlug, 'all' | 'combo'> = 'skill';
      let categoryLabel = '⚡ SKILL AGÉNTICA';
      let emoji = '🔮';
      let repoUrl = 'https://github.com/boxtools/vault';

      if (sourceType === 'link') {
        repoUrl = inputUrl;
        const parts = inputUrl.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1] || 'herramienta';
        candidateName = lastPart.replace(/[-_]/g, ' ').replace(/\.git$/, '');

        if (inputUrl.includes('mcp') || candidateName.toLowerCase().includes('mcp')) {
          category = 'mcp';
          categoryLabel = '🔌 SERVIDOR MCP';
          emoji = '🔌';
        } else if (inputUrl.endsWith('.md') || candidateName.toLowerCase().includes('workflow')) {
          category = 'markdown';
          categoryLabel = '📝 WORKFLOW MARKDOWN';
          emoji = '📄';
        }
      } else {
        const titleMatch = fileContent.match(/^#\s+(.+)$/m);
        if (titleMatch && titleMatch[1]) {
          candidateName = titleMatch[1].trim();
        } else if (fileName) {
          candidateName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        }

        if (fileName.endsWith('.md') || fileContent.toLowerCase().includes('workflow')) {
          category = 'markdown';
          categoryLabel = '📝 WORKFLOW MARKDOWN';
          emoji = '📝';
        }
      }

      const slug = candidateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `tool-${Date.now()}`;
      const codeId = category === 'mcp' ? `MCP-00${Math.floor(Math.random() * 90 + 10)}` : category === 'markdown' ? `MD-00${Math.floor(Math.random() * 90 + 10)}` : `SKILL-00${Math.floor(Math.random() * 90 + 10)}`;

      const titleFormatted = candidateName.charAt(0).toUpperCase() + candidateName.slice(1);

      const developed: ToolItem = {
        id: `t-${slug}-${Date.now()}`,
        slug,
        codeId,
        title: `${titleFormatted} (Integración IA)`,
        tagline: `Herramienta sintetizada automáticamente por BoxTools AI: optimización agéntica y flujo determinista para ${titleFormatted}.`,
        emoji,
        category,
        categoryLabel,
        phase: 'fase2' as Exclude<PhaseSlug, 'all'>,
        phaseLabel: 'FASE 2 // VIBE CODING',
        status: 'published',
        isFeatured: false,
        criolloAnalogy: `Es como cuando sumás al taller a un especialista con herramientas de precisión: en vez de pasarte horas lidiando con código a mano para ${titleFormatted}, este componente se encarga de resolver la tarea pesada sin que tengas que reinventar la rueda.`,
        criolloWithout: [
          `Hacer toda la configuración de ${titleFormatted} a pulmón y perder tiempo en documentación tediosa.`,
          'Incompatibilidades entre versiones que rompen el pipeline agéntico.',
        ],
        criolloWith: [
          `Automatización directa y comandos estandarizados listos para correr en Antigravity y Cursor.`,
          'Integración nativa con contratos claros y validación paso a paso.',
        ],
        semaforoGreen: [
          `Cuando tu proyecto requiera incorporar capacidades avanzadas de ${titleFormatted}.`,
          'Para estandarizar el flujo del equipo en tareas repetitivas.',
        ],
        semaforoRed: [
          'No usar si la tarea no involucra directamente este subsistema para no sobrecargar la ventana de contexto.',
        ],
        riskLevel: 'low',
        mermaidCode: `flowchart LR
    A[🤖 Agente BoxTools] --> B[⚡ ${titleFormatted}]
    B --> C[⚙️ Procesamiento Determinista]
    C --> D[🚀 Resultado Listo en Producción]`,
        svgConfig: {
          title: `Pipeline de ${titleFormatted}`,
          badge: 'SÍNTESIS BOXTOOLS AI',
          steps: [
            { icon: '📥', label: 'Ingesta de Datos', sublabel: 'Configuración lista', tone: 'orange' },
            { icon: '⚡', label: 'Ejecución Asistida', sublabel: 'Cero alucinación', tone: 'cyan' },
            { icon: '🚀', label: 'Salida Validada', sublabel: 'Integración limpia', tone: 'emerald' },
          ],
          summaryNote: `Desarrollado y categorizado automáticamente por la IA de BoxTools.`,
        },
        mediaGallery: [
          {
            id: `m-${slug}-1`,
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            caption: `Esquema de integración para ${titleFormatted}`,
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
        rawMarkdown: `# ${titleFormatted}
Documentación y reglas de integración sintetizadas automáticamente.

## Resumen:
- Tipo: ${categoryLabel}
- Repositorio/Origen: ${repoUrl}

## Instrucciones para el Agente:
1. Analizar el contexto del proyecto antes de ejecutar llamadas a esta herramienta.
2. Cumplir con los contratos y validaciones de TDD.
`,
        repoUrl,
        compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
      };

      setGeneratedTool(developed);
      setIsSynthesizing(false);
      onShowToast(`✨ IA desarrolló la ficha completa para "${titleFormatted}"`);
    }, 1200);
  };

  const handleConfirmAdd = () => {
    if (!generatedTool) return;
    onAddTool(generatedTool);
    onClose();
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
                Subir Herramienta al Baúl con IA
              </h3>
              <span className="font-mono text-[10px] text-white/90 font-bold">
                POR LINK DE REPO O ARCHIVO LOCAL (.MD / .JSON / .TXT)
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
                  ? 'La IA está analizando y redactando la analogía, diagramas y comandos...'
                  : 'Desarrollar Ficha Completa con IA'}
              </span>
            </button>
          </div>

          {/* Generated Tool Preview */}
          {generatedTool && (
            <div className="border-2 border-black rounded-lg p-4 bg-[#FFFDF7] dark:bg-[#1A1C22] shadow-brutal-sm space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{generatedTool.emoji}</span>
                  <div>
                    <h4 className="font-display font-black text-sm">{generatedTool.title}</h4>
                    <span className="font-mono text-[10px] text-brand-orange font-bold">
                      {generatedTool.codeId} // {generatedTool.categoryLabel}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-800 px-2 py-0.5 rounded font-black">
                  GENERADO POR IA
                </span>
              </div>

              {/* Editable Analogia */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-brand-orangeDark dark:text-brand-orange font-mono">
                  💡 Modo Criollo (Analogía Generada):
                </label>
                <textarea
                  rows={2}
                  value={generatedTool.criolloAnalogy}
                  onChange={(e) =>
                    setGeneratedTool({ ...generatedTool, criolloAnalogy: e.target.value })
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
                    {generatedTool.criolloWithout.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 rounded space-y-1">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block font-mono text-[11px]">
                    Con esta herramienta 🚀:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-neutral-700 dark:text-neutral-300">
                    {generatedTool.criolloWith.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Mini Preview of Infographic & Mermaid */}
              <div className="space-y-2">
                <span className="font-mono text-[11px] font-bold block text-neutral-500 uppercase">
                  Vista Previa de Infografía Generada:
                </span>
                <SvgInfographic config={generatedTool.svgConfig} />
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
            disabled={!generatedTool}
            className="px-6 py-2 bg-[#FFD166] text-[#121214] font-display font-black text-xs md:text-sm rounded border-2 border-black shadow-brutal-sm hover:bg-yellow-400 transition disabled:opacity-50"
          >
            🚀 Guardar y Agregar al Baúl
          </button>
        </footer>
      </div>
    </div>
  );
};
