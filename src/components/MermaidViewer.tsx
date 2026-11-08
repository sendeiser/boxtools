import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#FF6B35',
    primaryTextColor: '#FFFFFF',
    primaryBorderColor: '#121214',
    lineColor: '#121214',
    secondaryColor: '#FFD166',
    tertiaryColor: '#06D6A0',
    fontFamily: 'JetBrains Mono',
    fontSize: '12px',
  },
});

export interface MermaidViewerProps {
  readonly code: string;
  readonly className?: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ code, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      if (!containerRef.current) return;
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Error rendering Mermaid diagram:', err);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-3 bg-red-50 text-red-800 border-2 border-red-500 rounded font-mono text-xs">
              ⚠️ Error de sintaxis en el diagrama Mermaid.
            </div>
          `;
        }
      }
    };

    renderChart();
    return () => {
      isMounted = false;
    };
  }, [code]);

  return (
    <div
      ref={containerRef}
      className={`p-4 bg-white dark:bg-[#15161A] border-2 border-[#121214] dark:border-neutral-700 rounded-lg shadow-brutal-sm overflow-x-auto flex justify-center items-center ${className}`}
    />
  );
};

