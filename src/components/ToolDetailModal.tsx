import React, { useState } from 'react';
import { ToolItem, ViewMode } from '../types/boxtools';
import { MermaidViewer } from './MermaidViewer';
import { SvgInfographic } from './SvgInfographic';

export interface ToolDetailModalProps {
  readonly tool: ToolItem | null;
  readonly defaultMode: ViewMode;
  readonly onClose: () => void;
  readonly onToggleCombo: (slug: string) => void;
  readonly isSelectedInCombo: boolean;
  readonly onOpenLightbox: (url: string, caption: string) => void;
  readonly onCopy: (text: string, label: string) => void;
  readonly onDeleteTool?: (slug: string) => void;
}

export const ToolDetailModal: React.FC<ToolDetailModalProps> = ({
  tool,
  defaultMode,
  onClose,
  onToggleCombo,
  isSelectedInCombo,
  onOpenLightbox,
  onCopy,
  onDeleteTool,
}) => {
  if (!tool) return null;

  const [activeTab, setActiveTab] = useState<'criollo' | 'tecnico'>(defaultMode);
  const [markdownView, setMarkdownView] = useState<'formatted' | 'raw'>('formatted');
  const [selectedCliTab, setSelectedCliTab] = useState<'antigravity' | 'opencode' | 'cursor' | 'claudeCode'>('antigravity');

  // Collapsible Sections State in Modal
  const [isMermaidOpen, setIsMermaidOpen] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(true);
  const [isMatrixOpen, setIsMatrixOpen] = useState(true);
  const [isSemaforoOpen, setIsSemaforoOpen] = useState(true);
  const [isMarkdownOpen, setIsMarkdownOpen] = useState(true);

  const downloadMarkdownFile = () => {
    const blob = new Blob([tool.rawMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tool.slug}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#15161A] border-[3px] border-[#121214] dark:border-neutral-700 rounded-lg max-w-5xl w-full max-h-[92vh] flex flex-col shadow-brutal-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="p-4 bg-[#121214] text-white flex flex-wrap items-center justify-between gap-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{tool.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-brand-orange text-white rounded">
                  {tool.categoryLabel}
                </span>
                <span className="font-mono text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
                  {tool.phaseLabel}
                </span>
              </div>
              <h2 className="font-display font-extrabold text-base md:text-lg leading-tight mt-0.5">
                {tool.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCombo(tool.slug)}
              className={`px-3 py-1.5 font-display font-bold text-xs rounded border-2 border-[#121214] shadow-brutal-sm transition ${
                isSelectedInCombo
                  ? 'bg-[#FFD166] text-[#121214]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              {isSelectedInCombo ? '✓ En Mi Combo' : '+ Mi Combo'}
            </button>
            <button
              onClick={downloadMarkdownFile}
              className="px-3 py-1.5 bg-brand-orange text-white font-display font-bold text-xs rounded border-2 border-[#121214] shadow-brutal-sm hover:bg-orange-600 transition"
            >
              📥 Descargar .md
            </button>
            {onDeleteTool && (
              <button
                onClick={() => {
                  if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente "${tool.title}" del Baúl y de Supabase?`)) {
                    onDeleteTool(tool.slug);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-display font-bold text-xs rounded border-2 border-[#121214] shadow-brutal-sm transition flex items-center gap-1.5"
                title="Eliminar herramienta del Baúl"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 bg-neutral-800 hover:bg-red-600 text-white rounded font-mono font-bold text-sm transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* View Mode Switcher Inside Modal */}
        <div className="p-3 bg-[#FFFBF7] dark:bg-[#1A1C22] border-b-2 border-[#121214] dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('criollo')}
              className={`px-4 py-1.5 rounded font-display font-black text-xs border-2 border-[#121214] shadow-brutal-sm transition ${
                activeTab === 'criollo'
                  ? 'bg-brand-orange text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              🎨 Modo Criollo (Didáctico & Gráficos)
            </button>
            <button
              onClick={() => setActiveTab('tecnico')}
              className={`px-4 py-1.5 rounded font-display font-black text-xs border-2 border-[#121214] shadow-brutal-sm transition ${
                activeTab === 'tecnico'
                  ? 'bg-brand-orange text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              💻 Modo Técnico & Markdown
            </button>
          </div>

          <a
            href={tool.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400 hover:text-brand-orange underline hidden sm:inline"
          >
            Repositorio Oficial ↗
          </a>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Full Tool Description Box */}
          <div className="p-4 bg-neutral-50 dark:bg-[#1A1C22] border-2 border-[#121214] dark:border-neutral-700 rounded-lg shadow-brutal-sm space-y-1.5">
            <span className="font-mono text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              📖 Descripción General y Propósito
            </span>
            <p className="text-sm md:text-base font-body text-neutral-800 dark:text-neutral-200 leading-relaxed">
              {tool.tagline}
            </p>
          </div>

          {activeTab === 'criollo' ? (
            <>
              {/* Analogy Box */}
              <div className="p-5 bg-orange-50 dark:bg-orange-950/20 border-[3px] border-brand-orange rounded-lg shadow-brutal-sm space-y-2">
                <div className="flex items-center gap-2 font-display font-black text-sm text-brand-orange">
                  <span>💡 EN CRIOLLO (SIN VUELTAS):</span>
                </div>
                <p className="text-sm md:text-base font-body text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  "{tool.criolloAnalogy}"
                </p>
              </div>

              {/* Infographic Steps */}
              <SvgInfographic config={tool.svgConfig} />

              {/* Mermaid Flowchart */}
              <div className="border-2 border-[#121214] dark:border-neutral-700 rounded-lg overflow-hidden shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22]">
                <div
                  onClick={() => setIsMermaidOpen(!isMermaidOpen)}
                  className="p-3 bg-neutral-100 dark:bg-[#20222A] border-b border-[#121214] dark:border-neutral-700 flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
                    📊 Diagrama de Flujo por Código (Mermaid.js)
                  </span>
                  <button className="text-xs font-mono font-bold text-neutral-500 hover:text-black dark:hover:text-white px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600">
                    {isMermaidOpen ? '▴ Ocultar Diagrama' : '▾ Ver Diagrama'}
                  </button>
                </div>
                {isMermaidOpen && (
                  <div className="p-4 min-h-[140px] flex items-center justify-center animate-in fade-in duration-150">
                    <MermaidViewer code={tool.mermaidCode} className="w-full" />
                  </div>
                )}
              </div>

              {/* Image Gallery */}
              {tool.mediaGallery.length > 0 && (
                <div className="border-2 border-[#121214] dark:border-neutral-700 rounded-lg overflow-hidden shadow-brutal-sm bg-white dark:bg-[#1A1C22]">
                  <div
                    onClick={() => setIsGalleryOpen(!isGalleryOpen)}
                    className="p-3 bg-neutral-100 dark:bg-[#20222A] border-b border-[#121214] dark:border-neutral-700 flex items-center justify-between cursor-pointer select-none"
                  >
                    <span className="font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
                      🖼️ Galería Visual ({tool.mediaGallery.length} capturas)
                    </span>
                    <button className="text-xs font-mono font-bold text-neutral-500 hover:text-black dark:hover:text-white px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600">
                      {isGalleryOpen ? '▴ Ocultar Galería' : '▾ Ver Galería'}
                    </button>
                  </div>
                  {isGalleryOpen && (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                      {tool.mediaGallery.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => onOpenLightbox(m.url, m.caption)}
                          className="group cursor-pointer border-2 border-[#121214] rounded-lg overflow-hidden shadow-brutal-sm hover:shadow-brutal transition"
                        >
                          <img
                            src={m.url}
                            alt={m.caption}
                            className="w-full h-44 object-cover group-hover:scale-105 transition duration-200"
                          />
                          <div className="p-2.5 bg-white dark:bg-neutral-800 text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
                            {m.caption}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Before vs After Matrix */}
              <div className="border-2 border-[#121214] dark:border-neutral-700 rounded-lg overflow-hidden shadow-brutal-sm bg-white dark:bg-[#1A1C22]">
                <div
                  onClick={() => setIsMatrixOpen(!isMatrixOpen)}
                  className="p-3 bg-neutral-100 dark:bg-[#20222A] border-b border-[#121214] dark:border-neutral-700 flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
                    ⚖️ Análisis de Impacto (Con vs Sin Herramienta)
                  </span>
                  <button className="text-xs font-mono font-bold text-neutral-500 hover:text-black dark:hover:text-white px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600">
                    {isMatrixOpen ? '▴ Ocultar Matriz' : '▾ Ver Matriz'}
                  </button>
                </div>
                {isMatrixOpen && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-500 rounded-lg shadow-brutal-sm space-y-2">
                      <span className="font-display font-black text-xs text-red-700 dark:text-red-400 uppercase flex items-center gap-1.5">
                        ❌ Sin esta herramienta (Dolor 💀):
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                        {tool.criolloWithout.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500 rounded-lg shadow-brutal-sm space-y-2">
                      <span className="font-display font-black text-xs text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                        ✅ Con esta herramienta (Solución 🚀):
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                        {tool.criolloWith.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Team Traffic Light */}
              <div className="border-2 border-[#121214] dark:border-neutral-700 rounded-lg overflow-hidden shadow-brutal-sm bg-white dark:bg-[#1A1C22]">
                <div
                  onClick={() => setIsSemaforoOpen(!isSemaforoOpen)}
                  className="p-3 bg-neutral-100 dark:bg-[#20222A] border-b border-[#121214] dark:border-neutral-700 flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="font-display font-black text-xs uppercase tracking-wider block">
                    🚦 Semáforo Práctico para el Equipo
                  </span>
                  <button className="text-xs font-mono font-bold text-neutral-500 hover:text-black dark:hover:text-white px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600">
                    {isSemaforoOpen ? '▴ Ocultar Semáforo' : '▾ Ver Semáforo'}
                  </button>
                </div>
                {isSemaforoOpen && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150">
                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500 rounded space-y-1">
                      <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 block">
                        🟢 Cuándo usarla sí o sí:
                      </span>
                      {tool.semaforoGreen.map((s, idx) => (
                        <p key={idx} className="text-neutral-700 dark:text-neutral-300">
                          • {s}
                        </p>
                      ))}
                    </div>
                    <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-500 rounded space-y-1">
                      <span className="font-mono font-bold text-rose-800 dark:text-rose-400 block">
                        🔴 Cuándo NO usarla / Errores comunes:
                      </span>
                      {tool.semaforoRed.map((s, idx) => (
                        <p key={idx} className="text-neutral-700 dark:text-neutral-300">
                          • {s}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Multi-IDE CLI Commands */}
              <div className="p-4 bg-white dark:bg-[#1A1C22] border-2 border-[#121214] dark:border-neutral-700 rounded-lg shadow-brutal-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-xs uppercase tracking-wider">
                    ⚡ Instalación y Comandos por Entorno
                  </span>
                  <div className="flex gap-1">
                    {(['antigravity', 'opencode', 'cursor', 'claudeCode'] as const).map((ide) => (
                      <button
                        key={ide}
                        onClick={() => setSelectedCliTab(ide)}
                        className={`px-2.5 py-1 font-mono text-[11px] font-bold rounded border border-[#121214] transition ${
                          selectedCliTab === ide
                            ? 'bg-brand-orange text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {ide.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center bg-[#121214] text-white p-2 rounded border-2 border-[#121214]">
                  <code className="flex-1 font-mono text-xs text-brand-yellow px-2 overflow-x-auto">
                    {tool.installCommands[selectedCliTab]}
                  </code>
                  <button
                    onClick={() =>
                      onCopy(
                        tool.installCommands[selectedCliTab],
                        `Comando ${selectedCliTab.toUpperCase()}`
                      )
                    }
                    className="px-3 py-1 bg-brand-orange hover:bg-orange-600 text-white font-mono text-xs font-bold rounded transition"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              {/* MCP JSON Block if present */}
              {tool.mcpConfigJson && (
                <div className="p-4 bg-white dark:bg-[#1A1C22] border-2 border-[#121214] dark:border-neutral-700 rounded-lg shadow-brutal-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-xs uppercase tracking-wider">
                      🔌 Configuración MCP Server (JSON)
                    </span>
                    <button
                      onClick={() => onCopy(tool.mcpConfigJson!, 'Configuración JSON MCP')}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-brand-orange text-white font-mono text-xs font-bold rounded transition"
                    >
                      Copiar JSON
                    </button>
                  </div>
                  <pre className="p-3 bg-[#121214] text-cyan-300 border border-neutral-700 rounded font-mono text-xs overflow-x-auto">
                    <code>{tool.mcpConfigJson}</code>
                  </pre>
                </div>
              )}

              {/* Dual Markdown Viewer */}
              <div className="border-2 border-[#121214] dark:border-neutral-700 rounded-lg overflow-hidden shadow-brutal-sm bg-white dark:bg-[#1A1C22]">
                <div className="p-3 bg-neutral-100 dark:bg-[#20222A] border-b border-[#121214] dark:border-neutral-700 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-xs uppercase tracking-wider">
                      📝 Visor de Documentación Markdown
                    </span>
                    {isMarkdownOpen && (
                      <div className="flex bg-neutral-200 dark:bg-neutral-800 p-0.5 rounded font-mono text-[10px]">
                        <button
                          onClick={() => setMarkdownView('formatted')}
                          className={`px-2 py-0.5 rounded font-bold ${
                            markdownView === 'formatted'
                              ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs'
                              : 'text-neutral-500'
                          }`}
                        >
                          Formateado
                        </button>
                        <button
                          onClick={() => setMarkdownView('raw')}
                          className={`px-2 py-0.5 rounded font-bold ${
                            markdownView === 'raw'
                              ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs'
                              : 'text-neutral-500'
                          }`}
                        >
                          Raw .md
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCopy(tool.rawMarkdown, 'Markdown Completo')}
                      className="px-2.5 py-1 bg-[#121214] hover:bg-brand-orange text-white font-mono text-xs font-bold rounded transition"
                    >
                      Copiar Markdown
                    </button>
                    <button
                      onClick={() => setIsMarkdownOpen(!isMarkdownOpen)}
                      className="text-xs font-mono font-bold text-neutral-500 hover:text-black dark:hover:text-white px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
                    >
                      {isMarkdownOpen ? '▴ Ocultar' : '▾ Ver'}
                    </button>
                  </div>
                </div>

                {isMarkdownOpen && (
                  <div className="p-4 animate-in fade-in duration-150">
                    {markdownView === 'formatted' ? (
                      <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-xs font-sans leading-relaxed space-y-2 whitespace-pre-wrap">
                        {tool.rawMarkdown}
                      </div>
                    ) : (
                      <pre className="p-4 bg-[#121214] text-neutral-300 border border-neutral-700 rounded font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                        <code>{tool.rawMarkdown}</code>
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
