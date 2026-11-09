import React, { useState, useEffect } from 'react';
import { AiSettingsConfig } from '../types/boxtools';
import { getAiConfig, saveAiConfig, testAiApiKey } from '../lib/aiService';

export interface AiSettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onShowToast: (msg: string) => void;
  readonly onConfigSaved?: (config: AiSettingsConfig) => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<AiSettingsConfig>(getAiConfig());
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getAiConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!config.apiKey.trim()) {
      setTestResult({ success: false, message: 'Ingresa una API Key para probar' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testAiApiKey(config.provider, config.apiKey);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      onShowToast(res.message);
    }
  };

  const handleSave = () => {
    saveAiConfig(config);
    if (onConfigSaved) onConfigSaved(config);
    onShowToast(`✓ Configuración de ${config.provider.toUpperCase()} guardada permanentemente`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg max-w-md w-full shadow-brutal-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#121214] text-white p-4 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔑</span>
            <div>
              <h3 className="font-display font-black text-sm uppercase text-brand-yellow">
                Ajustes de Inteligencia Artificial
              </h3>
              <p className="text-[10px] font-mono text-neutral-300">
                Conexión real con Gemini o OpenRouter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-white/10 hover:bg-white/20 text-white font-mono font-bold flex items-center justify-center rounded transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 font-mono text-xs text-[#121214] dark:text-neutral-200">
          {/* Provider selector */}
          <div>
            <label className="block font-bold mb-1.5 uppercase text-[11px]">
              Proveedor de IA:
            </label>
            <select
              value={config.provider}
              onChange={(e) => {
                const prov = e.target.value as any;
                let defaultModel = 'gemini-2.0-flash';
                if (prov === 'openrouter') defaultModel = 'google/gemini-2.0-flash-001';
                else if (prov === 'openai') defaultModel = 'gpt-4o-mini';

                setConfig({
                  ...config,
                  provider: prov,
                  modelText: defaultModel,
                });
                setTestResult(null);
              }}
              className="w-full p-2.5 border-2 border-black rounded bg-neutral-50 dark:bg-neutral-800 font-bold focus:outline-none"
            >
              <option value="gemini">Google Gemini API (Recomendado / Cuota Gratuita)</option>
              <option value="openrouter">OpenRouter (Gemini, Claude, Llama, DeepSeek)</option>
              <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
            </select>
          </div>

          {/* Model selector */}
          <div>
            <label className="block font-bold mb-1.5 uppercase text-[11px]">
              Modelo de Lenguaje:
            </label>
            {config.provider === 'gemini' ? (
              <select
                value={config.modelText}
                onChange={(e) => setConfig({ ...config, modelText: e.target.value })}
                className="w-full p-2.5 border-2 border-black rounded bg-neutral-50 dark:bg-neutral-800 font-bold focus:outline-none"
              >
                <option value="gemini-2.0-flash">gemini-2.0-flash (Ultra rápido y moderno)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash (Estable y veloz)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (Máximo razonamiento)</option>
              </select>
            ) : config.provider === 'openrouter' ? (
              <select
                value={config.modelText}
                onChange={(e) => setConfig({ ...config, modelText: e.target.value })}
                className="w-full p-2.5 border-2 border-black rounded bg-neutral-50 dark:bg-neutral-800 font-bold focus:outline-none"
              >
                <option value="google/gemini-2.0-flash-001">google/gemini-2.0-flash-001 (Económico & Rápido)</option>
                <option value="meta-llama/llama-3.3-70b-instruct">meta-llama/llama-3.3-70b-instruct (Open Source Top)</option>
                <option value="deepseek/deepseek-chat">deepseek/deepseek-chat (Alta eficiencia)</option>
                <option value="anthropic/claude-3.5-sonnet">anthropic/claude-3.5-sonnet (Máxima calidad)</option>
              </select>
            ) : (
              <select
                value={config.modelText}
                onChange={(e) => setConfig({ ...config, modelText: e.target.value })}
                className="w-full p-2.5 border-2 border-black rounded bg-neutral-50 dark:bg-neutral-800 font-bold focus:outline-none"
              >
                <option value="gpt-4o-mini">gpt-4o-mini (Económico y veloz)</option>
                <option value="gpt-4o">gpt-4o (Completo)</option>
              </select>
            )}
          </div>

          {/* API Key input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold uppercase text-[11px]">API Key:</label>
              <span className="text-[10px] text-neutral-500 font-sans">
                {config.provider === 'gemini'
                  ? 'Obténla gratis en aistudio.google.com'
                  : config.provider === 'openrouter'
                  ? 'Obténla en openrouter.ai/keys'
                  : 'Obténla en platform.openai.com'}
              </span>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => {
                  setConfig({ ...config, apiKey: e.target.value });
                  setTestResult(null);
                }}
                placeholder={
                  config.provider === 'gemini'
                    ? 'AIzaSy...'
                    : config.provider === 'openrouter'
                    ? 'sk-or-v1-...'
                    : 'sk-...'
                }
                className="w-full p-2.5 pr-10 border-2 border-black rounded bg-neutral-50 dark:bg-neutral-800 font-mono text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-black dark:hover:text-white text-xs"
                title={showKey ? 'Ocultar' : 'Mostrar'}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Test connection button and status feedback */}
          <div className="pt-1 space-y-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-2 px-3 border-2 border-black rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 font-bold text-xs shadow-brutal-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{isTesting ? '⏳' : '⚡'}</span>
              <span>{isTesting ? 'Probando conexión con la API...' : 'Probar Conexión con la API Key'}</span>
            </button>

            {testResult && (
              <div
                className={`p-2.5 rounded border-2 font-mono text-[11px] leading-snug flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-[#E6F4EA] text-[#137333] border-[#137333]'
                    : 'bg-[#FCE8E6] text-[#C5221F] border-[#C5221F]'
                }`}
              >
                <span className="text-sm shrink-0">{testResult.success ? '✅' : '⚠️'}</span>
                <div>
                  <p className="font-bold">{testResult.message}</p>
                  {testResult.success && (
                    <p className="text-[10px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                      Listo: las síntesis de herramientas usarán este modelo de IA en tiempo real.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Local Storage Permanent Persistence note */}
          <div className="p-2.5 bg-[#FFF3E8] dark:bg-[#251A14] border border-brand-orange rounded text-[10px] text-neutral-700 dark:text-neutral-300 leading-snug">
            🔒 <strong>Guardado Seguro en tu Navegador:</strong> Tu API Key se almacena localmente en tu cliente web y nunca se expone públicamente ni en los repositorios de GitHub.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-100 dark:bg-[#1A1C22] border-t-2 border-black flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-mono font-bold hover:underline"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-brand-orange text-white font-display font-black text-xs uppercase rounded border-2 border-black shadow-brutal-sm hover:translate-y-[-1px] transition"
          >
            Guardar Ajustes Permanentemente
          </button>
        </div>
      </div>
    </div>
  );
};

