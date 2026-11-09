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
import { fetchAllToolsMerged, persistNewTool, testSupabaseConnection } from './lib/toolService';
import { ToolCard } from './components/ToolCard';
import { ToolDetailModal } from './components/ToolDetailModal';
import { ComboDrawer } from './components/ComboDrawer';
import { MediaLightboxModal } from './components/MediaLightboxModal';
import { AdminStudio } from './components/AdminStudio';
import { VibeGuideSection } from './components/VibeGuideSection';
import { AddToolModal } from './components/AddToolModal';

export const App: React.FC = () => {
  // Global View States
  const [tools, setTools] = useState<readonly ToolItem[]>(INITIAL_TOOLS);
  const [viewMode, setViewMode] = useState<ViewMode>('criollo');
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug>('all');
  const [selectedPhase, setSelectedPhase] = useState<PhaseSlug>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // App Sections
  const [currentSection, setCurrentSection] = useState<ActiveSection>('vault');

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
          onShowToast={showToast}
          onCloseAdmin={() => setCurrentSection('vault')}
        />
      ) : (
        <div className="flex h-full overflow-hidden bg-[#FFFDF7] dark:bg-[#0E0F12] text-[#121214] dark:text-[#F4F4F0]">
          {/* ========================================= */}
          {/* 1. LEFT FIXED SIDEBAR ("Índice del Manual") */}
          {/* ========================================= */}
          <aside className="w-[280px] shrink-0 h-full border-r-[3px] border-[#121214] dark:border-neutral-800 bg-white dark:bg-[#15161A] flex flex-col justify-between z-30 select-none shadow-[2px_0_0_#121214] hidden md:flex">
            {/* Top Brand Header */}
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
                <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold border-2 border-[#121214] px-1.5 py-0.5 shadow-brutal-sm ${
                  isCloudConnected
                    ? 'bg-[#E6F4EA] text-[#137333] dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-[#FFF3E8] text-brand-orange dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-brand-orange'}`}></span>
                  {isCloudConnected ? 'SUPABASE' : 'LOCAL'}
                </span>
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

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-medium">
              {/* Group: Vistas Principales */}
              <div>
                <p className="font-mono font-extrabold text-[10px] tracking-wider text-neutral-400 uppercase px-2 mb-1.5">
                  // Vistas Principales
                </p>
                <nav className="space-y-1">
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
              </div>

              {/* Group: Categorías */}
              <div>
                <p className="font-mono font-extrabold text-[10px] tracking-wider text-neutral-400 uppercase px-2 mb-1.5">
                  // Categorías Baúl
                </p>
                <div className="space-y-1 font-mono text-[11px]">
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
              </div>

              {/* Group: Fases PEVC V5 */}
              <div>
                <p className="font-mono font-extrabold text-[10px] tracking-wider text-neutral-400 uppercase px-2 mb-1.5">
                  // Ciclo de Vida PEVC V5
                </p>
                <div className="space-y-1 font-mono text-[10px]">
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
              </div>
            </div>

            {/* Sidebar Bottom Footer: Admin Panel Shortcut */}
            <div className="p-3 border-t-[3px] border-[#121214] dark:border-neutral-800 bg-neutral-50 dark:bg-[#121316]">
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
            </div>
          </aside>

          {/* ========================================= */}
          {/* 2. MAIN WORKSPACE AREA                   */}
          {/* ========================================= */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Navigation Bar: Responsive 2-Row on Mobile, 1-Row on Desktop */}
            <header className="border-b-[3px] border-[#121214] dark:border-neutral-800 bg-white dark:bg-[#15161A] px-3 md:px-6 py-2.5 md:py-0 md:h-[68px] flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-3 z-20 shrink-0">
              {/* Row 1 on Mobile: Logo + Menu Drawer + Mi Combo + Theme */}
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
                  {/* Hero Banner PEVC V5 */}
                  <section className="border-[3px] border-[#121214] dark:border-neutral-800 rounded-lg bg-white dark:bg-[#15161A] shadow-brutal-lg overflow-hidden">
                    <div className="bg-[#121214] text-white px-5 py-2.5 flex items-center justify-between border-b-2 border-black">
                      <span className="font-mono text-xs font-black text-brand-orange uppercase">
                        MANUAL OFICIAL PEVC V5 // FRAMEWORK DE INGENIERÍA IA
                      </span>
                      <span className="font-mono text-xs text-brand-yellow font-bold hidden sm:inline">
                        ⚡ 100% Cero Alucinaciones
                      </span>
                    </div>

                    <div className="p-6 flex flex-col xl:flex-row gap-6 items-start justify-between">
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
                        />
                      ))}
                    </div>
                  </section>
                </>
              )}

              {/* SECTION: WORKFLOW PEVC V5 */}
              {currentSection === 'pevc' && (
                <section className="p-6 bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg shadow-brutal-lg space-y-6">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-brand-orange uppercase">
                        // Metodología Maestra
                      </span>
                      <h2 className="font-display font-black text-2xl">PEVC V5: Vibe Coding Profesional</h2>
                    </div>
                    <button
                      onClick={() => setCurrentSection('vault')}
                      className="px-3 py-1.5 bg-[#FFD166] border-2 border-black font-bold text-xs rounded shadow-brutal-sm"
                    >
                      ← Volver al Baúl
                    </button>
                  </div>

                  <div className="prose dark:prose-invert max-w-none text-xs md:text-sm leading-relaxed space-y-4 font-sans">
                    <p className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-brand-orange rounded font-bold">
                      💡 Regla Categórica: "Prohibido programar la lógica funcional sin que antes el usuario haya aprobado las capturas finales del diseño tomadas por Playwright y pulidas por Impeccable."
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border-2 border-black rounded shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22]">
                        <h3 className="font-display font-black text-sm">Fase 0: Instalación de las 11 Skills & MCPs</h3>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                          Verificación obligatoria de herramientas: Superpowers, ECC, Stitch MCP, Supabase Cloud (cero Docker) y Playwright.
                        </p>
                      </div>

                      <div className="p-4 border-2 border-black rounded shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22]">
                        <h3 className="font-display font-black text-sm">Fase 1: Entrevista Exhaustiva Brainstorming</h3>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                          Interrogatorio socrático para erradicar cualquier hueco lógico, definir la pila y crear 01-arquitectura-y-spec.md.
                        </p>
                      </div>

                      <div className="p-4 border-2 border-black rounded shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22]">
                        <h3 className="font-display font-black text-sm">Fase 2: Frontend Design ➔ Stitch ➔ Impeccable</h3>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                          Diseño en alta resolución, capturas en 1440px/768px/375px y corrección visual con Impeccable antes de programar.
                        </p>
                      </div>

                      <div className="p-4 border-2 border-black rounded shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22]">
                        <h3 className="font-display font-black text-sm">Fase 3: Supabase Cloud & Semáforo TDD</h3>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                          Conexión a base de datos Postgres sin Docker y desarrollo guiado por pruebas (Rojo ➔ Verde ➔ Azul).
                        </p>
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
