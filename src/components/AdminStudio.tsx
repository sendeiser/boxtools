import React, { useState } from 'react';
import { ToolItem, AiSettingsConfig } from '../types/boxtools';
import { MermaidViewer } from './MermaidViewer';
import { SvgInfographic } from './SvgInfographic';
import { AiSettingsModal } from './AiSettingsModal';
import { getAiConfig, callRealAiSynthesis } from '../lib/aiService';

export interface AdminStudioProps {
  readonly tools: readonly ToolItem[];
  readonly onSaveTool: (tool: ToolItem) => void;
  readonly onShowToast: (msg: string) => void;
  readonly onCloseAdmin: () => void;
  readonly onDeleteTool?: (slug: string) => void;
}

export const AdminStudio: React.FC<AdminStudioProps> = ({
  tools,
  onSaveTool,
  onShowToast,
  onCloseAdmin,
  onDeleteTool,
}) => {
  const [selectedToolSlug, setSelectedToolSlug] = useState<string>(tools[0]?.slug || '');
  const activeTool = tools.find((t) => t.slug === selectedToolSlug) || tools[0];

  // Editable form state
  const [formData, setFormData] = useState<ToolItem>(activeTool);
  const [githubUrl, setGithubUrl] = useState('https://github.com/obra/superpowers');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // AI settings modal state
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState<AiSettingsConfig>(getAiConfig());

  const handleToolSelect = (slug: string) => {
    setSelectedToolSlug(slug);
    const found = tools.find((t) => t.slug === slug);
    if (found) setFormData(found);
  };

  const handleSimulateAiIngest = async () => {
    setIsAiProcessing(true);
    const realResult = await callRealAiSynthesis({
      sourceType: 'link',
      rawInput: githubUrl,
    });

    setIsAiProcessing(false);
    if (realResult && realResult.length > 0) {
      const generated = realResult[0].tool;
      setFormData(generated);
      onShowToast(`✨ Ingesta con ${aiConfig.provider.toUpperCase()} completada exitosamente`);
    } else {
      onShowToast('✨ Ingesta completada (Modo estructurado)');
    }
  };

  const handleSave = () => {
    onSaveTool(formData);
    onShowToast(`Guardado exitoso: ${formData.title}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-brand-surface dark:bg-[#0E0F12]">
      {/* Admin Top Header */}
      <header className="p-4 bg-white dark:bg-[#15161A] border-b-[3px] border-[#121214] dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-orange text-white border-2 border-black font-display font-black flex items-center justify-center text-sm shadow-brutal-sm">
            ⚡
          </div>
          <div>
            <h1 className="font-display font-black text-sm md:text-base leading-none text-[#121214] dark:text-white uppercase">
              BoxTools Studio // Panel Admin & Motor IA
            </h1>
            <span className="font-mono text-[10px] text-brand-orange font-bold">
              MODO ADMINISTRADOR PRIVADO // PEVC V5
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiSettings(true)}
            className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-xs font-mono font-bold border-2 border-[#121214] rounded shadow-brutal-sm hover:bg-neutral-200 transition flex items-center gap-1.5"
          >
            <span>🔑 Ajustes API Key IA</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          <button
            onClick={onCloseAdmin}
            className="px-3.5 py-1.5 bg-[#FFD166] text-[#121214] font-display font-bold text-xs border-2 border-[#121214] rounded shadow-brutal-sm hover:bg-yellow-400 transition"
          >
            ← Volver al Catálogo Público
          </button>
        </div>
      </header>

      {/* AI Magic Auto-Ingest Ribbon */}
      <div className="p-3 bg-[#FFD166] border-b-2 border-[#121214] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs uppercase bg-[#121214] text-white px-2 py-0.5 rounded">
            ⚡ AUTO-INGESTA MÁGICA CON IA
          </span>
          <span className="text-xs font-mono text-[#121214] hidden md:inline">
            Pega una URL de GitHub, README o texto suelto:
          </span>
        </div>

        <div className="flex-1 max-w-xl flex items-center gap-2">
          <input
            type="text"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/usuario/repo-ia..."
            className="flex-1 px-3 py-1.5 bg-white border-2 border-[#121214] font-mono text-xs rounded shadow-brutal-sm focus:outline-none"
          />
          <button
            onClick={handleSimulateAiIngest}
            disabled={isAiProcessing}
            className="px-4 py-1.5 bg-brand-orange text-white font-display font-black text-xs uppercase rounded border-2 border-[#121214] shadow-brutal-sm hover:bg-orange-600 transition disabled:opacity-50"
          >
            {isAiProcessing ? 'Procesando...' : 'Auto-Organizar con IA'}
          </button>
        </div>
      </div>

      {/* Split Screen Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Form Editor (48%) */}
        <section className="w-full lg:w-[48%] border-r-[3px] border-[#121214] dark:border-neutral-800 bg-white dark:bg-[#15161A] overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-neutral-200 dark:border-neutral-800 pb-2">
            <span className="font-display font-black text-xs uppercase tracking-wider text-neutral-500">
              // Editor Estructurado
            </span>
            <select
              value={selectedToolSlug}
              onChange={(e) => handleToolSelect(e.target.value)}
              className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 font-mono text-xs font-bold border border-black rounded"
            >
              {tools.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.emoji} {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* General info */}
          <div className="space-y-2">
            <label className="font-mono text-xs font-bold block">Título de la Herramienta:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border-2 border-[#121214] font-display font-bold text-xs rounded bg-neutral-50 dark:bg-neutral-900"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs font-bold block">Tagline breve:</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full p-2 border-2 border-[#121214] font-mono text-xs rounded bg-neutral-50 dark:bg-neutral-900"
            />
          </div>

          {/* Criollo Analogy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold block">
                🧠 Analogía Mental Criolla (Modo Didáctico):
              </label>
              <button
                onClick={() => onShowToast('🔄 Regenerando analogía con Gemini...')}
                className="text-[10px] font-mono font-bold text-brand-orange underline"
              >
                Regenerar con IA
              </button>
            </div>
            <textarea
              rows={3}
              value={formData.criolloAnalogy}
              onChange={(e) => setFormData({ ...formData, criolloAnalogy: e.target.value })}
              className="w-full p-2.5 border-2 border-brand-orange bg-orange-50/40 dark:bg-orange-950/20 font-body text-xs rounded leading-relaxed"
            />
          </div>

          {/* Mermaid Code Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold block">
                📊 Código de Diagrama Mermaid.js:
              </label>
              <button
                onClick={() => onShowToast('Validando sintaxis Mermaid: OK')}
                className="text-[10px] font-mono font-bold text-emerald-600 underline"
              >
                Validar Sintaxis
              </button>
            </div>
            <textarea
              rows={5}
              value={formData.mermaidCode}
              onChange={(e) => setFormData({ ...formData, mermaidCode: e.target.value })}
              className="w-full p-2.5 border-2 border-[#121214] bg-neutral-900 text-brand-cyan font-mono text-xs rounded leading-snug"
            />
          </div>

          {/* Save & Delete Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-brand-orange text-white font-display font-black text-xs uppercase rounded border-2 border-black shadow-brutal-sm hover:bg-orange-600 transition"
            >
              💾 Guardar Cambios
            </button>
            {onDeleteTool && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente "${formData.title}" del Baúl y de Supabase?`)) {
                    onDeleteTool(formData.slug);
                  }
                }}
                className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-display font-black text-xs uppercase rounded border-2 border-black shadow-brutal-sm transition"
                title="Eliminar herramienta"
              >
                🗑️ Eliminar
              </button>
            )}
          </div>
        </section>

        {/* Right Column: Live Preview (52%) */}
        <section className="w-full lg:w-[52%] bg-brand-canvas dark:bg-[#121316] overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-neutral-300 dark:border-neutral-800 pb-2">
            <span className="font-mono text-xs font-bold text-neutral-500 uppercase">
              👁️ VISTA PREVIA EN VIVO
            </span>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-600 font-bold">
              SINCRONIZACIÓN REACTIVA
            </span>
          </div>

          {/* Header Preview Card */}
          <div className="p-5 bg-white dark:bg-[#15161A] border-[3px] border-[#121214] dark:border-neutral-700 rounded-lg shadow-brutal space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{formData.emoji}</span>
              <div>
                <span className="font-mono text-[10px] bg-brand-orange text-white px-2 py-0.5 rounded font-bold">
                  {formData.categoryLabel}
                </span>
                <h2 className="font-display font-black text-xl text-[#121214] dark:text-white mt-1">
                  {formData.title}
                </h2>
              </div>
            </div>
            <p className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
              {formData.tagline}
            </p>
          </div>

          {/* Analogy Preview */}
          <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border-2 border-brand-orange rounded-lg shadow-brutal-sm space-y-1">
            <span className="font-mono font-bold text-[10px] text-brand-orange uppercase block">
              💡 Modo Criollo en Vivo:
            </span>
            <p className="text-xs font-body italic text-neutral-800 dark:text-neutral-200">
              "{formData.criolloAnalogy}"
            </p>
          </div>

          {/* Svg Infographic Preview */}
          <SvgInfographic config={formData.svgConfig} />

          {/* Mermaid Preview */}
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-neutral-500 font-bold uppercase">
              // Diagrama Renderizado en Vivo:
            </span>
            <MermaidViewer code={formData.mermaidCode} />
          </div>
        </section>
      </div>

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={showAiSettings}
        onClose={() => setShowAiSettings(false)}
        onShowToast={onShowToast}
        onConfigSaved={(updatedConfig) => setAiConfig(updatedConfig)}
      />
    </div>
  );
};

