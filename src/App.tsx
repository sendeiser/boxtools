import React, { useState, useEffect } from 'react';
import {
  CategorySlug,
  PhaseSlug,
  ViewMode,
  ActiveSection,
  ToolItem,
  ToolMediaItem,
} from './types/boxtools';
import { INITIAL_TOOLS, INITIAL_COMBOS } from './data/mockData';
import { fetchAllToolsMerged, persistNewTool, deleteTool, testSupabaseConnection } from './lib/toolService';
import { fetchAiConfigFromDatabase } from './lib/aiService';
import { ToolCard } from './components/ToolCard';
import { ToolDetailModal } from './components/ToolDetailModal';
import { ComboDrawer } from './components/ComboDrawer';
import { MediaLightboxModal } from './components/MediaLightboxModal';
import { AdminStudio } from './components/AdminStudio';
import { VibeGuideSection } from './components/VibeGuideSection';
import { AddToolModal } from './components/AddToolModal';
import { PublicationsHubSection } from './components/PublicationsHubSection';

const VALID_SECTIONS: readonly ActiveSection[] = [
  'vault',
  'publications',
  'pevc',
  'repomix-v7',
  'vibe-guide',
  'combos',
  'onboarding',
  'admin',
];

function getInitialSectionFromHash(): ActiveSection {
  try {
    const hash = window.location.hash.replace(/^#\/?/, '').trim() as ActiveSection;
    if (VALID_SECTIONS.includes(hash)) return hash;
  } catch {
    /* ignore */
  }
  return 'vault';
}

export const App: React.FC = () => {
  // Global View States
  const [tools, setTools] = useState<readonly ToolItem[]>(INITIAL_TOOLS);
  const [viewMode, setViewMode] = useState<ViewMode>('criollo');
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug>('all');
  const [selectedPhase, setSelectedPhase] = useState<PhaseSlug>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // App Sections (sincronizado con URL hash para conservar vista al recargar)
  const [currentSection, setCurrentSectionState] = useState<ActiveSection>(() =>
    getInitialSectionFromHash()
  );

  const setCurrentSection = (section: ActiveSection) => {
    setCurrentSectionState(section);
    try {
      const nextHash = section === 'vault' ? '' : `#${section}`;
      if (window.location.hash !== nextHash) {
        if (nextHash) {
          window.history.replaceState(null, '', nextHash);
        } else {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const onHashChange = () => {
      setCurrentSectionState(getInitialSectionFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Interactive Modals & Drawers
  const [activeDetailTool, setActiveDetailTool] = useState<ToolItem | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<ToolMediaItem | null>(null);
  const [isComboDrawerOpen, setIsComboDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddToolModalOpen, setIsAddToolModalOpen] = useState(false);
  const [selectedComboSlugs, setSelectedComboSlugs] = useState<readonly string[]>([
    'superpowers',
    'stitch-mcp',
    'impeccable',
  ]);

  // Retractable Sidebar & Collapsible Components State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('boxtools_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('boxtools_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const [openNavGroups, setOpenNavGroups] = useState({
    vistas: true,
    categorias: true,
    fases: true,
  });

  const toggleNavGroup = (key: 'vistas' | 'categorias' | 'fases') => {
    setOpenNavGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [isHeroCollapsed, setIsHeroCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('boxtools_hero_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleHero = () => {
    setIsHeroCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('boxtools_hero_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const [openPevcFases, setOpenPevcFases] = useState({
    f0: true,
    f1: true,
    f2: true,
    f3: true,
  });

  const togglePevcPhase = (key: 'f0' | 'f1' | 'f2' | 'f3') => {
    setOpenPevcFases((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllPevcFases = (expand: boolean) => {
    setOpenPevcFases({
      f0: expand,
      f1: expand,
      f2: expand,
      f3: expand,
    });
  };

  // Keyboard Shortcuts (Ctrl+B / Cmd+B for sidebar, Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input-desktop') || document.getElementById('search-input-mobile');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cloud Connection Status
  const [isCloudConnected, setIsCloudConnected] = useState<boolean | null>(null);

  // Load tools from LocalStorage + Supabase Cloud on mount
  useEffect(() => {
    fetchAllToolsMerged().then((loaded) => {
      if (loaded && loaded.length > 0) {
        setTools(loaded);
      }
    });

    testSupabaseConnection().then((connected) => {
      setIsCloudConnected(connected);
    });

    fetchAiConfigFromDatabase();
  }, []);

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`✓ Copiado: ${label}`);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleComboItem = (slug: string) => {
    if (selectedComboSlugs.includes(slug)) {
      setSelectedComboSlugs(selectedComboSlugs.filter((s) => s !== slug));
      showToast('Removido de tu Combo');
    } else {
      setSelectedComboSlugs([...selectedComboSlugs, slug]);
      showToast('Agregado a tu Combo');
    }
  };

  // Filter Logic
  const filteredTools = tools.filter((tool) => {
    const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesPhase = selectedPhase === 'all' || tool.phase === selectedPhase;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      query === '' ||
      tool.title.toLowerCase().includes(query) ||
      tool.tagline.toLowerCase().includes(query) ||
      tool.criolloAnalogy.toLowerCase().includes(query) ||
      tool.compatibilityTags.some((t) => t.toLowerCase().includes(query));

    return matchesCat && matchesPhase && matchesQuery;
  });

  const selectedComboTools = tools.filter((t) => selectedComboSlugs.includes(t.slug));

  const handleAddTool = async (newTool: ToolItem) => {
    // 1. Limpiar filtros para garantizar que la nueva herramienta se visualice de inmediato
    setSelectedCategory('all');
    setSelectedPhase('all');
    setSearchQuery('');

    // 2. Insertar al principio del catálogo en pantalla
    setTools((prev) => [newTool, ...prev.filter((t) => t.slug !== newTool.slug)]);
    setActiveDetailTool(newTool);

    // 3. Persistir en almacenamiento dual (Local + Supabase Cloud)
    const res = await persistNewTool(newTool);
    if (res.supabaseSuccess) {
      setIsCloudConnected(true);
      showToast(`🎉 "${newTool.title}" sincronizada en Supabase Cloud`);
    } else {
      showToast(`💾 "${newTool.title}" guardada localmente (permanente)`);
    }
  };

  const handleDeleteTool = async (slug: string) => {
    const target = tools.find((t) => t.slug === slug);
    const title = target?.title || slug;

    // 1. Quitar inmediatamente de la vista en pantalla
    setTools((prev) => prev.filter((t) => t.slug !== slug));
    setSelectedComboSlugs((prev) => prev.filter((s) => s !== slug));

    if (activeDetailTool?.slug === slug) {
      setActiveDetailTool(null);
    }

    // 2. Eliminar de Supabase Cloud y de LocalStorage
    const res = await deleteTool(slug);
    if (res.supabaseSuccess) {
      showToast(`🗑️ "${title}" eliminada de Supabase Cloud`);
    } else {
      showToast(`🗑️ "${title}" eliminada del catálogo`);
    }
  };

  return (
    <div className={`h-full flex flex-col font-sans selection:bg-brand-orange selection:text-white ${isDarkMode ? 'dark' : ''}`}>
      {currentSection === 'admin' ? (
        <AdminStudio
          tools={tools}
          onSaveTool={async (updated) => {
            setTools((prev) => {
              const exists = prev.some((t) => t.slug === updated.slug);
              return exists ? prev.map((t) => (t.slug === updated.slug ? updated : t)) : [updated, ...prev];
            });
            await persistNewTool(updated);
            showToast(`Guardado exitoso: ${updated.title}`);
          }}
          onDeleteTool={handleDeleteTool}
          onShowToast={showToast}
          onCloseAdmin={() => setCurrentSection('vault')}
        />
      ) : (
        <div className="flex h-full overflow-hidden bg-[#FFFDF7] dark:bg-[#0E0F12] text-[#121214] dark:text-[#F4F4F0]">
          {/* ========================================= */}
          {/* 1. LEFT FIXED SIDEBAR ("Índice del Manual") */}
          {/* ========================================= */}
          <aside
            className={`${
              isSidebarCollapsed ? 'w-[76px]' : 'w-[280px]'
            } shrink-0 h-full border-r-[3px] border-[#121214] dark:border-neutral-800 bg-white dark:bg-[#15161A] flex flex-col justify-between z-30 select-none shadow-[2px_0_0_#121214] hidden md:flex transition-all duration-300 ease-in-out`}
            data-testid="main-sidebar"
          >
            {/* Top Brand Header */}
            {isSidebarCollapsed ? (
              <div className="p-3 border-b-[3px] border-[#121214] dark:border-neutral-800 bg-[#FFFBF7] dark:bg-[#1A1C22] flex flex-col items-center">
                <div
                  onClick={toggleSidebar}
                  className="w-10 h-10 bg-brand-orange border-2 border-black shadow-brutal-xs flex items-center justify-center font-display font-black text-white text-base rotate-[-2deg] cursor-pointer hover:rotate-0 transition"
                  title="Expandir menú lateral (Ctrl+B)"
                >
                  BX
                </div>
                <button
                  onClick={toggleSidebar}
                  className="mt-2 w-8 h-7 rounded border-2 border-[#121214] bg-[#FFD166] text-black font-mono font-bold text-xs flex items-center justify-center shadow-brutal-xs hover:bg-yellow-400 transition"
                  title="Expandir menú lateral (Ctrl+B)"
                >
                  ▶
                </button>
                <div className="mt-2" title={isCloudConnected ? 'Supabase Conectado' : 'Modo Local'}>
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-brand-orange'
                    }`}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 border-b-[3px] border-[#121214] dark:border-neutral-800 bg-[#FFFBF7] dark:bg-[#1A1C22]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-brand-orange border-2 border-black shadow-brutal-sm flex items-center justify-center font-display font-black text-white text-lg rotate-[-2deg]">
                      BX
                    </div>
                    <div>
                      <span className="font-display font-black tracking-tight text-base leading-none block">
                        BOXTOOLS
                      </span>
                      <span className="font-mono text-[10px] tracking-widest text-brand-orange font-bold">
                        AI VAULT // V5.2
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold border-2 border-[#121214] px-1.5 py-0.5 shadow-brutal-sm ${
                        isCloudConnected
                          ? 'bg-[#E6F4EA] text-[#137333] dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-[#FFF3E8] text-brand-orange dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-brand-orange'
                        }`}
                      ></span>
                      {isCloudConnected ? 'SUPABASE' : 'LOCAL'}
                    </span>
                    <button
                      onClick={toggleSidebar}
                      className="w-7 h-7 rounded border-2 border-[#121214] bg-white dark:bg-neutral-800 hover:bg-[#FFD166] text-black dark:text-white flex items-center justify-center font-mono font-bold text-xs shadow-brutal-xs transition"
                      title="Contraer menú lateral (Ctrl+B)"
                    >
                      ◀
                    </button>
                  </div>
                </div>

                {/* PEVC V5 Ready Badge */}
                <div
                  onClick={() => setCurrentSection('pevc')}
                  className="mt-2 bg-[#FFD166] text-[#121214] border-2 border-[#121214] p-2 shadow-brutal-sm flex items-center justify-between cursor-pointer hover:bg-yellow-400 transition"
                >
                  <div className="flex items-center gap-1.5 font-display font-bold text-xs">
                    <span>⚡</span>
                    <span>PEVC V5 READY</span>
                  </div>
                  <span className="font-mono text-[9px] bg-[#121214] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                    5 Fases
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Groups */}
            {isSidebarCollapsed ? (
              <div className="flex-1 overflow-y-auto p-2 space-y-3 flex flex-col items-center">
                {/* Compact Nav Icons */}
                {[
                  { id: 'vault', label: 'Explorador del Baúl', icon: '🗃️', count: tools.length },
                  { id: 'publications', label: 'Publicaciones & Links (IA)', icon: '📰', badge: 'IA' },
                  { id: 'pevc', label: 'PEVC V5 (Creación)', icon: '📘', badge: '5F' },
                  { id: 'repomix-v7', label: 'Continuidad V7', icon: '📦', badge: 'V7' },
                  { id: 'vibe-guide', label: 'Jerga & Markdowns', icon: '💡', badge: 'Guía' },
                  { id: 'combos', label: 'Combos & Recetas', icon: '🎒', count: INITIAL_COMBOS.length },
                  { id: 'onboarding', label: 'Ruta Onboarding', icon: '🧭', badge: '15m' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentSection(item.id as any)}
                    className={`w-11 h-11 rounded-lg border-2 border-[#121214] flex items-center justify-center text-lg relative shadow-brutal-xs transition ${
                      currentSection === item.id
                        ? 'bg-brand-orange text-white ring-2 ring-brand-orange/40'
                        : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-[#FFD166] hover:text-black'
                    }`}
                    title={`${item.label} ${item.count !== undefined ? `(${item.count})` : ''}`}
                  >
                    <span>{item.icon}</span>
                    {item.count !== undefined && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#121214] text-white text-[8px] font-mono font-bold px-1 py-0.2 rounded-full border border-white">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}

                <div className="w-8 border-b-2 border-neutral-300 dark:border-neutral-700 my-1" />

                {/* Compact Categories */}
                <div className="space-y-1.5 flex flex-col items-center" title="Categorías">
                  {[
                    { slug: 'all', icon: '🗂️', label: 'Todos los Activos' },
                    { slug: 'skill', icon: '⚡', label: 'Skills Agénticas' },
                    { slug: 'mcp', icon: '🔌', label: 'Servidores MCP' },
                    { slug: 'markdown', icon: '📝', label: 'Workflows .md' },
                  ].map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedCategory(cat.slug as any)}
                      className={`w-9 h-9 rounded border-2 border-[#121214] flex items-center justify-center text-sm shadow-brutal-xs transition ${
                        selectedCategory === cat.slug
                          ? 'bg-brand-orange text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-[#FFD166] hover:text-black'
                      }`}
                      title={`Filtrar por: ${cat.label}`}
                    >
                      <span>{cat.icon}</span>
                    </button>
                  ))}
                </div>

                <div className="w-8 border-b-2 border-neutral-300 dark:border-neutral-700 my-1" />

                {/* Compact Phases */}
                <div className="space-y-1 flex flex-col items-center" title="Filtrar por Fase PEVC">
                  {['fase0', 'fase1', 'fase2', 'fase3', 'fase4'].map((ph, idx) => (
                    <button
                      key={ph}
                      onClick={() => setSelectedPhase(selectedPhase === ph ? 'all' : (ph as PhaseSlug))}
                      className={`w-9 h-6 rounded border font-mono text-[9px] font-black shadow-brutal-xs transition flex items-center justify-center ${
                        selectedPhase === ph
                          ? 'bg-brand-orange text-white border-black'
                          : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-black'
                      }`}
                      title={`Fase ${idx} PEVC`}
                    >
                      F{idx}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-medium">
                {/* Group: Vistas Principales */}
                <div>
                  <button
                    onClick={() => toggleNavGroup('vistas')}
                    className="w-full flex items-center justify-between text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 px-2 mb-1.5 font-mono font-extrabold text-[10px] tracking-wider uppercase transition"
                  >
                    <span>// Vistas Principales</span>
                    <span className="text-xs">{openNavGroups.vistas ? '▾' : '▸'}</span>
                  </button>
                  {openNavGroups.vistas && (
                    <nav className="space-y-1 animate-in fade-in duration-150">
                      <button
                        onClick={() => setCurrentSection('vault')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded border-2 border-[#121214] font-bold shadow-brutal-sm transition ${
                          currentSection === 'vault'
                            ? 'bg-brand-orange text-white'
                            : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>🗃️</span> Explorador del Baúl
                        </span>
                        <span className="bg-black/20 text-[10px] px-1.5 py-0.5 rounded font-mono">
                          {tools.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentSection('publications')}
                        data-testid="nav-publications-btn"
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded border-2 border-[#121214] font-bold shadow-brutal-sm transition ${
                          currentSection === 'publications'
                            ? 'bg-brand-orange text-white'
                            : 'bg-[#FFF7EE] dark:bg-neutral-800 text-[#121214] dark:text-neutral-200 hover:bg-[#FFD166]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>📰</span> Publicaciones & Links
                        </span>
                        <span className="font-mono text-[9px] bg-[#121214] text-white px-1.5 py-0.5 rounded font-bold">
                          IA + Manual
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentSection('pevc')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition ${
                          currentSection === 'pevc'
                            ? 'border-[#121214] bg-neutral-100 dark:bg-neutral-800 font-bold'
                            : 'border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>📘</span> PEVC V5 (Creación)
                        </span>
                        <span className="font-mono text-[9px] text-brand-orange font-bold">5 Fases</span>
                      </button>

                      <button
                        onClick={() => setCurrentSection('repomix-v7')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition ${
                          currentSection === 'repomix-v7'
                            ? 'border-[#121214] bg-cyan-100 dark:bg-cyan-950/50 font-bold text-cyan-900 dark:text-cyan-200'
                            : 'border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>📦</span> Continuidad V7
                        </span>
                        <span className="font-mono text-[9px] bg-cyan-200 text-cyan-950 px-1 rounded font-bold">Repomix</span>
                      </button>

                      <button
                        onClick={() => setCurrentSection('vibe-guide')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition ${
                          currentSection === 'vibe-guide'
                            ? 'border-[#121214] bg-[#FFD166] text-[#121214] font-bold shadow-brutal-xs'
                            : 'border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>💡</span> Jerga & Markdowns
                        </span>
                        <span className="font-mono text-[9px] bg-orange-100 text-orange-950 px-1 rounded font-bold">Guía</span>
                      </button>

                      <button
                        onClick={() => setCurrentSection('combos')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition ${
                          currentSection === 'combos'
                            ? 'border-[#121214] bg-neutral-100 dark:bg-neutral-800 font-bold'
                            : 'border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>🎒</span> Combos & Recetas
                        </span>
                        <span className="bg-purple-100 text-purple-900 font-mono text-[9px] px-1 rounded font-bold">
                          {INITIAL_COMBOS.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentSection('onboarding')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition ${
                          currentSection === 'onboarding'
                            ? 'border-[#121214] bg-neutral-100 dark:bg-neutral-800 font-bold'
                            : 'border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>🧭</span> Ruta de Onboarding
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 font-mono text-[9px] px-1 rounded font-bold">
                          15 min
                        </span>
                      </button>
                    </nav>
                  )}
                </div>

                {/* Group: Categorías */}
                <div>
                  <button
                    onClick={() => toggleNavGroup('categorias')}
                    className="w-full flex items-center justify-between text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 px-2 mb-1.5 font-mono font-extrabold text-[10px] tracking-wider uppercase transition"
                  >
                    <span>// Categorías Baúl</span>
                    <span className="text-xs">{openNavGroups.categorias ? '▾' : '▸'}</span>
                  </button>
                  {openNavGroups.categorias && (
                    <div className="space-y-1 font-mono text-[11px] animate-in fade-in duration-150">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition ${
                          selectedCategory === 'all'
                            ? 'bg-[#121214] text-white font-bold'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <span>Todos los Activos</span>
                        <span>{tools.length}</span>
                      </button>
                      <button
                        onClick={() => setSelectedCategory('skill')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition ${
                          selectedCategory === 'skill'
                            ? 'bg-brand-orange text-white font-bold'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <span>⚡ Skills Agénticas</span>
                        <span>{tools.filter((t) => t.category === 'skill').length}</span>
                      </button>
                      <button
                        onClick={() => setSelectedCategory('mcp')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition ${
                          selectedCategory === 'mcp'
                            ? 'bg-brand-orange text-white font-bold'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <span>🔌 Servidores MCP</span>
                        <span>{tools.filter((t) => t.category === 'mcp').length}</span>
                      </button>
                      <button
                        onClick={() => setSelectedCategory('markdown')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition ${
                          selectedCategory === 'markdown'
                            ? 'bg-brand-orange text-white font-bold'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <span>📝 Workflows .md</span>
                        <span>{tools.filter((t) => t.category === 'markdown').length}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Group: Fases PEVC V5 */}
                <div>
                  <button
                    onClick={() => toggleNavGroup('fases')}
                    className="w-full flex items-center justify-between text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 px-2 mb-1.5 font-mono font-extrabold text-[10px] tracking-wider uppercase transition"
                  >
                    <span>// Ciclo de Vida PEVC V5</span>
                    <span className="text-xs">{openNavGroups.fases ? '▾' : '▸'}</span>
                  </button>
                  {openNavGroups.fases && (
                    <div className="space-y-1 font-mono text-[10px] animate-in fade-in duration-150">
                      {[
                        { slug: 'fase0', label: 'Fase 0: Contexto & Arq' },
                        { slug: 'fase1', label: 'Fase 1: Especificación Spec' },
                        { slug: 'fase2', label: 'Fase 2: Vibe UI (Stitch/Imp)' },
                        { slug: 'fase3', label: 'Fase 3: DB Cloud & TDD' },
                        { slug: 'fase4', label: 'Fase 4: QA E2E & Release' },
                      ].map((phase) => (
                        <button
                          key={phase.slug}
                          onClick={() =>
                            setSelectedPhase(selectedPhase === phase.slug ? 'all' : (phase.slug as PhaseSlug))
                          }
                          className={`w-full text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                            selectedPhase === phase.slug
                              ? 'border-brand-orange bg-orange-50 dark:bg-orange-950/40 font-bold text-brand-orange'
                              : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <span>{phase.label}</span>
                          <span>
                            {tools.filter((t) => t.phase === phase.slug).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sidebar Bottom Footer: Admin Panel Shortcut */}
            <div className="p-3 border-t-[3px] border-[#121214] dark:border-neutral-800 bg-neutral-50 dark:bg-[#121316]">
              {isSidebarCollapsed ? (
                <button
                  onClick={() => setCurrentSection('admin')}
                  className="w-11 h-11 mx-auto rounded border-2 border-[#121214] bg-white dark:bg-[#1E1F24] hover:bg-[#FFD166] text-sm font-bold shadow-brutal-xs flex items-center justify-center relative transition"
                  title="Panel Admin & Motor IA"
                >
                  <span>⚙️</span>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-white dark:border-black"></span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentSection('admin')}
                  className="w-full flex items-center justify-between p-2.5 rounded border-2 border-[#121214] bg-white dark:bg-[#1E1F24] hover:bg-neutral-100 text-xs font-bold shadow-brutal-sm transition"
                >
                  <div className="flex items-center gap-2">
                    <span>⚙️</span>
                    <span className="font-display">Panel Admin & Motor IA</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </button>
              )}
            </div>
          </aside>

          {/* ========================================= */}
          {/* 2. MAIN WORKSPACE AREA                   */}
          {/* ========================================= */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Navigation Bar: Responsive 2-Row on Mobile, 1-Row on Desktop */}
            <header className="border-b-[3px] border-[#121214] dark:border-neutral-800 bg-white dark:bg-[#15161A] px-3 md:px-6 py-2.5 md:py-0 md:h-[68px] flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-3 z-20 shrink-0">
              {/* Row 1 on Mobile: Logo + Menu Drawer + Sidebar Toggle + Mi Combo + Theme */}
              <div className="flex items-center justify-between gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  {/* Mobile Drawer Trigger */}
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden w-8 h-8 rounded border-2 border-[#121214] bg-[#FFD166] flex items-center justify-center font-black text-sm shadow-brutal-sm"
                    title="Abrir Menú"
                  >
                    ☰
                  </button>

                  {/* Desktop Retract/Expand Toggle Button */}
                  <button
                    onClick={toggleSidebar}
                    className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded border-2 border-[#121214] bg-white dark:bg-[#1E1F24] hover:bg-[#FFD166] text-black dark:text-white hover:text-black font-display font-black text-xs shadow-brutal-sm transition"
                    title={isSidebarCollapsed ? "Expandir barra lateral (Ctrl+B)" : "Retraer barra lateral (Ctrl+B)"}
                  >
                    <span>{isSidebarCollapsed ? '▶' : '◀'}</span>
                    <span className="text-[10px] font-mono tracking-tight">{isSidebarCollapsed ? 'EXPANDIR' : 'RETRAER'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 md:hidden">
                    <div className="w-7 h-7 bg-brand-orange border-2 border-black shadow-brutal-sm flex items-center justify-center font-display font-black text-white text-xs">
                      BX
                    </div>
                    <span className="font-display font-black tracking-tight text-xs">
                      BOXTOOLS
                    </span>
                  </div>
                </div>

                {/* Search Box on Desktop */}
                <div className="hidden md:flex flex-1 max-w-md relative">
                  <input
                    id="search-input-desktop"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar skill, mcp, analogía o comando..."
                    className="w-full pl-9 pr-16 py-2 border-2 border-[#121214] dark:border-neutral-700 rounded bg-[#FAFAFA] dark:bg-[#1E1F24] font-mono text-xs shadow-brutal-sm focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-neutral-400">🔍</span>
                  <span className="absolute right-2.5 top-2 text-[10px] font-mono bg-neutral-200 dark:bg-neutral-700 px-1 rounded">
                    Ctrl+K
                  </span>
                </div>

                {/* Right controls on Mobile Row 1 */}
                <div className="flex items-center gap-2">
                  {isCloudConnected !== null && (
                    <div
                      className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-[#121214] rounded text-[11px] font-mono font-bold shadow-brutal-sm ${
                        isCloudConnected
                          ? 'bg-[#E6F4EA] text-[#137333] dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-[#FFF3E8] text-brand-orange dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                      title={
                        isCloudConnected
                          ? 'Supabase Cloud activo y sincronizado en tiempo real'
                          : 'Almacenamiento Local persistente activo'
                      }
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-brand-orange'
                        }`}
                      />
                      <span>{isCloudConnected ? 'SUPABASE CONECTADO' : 'MODO LOCAL'}</span>
                    </div>
                  )}

                  <button
                    onClick={() => setCurrentSection('publications')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 md:py-2 border-2 border-[#121214] rounded font-display font-black text-xs shadow-brutal-sm hover:translate-y-[-1px] transition ${
                      currentSection === 'publications'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-950 hover:bg-purple-200'
                    }`}
                    title="Abrir Muro de Publicaciones & Links (GitHub, Videos, Tutoriales)"
                    data-testid="header-publications-btn"
                  >
                    <span>📰</span>
                    <span className="hidden sm:inline">Publicaciones</span>
                  </button>

                  <button
                    onClick={() => setIsAddToolModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 md:py-2 border-2 border-[#121214] rounded bg-brand-orange text-white font-display font-black text-xs shadow-brutal-sm hover:translate-y-[-1px] transition"
                    title="Subir Herramienta al Baúl con IA"
                  >
                    <span>➕</span>
                    <span className="hidden sm:inline">Subir con IA</span>
                  </button>

                  <button
                    onClick={() => setIsComboDrawerOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 md:py-2 border-2 border-[#121214] rounded bg-[#FFD166] text-[#121214] font-display font-black text-xs shadow-brutal-sm hover:translate-y-[-1px] transition"
                  >
                    <span>🎒</span>
                    <span className="hidden sm:inline">Mi Combo</span>
                    <span className="w-5 h-5 rounded-full bg-[#121214] text-white flex items-center justify-center font-mono text-[10px]">
                      {selectedComboSlugs.length}
                    </span>
                  </button>

                  <button
                    onClick={toggleDarkMode}
                    className="w-8 h-8 md:w-9 md:h-9 border-2 border-[#121214] rounded bg-white dark:bg-[#1E1F24] flex items-center justify-center shadow-brutal-sm"
                    title="Alternar Tema"
                  >
                    {isDarkMode ? '☀️' : '🌙'}
                  </button>
                </div>
              </div>

              {/* Row 2 on Mobile: Full Search + Clean Criollo/Técnico Switch */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                {/* Search Box on Mobile */}
                <div className="flex-1 md:hidden relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar herramientas..."
                    className="w-full pl-8 pr-2 py-1.5 border-2 border-[#121214] dark:border-neutral-700 rounded bg-[#FAFAFA] dark:bg-[#1E1F24] font-mono text-xs shadow-brutal-sm focus:outline-none"
                  />
                  <span className="absolute left-2.5 top-2 text-neutral-400 text-xs">🔍</span>
                </div>

                {/* Master Mode Switch: Criollo vs Técnico */}
                <div className="bg-[#121214] p-1 rounded-lg border-2 border-[#121214] flex items-center shadow-brutal-sm shrink-0">
                  <button
                    onClick={() => setViewMode('criollo')}
                    className={`flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded font-display font-black text-[11px] md:text-xs transition ${
                      viewMode === 'criollo'
                        ? 'bg-brand-orange text-white shadow-xs'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    <span>🎨</span>
                    <span>CRIOLLO</span>
                  </button>
                  <button
                    onClick={() => setViewMode('tecnico')}
                    className={`flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded font-display font-black text-[11px] md:text-xs transition ${
                      viewMode === 'tecnico'
                        ? 'bg-brand-orange text-white shadow-xs'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    <span>💻</span>
                    <span>TÉCNICO</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Main Scrollable Canvas */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 grid-dots">
              {currentSection === 'vault' && (
                <>
                  {/* Hero Banner PEVC V5 (Collapsible) */}
                  <section className="border-[3px] border-[#121214] dark:border-neutral-800 rounded-lg bg-white dark:bg-[#15161A] shadow-brutal-lg overflow-hidden transition-all duration-200">
                    <div className="bg-[#121214] text-white px-4 md:px-5 py-2.5 flex items-center justify-between border-b-2 border-black gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-brand-orange uppercase">
                          MANUAL OFICIAL PEVC V5 // FRAMEWORK DE INGENIERÍA IA
                        </span>
                        <span className="font-mono text-xs text-brand-yellow font-bold hidden sm:inline">
                          ⚡ 100% Cero Alucinaciones
                        </span>
                      </div>
                      <button
                        onClick={toggleHero}
                        className="px-2.5 py-1 rounded border-2 border-neutral-700 bg-neutral-900 hover:bg-[#FFD166] text-white hover:text-black font-mono text-[11px] font-bold flex items-center gap-1.5 transition shadow-brutal-xs"
                        title={isHeroCollapsed ? "Expandir banner explicativo" : "Contraer banner para ver más herramientas"}
                      >
                        <span>{isHeroCollapsed ? '▾' : '▴'}</span>
                        <span>{isHeroCollapsed ? 'Expandir Banner' : 'Contraer Banner'}</span>
                      </button>
                    </div>

                    {!isHeroCollapsed ? (
                      <div className="p-6 flex flex-col xl:flex-row gap-6 items-start justify-between animate-in fade-in duration-200">
                        <div className="xl:max-w-[45%] space-y-3">
                          <span className="inline-block px-2.5 py-1 bg-orange-100 text-brand-orangeDark border border-brand-orange font-mono text-[11px] font-bold rounded">
                            🏆 PROTOCOLO ESTÁNDAR DEL EQUIPO
                          </span>
                          <h1 className="font-display font-extrabold text-2xl lg:text-3xl tracking-tight leading-tight">
                            PEVC V5: <span className="text-brand-orange underline decoration-wavy">Vibe Coding Profesional</span>
                          </h1>
                          <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                            {viewMode === 'criollo'
                              ? 'No le tires código a ciegas a la IA. La metodología PEVC es como construir una casa: primero planos con el arquitecto (Contexto), compras los materiales exactos (Spec), pegas ladrillos en tandas chicas (Vibe Coding), revisas grietas con la plomada (QA), y recién entregas la llave (Deploy).'
                              : 'Pipeline determinista por fases con contratos semánticos: context_anchor.md -> specs_spec.md -> incremental_diffs -> jest/playwright_audit -> atomic_squash_merge.'}
                          </p>

                          <div className="pt-2 flex flex-wrap gap-2.5">
                            <button
                              onClick={() => setCurrentSection('pevc')}
                              className="px-4 py-2 bg-brand-orange text-white font-display font-bold text-xs rounded border-2 border-[#121214] shadow-brutal-sm hover:bg-orange-600 transition"
                            >
                              Abrir PEVC V5 (Creación)
                            </button>
                            <button
                              onClick={() => setCurrentSection('repomix-v7')}
                              className="px-3.5 py-2 bg-cyan-100 dark:bg-cyan-950/40 text-cyan-950 dark:text-cyan-200 font-display font-bold text-xs rounded border-2 border-[#121214] shadow-brutal-sm hover:bg-cyan-200 transition"
                            >
                              📦 Workflow Continuidad V7
                            </button>
                            <button
                              onClick={() => setCurrentSection('vibe-guide')}
                              className="px-3.5 py-2 bg-orange-100 dark:bg-orange-950/40 text-brand-orangeDark dark:text-brand-orange font-display font-bold text-xs rounded border-2 border-[#121214] shadow-brutal-sm hover:bg-orange-200 transition"
                            >
                              💡 Jerga & Markdowns
                            </button>
                            <button
                              onClick={() => setCurrentSection('publications')}
                              className="px-3.5 py-2 bg-purple-100 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 font-display font-black text-xs rounded border-2 border-[#121214] shadow-brutal-sm hover:bg-purple-200 transition"
                            >
                              📰 Muro Publicaciones & Links
                            </button>
                            <button
                              onClick={() => setIsAddToolModalOpen(true)}
                              className="px-3.5 py-2 bg-[#FFD166] text-[#121214] font-display font-black text-xs rounded border-2 border-[#121214] shadow-brutal-sm hover:bg-yellow-400 transition"
                            >
                              ➕ Subir con IA (Link/Archivo)
                            </button>
                          </div>
                        </div>

                        {/* 5-Phase Interactive Pipeline Roadmap */}
                        <div className="xl:flex-1 w-full bg-[#FAF9F5] dark:bg-[#111215] border-2 border-[#121214] dark:border-neutral-700 p-4 rounded-lg shadow-brutal-sm">
                          <div className="flex items-center justify-between mb-3 border-b border-neutral-300 dark:border-neutral-800 pb-2">
                            <span className="font-mono text-xs font-bold flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-brand-orange"></span>
                              PIPELINE DE LAS 5 FASES PEVC
                            </span>
                            <span className="font-mono text-[10px] text-neutral-500 uppercase">
                              Flujo Obligatorio
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-[10px]">
                            {[
                              { f: 'F0', name: 'Arquitectura', icon: '🗺️', desc: 'Mirar el mapa antes de cavar' },
                              { f: 'F1', name: 'Especificación', icon: '📐', desc: 'Pedir la hamburguesa sin cebolla' },
                              { f: 'F2', name: 'Vibe UI & Code', icon: '🎨', desc: 'Stitch + Impeccable' },
                              { f: 'F3', name: 'DB & QA E2E', icon: '🧪', desc: 'Supabase Cloud + Playwright' },
                              { f: 'F4', name: 'Git & Release', icon: '🚀', desc: 'Clean PR y merge a main' },
                            ].map((step, idx) => (
                              <div
                                key={step.f}
                                onClick={() => setSelectedPhase(step.f.toLowerCase() as PhaseSlug)}
                                className="p-2.5 bg-white dark:bg-[#1A1C22] border-2 border-[#121214] rounded shadow-brutal-sm cursor-pointer hover:border-brand-orange transition"
                              >
                                <div className="flex justify-between font-bold">
                                  <span>{step.f}</span>
                                  <span>{step.icon}</span>
                                </div>
                                <div className="font-display font-black text-xs text-[#121214] dark:text-white mt-1">
                                  {step.name}
                                </div>
                                <p className="text-[9px] text-neutral-500 mt-1 line-clamp-2">
                                  {step.desc}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-[#FFFBF7] dark:bg-[#1A1C22] flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-orange-100 text-brand-orangeDark border border-brand-orange font-mono text-[10px] font-bold rounded">
                            🏆 PROTOCOLO ESTÁNDAR
                          </span>
                          <span className="font-display font-extrabold text-xs md:text-sm text-neutral-800 dark:text-neutral-200">
                            PEVC V5: <span className="text-brand-orange">Vibe Coding Profesional</span> (5 Fases)
                          </span>
                          <span className="text-neutral-500 text-xs hidden lg:inline font-mono">
                            — Contexto ➔ Spec ➔ Vibe UI (Stitch/Imp) ➔ Supabase TDD ➔ Deploy
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentSection('pevc')}
                            className="px-3 py-1 bg-brand-orange text-white font-display font-bold text-xs rounded border-2 border-[#121214] shadow-brutal-xs hover:bg-orange-600 transition"
                          >
                            Abrir Metodología →
                          </button>
                          <button
                            onClick={toggleHero}
                            className="text-neutral-600 dark:text-neutral-300 hover:text-brand-orange font-mono text-xs font-bold underline"
                          >
                            Expandir Banner ▾
                          </button>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Filter Status Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#15161A] p-3 rounded border-2 border-[#121214] dark:border-neutral-800 shadow-brutal-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xs">Filtro Activo:</span>
                      <span className="bg-[#121214] text-white px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                        {selectedCategory.toUpperCase()} | {selectedPhase.toUpperCase()} ({filteredTools.length})
                      </span>
                      {(selectedCategory !== 'all' || selectedPhase !== 'all' || searchQuery !== '') && (
                        <button
                          onClick={() => {
                            setSelectedCategory('all');
                            setSelectedPhase('all');
                            setSearchQuery('');
                          }}
                          className="text-xs text-brand-orange hover:underline font-bold ml-1 font-mono"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>

                    <div className="text-xs font-mono text-neutral-500">
                      Visualizando: <strong className="text-black dark:text-white">{filteredTools.length}</strong> herramientas
                    </div>
                  </div>

                  {/* Main Tool Grid (3 Columns) */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display font-black text-xl tracking-tight flex items-center gap-2">
                        <span>EXPLORADOR DEL BAÚL</span>
                        <span className="text-brand-orange">//</span>
                        <span className="text-xs font-mono text-neutral-500 font-normal">
                          Fichas Didácticas e Implementaciones Técnicas
                        </span>
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredTools.map((tool) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          mode={viewMode}
                          isSelectedInCombo={selectedComboSlugs.includes(tool.slug)}
                          onToggleCombo={toggleComboItem}
                          onOpenDetail={setActiveDetailTool}
                          onCopy={handleCopy}
                          onDeleteTool={handleDeleteTool}
                        />
                      ))}
                    </div>
                  </section>
                </>
              )}

              {/* SECTION: PUBLICATIONS & LINKS HUB */}
              {currentSection === 'publications' && (
                <PublicationsHubSection
                  viewMode={viewMode}
                  onCopy={handleCopy}
                  onShowToast={showToast}
                />
              )}

              {/* SECTION: WORKFLOW PEVC V5 */}
              {currentSection === 'pevc' && (
                <section className="p-6 bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg shadow-brutal-lg space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-3 gap-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-brand-orange uppercase">
                        // Metodología Maestra
                      </span>
                      <h2 className="font-display font-black text-2xl">PEVC V5: Vibe Coding Profesional</h2>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <button
                          onClick={() => toggleAllPevcFases(true)}
                          className="px-2.5 py-1 border border-black rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-[#FFD166] text-black dark:text-white hover:text-black font-bold transition shadow-brutal-xs"
                          title="Expandir todas las fases"
                        >
                          ▾ Expandir Todo
                        </button>
                        <button
                          onClick={() => toggleAllPevcFases(false)}
                          className="px-2.5 py-1 border border-black rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-[#FFD166] text-black dark:text-white hover:text-black font-bold transition shadow-brutal-xs"
                          title="Contraer todas las fases"
                        >
                          ▴ Contraer Todo
                        </button>
                      </div>
                      <button
                        onClick={() => setCurrentSection('vault')}
                        className="px-3 py-1.5 bg-[#FFD166] border-2 border-black font-bold text-xs rounded shadow-brutal-sm hover:bg-yellow-400 transition"
                      >
                        ← Volver al Baúl
                      </button>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none text-xs md:text-sm leading-relaxed space-y-4 font-sans">
                    <p className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-brand-orange rounded font-bold">
                      💡 Regla Categórica: "Prohibido programar la lógica funcional sin que antes el usuario haya aprobado las capturas finales del diseño tomadas por Playwright y pulidas por Impeccable."
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Fase 0 */}
                      <div className="border-2 border-black rounded shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22] overflow-hidden transition">
                        <div
                          onClick={() => togglePevcPhase('f0')}
                          className="p-3 bg-neutral-100 dark:bg-[#20222A] border-b border-black flex items-center justify-between cursor-pointer select-none"
                        >
                          <h3 className="font-display font-black text-sm m-0">Fase 0: Instalación de las Skills & MCPs</h3>
                          <button className="text-xs font-mono font-bold text-neutral-500 hover:text-black dark:hover:text-white">
                            {openPevcFases.f0 ? '▴ Contraer' : '▾ Expandir'}
                          </button>
                        </div>
                        {openPevcFases.f0 && (
                          <div className="p-4 animate-in fade-in duration-150">
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 m-0">
                              Verificación obligatoria de herramientas: Superpowers, ECC, Stitch MCP, Supabase Cloud (cero Docker), Playwright, Frontend Design y UI/UX Pro Max.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Fase 1 */}
                      <div className="border-2 border-black rounded shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22] overflow-hidden transition">
                        <div
                          onClick={() => togglePevcPhase('f1')}
                          className="p-3 bg-neutral-100 dark:bg-[#20222A] border-b border-black flex items-center justify-between cursor-pointer select-none"
                        >
                          <h3 className="font-display font-black text-sm m-0">Fase 1: Entrevista Exhaustiva Brainstorming</h3>
                          <button className="text-xs font-mono font-bold text-neutral-500 hover:text-black dark:hover:text-white">
                            {openPevcFases.f1 ? '▴ Contraer' : '▾ Expandir'}
                          </button>
                        </div>
                        {openPevcFases.f1 && (
                          <div className="p-4 animate-in fade-in duration-150">
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 m-0">
                              Interrogatorio socrático para erradicar cualquier hueco lógico, definir la pila, elegir la estrategia UI/UX y crear 01-arquitectura-y-spec.md.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Fase 2: Suite Vibe UI */}
                      <div className="md:col-span-2 border-[3px] border-[#121214] dark:border-neutral-700 rounded-lg shadow-brutal bg-[#FFFDF7] dark:bg-[#1A1C22] overflow-hidden transition">
                        <div
                          onClick={() => togglePevcPhase('f2')}
                          className="p-4 bg-purple-50/70 dark:bg-purple-950/30 border-b-2 border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎨</span>
                            <div>
                              <h3 className="font-display font-black text-base text-[#121214] dark:text-white m-0">
                                Fase 2: Diseño UI/UX — Frontend Design, UI/UX Pro Max o Mezcla de las Dos
                              </h3>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 m-0">
                                Las 2 opciones oficiales de diseño y su integración armónica hacia Google Stitch MCP e Impeccable.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="bg-purple-100 text-purple-950 border border-purple-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                              VIBE UI SUITE
                            </span>
                            <button className="text-xs font-mono font-bold text-purple-800 dark:text-purple-300 underline">
                              {openPevcFases.f2 ? '▴ Contraer Suite' : '▾ Expandir Suite'}
                            </button>
                          </div>
                        </div>

                        {openPevcFases.f2 && (
                          <div className="p-5 space-y-4 animate-in fade-in duration-200">
                            {/* 3 Pillars of Design: Opción A, Opción B, Opción C */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                              {/* Opción 1: frontend-design */}
                              <div className="p-3.5 border-2 border-[#121214] dark:border-neutral-700 rounded bg-white dark:bg-[#15161A] flex flex-col justify-between space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-mono text-[10px] font-extrabold text-cyan-700 dark:text-cyan-400 uppercase">
                                      // OPCIÓN 1: ARQUITECTURA
                                    </span>
                                    <span className="text-base">📐</span>
                                  </div>
                                  <h4 className="font-display font-black text-sm m-0">frontend-design</h4>
                                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-1 leading-snug">
                                    Ideal para diseñar la estructura formal del sistema: pliego de tokens, escalas tipográficas proporcionales, espaciados y redacción del Prompt Maestro hiperdetallado para Stitch.
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    const found = tools.find((t) => t.slug === 'frontend-design');
                                    if (found) setActiveDetailTool(found);
                                  }}
                                  className="w-full text-center py-1.5 px-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-950 font-mono text-[10px] font-bold border-2 border-black rounded shadow-brutal-xs transition"
                                >
                                  Ver Ficha frontend-design →
                                </button>
                              </div>

                              {/* Opción 2: ui-ux-pro-max */}
                              <div className="p-3.5 border-2 border-[#121214] dark:border-neutral-700 rounded bg-white dark:bg-[#15161A] flex flex-col justify-between space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-mono text-[10px] font-extrabold text-brand-orange uppercase">
                                      // OPCIÓN 2: INTELIGENCIA
                                    </span>
                                    <span className="text-base">✨</span>
                                  </div>
                                  <h4 className="font-display font-black text-sm m-0">ui-ux-pro-max</h4>
                                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-1 leading-snug">
                                    Motor de búsqueda por CLI Python con 192 paletas de producto fundamentadas, 79 estilos visuales (bento, neo-brutal, minimal) y 119 reglas de accesibilidad WCAG.
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    const found = tools.find((t) => t.slug === 'ui-ux-pro-max');
                                    if (found) setActiveDetailTool(found);
                                  }}
                                  className="w-full text-center py-1.5 px-2 bg-orange-100 hover:bg-orange-200 text-orange-950 font-mono text-[10px] font-bold border-2 border-black rounded shadow-brutal-xs transition"
                                >
                                  Ver Ficha ui-ux-pro-max →
                                </button>
                              </div>

                              {/* Opción 3: La Mezcla de las Dos (Híbrido) */}
                              <div className="p-3.5 border-2 border-brand-orange rounded bg-[#FFF7EE] dark:bg-[#251A14] flex flex-col justify-between space-y-3 relative overflow-hidden">
                                <div className="absolute -right-6 top-3 rotate-45 bg-brand-orange text-white text-[8px] font-mono font-bold px-6 py-0.5">
                                  TOP
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-mono text-[10px] font-extrabold text-purple-700 dark:text-purple-400 uppercase">
                                      // LA MEZCLA (RECOMENDADA)
                                    </span>
                                    <span className="text-base">⚡🎨</span>
                                  </div>
                                  <h4 className="font-display font-black text-sm m-0">Dúo Dinámico UI/UX</h4>
                                  <p className="text-[11px] text-neutral-700 dark:text-neutral-300 mt-1 leading-snug">
                                    La combinación suprema: 1) <strong>ui-ux-pro-max</strong> investiga el nicho y paleta cromática; 2) <strong>frontend-design</strong> estructura la guía de componentes y prompt maestro de Stitch.
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    const found = tools.find((t) => t.slug === 'diseno-hibrido-vibe');
                                    if (found) setActiveDetailTool(found);
                                  }}
                                  className="w-full text-center py-1.5 px-2 bg-brand-orange hover:bg-brand-orangeDark text-white font-mono text-[10px] font-bold border-2 border-black rounded shadow-brutal-xs transition"
                                >
                                  Ver Flujo Híbrido Completo →
                                </button>
                              </div>
                            </div>

                            {/* Next Steps in Phase 2 */}
                            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-[11px] text-neutral-700 dark:text-neutral-300 flex items-center justify-between flex-wrap gap-2">
                              <span className="font-mono font-bold">
                                ➔ Siguiente en Fase 2: Inyectar a <strong>Google Stitch MCP</strong> y auditar con <strong>Playwright + Impeccable (1440px / 768px / 375px)</strong>.
                              </span>
                              <span className="bg-[#121214] text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                                CERO PROGRAMAR SIN APROBACIÓN VISUAL
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Fase 3 */}
                      <div className="border-2 border-black rounded shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22] overflow-hidden transition">
                        <div
                          onClick={() => togglePevcPhase('f3')}
                          className="p-3 bg-neutral-100 dark:bg-[#20222A] border-b border-black flex items-center justify-between cursor-pointer select-none"
                        >
                          <h3 className="font-display font-black text-sm m-0">Fase 3: Supabase Cloud & Semáforo TDD</h3>
                          <button className="text-xs font-mono font-bold text-neutral-500 hover:text-black dark:hover:text-white">
                            {openPevcFases.f3 ? '▴ Contraer' : '▾ Expandir'}
                          </button>
                        </div>
                        {openPevcFases.f3 && (
                          <div className="p-4 animate-in fade-in duration-150">
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 m-0">
                              Conexión a base de datos Postgres sin Docker y desarrollo guiado por pruebas (Rojo ➔ Verde ➔ Azul).
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-cyan-50 dark:bg-cyan-950/20 border-2 border-cyan-600 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                      <div>
                        <p className="font-bold text-cyan-900 dark:text-cyan-200 text-xs">
                          📦 ¿No estás creando desde cero y necesitas retomar un proyecto existente?
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                          Para proyectos existentes utiliza el <strong>Workflow V7 Continuidad con Repomix</strong> para absorber el contexto 360° sin romper nada.
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentSection('repomix-v7')}
                        className="shrink-0 px-3 py-1.5 bg-cyan-600 text-white font-mono text-xs font-bold rounded shadow-brutal-sm hover:bg-cyan-700 transition"
                      >
                        Abrir Workflow V7 →
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* SECTION: WORKFLOW CONTINUIDAD V7 (REPOMIX) */}
              {currentSection === 'repomix-v7' && (
                <section className="p-6 bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg shadow-brutal-lg space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-black pb-3 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase">
                          // WORKFLOW INDEPENDIENTE // RETOMAR & AUDITAR PROYECTOS
                        </span>
                        <span className="bg-cyan-100 text-cyan-900 border border-cyan-800 text-[10px] font-mono px-2 py-0.5 rounded font-black">
                          V7 REPOMIX
                        </span>
                      </div>
                      <h2 className="font-display font-black text-2xl mt-1">
                        Workflow V7: Continuidad & Contexto Profundo
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const repomixTool = tools.find((t) => t.slug === 'system-rol-repomix-v7');
                          if (repomixTool) handleCopy(repomixTool.rawMarkdown, 'system_rol_and_analysis_spec.md');
                        }}
                        className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border-2 border-black font-bold text-xs rounded shadow-brutal-sm hover:bg-neutral-200 transition"
                      >
                        📋 Copiar Spec .md
                      </button>
                      <button
                        onClick={() => setCurrentSection('vault')}
                        className="px-3 py-1.5 bg-[#FFD166] border-2 border-black font-bold text-xs rounded shadow-brutal-sm hover:bg-yellow-400 transition"
                      >
                        ← Volver al Baúl
                      </button>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none text-xs md:text-sm leading-relaxed space-y-5 font-sans">
                    {/* Comparison Callout */}
                    <div className="p-4 bg-cyan-50 dark:bg-cyan-950/20 border-2 border-cyan-600 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-cyan-900 dark:text-cyan-200 text-xs md:text-sm">
                          ⚡ ¿Por qué es un workflow aparte de PEVC V5?
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                          <strong>PEVC V5</strong> está diseñado para construir productos <strong>desde cero (de 0 a 1)</strong> mediante ideación y maquetación inicial. <strong>V7 Continuidad</strong> está diseñado específicamente para <strong>entrar a repositorios existentes</strong>, entender la historia del código con <code>repomix</code> y continuar exactamente desde el último hito sin romper nada.
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentSection('pevc')}
                        className="shrink-0 px-3 py-1.5 bg-white dark:bg-neutral-900 border border-cyan-800 text-cyan-950 dark:text-cyan-100 font-mono text-[11px] font-bold rounded shadow-xs hover:bg-cyan-100 transition"
                      >
                        Ver PEVC V5 (0 a 1) →
                      </button>
                    </div>

                    <p className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-600 rounded font-bold text-red-900 dark:text-red-200">
                      🛑 Regla Categórica V7: "ESTRICTAMENTE PROHIBIDO alterar la arquitectura base, la pila tecnológica existente o los estilos visuales aprobados. Es obligatorio ejecutar Fase -1 con Repomix y plantear la pregunta de continuidad antes de tocar una sola línea de código."
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border-2 border-black rounded shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22]">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-black text-sm">Fase -1: Análisis Masivo con Repomix</h3>
                          <span className="font-mono text-[10px] bg-orange-100 text-orange-900 px-1.5 py-0.5 rounded font-bold">npx repomix</span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2">
                          Empaqueta todo el repositorio en un único contexto estructurado para que el agente entienda dependencias reales, arquitectura de carpetas, specs previas y deudas técnicas.
                        </p>
                      </div>

                      <div className="p-4 border-2 border-black rounded shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22]">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-black text-sm">Fase 0: Verificación de Skills & MCPs</h3>
                          <span className="font-mono text-[10px] bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-bold">Tooling</span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2">
                          Verifica la disponibilidad de Repomix, Superpowers (SDLC), ECC (AgentShield), Stitch MCP, Impeccable, Supabase Cloud (cero Docker) y Playwright.
                        </p>
                      </div>

                      <div className="p-4 border-2 border-black rounded shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22]">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-black text-sm">Fase 1: Diagnóstico & Checkpoint Obligatorio</h3>
                          <span className="font-mono text-[10px] bg-cyan-100 text-cyan-900 px-1.5 py-0.5 rounded font-bold">Pregunta</span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2">
                          El agente presenta el informe de situación y realiza la pregunta textual: <em>"He completado el análisis exhaustivo del repositorio utilizando Repomix... ¿Confirmamos continuar exactamente desde este punto?"</em>.
                        </p>
                      </div>

                      <div className="p-4 border-2 border-black rounded shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22]">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-black text-sm">Fase 2 & 3: Worktrees, TDD & Cierre</h3>
                          <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">Cero Roturas</span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2">
                          Aislamiento en Git Worktrees, TDD sistemático (Rojo ➔ Verde ➔ Azul), control visual multimodal con Playwright e Impeccable, y validación E2E con AgentShield.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          const repomixTool = tools.find((t) => t.slug === 'system-rol-repomix-v7');
                          if (repomixTool) setActiveDetailTool(repomixTool);
                        }}
                        className="px-4 py-2 bg-cyan-600 text-white font-display font-bold text-xs rounded border-2 border-[#121214] shadow-brutal-sm hover:bg-cyan-700 transition"
                      >
                        Ver Ficha Completa + Diagramas de V7 →
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* SECTION: VIBE GUIDE (JERGA Y MARKDOWNS) */}
              {currentSection === 'vibe-guide' && (
                <VibeGuideSection
                  onOpenVault={() => setCurrentSection('vault')}
                  onCopy={handleCopy}
                />
              )}

              {/* SECTION: COMBOS */}
              {currentSection === 'combos' && (
                <section className="p-6 bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg shadow-brutal-lg space-y-6">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-purple-600 uppercase">
                        // Stacks Prearmados
                      </span>
                      <h2 className="font-display font-black text-2xl">Combos & Recetas del Equipo</h2>
                    </div>
                    <button
                      onClick={() => setCurrentSection('vault')}
                      className="px-3 py-1.5 bg-[#FFD166] border-2 border-black font-bold text-xs rounded shadow-brutal-sm"
                    >
                      ← Volver al Baúl
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {INITIAL_COMBOS.map((combo) => (
                      <div
                        key={combo.id}
                        className="p-5 border-2 border-[#121214] rounded-lg shadow-brutal bg-neutral-50 dark:bg-[#1A1C22] flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-purple-200 text-purple-900 border border-purple-800 rounded">
                            {combo.toolSlugs.length} Herramientas
                          </span>
                          <h3 className="font-display font-black text-base mt-2">{combo.title}</h3>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono mt-1">
                            {combo.subtitle}
                          </p>

                          <div className="p-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded my-3 text-xs italic">
                            "{combo.criolloSummary}"
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedComboSlugs(combo.toolSlugs);
                            setIsComboDrawerOpen(true);
                            showToast(`Combo cargado: ${combo.title}`);
                          }}
                          className="w-full py-2 bg-[#121214] text-white font-display font-bold text-xs rounded hover:bg-brand-orange transition"
                        >
                          Cargar este Combo al Armador
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SECTION: ONBOARDING */}
              {currentSection === 'onboarding' && (
                <section className="p-6 bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg shadow-brutal-lg space-y-6">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-600 uppercase">
                        // Academia Rápida para Nuevos
                      </span>
                      <h2 className="font-display font-black text-2xl">Ruta de Onboarding: Domina el Vibe Coding</h2>
                    </div>
                    <button
                      onClick={() => setCurrentSection('vault')}
                      className="px-3 py-1.5 bg-[#FFD166] border-2 border-black font-bold text-xs rounded shadow-brutal-sm"
                    >
                      ← Volver al Baúl
                    </button>
                  </div>

                  <div className="space-y-4 font-body text-xs md:text-sm">
                    <div className="p-4 border-2 border-[#121214] rounded bg-emerald-50 dark:bg-emerald-950/20">
                      <h3 className="font-display font-black text-base text-emerald-800 dark:text-emerald-300">
                        1. ¿Qué es una Skill vs un MCP vs un Workflow?
                      </h3>
                      <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                        • <strong>Skill:</strong> Es el conocimiento o manual de instrucciones que le enseña al agente cómo pensar y qué pasos seguir.<br />
                        • <strong>MCP Server:</strong> Son los cables y manos que conectan al agente con el mundo real (base de datos, navegador, consola).<br />
                        • <strong>Workflow (.md):</strong> Es el reglamento de obra que nadie puede violar.
                      </p>
                    </div>

                    <div className="p-4 border-2 border-[#121214] rounded bg-cyan-50 dark:bg-cyan-950/20">
                      <h3 className="font-display font-black text-base text-cyan-800 dark:text-cyan-300">
                        2. ¿Por qué 100% Cero Docker para Supabase?
                      </h3>
                      <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                        Porque levantar Docker localmente consume gigabytes de RAM innecesarios y frena el desarrollo. Usamos directamente la API remota de Supabase Cloud mediante el MCP oficial para aplicar migraciones y generar tipos en segundos.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-[280px] max-w-[85vw] h-full bg-white dark:bg-[#15161A] border-r-[3px] border-[#121214] shadow-brutal-lg flex flex-col justify-between z-10 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-orange border-2 border-black shadow-brutal-sm flex items-center justify-center font-display font-black text-white text-sm">
                    BX
                  </div>
                  <span className="font-display font-black text-sm">BOXTOOLS MENU</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-7 h-7 bg-neutral-800 text-white font-mono text-xs font-bold rounded"
                >
                  ✕
                </button>
              </div>

              {/* Navigation links */}
              <div className="space-y-1.5 font-display font-bold text-xs">
                <button
                  onClick={() => {
                    setCurrentSection('vault');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded bg-neutral-100 dark:bg-neutral-800"
                >
                  🗃️ Explorador del Baúl
                </button>
                <button
                  onClick={() => {
                    setCurrentSection('publications');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded bg-[#FFD166] text-black font-black border border-black"
                >
                  📰 Publicaciones & Links (IA / Manual)
                </button>
                <button
                  onClick={() => {
                    setCurrentSection('pevc');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded bg-neutral-100 dark:bg-neutral-800"
                >
                  📘 PEVC V5 (Creación de Cero)
                </button>
                <button
                  onClick={() => {
                    setCurrentSection('repomix-v7');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded bg-cyan-100 dark:bg-cyan-950/40 text-cyan-950 dark:text-cyan-200"
                >
                  📦 Workflow Continuidad V7 (Repomix)
                </button>
                <button
                  onClick={() => {
                    setCurrentSection('vibe-guide');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded bg-orange-100 dark:bg-orange-950/40 text-brand-orangeDark dark:text-brand-orange font-bold"
                >
                  💡 Jerga & Markdowns Antigravity
                </button>
                <button
                  onClick={() => {
                    setCurrentSection('combos');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded bg-neutral-100 dark:bg-neutral-800"
                >
                  🎒 Combos & Recetas
                </button>
                <button
                  onClick={() => {
                    setCurrentSection('onboarding');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded bg-neutral-100 dark:bg-neutral-800"
                >
                  🧭 Ruta de Onboarding
                </button>
              </div>

              {/* Categories */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1 text-[11px] font-mono">
                <span className="font-bold text-neutral-400 block mb-1 uppercase">// Categorías</span>
                {(['all', 'skill', 'mcp', 'markdown'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left p-1.5 rounded ${
                      selectedCategory === cat ? 'bg-brand-orange text-white font-bold' : ''
                    }`}
                  >
                    {cat === 'all' ? 'Todos los Activos' : cat === 'skill' ? '⚡ Skills' : cat === 'mcp' ? '🔌 Servidores MCP' : '📝 Workflows'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black">
              <button
                onClick={() => {
                  setCurrentSection('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-[#121214] text-white font-display font-bold text-xs rounded border border-black shadow-brutal-sm"
              >
                ⚙️ Panel Admin & Motor IA
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Detail Modal */}
      <ToolDetailModal
        tool={activeDetailTool}
        defaultMode={viewMode}
        onClose={() => setActiveDetailTool(null)}
        onToggleCombo={toggleComboItem}
        isSelectedInCombo={activeDetailTool ? selectedComboSlugs.includes(activeDetailTool.slug) : false}
        onOpenLightbox={(url, caption) => setLightboxMedia({ id: 'lb-1', url, caption, isAiGenerated: false })}
        onCopy={handleCopy}
        onDeleteTool={handleDeleteTool}
      />

      {/* Lightbox Modal */}
      <MediaLightboxModal media={lightboxMedia} onClose={() => setLightboxMedia(null)} />

      {/* Combo Drawer */}
      <ComboDrawer
        isOpen={isComboDrawerOpen}
        onClose={() => setIsComboDrawerOpen(false)}
        selectedTools={selectedComboTools}
        onRemoveTool={toggleComboItem}
        onClearCombo={() => {
          setSelectedComboSlugs([]);
          showToast('Combo vaciado');
        }}
        onCopy={handleCopy}
      />

      {/* Add Tool Modal with AI Synthesizer */}
      <AddToolModal
        isOpen={isAddToolModalOpen}
        onClose={() => setIsAddToolModalOpen(false)}
        onAddTool={handleAddTool}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#121214] text-white border-2 border-brand-orange px-4 py-2.5 rounded shadow-brutal text-xs font-mono font-bold z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="text-brand-orange">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
