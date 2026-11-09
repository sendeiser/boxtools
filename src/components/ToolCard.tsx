import React from 'react';
import { ToolItem, ViewMode } from '../types/boxtools';

export interface ToolCardProps {
  readonly tool: ToolItem;
  readonly mode: ViewMode;
  readonly isSelectedInCombo: boolean;
  readonly onToggleCombo: (slug: string) => void;
  readonly onOpenDetail: (tool: ToolItem) => void;
  readonly onCopy: (text: string, label: string) => void;
  readonly onDeleteTool?: (slug: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  mode,
  isSelectedInCombo,
  onToggleCombo,
  onOpenDetail,
  onCopy,
  onDeleteTool,
}) => {
  return (
    <article
      className="bg-white dark:bg-[#15161A] border-[3px] border-[#121214] dark:border-neutral-700 rounded-lg shadow-brutal hover:shadow-brutal-lg transition duration-200 flex flex-col justify-between overflow-hidden"
      data-testid={`tool-card-${tool.slug}`}
    >
      {/* Top Bar: Badges & Mi Combo */}
      <div className="p-3.5 border-b-2 border-[#121214] dark:border-neutral-800 bg-[#FFFBF7] dark:bg-[#1A1C22] flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="bg-orange-100 text-orange-950 border border-orange-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
            {tool.categoryLabel}
          </span>
          <span className="bg-slate-200 text-slate-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-700">
            {tool.phaseLabel}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleCombo(tool.slug)}
            className={`text-[11px] font-mono font-bold px-2 py-1 rounded border-2 border-[#121214] shadow-brutal-sm transition ${
              isSelectedInCombo
                ? 'bg-[#FFD166] text-[#121214]'
                : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-[#FFD166]'
            }`}
          >
            {isSelectedInCombo ? '✓ En Combo' : '+ Mi Combo'}
          </button>
          {onDeleteTool && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`¿Estás seguro de que deseas eliminar "${tool.title}" del Baúl y de Supabase?`)) {
                  onDeleteTool(tool.slug);
                }
              }}
              className="text-[11px] px-1.5 py-1 rounded border-2 border-[#121214] bg-white dark:bg-neutral-800 hover:bg-red-500 hover:text-white transition shadow-brutal-xs"
              title="Eliminar herramienta"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3.5 flex-1 flex flex-col">
        {/* Title & Tagline */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-base text-[#121214] dark:text-white leading-tight">
              {tool.title}
            </h3>
            <span className="text-xl shrink-0 ml-1.5">{tool.emoji}</span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans mt-1.5 leading-relaxed line-clamp-4">
            {tool.tagline}
          </p>
        </div>

        {/* Dynamic Mode Switch View */}
        {mode === 'criollo' ? (
          <div className="space-y-2.5 flex-1 flex flex-col justify-between">
            <div className="bg-[#FFF3E8] dark:bg-[#2A1D15] border-2 border-brand-orange p-3 rounded text-xs space-y-1">
              <span className="font-bold text-brand-orange text-[10px] uppercase font-mono block">
                💡 En Criollo (La Analogía):
              </span>
              <p className="text-neutral-700 dark:text-neutral-300 leading-snug text-[11px] italic">
                "{tool.criolloAnalogy}"
              </p>
            </div>

            {/* Mini Svg Steps Preview */}
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-2 rounded font-mono text-[9px] flex items-center justify-between text-center">
              <div className="flex-1 truncate">
                <span className="block font-bold">{tool.svgConfig.steps[0].label}</span>
              </div>
              <span className="text-brand-orange font-bold px-1">➔</span>
              <div className="flex-1 truncate">
                <span className="block font-bold text-brand-orange">{tool.svgConfig.steps[1].label}</span>
              </div>
              <span className="text-brand-orange font-bold px-1">➔</span>
              <div className="flex-1 truncate">
                <span className="block font-bold text-emerald-600">{tool.svgConfig.steps[2].label}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 flex-1 flex flex-col justify-between">
            <div className="bg-[#121214] text-neutral-200 p-2.5 rounded border border-neutral-700 font-mono text-[10px] space-y-1">
              <span className="text-neutral-400 block text-[9px] uppercase">// Compatibilidad:</span>
              <div className="flex flex-wrap gap-1">
                {tool.compatibilityTags.map((tag) => (
                  <span key={tag} className="bg-neutral-800 text-brand-cyan px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* One-Click Command CLI Box */}
            <div className="flex items-center bg-[#121214] text-white rounded border border-black overflow-hidden p-1">
              <code className="px-1.5 font-mono text-[10px] text-brand-yellow flex-1 truncate">
                {tool.cliQuickCommand}
              </code>
              <button
                onClick={() => onCopy(tool.cliQuickCommand, 'Comando de Instalación')}
                className="px-2 py-0.5 bg-neutral-800 hover:bg-brand-orange text-white text-[10px] font-mono rounded transition"
              >
                Copiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Detail Link */}
      <div className="p-3 border-t-2 border-[#121214] dark:border-neutral-800 bg-neutral-50 dark:bg-[#121316] flex items-center justify-between">
        <span className="text-[10px] font-mono text-neutral-400">{tool.codeId}</span>
        <button
          onClick={() => onOpenDetail(tool)}
          className="text-xs font-display font-black text-[#121214] dark:text-white hover:text-brand-orange flex items-center gap-1 group transition"
        >
          <span>Ver Ficha + Gráficos</span>
          <span className="group-hover:translate-x-1 transition">→</span>
        </button>
      </div>
    </article>
  );
};

