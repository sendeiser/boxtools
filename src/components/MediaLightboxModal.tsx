import React from 'react';
import { ToolMediaItem } from '../types/boxtools';

export interface MediaLightboxModalProps {
  readonly media: ToolMediaItem | null;
  readonly onClose: () => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({ media, onClose }) => {
  if (!media) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#15161A] border-[3px] border-[#121214] dark:border-neutral-700 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-brutal-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 bg-[#121214] text-white flex items-center justify-between border-b-2 border-black">
          <span className="font-mono text-xs font-bold text-brand-orange">
            📸 Visor de Imagen / Supabase Storage
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-neutral-800 hover:bg-brand-orange text-white rounded font-bold font-mono text-xs transition"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-neutral-100 dark:bg-black/40">
          <img
            src={media.url}
            alt={media.caption}
            className="max-h-[65vh] w-auto object-contain border-2 border-[#121214] rounded shadow-brutal"
          />
        </div>

        <div className="p-4 bg-white dark:bg-[#15161A] border-t-2 border-[#121214] dark:border-neutral-800 space-y-1">
          <p className="font-display font-bold text-sm text-[#121214] dark:text-white">
            {media.caption}
          </p>
          {media.promptUsed && (
            <p className="font-mono text-[11px] text-neutral-500">
              <span className="font-bold text-brand-orange">Prompt IA:</span> "{media.promptUsed}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

