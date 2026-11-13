import React, { useState, useEffect } from 'react';
import {
  PublicationItem,
  PublicationSection,
  PublicationResourceType,
  PublicationDifficulty,
  SectionTone,
  ViewMode,
  AiSettingsConfig,
} from '../types/boxtools';
import {
  getPublicationSections,
  persistPublicationSection,
  removePublicationSection,
  getPublications,
  persistPublication,
  removePublication,
  fetchPublicationsDataFromCloud,
  analyzeLinkAndGeneratePublication,
  extractYoutubeId,
  extractLoomId,
} from '../lib/publicationService';
import { getAiConfig, fetchAiConfigFromDatabase } from '../lib/aiService';
import { AiSettingsModal } from './AiSettingsModal';

export interface PublicationsHubSectionProps {
  readonly viewMode: ViewMode;
  readonly onCopy: (text: string, label: string) => void;
  readonly onShowToast: (msg: string) => void;
}

const TONE_STYLES: Record<SectionTone, { badge: string; activeTab: string; border: string }> = {
  orange: {
    badge: 'bg-orange-100 text-orange-950 border-orange-800 dark:bg-orange-950/60 dark:text-orange-200',
    activeTab: 'bg-brand-orange text-white',
    border: 'border-brand-orange',
  },
  purple: {
    badge: 'bg-purple-100 text-purple-950 border-purple-800 dark:bg-purple-950/60 dark:text-purple-200',
    activeTab: 'bg-purple-600 text-white',
    border: 'border-purple-600',
  },
  rose: {
    badge: 'bg-rose-100 text-rose-950 border-rose-800 dark:bg-rose-950/60 dark:text-rose-200',
    activeTab: 'bg-rose-600 text-white',
    border: 'border-rose-600',
  },
  emerald: {
    badge: 'bg-emerald-100 text-emerald-950 border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
    activeTab: 'bg-emerald-600 text-white',
    border: 'border-emerald-600',
  },
  cyan: {
    badge: 'bg-cyan-100 text-cyan-950 border-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-200',
    activeTab: 'bg-cyan-600 text-white',
    border: 'border-cyan-600',
  },
  yellow: {
    badge: 'bg-amber-100 text-amber-950 border-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
    activeTab: 'bg-[#FFD166] text-black',
    border: 'border-amber-500',
  },
  neutral: {
    badge: 'bg-neutral-200 text-neutral-900 border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
    activeTab: 'bg-[#121214] text-white',
    border: 'border-neutral-600',
  },
};

const RESOURCE_TYPE_META: Record<
  PublicationResourceType,
  { label: string; icon: string; badgeClass: string }
