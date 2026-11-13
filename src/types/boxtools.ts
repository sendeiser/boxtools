export type CategorySlug = 'all' | 'skill' | 'mcp' | 'markdown' | 'app' | 'combo' | 'rule';

export type PhaseSlug = 'all' | 'fase0' | 'fase1' | 'fase2' | 'fase3' | 'fase4';

export type ViewMode = 'criollo' | 'tecnico';

export type ActiveSection = 'vault' | 'publications' | 'pevc' | 'repomix-v7' | 'vibe-guide' | 'combos' | 'onboarding' | 'admin';

export type PublicationResourceType = 'github' | 'video' | 'tutorial' | 'link' | 'articulo' | 'herramienta';

export type PublicationDifficulty = 'inicial' | 'intermedio' | 'avanzado';

export type SectionTone = 'orange' | 'cyan' | 'yellow' | 'emerald' | 'purple' | 'rose' | 'neutral';

export interface PublicationSection {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly tone: SectionTone;
  readonly isSystem?: boolean;
  readonly createdAt: string;
}

export interface PublicationItem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly criolloTakeaway: string;
  readonly technicalNotes: string;
  readonly url: string;
  readonly resourceType: PublicationResourceType;
  readonly sectionId: string; // ID del apartado al que pertenece
  readonly emoji: string;
  readonly authorOrChannel: string;
  readonly thumbnailUrl?: string;
  readonly videoEmbedUrl?: string;
  readonly githubStars?: number;
  readonly githubLanguage?: string;
  readonly keyPoints: readonly string[];
  readonly tutorialSteps: readonly string[];
  readonly tags: readonly string[];
  readonly difficulty: PublicationDifficulty;
  readonly estimatedTime: string;
  readonly isPinned: boolean;
  readonly isFavorite: boolean;
  readonly createdByAi: boolean;
  readonly createdAt: string;
}

export interface SvgFlowStep {
  readonly icon: string;
  readonly label: string;
  readonly sublabel: string;
  readonly tone: 'neutral' | 'orange' | 'cyan' | 'yellow' | 'emerald' | 'purple' | 'rose';
}

export interface SvgInfographicConfig {
  readonly title: string;
  readonly badge: string;
  readonly steps: readonly [SvgFlowStep, SvgFlowStep, SvgFlowStep];
  readonly summaryNote: string;
}

export interface ToolMediaItem {
  readonly id: string;
  readonly url: string;
  readonly caption: string;
  readonly isAiGenerated: boolean;
  readonly promptUsed?: string;
}

export interface InstallCommands {
  readonly antigravity: string;
  readonly opencode: string;
  readonly cursor: string;
  readonly claudeCode: string;
}

export interface ToolItem {
  readonly id: string;
  readonly slug: string;
  readonly codeId: string;
  readonly title: string;
  readonly tagline: string;
  readonly emoji: string;
  readonly category: Exclude<CategorySlug, 'all' | 'combo'>;
  readonly categoryLabel: string;
  readonly phase: Exclude<PhaseSlug, 'all'>;
  readonly phaseLabel: string;
  readonly status: 'published' | 'draft';
  readonly isFeatured: boolean;
  readonly criolloAnalogy: string;
  readonly criolloWithout: readonly string[];
  readonly criolloWith: readonly string[];
  readonly semaforoGreen: readonly string[];
  readonly semaforoRed: readonly string[];
  readonly riskLevel: 'low' | 'medium' | 'high';
  readonly mermaidCode: string;
  readonly svgConfig: SvgInfographicConfig;
  readonly mediaGallery: readonly ToolMediaItem[];
  readonly cliQuickCommand: string;
  readonly installCommands: InstallCommands;
  readonly mcpConfigJson?: string;
  readonly rawMarkdown: string;
  readonly repoUrl: string;
  readonly compatibilityTags: readonly string[];
}

export interface ComboPreset {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly badgeColor: 'orange' | 'cyan' | 'yellow' | 'purple';
  readonly criolloSummary: string;
  readonly toolSlugs: readonly string[];
  readonly workflowNote: string;
}

export interface AiSettingsConfig {
  readonly provider: 'gemini' | 'openai' | 'openrouter';
  readonly apiKey: string;
  readonly modelText: string;
  readonly modelImage: string;
  readonly enableSvgFallback: boolean;
}

