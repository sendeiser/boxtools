import React from 'react';
import { SvgInfographicConfig } from '../types/boxtools';

export interface SvgInfographicProps {
  readonly config: SvgInfographicConfig;
  readonly className?: string;
}

export const SvgInfographic: React.FC<SvgInfographicProps> = ({ config, className = '' }) => {
  const getToneClasses = (tone: string) => {
    switch (tone) {
      case 'orange':
        return 'bg-orange-100 border-orange-500 text-orange-950';
      case 'cyan':
        return 'bg-cyan-100 border-cyan-500 text-cyan-950';
      case 'emerald':
        return 'bg-emerald-100 border-emerald-500 text-emerald-950';
      case 'purple':
        return 'bg-purple-100 border-purple-500 text-purple-950';
      case 'yellow':
        return 'bg-yellow-100 border-yellow-500 text-yellow-950';
      default:
        return 'bg-slate-100 border-slate-400 text-slate-900';
    }
  };

  return (
    <div className={`p-4 bg-[#FAF9F5] dark:bg-[#15161A] border-2 border-[#121214] dark:border-neutral-700 rounded-lg shadow-brutal-sm ${className}`}>
      <div className="flex items-center justify-between mb-3 border-b border-neutral-300 dark:border-neutral-800 pb-2">
        <span className="font-display font-black text-xs text-[#121214] dark:text-white uppercase flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-brand-orange inline-block"></span>
          {config.title}
        </span>
        <span className="px-2 py-0.5 bg-[#121214] text-white font-mono text-[9px] font-bold rounded">
          {config.badge}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {config.steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div
              className={`p-3 border-2 border-[#121214] rounded shadow-brutal-sm flex items-center gap-3 ${getToneClasses(
                step.tone
              )}`}
            >
              <span className="text-2xl p-1.5 bg-white dark:bg-black/30 rounded border border-black/20">
                {step.icon}
              </span>
              <div>
                <div className="font-display font-extrabold text-xs leading-tight">
                  {step.label}
                </div>
                <div className="font-mono text-[10px] opacity-80">{step.sublabel}</div>
              </div>
            </div>
            {idx < config.steps.length - 1 && (
              <div className="hidden md:flex justify-center text-brand-orange font-black text-lg select-none">
                ➔
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <p className="mt-3 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 border-t border-dashed border-neutral-300 dark:border-neutral-800 pt-2 text-center">
        💡 {config.summaryNote}
      </p>
    </div>
  );
};

