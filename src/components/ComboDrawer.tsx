import React from 'react';
import { ToolItem } from '../types/boxtools';

export interface ComboDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly selectedTools: readonly ToolItem[];
  readonly onRemoveTool: (slug: string) => void;
  readonly onClearCombo: () => void;
  readonly onCopy: (text: string, label: string) => void;
}

export const ComboDrawer: React.FC<ComboDrawerProps> = ({
  isOpen,
  onClose,
  selectedTools,
  onRemoveTool,
  onClearCombo,
  onCopy,
}) => {
  if (!isOpen) return null;

  const unifiedScript = selectedTools.map((t) => t.cliQuickCommand).join('\n');

  const unifiedMcpJson = JSON.stringify(
    {
      mcpServers: selectedTools.reduce((acc, t) => {
        if (t.mcpConfigJson) {
          try {
            const parsed = JSON.parse(t.mcpConfigJson);
            return { ...acc, ...parsed.mcpServers };
          } catch {
            return acc;
          }
        }
        return acc;
      }, {}),
    },
    null,
    2
  );

  const downloadComboPlaybook = () => {
    const content = `# PLAYBOOK COMBO BOXTOOLS PERSONALIZADO

Generado automáticamente por el Armador de Setup de BoxTools.

## Herramientas Seleccionadas (${selectedTools.length}):
${selectedTools.map((t) => `- **${t.title}** (${t.categoryLabel})`).join('\n')}

---

## 1. Script Unificado de Instalación:
\`\`\`bash
${unifiedScript}
\`\`\`

---

## 2. Configuración MCP Servers Unificada:
\`\`\`json
${unifiedMcpJson}
\`\`\`

---

## 3. Resumen Operativo en Criollo:
${selectedTools.map((t) => `### ${t.title}\n> ${t.criolloAnalogy}\n`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boxtools-combo-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed inset-y-0 right-0 w-[380px] max-w-[90vw] bg-white dark:bg-[#15161A] border-l-[3px] border-[#121214] dark:border-neutral-700 shadow-[-6px_0_0_#121214] z-50 flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 border-b-[3px] border-[#121214] dark:border-neutral-800 bg-[#FFFBF7] dark:bg-[#1A1C22] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <div>
              <h3 className="font-display font-black text-sm text-[#121214] dark:text-white">
                Armador de Setup (Mi Combo)
              </h3>
              <span className="text-[10px] font-mono text-neutral-500">
                {selectedTools.length} herramientas seleccionadas
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded border-2 border-black flex items-center justify-center font-bold font-mono text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            ✕
          </button>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs">
          {selectedTools.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 space-y-2">
              <span className="text-3xl block">📭</span>
              <p className="font-sans text-xs">Tu combo está vacío.</p>
              <p className="text-[11px] text-neutral-500">
                Haz click en <strong>"+ Mi Combo"</strong> en las tarjetas para armar tu stack.
              </p>
            </div>
          ) : (
            selectedTools.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-neutral-50 dark:bg-[#1A1C22] border-2 border-[#121214] dark:border-neutral-700 rounded shadow-brutal-sm flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{t.emoji}</span>
                  <div className="truncate">
                    <div className="font-display font-bold text-xs truncate">{t.title}</div>
                    <div className="text-[10px] text-brand-orange font-bold truncate">
                      {t.categoryLabel}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveTool(t.slug)}
                  className="px-2 py-1 bg-red-100 hover:bg-red-500 hover:text-white text-red-900 border border-red-700 rounded text-[10px] font-bold transition"
                  title="Quitar del combo"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Actions */}
        {selectedTools.length > 0 && (
          <div className="p-4 border-t-[3px] border-[#121214] dark:border-neutral-800 bg-neutral-50 dark:bg-[#121316] space-y-2">
            <button
              onClick={() => onCopy(unifiedScript, 'Script Unificado')}
              className="w-full py-2 bg-[#121214] text-white font-display font-bold text-xs rounded border-2 border-black shadow-brutal-sm hover:bg-neutral-800 transition flex items-center justify-center gap-1.5"
            >
              📋 Copiar Script Unificado CLI
            </button>

            <button
              onClick={downloadComboPlaybook}
              className="w-full py-2.5 bg-brand-orange text-white font-display font-black text-xs uppercase rounded border-2 border-black shadow-brutal-sm hover:bg-orange-600 transition flex items-center justify-center gap-1.5"
            >
              📥 Descargar Playbook .md del Combo
            </button>

            <button
              onClick={onClearCombo}
              className="w-full py-1 text-center font-mono text-[11px] text-neutral-500 hover:text-red-500 transition"
            >
              Vaciar combo
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