> = {
  github: {
    label: 'REPO GITHUB',
    icon: '🐙',
    badgeClass: 'bg-purple-100 text-purple-950 border-purple-800 dark:bg-purple-950 dark:text-purple-200',
  },
  video: {
    label: 'VIDEO',
    icon: '🎬',
    badgeClass: 'bg-rose-100 text-rose-950 border-rose-800 dark:bg-rose-950 dark:text-rose-200',
  },
  tutorial: {
    label: 'TUTORIAL',
    icon: '🎓',
    badgeClass: 'bg-emerald-100 text-emerald-950 border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  },
  link: {
    label: 'LINK WEB',
    icon: '🔗',
    badgeClass: 'bg-cyan-100 text-cyan-950 border-cyan-800 dark:bg-cyan-950 dark:text-cyan-200',
  },
  articulo: {
    label: 'ARTÍCULO',
    icon: '📰',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-800 dark:bg-amber-950 dark:text-amber-200',
  },
  herramienta: {
    label: 'HERRAMIENTA',
    icon: '🛠️',
    badgeClass: 'bg-orange-100 text-orange-950 border-orange-800 dark:bg-orange-950 dark:text-orange-200',
  },
};

const DIFFICULTY_META: Record<PublicationDifficulty, { label: string; badgeClass: string }> = {
  inicial: {
    label: 'Nivel Inicial',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-700',
  },
  intermedio: {
    label: 'Nivel Intermedio',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-700',
  },
  avanzado: {
    label: 'Nivel Avanzado',
    badgeClass: 'bg-rose-100 text-rose-950 border-rose-700',
  },
};

export const PublicationsHubSection: React.FC<PublicationsHubSectionProps> = ({
  viewMode,
  onCopy,
  onShowToast,
}) => {
  const [sections, setSections] = useState<PublicationSection[]>(() => getPublicationSections());
  const [publications, setPublications] = useState<PublicationItem[]>(() => getPublications());
  const [cloudSyncState, setCloudSyncState] = useState<'syncing' | 'synced' | 'local'>('syncing');
  const [isSavingPub, setIsSavingPub] = useState(false);
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Filters (conservar apartado seleccionado entre recargas)
  const [activeSectionId, setActiveSectionIdState] = useState<string>(() => {
    try {
      return localStorage.getItem('boxtools_pub_active_section_v1') || 'all';
    } catch {
      return 'all';
    }
  });
  const setActiveSectionId = (secId: string) => {
    setActiveSectionIdState(secId);
    try {
      localStorage.setItem('boxtools_pub_active_section_v1', secId);
    } catch {
      /* ignore */
    }
  };

  const [activeTypeFilter, setActiveTypeFilter] = useState<PublicationResourceType | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick bar state
  const [quickUrl, setQuickUrl] = useState('');
  const [quickSectionId, setQuickSectionId] = useState<string>('auto');
  const [isQuickAnalyzing, setIsQuickAnalyzing] = useState(false);

  // Interactive card states
  const [playingVideoIds, setPlayingVideoIds] = useState<Record<string, boolean>>({});
  const [expandedStepIds, setExpandedStepIds] = useState<Record<string, boolean>>({});
  const [detailPub, setDetailPub] = useState<PublicationItem | null>(null);
  const [completedStepsMap, setCompletedStepsMap] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('boxtools_pub_steps_v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Create / Edit Publication Modal state
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);
  const [pubModalMode, setPubModalMode] = useState<'ai' | 'manual'>('ai');
  const [editingPubId, setEditingPubId] = useState<string | null>(null);

  // Form fields inside Publication Modal
  const [formUrl, setFormUrl] = useState('');
  const [formUserNotes, setFormUserNotes] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGenerationNotice, setAiGenerationNotice] = useState<{
    type: 'success' | 'info' | 'warning';
    text: string;
  } | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSectionId, setFormSectionId] = useState('sec-links');
  const [formResourceType, setFormResourceType] = useState<PublicationResourceType>('link');
  const [formEmoji, setFormEmoji] = useState('📌');
  const [formAuthor, setFormAuthor] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formCriollo, setFormCriollo] = useState('');
  const [formTechnical, setFormTechnical] = useState('');
  const [formKeyPointsText, setFormKeyPointsText] = useState('');
  const [formStepsText, setFormStepsText] = useState('');
  const [formTagsText, setFormTagsText] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<PublicationDifficulty>('intermedio');
  const [formEstimatedTime, setFormEstimatedTime] = useState('10 min de lectura');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formVideoEmbedUrl, setFormVideoEmbedUrl] = useState('');
  const [formGithubStars, setFormGithubStars] = useState<string>('');
  const [formGithubLanguage, setFormGithubLanguage] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formCreatedByAi, setFormCreatedByAi] = useState(false);

  // Apartado (Section) Creator / Manager Modal state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [secName, setSecName] = useState('');
  const [secEmoji, setSecEmoji] = useState('🗂️');
  const [secDescription, setSecDescription] = useState('');
  const [secTone, setSecTone] = useState<SectionTone>('orange');

  // AI Settings Modal
  const [showAiSettingsModal, setShowAiSettingsModal] = useState(false);
  const [aiConfig, setAiConfig] = useState<AiSettingsConfig>(() => getAiConfig());

  // Sincronización inicial con Supabase Cloud al montar
  useEffect(() => {
    let active = true;
    fetchPublicationsDataFromCloud().then((res) => {
      if (!active) return;
      setSections(res.sections);
      setPublications(res.publications);
      setCloudSyncState(res.cloudSynced ? 'synced' : 'local');
      setActiveSectionIdState((prev) => {
        if (prev !== 'all' && !res.sections.some((s) => s.id === prev)) {
          try {
            localStorage.setItem('boxtools_pub_active_section_v1', 'all');
          } catch {
            /* ignore */
          }
          return 'all';
        }
        return prev;
      });
    });

    fetchAiConfigFromDatabase().then((cfg) => {
      if (active) setAiConfig(cfg);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setAiConfig(getAiConfig());
  }, [showAiSettingsModal, isPubModalOpen]);

  // Helper to populate form from draft or existing item
  const populateForm = (
    data: Omit<PublicationItem, 'id' | 'slug' | 'createdAt' | 'isPinned' | 'isFavorite'> & {
      isPinned?: boolean;
    }
  ) => {
    setFormUrl(data.url || '');
    setFormTitle(data.title || '');
    setFormSectionId(data.sectionId || sections[0]?.id || 'sec-links');
    setFormResourceType(data.resourceType || 'link');
    setFormEmoji(data.emoji || '📌');
    setFormAuthor(data.authorOrChannel || '');
    setFormSummary(data.summary || '');
    setFormCriollo(data.criolloTakeaway || '');
    setFormTechnical(data.technicalNotes || '');
    setFormKeyPointsText((data.keyPoints || []).join('\n'));
    setFormStepsText((data.tutorialSteps || []).join('\n'));
    setFormTagsText((data.tags || []).join(', '));
    setFormDifficulty(data.difficulty || 'intermedio');
    setFormEstimatedTime(data.estimatedTime || '10 min');
    setFormThumbnailUrl(data.thumbnailUrl || '');
    setFormVideoEmbedUrl(data.videoEmbedUrl || '');
    setFormGithubStars(data.githubStars !== undefined ? String(data.githubStars) : '');
    setFormGithubLanguage(data.githubLanguage || '');
    setFormIsPinned(Boolean(data.isPinned));
    setFormCreatedByAi(Boolean(data.createdByAi));
  };

  const resetForm = (defaultSecId?: string) => {
    setEditingPubId(null);
    setFormUrl('');
    setFormUserNotes('');
    setAiGenerationNotice(null);
    setFormTitle('');
    setFormSectionId(
      defaultSecId && defaultSecId !== 'all' ? defaultSecId : sections[0]?.id || 'sec-links'
    );
    setFormResourceType('link');
    setFormEmoji('📌');
    setFormAuthor('');
    setFormSummary('');
    setFormCriollo('');
    setFormTechnical('');
    setFormKeyPointsText('');
    setFormStepsText('');
    setFormTagsText('');
    setFormDifficulty('intermedio');
    setFormEstimatedTime('10 min de lectura');
    setFormThumbnailUrl('');
    setFormVideoEmbedUrl('');
    setFormGithubStars('');
    setFormGithubLanguage('');
    setFormIsPinned(false);
    setFormCreatedByAi(false);
  };

  const handleOpenNewModal = (mode: 'ai' | 'manual', prefillSecId?: string) => {
    resetForm(prefillSecId || (activeSectionId !== 'all' ? activeSectionId : undefined));
    setPubModalMode(mode);
    setIsPubModalOpen(true);
  };

  const handleOpenEditModal = (pub: PublicationItem) => {
    setEditingPubId(pub.id);
    populateForm(pub);
    setAiGenerationNotice(null);
    setPubModalMode('manual');
    setIsPubModalOpen(true);
  };

  // Auto-detect video embed or GitHub when URL changes manually
  const handleManualUrlChange = (newUrl: string) => {
    setFormUrl(newUrl);
    const trimmed = newUrl.trim();
    const ytId = extractYoutubeId(trimmed);
    const loomId = extractLoomId(trimmed);

    if (ytId) {
      setFormResourceType('video');
      setFormEmoji('🎬');
      if (!formThumbnailUrl) setFormThumbnailUrl(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
      setFormVideoEmbedUrl(`https://www.youtube.com/embed/${ytId}`);
      if (formSectionId === 'sec-links') setFormSectionId('sec-videos');
    } else if (loomId) {
      setFormResourceType('video');
      setFormEmoji('🎬');
      setFormVideoEmbedUrl(`https://www.loom.com/embed/${loomId}`);
      if (formSectionId === 'sec-links') setFormSectionId('sec-videos');
    } else if (/github\.com\/[^/]+\/[^/]+/i.test(trimmed)) {
      setFormResourceType('github');
      setFormEmoji('🐙');
      if (formSectionId === 'sec-links') setFormSectionId('sec-github');
    }
  };

  // Trigger AI generation from Quick Bar
  const handleQuickAiAnalyze = async () => {
    const cleanUrl = quickUrl.trim();
    if (!cleanUrl) {
      onShowToast('⚠️ Pegá un link (GitHub, YouTube, tutorial o web) para generar con IA');
      return;
    }

    setIsQuickAnalyzing(true);
    resetForm(quickSectionId !== 'auto' ? quickSectionId : undefined);
    setFormUrl(cleanUrl);
    setPubModalMode('ai');
    setIsPubModalOpen(true);
    setIsGeneratingAi(true);

    const res = await analyzeLinkAndGeneratePublication({
      url: cleanUrl,
      preferredSectionId: quickSectionId !== 'auto' ? quickSectionId : undefined,
      sections,
    });

    populateForm(res.draft);
    setIsGeneratingAi(false);
    setIsQuickAnalyzing(false);
    setQuickUrl('');

    if (res.usedRealAi) {
      setAiGenerationNotice({
        type: 'success',
        text: `✨ IA (${aiConfig.provider.toUpperCase()}) analizó "${res.metadata.sourceLabel}" y generó toda la publicación automáticamente. Podés revisar o editar cualquier campo antes de guardar.`,
      });
      onShowToast(`✨ Publicación generada con IA desde ${res.metadata.sourceLabel}`);
    } else if (res.warning) {
      setAiGenerationNotice({
        type: 'warning',
        text: res.warning,
      });
      onShowToast('⚡ Metadatos extraídos del link');
    } else {
      setAiGenerationNotice({
        type: 'info',
        text: `⚡ Extrajimos automáticamente los datos reales de "${res.metadata.sourceLabel}". (Conectá una API Key de Gemini/OpenRouter si querés síntesis profunda con IA).`,
      });
      onShowToast(`✓ Datos extraídos de ${res.metadata.sourceLabel}`);
    }
  };

  // Trigger AI generation inside Modal
  const handleModalAiGenerate = async () => {
    const cleanUrl = formUrl.trim();
    if (!cleanUrl) {
      onShowToast('⚠️ Ingresá una URL (GitHub, YouTube, tutorial o sitio web)');
      return;
    }

    setIsGeneratingAi(true);
    setAiGenerationNotice(null);

    const res = await analyzeLinkAndGeneratePublication({
      url: cleanUrl,
      userNotes: formUserNotes,
      preferredSectionId: activeSectionId !== 'all' ? activeSectionId : undefined,
      sections,
    });

    populateForm(res.draft);
    setIsGeneratingAi(false);

    if (res.usedRealAi) {
      setAiGenerationNotice({
        type: 'success',
        text: `✨ ¡Listo! ${aiConfig.provider.toUpperCase()} leyó el link (${res.metadata.sourceLabel}) y completó todos los campos. Podés retocar lo que quieras manualmente abajo o publicar directo.`,
      });
      onShowToast('✨ Ficha de publicación generada con IA');
    } else if (res.warning) {
      setAiGenerationNotice({
        type: 'warning',
        text: res.warning,
      });
    } else {
      setAiGenerationNotice({
        type: 'info',
        text: `⚡ Se extrajeron los metadatos reales desde ${res.metadata.sourceLabel}. Podés editar cualquier campo manualmente o conectar tu API Key IA para resúmenes extendidos.`,
      });
      onShowToast(`✓ Información extraída de ${res.metadata.sourceLabel}`);
    }
  };

  // Save Publication (Create or Update -> LocalStorage + Supabase Cloud)
  const handleSavePublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingPub) return;
    const title = formTitle.trim();
    if (!title) {
      onShowToast('⚠️ El título de la publicación es obligatorio');
      return;
    }

    const keyPoints = formKeyPointsText
      .split('\n')
      .map((l) => l.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);

    const tutorialSteps = formStepsText
      .split('\n')
      .map((l) => l.replace(/^\d+[.)]\s*|^[-•*]\s*/, '').trim())
      .filter(Boolean);

    const tags = formTagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const slugBase =
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `pub-${Date.now()}`;

    const existing = editingPubId ? publications.find((p) => p.id === editingPubId) : undefined;
    const starsNum = formGithubStars.trim() ? parseInt(formGithubStars.trim(), 10) : undefined;
    const uniqueSuffix = `${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;

    const newItem: PublicationItem = {
      id: existing ? existing.id : `pub-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      slug: existing ? existing.slug : `${slugBase}-${uniqueSuffix}`,
      title,
      summary:
        formSummary.trim() ||
        `Recurso publicado en el apartado ${sections.find((s) => s.id === formSectionId)?.name || 'General'}.`,
      criolloTakeaway:
        formCriollo.trim() ||
        'Recurso práctico seleccionado por el equipo para acelerar el flujo de desarrollo.',
      technicalNotes: formTechnical.trim(),
      url: formUrl.trim() || 'https://github.com/boxtools/vault',
      resourceType: formResourceType,
      sectionId: formSectionId,
      emoji: formEmoji.trim() || '📌',
      authorOrChannel: formAuthor.trim() || 'Equipo BoxTools',
      thumbnailUrl: formThumbnailUrl.trim() || undefined,
      videoEmbedUrl: formVideoEmbedUrl.trim() || undefined,
      githubStars: starsNum && !isNaN(starsNum) ? starsNum : undefined,
      githubLanguage: formGithubLanguage.trim() || undefined,
      keyPoints:
        keyPoints.length > 0
          ? keyPoints
          : ['Recurso verificado y disponible para todo el equipo en el Hub de Publicaciones.'],
      tutorialSteps,
      tags: tags.length > 0 ? tags : [formResourceType.toUpperCase()],
      difficulty: formDifficulty,
      estimatedTime: formEstimatedTime.trim() || '10 min',
      isPinned: formIsPinned,
      isFavorite: existing ? existing.isFavorite : false,
      createdByAi: formCreatedByAi,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
    };

    // Asegurar visibilidad inmediata tras guardar (limpiar filtros que oculten la nueva card)
    if (activeSectionId !== 'all' && activeSectionId !== newItem.sectionId) {
      setActiveSectionId(newItem.sectionId);
    }
    if (activeTypeFilter !== 'all' && activeTypeFilter !== newItem.resourceType) {
      setActiveTypeFilter('all');
    }
    if (searchQuery.trim()) {
      setSearchQuery('');
    }

    setIsSavingPub(true);
    setCloudSyncState('syncing');
    const result = await persistPublication(newItem, sections);
    setIsSavingPub(false);

    setPublications(result.publications);
    setCloudSyncState(result.supabaseSuccess ? 'synced' : 'local');
    setIsPubModalOpen(false);
    if (detailPub && detailPub.id === newItem.id) {
      setDetailPub(newItem);
    }

    const secNameLabel = sections.find((s) => s.id === newItem.sectionId)?.name || 'Hub';
    onShowToast(
      result.supabaseSuccess
        ? existing
          ? `☁️ Publicación actualizada en la nube: "${newItem.title}"`
          : `☁️ Publicación guardada en Supabase ("${secNameLabel}")`
        : existing
        ? `✓ Actualizada localmente: "${newItem.title}"`
        : `🎉 Publicación guardada localmente en "${secNameLabel}"`
    );
  };

  const handleDeletePublication = async (pub: PublicationItem) => {
    if (detailPub?.id === pub.id) setDetailPub(null);
    setCloudSyncState('syncing');
    const result = await removePublication(pub.id);
    setPublications(result.publications);
    setCloudSyncState(result.supabaseSuccess ? 'synced' : 'local');
    onShowToast(
      result.supabaseSuccess
        ? `🗑️ Publicación eliminada de la nube: "${pub.title}"`
        : `🗑️ Publicación eliminada localmente: "${pub.title}"`
    );
  };

  const handlePublicationFlagUpdate = async (updatedItem: PublicationItem, toastMsg: string) => {
    setPublications((prev) => prev.map((p) => (p.id === updatedItem.id ? updatedItem : p)));
    if (detailPub?.id === updatedItem.id) setDetailPub(updatedItem);
    setCloudSyncState('syncing');
    const result = await persistPublication(updatedItem, sections);
    setPublications(result.publications);
    setCloudSyncState(result.supabaseSuccess ? 'synced' : 'local');
    onShowToast(toastMsg);
  };

  const handleTogglePin = (pub: PublicationItem) => {
    const updatedItem: PublicationItem = { ...pub, isPinned: !pub.isPinned };
    void handlePublicationFlagUpdate(
      updatedItem,
      updatedItem.isPinned ? '📌 Fijada arriba del muro' : '📌 Desfijada'
    );
  };

  const handleToggleFavorite = (pub: PublicationItem) => {
    const updatedItem: PublicationItem = { ...pub, isFavorite: !pub.isFavorite };
    void handlePublicationFlagUpdate(
      updatedItem,
      updatedItem.isFavorite ? '⭐ Guardada en Favoritos' : 'Removida de Favoritos'
    );
  };

  // Apartado (Section) CRUD
  const handleOpenCreateSection = () => {
    setEditingSectionId(null);
    setSecName('');
    setSecEmoji('🚀');
    setSecDescription('');
    setSecTone('orange');
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec: PublicationSection) => {
    setEditingSectionId(sec.id);
    setSecName(sec.name);
    setSecEmoji(sec.emoji);
    setSecDescription(sec.description);
    setSecTone(sec.tone);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingSection) return;
    const cleanName = secName.trim();
    if (!cleanName) {
      onShowToast('⚠️ Escribí un nombre para el apartado');
      return;
    }

    const existing = editingSectionId ? sections.find((s) => s.id === editingSectionId) : undefined;
    const slugBase =
      cleanName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `apartado-${Date.now()}`;

    const slugTaken = sections.some((s) => s.slug === slugBase && s.id !== existing?.id);
    const uniqueSlug = slugTaken ? `${slugBase}-${Date.now().toString().slice(-4)}` : slugBase;

    const newSec: PublicationSection = {
      id: existing ? existing.id : `sec-${slugBase}-${Date.now().toString().slice(-4)}`,
      slug: existing ? existing.slug : uniqueSlug,
      name: cleanName,
      emoji: secEmoji.trim() || '📁',
      description:
        secDescription.trim() || `Apartado personalizado para publicaciones sobre ${cleanName}.`,
      tone: secTone,
      isSystem: existing?.isSystem ?? false,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
    };

    setIsSavingSection(true);
    setCloudSyncState('syncing');
    const result = await persistPublicationSection(newSec);
    setIsSavingSection(false);

    setSections(result.sections);
    setCloudSyncState(result.supabaseSuccess ? 'synced' : 'local');
    setActiveSectionId(newSec.id);
    if (isPubModalOpen) {
      setFormSectionId(newSec.id);
    }
    setIsSectionModalOpen(false);
    onShowToast(
      result.supabaseSuccess
        ? existing
          ? `☁️ Apartado "${newSec.name}" actualizado en la nube`
          : `☁️ Apartado guardado en Supabase: "${newSec.emoji} ${newSec.name}"`
        : existing
        ? `✓ Apartado "${newSec.name}" actualizado localmente`
        : `🗂️ Nuevo apartado creado: "${newSec.emoji} ${newSec.name}"`
    );
  };

  const handleDeleteSection = async (sec: PublicationSection) => {
    if (sec.isSystem) {
      onShowToast('⚠️ Los apartados base del sistema no se pueden borrar, pero podés editarlos.');
      return;
    }
    setCloudSyncState('syncing');
    const result = await removePublicationSection(sec.id);
    setSections(result.sections);
    setPublications(result.publications);
    setCloudSyncState(result.supabaseSuccess ? 'synced' : 'local');
    if (activeSectionId === sec.id) setActiveSectionId('all');
    onShowToast(
      result.supabaseSuccess
        ? `🗑️ Apartado "${sec.name}" eliminado de la nube`
        : `🗑️ Apartado "${sec.name}" eliminado localmente`
    );
  };

  // Filtered and sorted publications (pinned first, then newest)
  const filteredPublications = publications
    .filter((pub) => {
      const matchesSection = activeSectionId === 'all' || pub.sectionId === activeSectionId;
      const matchesType =
        activeTypeFilter === 'all'
          ? true
          : activeTypeFilter === 'favorites'
          ? pub.isFavorite
          : pub.resourceType === activeTypeFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        q === '' ||
        pub.title.toLowerCase().includes(q) ||
        pub.summary.toLowerCase().includes(q) ||
        pub.criolloTakeaway.toLowerCase().includes(q) ||
        pub.authorOrChannel.toLowerCase().includes(q) ||
        pub.tags.some((t) => t.toLowerCase().includes(q));

      return matchesSection && matchesType && matchesQuery;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const activeSectionObj = sections.find((s) => s.id === activeSectionId);

  return (
    <div className="space-y-6" data-testid="publications-hub-section">
      {/* =================================================================== */}
      {/* 1. HERO HEADER & QUICK AI LINK CREATOR                              */}
      {/* =================================================================== */}
      <section className="border-[3px] border-[#121214] dark:border-neutral-800 rounded-lg bg-white dark:bg-[#15161A] shadow-brutal-lg overflow-hidden">
        <div className="bg-[#121214] text-white px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-2 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="text-base">📰</span>
            <span className="font-mono text-xs font-black text-brand-orange uppercase tracking-wider">
              HUB DE PUBLICACIONES & RECURSOS // LINKS, GITHUB, VIDEOS & TUTORIALES
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              data-testid="pub-cloud-status"
              className={`font-mono text-[10px] px-2 py-1 rounded border font-bold flex items-center gap-1.5 ${
                cloudSyncState === 'synced'
                  ? 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300'
                  : cloudSyncState === 'syncing'
                  ? 'border-amber-400/60 bg-amber-950/60 text-amber-200'
                  : 'border-neutral-600 bg-neutral-900 text-neutral-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  cloudSyncState === 'synced'
                    ? 'bg-emerald-400'
                    : cloudSyncState === 'syncing'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-neutral-400'
                }`}
              />
              <span>
                {cloudSyncState === 'synced'
                  ? 'Nube Supabase OK'
                  : cloudSyncState === 'syncing'
                  ? 'Sincronizando...'
                  : 'Modo Local'}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setShowAiSettingsModal(true)}
              className="px-2.5 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-[#FFD166] text-white hover:text-black font-mono text-[10px] font-bold flex items-center gap-1.5 transition"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  aiConfig.apiKey.trim() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>
                {aiConfig.apiKey.trim()
                  ? `IA Activa (${aiConfig.provider.toUpperCase()})`
                  : 'Conectar API Key IA'}
              </span>
            </button>
            <span className="font-mono text-[10px] bg-white/10 text-white px-2 py-0.5 rounded font-bold">
              {sections.length} Apartados • {publications.length} Publicaciones
            </span>
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-orange-100 text-brand-orangeDark border border-brand-orange font-mono text-[10px] font-bold rounded">
                  ⚡ AUTO-EXTRACCIÓN IA + EDICIÓN MANUAL
                </span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-900 border border-purple-700 font-mono text-[10px] font-bold rounded">
                  🗂️ APARTADOS PERSONALIZABLES
                </span>
              </div>
              <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight">
                Muro de Publicaciones <span className="text-brand-orange">& Apartados Temáticos</span>
              </h1>
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Creá tus propios <strong>apartados personalizados</strong> y publicá repositorios de GitHub, videos de YouTube, tutoriales paso a paso o links técnicos. Pegá un link para que la <strong>IA extraiga y redacte toda la ficha automáticamente</strong>, o creala y editala <strong>manualmente</strong> a tu medida.
              </p>
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenNewModal('ai')}
                className="px-4 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-display font-black text-xs rounded border-2 border-[#121214] shadow-brutal-sm flex items-center gap-2 transition"
                data-testid="open-ai-publication-modal-btn"
              >
                <span>🤖</span>
                <span>+ Crear con IA (Desde Link)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenNewModal('manual')}
                className="px-4 py-2.5 bg-[#FFD166] hover:bg-yellow-400 text-[#121214] font-display font-black text-xs rounded border-2 border-[#121214] shadow-brutal-sm flex items-center gap-2 transition"
                data-testid="open-manual-publication-modal-btn"
              >
                <span>✍️</span>
                <span>+ Crear Manualmente</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreateSection}
                className="px-3.5 py-2.5 bg-white dark:bg-[#1E1F24] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#121214] dark:text-white font-display font-black text-xs rounded border-2 border-[#121214] shadow-brutal-sm flex items-center gap-1.5 transition"
                data-testid="open-create-section-modal-btn"
              >
                <span>🗂️</span>
                <span>+ Nuevo Apartado</span>
              </button>
            </div>
          </div>

          {/* Quick AI Link Box */}
          <div className="p-4 bg-[#FAF9F5] dark:bg-[#111215] border-2 border-[#121214] dark:border-neutral-700 rounded-lg shadow-brutal-sm space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="font-display font-black text-xs flex items-center gap-1.5">
                <span>⚡</span>
                <span>PUBLICACIÓN INSTANTÁNEA CON IA (Pegá un link de GitHub, YouTube, Tutorial o Web):</span>
              </label>
              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                <span>Probar con ejemplo:</span>
                <button
                  type="button"
                  onClick={() => setQuickUrl('https://github.com/browser-use/browser-use')}
                  className="underline hover:text-brand-orange font-bold"
                >
                  Repo GitHub
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setQuickUrl('https://www.youtube.com/watch?v=aircAruvnKk')}
                  className="underline hover:text-brand-orange font-bold"
                >
                  Video YouTube
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setQuickUrl('https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview')}
                  className="underline hover:text-brand-orange font-bold"
                >
                  Tutorial / Docs
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2.5">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleQuickAiAnalyze();
                    }
                  }}
                  placeholder="https://github.com/... o https://youtube.com/watch?v=... o link de tutorial..."
                  className="w-full pl-9 pr-3 py-2.5 border-2 border-[#121214] rounded bg-white dark:bg-[#1A1C22] font-mono text-xs focus:outline-none"
                  data-testid="quick-ai-url-input"
                />
                <span className="absolute left-3 top-2.5 text-sm">🔗</span>
              </div>

              <select
                value={quickSectionId}
                onChange={(e) => setQuickSectionId(e.target.value)}
                className="px-3 py-2.5 border-2 border-[#121214] rounded bg-white dark:bg-[#1A1C22] font-mono text-xs font-bold focus:outline-none"
                title="Apartado destino"
              >
                <option value="auto">🤖 Auto-detectar Apartado</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleQuickAiAnalyze}
                disabled={isQuickAnalyzing}
                className="px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-display font-black text-xs rounded border-2 border-[#121214] shadow-brutal-sm transition disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                data-testid="quick-ai-generate-btn"
              >
                <span>{isQuickAnalyzing ? '⏳' : '🤖'}</span>
                <span>{isQuickAnalyzing ? 'Analizando Link...' : 'Extraer Info con IA'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. NAVEGADOR DE APARTADOS (TABS PERSONALIZABLES)                    */}
      {/* =================================================================== */}
      <section className="bg-white dark:bg-[#15161A] border-[3px] border-[#121214] dark:border-neutral-800 rounded-lg p-4 shadow-brutal-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-extrabold uppercase text-neutral-500">
              // APARTADOS & COLECCIONES:
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              (Seleccioná un apartado para filtrar o creá uno nuevo)
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateSection}
            className="px-2.5 py-1 rounded border-2 border-[#121214] bg-[#FFD166] hover:bg-yellow-400 text-black font-mono text-[11px] font-bold shadow-brutal-xs flex items-center gap-1 transition"
          >
            <span>➕</span>
            <span>Crear Apartado</span>
          </button>
        </div>

        {/* Apartados Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveSectionId('all')}
            className={`px-3.5 py-2 rounded border-2 border-[#121214] font-display font-black text-xs flex items-center gap-2 shrink-0 shadow-brutal-xs transition ${
              activeSectionId === 'all'
                ? 'bg-[#121214] text-white'
                : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <span>🗂️</span>
            <span>Todos los Apartados</span>
            <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px] font-mono">
              {publications.length}
            </span>
          </button>

          {sections.map((sec) => {
            const count = publications.filter((p) => p.sectionId === sec.id).length;
            const isSelected = activeSectionId === sec.id;
            const toneStyle = TONE_STYLES[sec.tone] || TONE_STYLES.orange;

            return (
              <div key={sec.id} className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`px-3.5 py-2 rounded border-2 border-[#121214] font-display font-black text-xs flex items-center gap-2 shadow-brutal-xs transition ${
                    isSelected
                      ? toneStyle.activeTab
                      : 'bg-white dark:bg-[#1A1C22] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span>{sec.emoji}</span>
                  <span>{sec.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      isSelected
                        ? 'bg-black/25 text-white'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Active Section Banner (when a specific apartado is selected) */}
        {activeSectionObj && (
          <div className="p-3 rounded border-2 border-[#121214] bg-[#FFFBF7] dark:bg-[#1A1C22] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-start gap-2.5">
              <span className="text-2xl">{activeSectionObj.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-sm">{activeSectionObj.name}</h3>
                  <span className="font-mono text-[10px] text-neutral-500">
                    ({filteredPublications.length} publicaciones)
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                  {activeSectionObj.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenNewModal('ai', activeSectionObj.id)}
                className="px-2.5 py-1.5 bg-brand-orange text-white font-mono text-[11px] font-bold rounded border-2 border-black shadow-brutal-xs hover:bg-orange-600 transition"
              >
                🤖 + Publicar Link con IA aquí
              </button>
              <button
                type="button"
                onClick={() => handleOpenNewModal('manual', activeSectionObj.id)}
                className="px-2.5 py-1.5 bg-[#FFD166] text-black font-mono text-[11px] font-bold rounded border-2 border-black shadow-brutal-xs hover:bg-yellow-400 transition"
              >
                ✍️ + Manual
              </button>
              <button
                type="button"
                onClick={() => handleOpenEditSection(activeSectionObj)}
                className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 border-2 border-black font-mono text-[11px] font-bold rounded shadow-brutal-xs hover:bg-neutral-100"
                title="Editar nombre, icono o descripción del apartado"
              >
                ✏️ Editar
              </button>
              {!activeSectionObj.isSystem && (
                <button
                  type="button"
                  onClick={() => handleDeleteSection(activeSectionObj)}
                  className="px-2.5 py-1.5 bg-red-100 text-red-900 border-2 border-black font-mono text-[11px] font-bold rounded shadow-brutal-xs hover:bg-red-200"
                  title="Eliminar apartado"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        )}

        {/* Secondary Filter Bar: Type + Search */}
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px]">
            <span className="font-bold text-neutral-500 mr-1">Tipo:</span>
            {[
              { id: 'all', label: 'Todos', icon: '📋' },
              { id: 'github', label: 'GitHub', icon: '🐙' },
              { id: 'video', label: 'Videos', icon: '🎬' },
              { id: 'tutorial', label: 'Tutoriales', icon: '🎓' },
              { id: 'link', label: 'Links Web', icon: '🔗' },
              { id: 'favorites', label: 'Favoritos', icon: '⭐' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTypeFilter(t.id as any)}
                className={`px-2.5 py-1 rounded border transition flex items-center gap-1 ${
                  activeTypeFilter === t.id
                    ? 'border-[#121214] bg-[#FFD166] text-black font-bold shadow-brutal-xs'
                    : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar publicaciones por título, tag o autor..."
              className="w-full pl-8 pr-7 py-1.5 border-2 border-[#121214] dark:border-neutral-700 rounded bg-[#FAFAFA] dark:bg-[#1E1F24] font-mono text-xs focus:outline-none"
            />
            <span className="absolute left-2.5 top-1.5 text-xs text-neutral-400">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-xs font-mono text-neutral-500 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. FEED / GRID DE PUBLICACIONES                                     */}
      {/* =================================================================== */}
      {filteredPublications.length === 0 ? (
        <div className="p-10 bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg shadow-brutal text-center space-y-4">
          <div className="text-4xl">📭</div>
          <h3 className="font-display font-black text-lg">
            No hay publicaciones en esta vista todavía
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Pegá cualquier link de un repositorio GitHub, video de YouTube o tutorial para que la IA arme la publicación automáticamente, o creá una de forma manual.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleOpenNewModal('ai')}
              className="px-4 py-2 bg-brand-orange text-white font-display font-black text-xs rounded border-2 border-black shadow-brutal-sm"
            >
              🤖 Crear Publicación con IA
            </button>
            <button
              type="button"
              onClick={() => handleOpenNewModal('manual')}
              className="px-4 py-2 bg-[#FFD166] text-black font-display font-black text-xs rounded border-2 border-black shadow-brutal-sm"
            >
              ✍️ Crear Manualmente
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPublications.map((pub) => {
            const section = sections.find((s) => s.id === pub.sectionId);
            const secTone = TONE_STYLES[section?.tone || 'orange'];
            const typeMeta = RESOURCE_TYPE_META[pub.resourceType] || RESOURCE_TYPE_META.link;
            const diffMeta = DIFFICULTY_META[pub.difficulty] || DIFFICULTY_META.intermedio;
            const isPlayingVideo = Boolean(playingVideoIds[pub.id]);
            const isStepsOpen = Boolean(expandedStepIds[pub.id]);

            return (
              <article
                key={pub.id}
                className={`border-[3px] border-[#121214] dark:border-neutral-700 rounded-lg bg-white dark:bg-[#15161A] shadow-brutal flex flex-col justify-between overflow-hidden transition hover:translate-y-[-2px] ${
                  pub.isPinned ? 'ring-2 ring-brand-orange' : ''
                }`}
                data-testid={`publication-card-${pub.id}`}
              >
                <div>
                  {/* Card Top Bar */}
                  <div className="px-4 py-2.5 bg-[#FAF9F5] dark:bg-[#1A1C22] border-b-2 border-[#121214] dark:border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {pub.isPinned && (
                        <span className="px-2 py-0.5 bg-brand-orange text-white font-mono text-[10px] font-black rounded border border-black">
                          📌 FIJADO
                        </span>
                      )}
                      {section && (
                        <button
                          type="button"
                          onClick={() => setActiveSectionId(section.id)}
                          className={`px-2 py-0.5 rounded border font-mono text-[10px] font-bold ${secTone.badge} hover:opacity-80`}
                        >
                          {section.emoji} {section.name}
                        </button>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded border font-mono text-[10px] font-extrabold ${typeMeta.badgeClass}`}
                      >
                        {typeMeta.icon} {typeMeta.label}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded border font-mono text-[9px] font-bold ${
                          pub.createdByAi
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-400 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {pub.createdByAi ? '🤖 IA' : '✍️ Manual'}
                      </span>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(pub)}
                        className={`w-7 h-7 rounded border border-[#121214] flex items-center justify-center text-xs transition ${
                          pub.isFavorite
                            ? 'bg-[#FFD166] text-black shadow-brutal-xs'
                            : 'bg-white dark:bg-neutral-800 hover:bg-neutral-100'
                        }`}
                        title={pub.isFavorite ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
                      >
                        {pub.isFavorite ? '⭐' : '☆'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePin(pub)}
                        className={`w-7 h-7 rounded border border-[#121214] flex items-center justify-center text-xs transition ${
                          pub.isPinned
                            ? 'bg-brand-orange text-white shadow-brutal-xs'
                            : 'bg-white dark:bg-neutral-800 hover:bg-neutral-100'
                        }`}
                        title={pub.isPinned ? 'Desfijar publicación' : 'Fijar arriba'}
                      >
                        📌
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(pub)}
                        className="w-7 h-7 rounded border border-[#121214] bg-white dark:bg-neutral-800 hover:bg-[#FFD166] text-black flex items-center justify-center text-xs transition"
                        title="Editar publicación manualmente"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePublication(pub)}
                        className="w-7 h-7 rounded border border-[#121214] bg-white dark:bg-neutral-800 hover:bg-red-100 text-red-700 flex items-center justify-center text-xs transition"
                        title="Eliminar publicación"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Multimedia Area: Video Player or Thumbnail Banner */}
                  {pub.videoEmbedUrl ? (
                    <div className="border-b-2 border-[#121214] bg-black relative">
                      {isPlayingVideo ? (
                        <div className="aspect-video w-full">
                          <iframe
                            src={`${pub.videoEmbedUrl}?autoplay=1`}
                            title={pub.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            setPlayingVideoIds((prev) => ({ ...prev, [pub.id]: true }))
                          }
                          className="aspect-video w-full relative cursor-pointer group overflow-hidden bg-neutral-900 flex items-center justify-center"
                        >
                          {pub.thumbnailUrl ? (
                            <img
                              src={pub.thumbnailUrl}
                              alt={pub.title}
                              className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <div className="text-white font-mono text-xs">Vista Previa de Video</div>
                          )}
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition flex items-center justify-center">
                            <div className="px-4 py-2.5 bg-brand-orange text-white font-display font-black text-xs rounded-lg border-2 border-black shadow-brutal flex items-center gap-2 group-hover:scale-105 transition">
                              <span>▶</span>
                              <span>Reproducir Video Aquí</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : pub.thumbnailUrl ? (
                    <div className="border-b-2 border-[#121214] bg-neutral-100 dark:bg-neutral-900 h-40 overflow-hidden relative">
                      <img
                        src={pub.thumbnailUrl}
                        alt={pub.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : null}

                  {/* Main Body */}
                  <div className="p-5 space-y-4">
                    {/* Title & Metadata Row */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] font-mono text-neutral-500">
                        <span className="font-bold text-neutral-700 dark:text-neutral-300">
                          👤 {pub.authorOrChannel}
                        </span>
                        <div className="flex items-center gap-2">
                          {pub.githubLanguage && (
                            <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-400 rounded text-[10px] font-bold">
                              💻 {pub.githubLanguage}
                            </span>
                          )}
                          {pub.githubStars !== undefined && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-950 border border-amber-600 rounded text-[10px] font-bold">
                              ⭐ {pub.githubStars.toLocaleString()}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${diffMeta.badgeClass}`}>
                            {diffMeta.label}
                          </span>
                          <span>⏱️ {pub.estimatedTime}</span>
                        </div>
                      </div>

                      <h3
                        onClick={() => setDetailPub(pub)}
                        className="font-display font-black text-lg leading-snug cursor-pointer hover:text-brand-orange transition flex items-start gap-2"
                      >
                        <span className="text-xl shrink-0">{pub.emoji}</span>
                        <span>{pub.title}</span>
                      </h3>
                    </div>

                    {/* Summary */}
                    <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {pub.summary}
                    </p>

                    {/* Criollo vs Técnico Switchable Highlight Box */}
                    {viewMode === 'criollo' ? (
                      <div className="p-3.5 rounded-lg border-2 border-[#121214] bg-[#FFF7EE] dark:bg-[#221912] space-y-1">
                        <div className="font-mono text-[10px] font-extrabold text-brand-orangeDark dark:text-brand-orange uppercase flex items-center gap-1.5">
                          <span>🎨</span>
                          <span>EN CRIOLLO // ¿PARA QUÉ TE SIRVE ESTO?</span>
                        </div>
                        <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                          {pub.criolloTakeaway}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-lg border-2 border-[#121214] bg-cyan-50/70 dark:bg-cyan-950/25 space-y-1">
                        <div className="font-mono text-[10px] font-extrabold text-cyan-900 dark:text-cyan-300 uppercase flex items-center gap-1.5">
                          <span>💻</span>
                          <span>NOTAS TÉCNICAS & IMPLEMENTACIÓN</span>
                        </div>
                        <pre className="text-[11px] font-mono whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 leading-relaxed overflow-x-auto">
                          {pub.technicalNotes || pub.summary}
                        </pre>
                      </div>
                    )}

                    {/* Key Points */}
                    {pub.keyPoints.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="font-mono text-[10px] font-extrabold uppercase text-neutral-500 block">
                          // PUNTOS CLAVE EXTRAÍDOS:
                        </span>
                        <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                          {pub.keyPoints.slice(0, 4).map((pt, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-brand-orange font-bold">▸</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Collapsible Tutorial Steps */}
                    {pub.tutorialSteps.length > 0 && (
                      <div className="border-2 border-[#121214] dark:border-neutral-700 rounded overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedStepIds((prev) => ({ ...prev, [pub.id]: !prev[pub.id] }))
                          }
                          className="w-full px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-between text-left font-mono text-[11px] font-bold text-emerald-950 dark:text-emerald-200"
                        >
                          <span>
                            🎓 Guía Paso a Paso ({pub.tutorialSteps.length} pasos accionables)
                          </span>
                          <span>{isStepsOpen ? '▴ Ocultar' : '▾ Ver Pasos'}</span>
                        </button>
                        {isStepsOpen && (
                          <ol className="p-3 bg-white dark:bg-[#1A1C22] space-y-2 text-xs list-decimal pl-7">
                            {pub.tutorialSteps.map((step, i) => (
                              <li key={i} className="text-neutral-700 dark:text-neutral-300 leading-snug">
                                {step}
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {pub.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {pub.tags.map((tag, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSearchQuery(tag)}
                            className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-[#FFD166] hover:text-black border border-neutral-300 dark:border-neutral-700 rounded font-mono text-[10px] font-bold transition"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-[#FAF9F5] dark:bg-[#1A1C22] border-t-2 border-[#121214] dark:border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#121214] hover:bg-brand-orange text-white font-display font-bold text-xs rounded border border-black shadow-brutal-xs flex items-center gap-1.5 transition"
                    >
                      <span>🔗</span>
                      <span>
                        {pub.resourceType === 'github'
                          ? 'Abrir Repo GitHub ↗'
                          : pub.resourceType === 'video'
                          ? 'Ver en YouTube / Web ↗'
                          : 'Abrir Recurso ↗'}
                      </span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onCopy(pub.url, `Link de ${pub.title}`)}
                      className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 hover:bg-neutral-100 border-2 border-[#121214] rounded font-mono text-[11px] font-bold shadow-brutal-xs"
                      title="Copiar URL al portapapeles"
                    >
                      📋 Copiar Link
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailPub(pub)}
                    className="px-3 py-1.5 bg-[#FFD166] hover:bg-yellow-400 text-black font-display font-black text-xs rounded border-2 border-[#121214] shadow-brutal-xs transition"
                  >
                    📖 Ficha Completa →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. MODAL DE LECTURA COMPLETA DE LA PUBLICACIÓN                      */}
      {/* =================================================================== */}
      {detailPub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg shadow-brutal-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            <header className="p-4 bg-[#121214] text-white border-b-2 border-black flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">{detailPub.emoji}</span>
                <div className="min-w-0">
                  <span className="font-mono text-[10px] text-brand-orange font-bold uppercase block">
                    {sections.find((s) => s.id === detailPub.sectionId)?.name || 'Publicación'} //{' '}
                    {detailPub.authorOrChannel}
                  </span>
                  <h3 className="font-display font-black text-base md:text-lg truncate">
                    {detailPub.title}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const target = detailPub;
                    setDetailPub(null);
                    handleOpenEditModal(target);
                  }}
                  className="px-3 py-1 bg-[#FFD166] text-black font-mono text-xs font-bold rounded border border-black"
                >
                  ✏️ Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDetailPub(null)}
                  className="w-8 h-8 rounded bg-white text-black font-mono font-bold text-sm flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </header>

            <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
              {detailPub.videoEmbedUrl && (
                <div className="aspect-video w-full border-2 border-black rounded overflow-hidden bg-black shadow-brutal-sm">
                  <iframe
                    src={detailPub.videoEmbedUrl}
                    title={detailPub.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="p-4 bg-[#FAF9F5] dark:bg-[#1A1C22] border-2 border-[#121214] rounded-lg space-y-2">
                <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">
                  // RESUMEN GENERAL DE LA PUBLICACIÓN
                </span>
                <p className="text-sm leading-relaxed">{detailPub.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#FFF7EE] dark:bg-[#221912] border-2 border-[#121214] rounded-lg space-y-1.5">
                  <h4 className="font-display font-black text-xs uppercase text-brand-orangeDark dark:text-brand-orange">
                    🎨 Explicación en Criollo
                  </h4>
                  <p className="text-xs leading-relaxed">{detailPub.criolloTakeaway}</p>
                </div>

                <div className="p-4 bg-cyan-50/70 dark:bg-cyan-950/25 border-2 border-[#121214] rounded-lg space-y-1.5">
                  <h4 className="font-display font-black text-xs uppercase text-cyan-900 dark:text-cyan-300">
                    💻 Notas Técnicas & Arquitectura
                  </h4>
                  <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">
                    {detailPub.technicalNotes || 'Sin notas técnicas adicionales.'}
                  </pre>
                </div>
              </div>

              {detailPub.keyPoints.length > 0 && (
                <div className="p-4 bg-white dark:bg-[#1A1C22] border-2 border-[#121214] rounded-lg space-y-2">
                  <h4 className="font-display font-black text-sm">📌 Puntos Clave Destacados</h4>
                  <ul className="space-y-1.5 text-xs">
                    {detailPub.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-brand-orange font-bold">✓</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detailPub.tutorialSteps.length > 0 && (
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border-2 border-[#121214] rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-black text-sm text-emerald-950 dark:text-emerald-200">
                      🎓 Checklist de Aplicación / Tutorial Paso a Paso
                    </h4>
                    <span className="font-mono text-[10px] text-emerald-800 dark:text-emerald-300">
                      Podés tildar cada paso al completarlo
                    </span>
                  </div>
                  <div className="space-y-2">
                    {detailPub.tutorialSteps.map((step, i) => {
                      const stepKey = `${detailPub.id}-step-${i}`;
                      const checked = Boolean(completedStepsMap[stepKey]);
                      return (
                        <label
                          key={i}
                          className={`flex items-start gap-2.5 p-2.5 rounded border border-black bg-white dark:bg-[#15161A] cursor-pointer text-xs ${
                            checked ? 'line-through opacity-60' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setCompletedStepsMap((prev) => {
                                const next = {
                                  ...prev,
                                  [stepKey]: !prev[stepKey],
                                };
                                try {
                                  localStorage.setItem('boxtools_pub_steps_v1', JSON.stringify(next));
                                } catch {
                                  // Ignore storage quota errors
                                }
                                return next;
                              })
                            }
                            className="mt-0.5"
                          />
                          <span>
                            <strong>Paso {i + 1}:</strong> {step}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <footer className="p-4 bg-neutral-100 dark:bg-[#1A1C22] border-t-2 border-black flex items-center justify-between gap-3 flex-wrap">
              <a
                href={detailPub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-brand-orange text-white font-display font-black text-xs rounded border-2 border-black shadow-brutal-sm"
              >
                🔗 Abrir Recurso Original ({detailPub.url.slice(0, 45)}...) ↗
              </a>
              <button
                type="button"
                onClick={() => setDetailPub(null)}
                className="px-4 py-2 bg-[#121214] text-white font-display font-bold text-xs rounded"
              >
                Cerrar Ventana
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. MODAL CREAR / EDITAR PUBLICACIÓN (IA AUTOMÁTICA + MANUAL)        */}
      {/* =================================================================== */}
      {isPubModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in"
          data-testid="publication-editor-modal"
        >
          <div className="bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg shadow-brutal-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <header className="p-4 bg-brand-orange text-white border-b-2 border-black flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#121214] text-white border-2 border-white flex items-center justify-center font-display font-black text-sm">
                  {editingPubId ? '✏️' : pubModalMode === 'ai' ? '🤖' : '✍️'}
                </div>
                <div>
                  <h3 className="font-display font-black text-base md:text-lg leading-none uppercase">
                    {editingPubId
                      ? 'Editar Publicación'
                      : 'Nueva Publicación (Automática con IA o Manual)'}
                  </h3>
                  <span className="font-mono text-[10px] text-white/90 font-bold">
                    EXTRAE INFORMACIÓN REAL DE LINKS (GITHUB, YOUTUBE, TUTORIALES) O REDACTA A MANO
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPubModalOpen(false)}
                className="w-8 h-8 rounded border-2 border-black bg-white text-black font-mono font-bold text-sm shadow-brutal-sm hover:bg-neutral-100 flex items-center justify-center"
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleSavePublication} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-4 md:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Mode Switch Tabs inside Modal */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPubModalMode('ai')}
                  className={`p-3 rounded border-2 border-black font-display font-black text-xs flex items-center justify-center gap-2 transition ${
                    pubModalMode === 'ai'
                      ? 'bg-[#FFD166] text-black shadow-brutal-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <span>🤖</span>
                  <span>1. Autocompletar con IA desde Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPubModalMode('manual')}
                  className={`p-3 rounded border-2 border-black font-display font-black text-xs flex items-center justify-center gap-2 transition ${
                    pubModalMode === 'manual'
                      ? 'bg-[#FFD166] text-black shadow-brutal-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <span>✍️</span>
                  <span>2. Carga / Edición Manual Directa</span>
                </button>
              </div>

              {/* AI Auto-Extraction Panel */}
              {pubModalMode === 'ai' && (
                <div className="p-4 bg-[#FFF7EE] dark:bg-[#1F1712] border-2 border-[#121214] rounded-lg space-y-3 shadow-brutal-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-display font-black text-xs uppercase text-brand-orangeDark dark:text-brand-orange">
                      🤖 Paso 1: Pegá el Link y dejá que la IA redacte toda la publicación
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAiSettingsModal(true)}
                      className="text-[11px] font-mono font-bold underline text-neutral-700 dark:text-neutral-300"
                    >
                      🔑 {aiConfig.apiKey.trim() ? `Motor: ${aiConfig.provider.toUpperCase()}` : 'Configurar API Key IA'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-xs font-bold block">
                      URL del Repositorio GitHub, Video de YouTube, Tutorial o Recurso Web:
                    </label>
                    <input
                      type="text"
                      value={formUrl}
                      onChange={(e) => handleManualUrlChange(e.target.value)}
                      placeholder="https://github.com/usuario/repo o https://www.youtube.com/watch?v=..."
                      className="w-full p-2.5 border-2 border-black rounded font-mono text-xs bg-white dark:bg-neutral-900"
                      data-testid="modal-ai-url-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[11px] font-bold block text-neutral-600 dark:text-neutral-300">
                      Notas o enfoque adicional para la IA (Opcional):
                    </label>
                    <input
                      type="text"
                      value={formUserNotes}
                      onChange={(e) => setFormUserNotes(e.target.value)}
                      placeholder="Ej: Enfocarse en cómo instalarlo con TypeScript y por qué sirve para testing..."
                      className="w-full p-2 border border-black rounded text-xs bg-white dark:bg-neutral-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleModalAiGenerate}
                    disabled={isGeneratingAi}
                    className="w-full py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-display font-black text-xs uppercase rounded border-2 border-black shadow-brutal-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                    data-testid="modal-ai-generate-btn"
                  >
                    <span>{isGeneratingAi ? '⏳' : '✨'}</span>
                    <span>
                      {isGeneratingAi
                        ? 'Extrayendo contenido del link y generando publicación completa...'
                        : 'Extraer Datos del Link y Autocompletar Campos con IA'}
                    </span>
                  </button>
                </div>
              )}

              {aiGenerationNotice && (
                <div
                  className={`p-3 rounded border-2 font-mono text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                    aiGenerationNotice.type === 'success'
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'
                      : aiGenerationNotice.type === 'warning'
                      ? 'bg-amber-50 text-amber-950 border-amber-700 dark:bg-amber-950/40 dark:text-amber-200'
                      : 'bg-cyan-50 text-cyan-950 border-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200'
                  }`}
                >
                  <span>{aiGenerationNotice.text}</span>
                  {aiGenerationNotice.type === 'success' && (
                    <button
                      type="submit"
                      disabled={isSavingPub}
                      className="shrink-0 px-3 py-1.5 rounded border-2 border-black bg-[#121214] hover:bg-brand-orange disabled:opacity-60 text-white font-display font-black text-[11px] shadow-brutal-xs transition"
                    >
                      {isSavingPub ? '⏳ Guardando...' : '🚀 Publicar Ahora'}
                    </button>
                  )}
                </div>
              )}

              {/* Full Manual / Editable Fields */}
              <div className="space-y-4 pt-2 border-t-2 border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-xs uppercase tracking-wider">
                    📝 Datos de la Publicación (100% Editables Manualmente):
                  </span>
                  <label className="flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPinned}
                      onChange={(e) => setFormIsPinned(e.target.checked)}
                    />
                    <span>📌 Fijar arriba del muro</span>
                  </label>
                </div>

                {/* Row 1: Apartado + Tipo + Emoji */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-mono text-[11px] font-bold">Apartado Destino:</label>
                      <button
                        type="button"
                        onClick={handleOpenCreateSection}
                        className="text-[10px] font-mono font-bold text-brand-orange underline"
                      >
                        + Crear Apartado
                      </button>
                    </div>
                    <select
                      value={formSectionId}
                      onChange={(e) => setFormSectionId(e.target.value)}
                      className="w-full p-2 border-2 border-black rounded text-xs font-bold bg-white dark:bg-neutral-900"
                      data-testid="pub-form-section-select"
                    >
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.emoji} {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1">
                      Tipo de Publicación:
                    </label>
                    <select
                      value={formResourceType}
                      onChange={(e) =>
                        setFormResourceType(e.target.value as PublicationResourceType)
                      }
                      className="w-full p-2 border-2 border-black rounded text-xs font-bold bg-white dark:bg-neutral-900"
                      data-testid="pub-form-type-select"
                    >
                      <option value="github">🐙 Repositorio GitHub</option>
                      <option value="video">🎬 Video (YouTube / Loom)</option>
                      <option value="tutorial">🎓 Tutorial / Guía Paso a Paso</option>
                      <option value="link">🔗 Link / Documentación Web</option>
                      <option value="articulo">📰 Artículo / Blog</option>
                      <option value="herramienta">🛠️ Herramienta / App</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-mono text-[11px] font-bold block mb-1">Icono:</label>
                      <input
                        type="text"
                        value={formEmoji}
                        onChange={(e) => setFormEmoji(e.target.value)}
                        className="w-full p-2 border-2 border-black rounded text-center text-sm bg-white dark:bg-neutral-900"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="font-mono text-[11px] font-bold block mb-1">Nivel:</label>
                      <select
                        value={formDifficulty}
                        onChange={(e) =>
                          setFormDifficulty(e.target.value as PublicationDifficulty)
                        }
                        className="w-full p-2 border-2 border-black rounded text-xs font-bold bg-white dark:bg-neutral-900"
                      >
                        <option value="inicial">Inicial</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 2: Title + Author + Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="font-mono text-[11px] font-bold block mb-1">
                      Título de la Publicación *:
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ej: Playwright MCP — Automatización de Navegador para Agentes"
                      className="w-full p-2 border-2 border-black rounded text-xs font-display font-bold bg-white dark:bg-neutral-900"
                      data-testid="pub-form-title-input"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1">
                      Autor / Canal / Organización:
                    </label>
                    <input
                      type="text"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="Ej: microsoft / Andrej Karpathy"
                      className="w-full p-2 border-2 border-black rounded text-xs font-mono bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>

                {/* Row 3: Link URL + Estimated Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="font-mono text-[11px] font-bold block mb-1">
                      URL del Link / Repositorio / Video:
                    </label>
                    <input
                      type="text"
                      value={formUrl}
                      onChange={(e) => handleManualUrlChange(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2 border-2 border-black rounded text-xs font-mono bg-white dark:bg-neutral-900"
                      data-testid="pub-form-url-input"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1">
                      Duración / Tiempo Estimado:
                    </label>
                    <input
                      type="text"
                      value={formEstimatedTime}
                      onChange={(e) => setFormEstimatedTime(e.target.value)}
                      placeholder="Ej: 10 min lectura / Video 20m"
                      className="w-full p-2 border-2 border-black rounded text-xs font-mono bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="font-mono text-[11px] font-bold block mb-1">
                    📖 Resumen / Descripción Principal de la Publicación:
                  </label>
                  <textarea
                    rows={3}
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="Explicá de qué trata este recurso, qué problema resuelve y por qué lo compartís..."
                    className="w-full p-2.5 border-2 border-black rounded text-xs bg-white dark:bg-neutral-900 leading-relaxed"
                    data-testid="pub-form-summary-input"
                  />
                </div>

                {/* Criollo & Technical Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1 text-brand-orangeDark dark:text-brand-orange">
                      🎨 Explicación "En Criollo" (Analogía / Utilidad Práctica):
                    </label>
                    <textarea
                      rows={3}
                      value={formCriollo}
                      onChange={(e) => setFormCriollo(e.target.value)}
                      placeholder="En criollo: ¿Para qué nos sirve esto en el día a día del taller?"
                      className="w-full p-2.5 border-2 border-black rounded text-xs bg-orange-50/40 dark:bg-neutral-900 leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1 text-cyan-800 dark:text-cyan-300">
                      💻 Notas Técnicas / Comandos (Markdown):
                    </label>
                    <textarea
                      rows={3}
                      value={formTechnical}
                      onChange={(e) => setFormTechnical(e.target.value)}
                      placeholder="Comandos de instalación, fragmentos de código o detalles de arquitectura..."
                      className="w-full p-2.5 border-2 border-black rounded text-xs font-mono bg-cyan-50/30 dark:bg-neutral-900 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Key Points & Tutorial Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1">
                      📌 Puntos Clave (1 por renglón):
                    </label>
                    <textarea
                      rows={4}
                      value={formKeyPointsText}
                      onChange={(e) => setFormKeyPointsText(e.target.value)}
                      placeholder={`Punto clave 1\nPunto clave 2\nPunto clave 3`}
                      className="w-full p-2.5 border-2 border-black rounded text-xs bg-white dark:bg-neutral-900 leading-snug"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1">
                      🎓 Pasos del Tutorial / Cómo Usarlo (1 paso por renglón):
                    </label>
                    <textarea
                      rows={4}
                      value={formStepsText}
                      onChange={(e) => setFormStepsText(e.target.value)}
                      placeholder={`Clonar el repositorio\nInstalar dependencias con npm i\nEjecutar el comando principal`}
                      className="w-full p-2.5 border-2 border-black rounded text-xs bg-white dark:bg-neutral-900 leading-snug"
                    />
                  </div>
                </div>

                {/* Tags & Optional Media / GitHub Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1">
                      🏷️ Etiquetas (separadas por coma):
                    </label>
                    <input
                      type="text"
                      value={formTagsText}
                      onChange={(e) => setFormTagsText(e.target.value)}
                      placeholder="GitHub, IA, MCP, Tutorial"
                      className="w-full p-2 border-2 border-black rounded text-xs font-mono bg-white dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1">
                      🖼️ URL Imagen / Miniatura (Opcional):
                    </label>
                    <input
                      type="text"
                      value={formThumbnailUrl}
                      onChange={(e) => setFormThumbnailUrl(e.target.value)}
                      placeholder="Auto-detectada en YouTube/GitHub"
                      className="w-full p-2 border-2 border-black rounded text-xs font-mono bg-white dark:bg-neutral-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-mono text-[11px] font-bold block mb-1">
                        ⭐ Stars GH:
                      </label>
                      <input
                        type="number"
                        value={formGithubStars}
                        onChange={(e) => setFormGithubStars(e.target.value)}
                        placeholder="Ej: 4500"
                        className="w-full p-2 border-2 border-black rounded text-xs font-mono bg-white dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[11px] font-bold block mb-1">
                        💻 Lenguaje:
                      </label>
                      <input
                        type="text"
                        value={formGithubLanguage}
                        onChange={(e) => setFormGithubLanguage(e.target.value)}
                        placeholder="TypeScript"
                        className="w-full p-2 border-2 border-black rounded text-xs font-mono bg-white dark:bg-neutral-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              </div>

              {/* Sticky Modal Footer */}
              <div className="px-4 md:px-6 py-3.5 border-t-2 border-black bg-[#FAF9F5] dark:bg-[#1A1C22] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPubModalOpen(false)}
                  disabled={isSavingPub}
                  className="px-4 py-2 rounded border-2 border-black bg-white dark:bg-neutral-800 disabled:opacity-60 font-display font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPub}
                  className="px-5 py-2 rounded border-2 border-black bg-[#121214] hover:bg-brand-orange disabled:opacity-60 text-white font-display font-black text-xs shadow-brutal-sm transition"
                  data-testid="save-publication-submit-btn"
                >
                  {isSavingPub
                    ? '⏳ Guardando en Nube...'
                    : editingPubId
                    ? '💾 Guardar Cambios'
                    : '🚀 Publicar en el Muro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. MODAL CREAR / EDITAR APARTADO PERSONALIZADO                      */}
      {/* =================================================================== */}
      {isSectionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
          data-testid="section-editor-modal"
        >
          <div className="bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg shadow-brutal-xl w-full max-w-lg overflow-hidden">
            <header className="p-4 bg-[#FFD166] text-black border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗂️</span>
                <h3 className="font-display font-black text-base uppercase">
                  {editingSectionId ? 'Editar Apartado' : 'Crear Nuevo Apartado'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSectionModalOpen(false)}
                className="w-7 h-7 rounded border-2 border-black bg-white font-mono font-bold text-xs"
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleSaveSection} className="p-5 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="font-mono text-[11px] font-bold block mb-1">Emoji:</label>
                  <input
                    type="text"
                    value={secEmoji}
                    onChange={(e) => setSecEmoji(e.target.value)}
                    className="w-full p-2 border-2 border-black rounded text-center text-base bg-white dark:bg-neutral-900"
                    data-testid="sec-form-emoji-input"
                  />
                </div>
                <div className="col-span-3">
                  <label className="font-mono text-[11px] font-bold block mb-1">
                    Nombre del Apartado *:
                  </label>
                  <input
                    type="text"
                    required
                    value={secName}
                    onChange={(e) => setSecName(e.target.value)}
                    placeholder="Ej: Cursos de IA, Librerías UI, Videos Frontend..."
                    className="w-full p-2 border-2 border-black rounded text-xs font-display font-bold bg-white dark:bg-neutral-900"
                    data-testid="sec-form-name-input"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[11px] font-bold block mb-1">
                  Descripción corta del Apartado:
                </label>
                <textarea
                  rows={2}
                  value={secDescription}
                  onChange={(e) => setSecDescription(e.target.value)}
                  placeholder="¿Qué tipo de links, videos, repos o tutoriales se guardan en este apartado?"
                  className="w-full p-2 border-2 border-black rounded text-xs bg-white dark:bg-neutral-900"
                  data-testid="sec-form-desc-input"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] font-bold block mb-1.5">
                  Color Identificador:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {(
                    [
                      { id: 'orange', label: 'Naranja' },
                      { id: 'purple', label: 'Violeta' },
                      { id: 'rose', label: 'Rojo/Video' },
                      { id: 'emerald', label: 'Verde' },
                      { id: 'cyan', label: 'Cian' },
                      { id: 'yellow', label: 'Amarillo' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSecTone(t.id)}
                      className={`px-2.5 py-1 rounded border-2 border-black font-mono text-[10px] font-bold ${
                        TONE_STYLES[t.id].badge
                      } ${secTone === t.id ? 'ring-2 ring-black scale-105' : 'opacity-75'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t-2 border-black flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  disabled={isSavingSection}
                  className="px-4 py-2 rounded border-2 border-black bg-white dark:bg-neutral-800 disabled:opacity-60 font-display font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingSection}
                  className="px-4 py-2 rounded border-2 border-black bg-brand-orange disabled:opacity-60 text-white font-display font-black text-xs shadow-brutal-sm"
                  data-testid="save-section-submit-btn"
                >
                  {isSavingSection
                    ? '⏳ Guardando...'
                    : editingSectionId
                    ? 'Guardar Apartado'
                    : '✓ Crear Apartado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={showAiSettingsModal}
        onClose={() => {
          setShowAiSettingsModal(false);
          setAiConfig(getAiConfig());
        }}
        onShowToast={onShowToast}
        onConfigSaved={(newCfg) => {
          setAiConfig(newCfg);
          onShowToast(`✓ Configuración IA activa: ${newCfg.provider.toUpperCase()}`);
        }}
      />
    </div>
  );
};
