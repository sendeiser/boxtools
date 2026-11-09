import React, { useState, useEffect } from 'react';
import { ToolItem, CategorySlug, PhaseSlug, AiSettingsConfig } from '../types/boxtools';
import { MermaidViewer } from './MermaidViewer';
import { SvgInfographic } from './SvgInfographic';
import { AiSettingsModal } from './AiSettingsModal';
import { getAiConfig, synthesizeWithRealAi, SourceContext } from '../lib/aiService';

export interface ToolVariationOption {
  readonly id: string;
  readonly name: string;
  readonly badge: string;
  readonly badgeColor: 'orange' | 'cyan' | 'purple';
  readonly icon: string;
  readonly description: string;
  tool: ToolItem;
}

export interface AddToolModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onAddTool: (tool: ToolItem) => void;
  readonly onShowToast: (msg: string) => void;
}

export const AddToolModal: React.FC<AddToolModalProps> = ({
  isOpen,
  onClose,
  onAddTool,
  onShowToast,
}) => {
  const [sourceType, setSourceType] = useState<'link' | 'file'>('link');
  const [inputUrl, setInputUrl] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Variations state: Array of 3 AI-generated variations
  const [variations, setVariations] = useState<ToolVariationOption[]>([]);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);

  // AI settings state
  const [showAiSettingsModal, setShowAiSettingsModal] = useState(false);
  const [aiConfig, setAiConfig] = useState<AiSettingsConfig>(getAiConfig());
  const [aiStatus, setAiStatus] = useState<
    | { kind: 'real'; source: SourceContext }
    | { kind: 'error'; message: string; source?: SourceContext }
    | { kind: 'local' }
    | null
  >(null);
  const [synthStep, setSynthStep] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAiConfig(getAiConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      onShowToast(`✓ Archivo cargado: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const synthesizeToolWithAi = async () => {
    const rawInput = sourceType === 'link' ? inputUrl.trim() : fileContent.trim();
    if (!rawInput) {
      onShowToast('⚠️ Ingresa una URL o selecciona un archivo para procesar');
      return;
    }

    setIsSynthesizing(true);
    setAiStatus(null);

    // 1. IA Real (Gemini / OpenRouter / OpenAI): primero lee el contenido del link y luego analiza
    if (aiConfig.apiKey.trim()) {
      setSynthStep(sourceType === 'link' ? '📥 Leyendo el contenido del link (README / web)...' : '📄 Preparando el archivo...');
      const stepTimer = setTimeout(
        () => setSynthStep(`🧠 ${aiConfig.provider.toUpperCase()} está analizando el contenido y armando las 3 fichas...`),
        2500
      );

      const result = await synthesizeWithRealAi({ sourceType, rawInput, fileName });
      clearTimeout(stepTimer);
      setSynthStep('');

      if (result.ok && result.variations && result.variations.length === 3) {
        setVariations(result.variations);
        setSelectedVariationIndex(0);
        setIsSynthesizing(false);
        setAiStatus({ kind: 'real', source: result.source! });
        onShowToast(
          `✨ ${aiConfig.provider.toUpperCase()} analizó ${result.source?.label} (${result.source?.chars.toLocaleString()} caracteres)`
        );
        return;
      }

      // Si falló, NO esconder el error: mostrarlo y no generar plantillas genéricas
      setIsSynthesizing(false);
      setAiStatus({ kind: 'error', message: result.error || 'Error desconocido', source: result.source });
      onShowToast(`⚠️ La IA falló: ${result.error}`);
      return;
    }

    setAiStatus({ kind: 'local' });

    // 2. Sin API Key: motor estructurado local (plantillas)
    setTimeout(() => {
      let candidateName = 'Nueva Herramienta Agéntica';
      let defaultCategory: Exclude<CategorySlug, 'all' | 'combo'> = 'skill';
      let defaultCategoryLabel = '⚡ SKILL AGÉNTICA';
      let repoUrl = 'https://github.com/boxtools/vault';

      if (sourceType === 'link') {
        repoUrl = inputUrl;
        const parts = inputUrl.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1] || 'herramienta';
        candidateName = lastPart.replace(/[-_]/g, ' ').replace(/\.git$/, '');

        if (inputUrl.includes('mcp') || candidateName.toLowerCase().includes('mcp')) {
          defaultCategory = 'mcp';
          defaultCategoryLabel = '🔌 SERVIDOR MCP';
        } else if (inputUrl.endsWith('.md') || candidateName.toLowerCase().includes('workflow')) {
          defaultCategory = 'markdown';
          defaultCategoryLabel = '📝 WORKFLOW MARKDOWN';
        }
      } else {
        const titleMatch = fileContent.match(/^#\s+(.+)$/m);
        if (titleMatch && titleMatch[1]) {
          candidateName = titleMatch[1].trim();
        } else if (fileName) {
          candidateName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        }

        if (fileName.endsWith('.md') || fileContent.toLowerCase().includes('workflow')) {
          defaultCategory = 'markdown';
          defaultCategoryLabel = '📝 WORKFLOW MARKDOWN';
        }
      }

      const slugBase = candidateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `tool-${Date.now()}`;
      const titleFormatted = candidateName.charAt(0).toUpperCase() + candidateName.slice(1);
      const randomSuffix = Math.floor(Math.random() * 90 + 10);

      // VARIACIÓN 1: Criollo & Velocidad Práctica 🛠️
      const toolVar1: ToolItem = {
        id: `t-${slugBase}-criollo-${Date.now()}`,
        slug: `${slugBase}-practico`,
        codeId: defaultCategory === 'mcp' ? `MCP-0${randomSuffix}` : defaultCategory === 'markdown' ? `MD-0${randomSuffix}` : `SKILL-0${randomSuffix}`,
        title: `${titleFormatted} (Enfoque Práctico)`,
        tagline: `Solución agéntica directa y sin vueltas para ${titleFormatted}: automatiza las tareas repetitivas de configuración, ejecución y diagnóstico directamente desde tu entorno de trabajo. Permite que el agente resuelva en minutos lo que manualmente llevaría horas de lectura de documentación y pruebas de ensayo y error, manteniendo el foco en entregar código funcional y limpio en el día a día.`,
        emoji: '🛠️',
        category: defaultCategory,
        categoryLabel: defaultCategoryLabel,
        phase: 'fase2' as Exclude<PhaseSlug, 'all'>,
        phaseLabel: 'FASE 2 // VIBE CODING',
        status: 'published',
        isFeatured: false,
        criolloAnalogy: `Es como cuando llamás al mecánico de confianza del barrio que ya conoce el ruido del motor de memoria y viene con la llave tubo exacta en el bolsillo: en vez de hacerte desarmar medio auto ni pasarte toda la tarde adivinando con el capó levantado, conecta el escáner, ajusta la pieza justa en cinco minutos y te deja el coche regulando parejito para salir a la ruta sin renegar.`,
        criolloWithout: [
          `Perder horas valiosas buscando ejemplos desactualizados en foros y renegando con configuraciones manuales que fallan a mitad de camino.`,
          `Escribir código repetitivo de integración para ${titleFormatted} que un agente especializado podría resolver de forma automática y sin errores de tipeo.`,
          `Depender de prueba y error constante en consola sin una guía clara de comandos probados para el proyecto.`,
        ],
        criolloWith: [
          `Automatización directa con comandos estandarizados listos para ejecutar sin fricción desde el primer minuto en el repositorio.`,
          `El agente comprende exactamente qué archivos e interfaces tocar sin romper lo que ya estaba funcionando en el sistema.`,
          `Resolución pragmática orientada a resultados rápidos para destrabar el desarrollo diario del equipo.`,
        ],
        semaforoGreen: [
          `Cuando necesitás velocidad inmediata para integrar y operar ${titleFormatted} en tu flujo de desarrollo cotidiano.`,
          `Para automatizar tareas operativas recurrentes y configurar el entorno sin tener que inventar la rueda en cada proyecto.`,
          `Ideal para destrabar bloqueos técnicos rápidos con comandos directos de terminal.`,
        ],
        semaforoRed: [
          `No activar esta herramienta si la tarea actual no involucra directamente a ${titleFormatted}, para mantener limpio el contexto del agente.`,
          `Evitar usar el enfoque rápido sin revisión previa cuando se estén modificando esquemas productivos irreversibles.`,
        ],
        riskLevel: 'low',
        mermaidCode: `flowchart LR
    A["💡 Requerimiento o Bug"] --> B["🛠️ ${titleFormatted}"]
    B --> C["⚡ Diagnóstico & Ajuste"]
    C --> D["✅ Verificación Local"]
    D --> E["🚀 Listo en Producción"]`,
        svgConfig: {
          title: `Flujo Práctico: ${titleFormatted}`,
          badge: 'VELOCIDAD & CERO VUELTAS',
          steps: [
            { icon: '💡', label: 'Detección Rápida', sublabel: 'Lectura del contexto', tone: 'orange' },
            { icon: '🛠️', label: 'Ejecución Directa', sublabel: 'Comandos sin fricción', tone: 'cyan' },
            { icon: '🚀', label: 'Entrega Validada', sublabel: 'Listo para usar', tone: 'emerald' },
          ],
          summaryNote: `Flujo optimizado de tres etapas para máxima velocidad de desarrollo: detecta la necesidad en el repositorio, ejecuta la automatización de ${titleFormatted} sin pasos burocráticos y entrega el resultado verificado.`,
        },
        mediaGallery: [
          {
            id: `m-${slugBase}-1`,
            url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
            caption: `Esquema de integración práctica para ${titleFormatted}`,
            isAiGenerated: false,
          },
        ],
        cliQuickCommand: `npx skills add ${repoUrl}`,
        installCommands: {
          antigravity: `agy plugin install ${repoUrl}`,
          opencode: `npx skills add ${repoUrl}`,
          cursor: `npx skills add ${repoUrl}`,
          claudeCode: `npx skills add ${repoUrl}`,
        },
        rawMarkdown: `# ${titleFormatted} — Enfoque Práctico & Velocidad

## 📖 Descripción Profunda y Propósito
**${titleFormatted}** en su variante práctica está pensada para desarrolladores que necesitan resultados inmediatos sin empantanarse en configuraciones eternas. Integra directivas claras y comandos listos para usar que le permiten al agente de IA operar la herramienta con precisión quirúrgica desde la primera instrucción.

## ⚙️ Arquitectura y Cómo Funciona por Dentro
1. **Ingesta de Contexto Local:** Identifica los archivos clave del proyecto antes de ejecutar cualquier acción.
2. **Automatización Directa:** Ejecuta los comandos nativos de \`${titleFormatted}\` con los parámetros óptimos.
3. **Verificación Rápida:** Comprueba que la salida sea limpia y que el proyecto siga compilando sin errores.

## 🚀 Instalación y Comandos Reales
\`\`\`bash
npx skills add ${repoUrl}
\`\`\`

## 💡 Casos de Uso en el Equipo
- Configuración inicial rápida en repositorios nuevos o existentes.
- Resolución de tareas repetitivas mediante comandos estandarizados.
`,
        repoUrl,
        compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
      };

      // VARIACIÓN 2: Arquitectura Enterprise & Blindaje 🛡️
      const toolVar2: ToolItem = {
        id: `t-${slugBase}-enterprise-${Date.now()}`,
        slug: `${slugBase}-enterprise`,
        codeId: defaultCategory === 'mcp' ? `MCP-E${randomSuffix}` : defaultCategory === 'markdown' ? `MD-E${randomSuffix}` : `SKILL-E${randomSuffix}`,
        title: `${titleFormatted} (Arquitectura Enterprise)`,
        tagline: `Integración determinista de grado empresarial para ${titleFormatted} diseñada bajo estándares estrictos de arquitectura de software. Incorpora validación rigurosa de contratos, aislamiento de responsabilidades, trazabilidad de cambios y tolerancia cero a regresiones para garantizar que cada operación sea predecible, auditable y segura en entornos de misión crítica.`,
        emoji: '🛡️',
        category: defaultCategory,
        categoryLabel: defaultCategoryLabel,
        phase: 'fase0' as Exclude<PhaseSlug, 'all'>,
        phaseLabel: 'FASE 0 // ARQUITECTURA & SEGURIDAD',
        status: 'published',
        isFeatured: true,
        criolloAnalogy: `Es como el protocolo de chequeo pre-vuelo en la cabina de un avión comercial internacional: ningún interruptor se toca de memoria ni a las apuradas; cada subsistema tiene su lista de verificación firmada, su sensor de respaldo y su contrato de seguridad para garantizar que el avión despegue, vuele en medio de cualquier tormenta y aterrice con precisión milimétrica.`,
        criolloWithout: [
          `Inconsistencias de contratos, tipos de datos desincronizados y acumulación de deuda técnica silenciosa al integrar ${titleFormatted} sin estándares.`,
          `Despliegues riesgosos sin cobertura de pruebas automatizadas que terminan rompiendo servicios críticos en producción un viernes a la tarde.`,
          `Falta de trazabilidad y control sobre qué permisos o recursos del sistema modifica la herramienta durante su ejecución.`,
        ],
        criolloWith: [
          `Blindaje integral mediante contratos estrictos, validación de esquemas de entrada/salida y separación clara de capas arquitectónicas.`,
          `Verificación continua bajo ciclo TDD (Rojo ➔ Verde ➔ Refactor) y auditoría preventiva antes de fusionar cualquier cambio a la rama principal.`,
          `Documentación técnica clara y reproducible para que todo el equipo de ingeniería mantenga el mismo estándar de calidad.`,
        ],
        semaforoGreen: [
          `En arquitecturas empresariales, plataformas en producción o módulos críticos donde un fallo impacte directamente a los usuarios.`,
          `Cuando se requiere trazabilidad completa, contratos de interfaz inmutables y validación automatizada en el pipeline CI/CD.`,
          `Al escalar un proyecto entre múltiples desarrolladores y agentes trabajando en paralelo.`,
        ],
        semaforoRed: [
          `PROHIBIDO alterar contratos principales o esquemas de base de datos sin contar con pruebas automatizadas previas y respaldo.`,
          `Evitar saltearse las validaciones de tipos o desactivar reglas del linter para forzar un despliegue rápido.`,
        ],
        riskLevel: 'medium',
        mermaidCode: `flowchart TD
    A["📄 Contrato & Esquema"] --> B["🛡️ ${titleFormatted}"]
    B --> C["🧪 Suite de Validación TDD"]
    C --> D["🔒 Auditoría de Seguridad"]
    D --> E["📦 Despliegue Inmutable"]`,
        svgConfig: {
          title: `Protocolo Enterprise: ${titleFormatted}`,
          badge: 'BLINDAJE & CONTRATOS ESTRICTOS',
          steps: [
            { icon: '📄', label: 'Contrato y Tipos', sublabel: 'Validación de esquema', tone: 'cyan' },
            { icon: '🛡️', label: 'Ejecución Aislada', sublabel: 'Control y TDD estricto', tone: 'purple' },
            { icon: '🔒', label: 'Auditoría Final', sublabel: '100% blindado', tone: 'emerald' },
          ],
          summaryNote: `Arquitectura defensiva de tres capas: valida los contratos de entrada antes de invocar ${titleFormatted}, ejecuta los procesos en un entorno controlado con pruebas TDD y certifica la integridad antes de producción.`,
        },
        mediaGallery: [
          {
            id: `m-${slugBase}-2`,
            url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
            caption: `Arquitectura de seguridad y contratos para ${titleFormatted}`,
            isAiGenerated: false,
          },
        ],
        cliQuickCommand: `npx skills add ${repoUrl}`,
        installCommands: {
          antigravity: `agy plugin install ${repoUrl}`,
          opencode: `npx skills add ${repoUrl}`,
          cursor: `npx skills add ${repoUrl}`,
          claudeCode: `npx skills add ${repoUrl}`,
        },
        rawMarkdown: `# ${titleFormatted} — Edición Arquitectura Enterprise

## 📖 Descripción Profunda y Propósito
Esta variante de **${titleFormatted}** establece un marco de ingeniería robusto pensado para entornos productivos de alta exigencia. En lugar de ejecutar acciones aisladas, estructura el trabajo alrededor de contratos explícitos, control de errores determinista y validación automatizada de principio a fin.

## ⚙️ Arquitectura y Flujo de Datos
1. **Capa de Contratos y Validación:** Verifica precondiciones, tipos y configuraciones antes de iniciar.
2. **Núcleo de Ejecución Controlada:** Aplica las capacidades de \`${titleFormatted}\` respetando límites de seguridad y aislamiento.
3. **Certificación y Auditoría:** Ejecuta pruebas de regresión y comprueba la integridad del build de producción.

## 🚀 Instalación y Comandos Reales
\`\`\`bash
npx skills add ${repoUrl}
\`\`\`

## 🛡️ Buenas Prácticas y Gobernanza
- Validar siempre las entradas y salidas con tipado estricto.
- Comprobar el semáforo de pruebas antes de integrar cambios en \`main\`.
`,
        repoUrl,
        compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
      };

      // VARIACIÓN 3: Vibe UI & Prototipado Ágil ✨
      const toolVar3: ToolItem = {
        id: `t-${slugBase}-vibe-${Date.now()}`,
        slug: `${slugBase}-vibe-ui`,
        codeId: defaultCategory === 'mcp' ? `MCP-V${randomSuffix}` : defaultCategory === 'markdown' ? `MD-V${randomSuffix}` : `SKILL-V${randomSuffix}`,
        title: `${titleFormatted} (Vibe UI & Prototipado)`,
        tagline: `Acelerador de experiencia de desarrollo (DX) y prototipado interactivo con ${titleFormatted}: combina iteración creativa de alta velocidad, feedback visual continuo y orquestación fluida con agentes de IA. Diseñado para transformar ideas y bocetos en implementaciones pulidas, responsivas y listas para demostrar en tiempo récord.`,
        emoji: '✨',
        category: defaultCategory,
        categoryLabel: defaultCategoryLabel,
        phase: 'fase2' as Exclude<PhaseSlug, 'all'>,
        phaseLabel: 'FASE 2 // VIBE UI & DESIGN',
        status: 'published',
        isFeatured: false,
        criolloAnalogy: `Es como trabajar en un estudio de diseño y prototipado de alta costura donde tenés a los mejores artesanos al lado tuyo: apenas tirás la idea sobre la mesa, te arman la maqueta a escala real, prueban cómo le da la luz desde todos los ángulos y ajustan cada costura en el acto para que el producto final entre por los ojos y funcione con total suavidad.`,
        criolloWithout: [
          `Ciclos de iteración lentos y frustrantes donde cada pequeño cambio visual o funcional requiere rehacer configuraciones a mano.`,
          `Prototipos desconectados de la realidad técnica que luego hay que tirar a la basura al pasar a la etapa de código real con ${titleFormatted}.`,
          `Experiencias de usuario rígidas o genéricas por falta de tiempo para explorar y pulir variantes interactivas.`,
        ],
        criolloWith: [
          `Prototipado a la velocidad del pensamiento integrando ${titleFormatted} en un flujo conversacional ágil con el agente.`,
          `Iteración en tiempo real sobre componentes, flujos y estados interactivos con validación visual en escritorio y móvil (375px).`,
          `Transición directa entre el prototipo inicial y el código definitivo sin duplicar esfuerzos de maquetación o lógica.`,
        ],
        semaforoGreen: [
          `Al idear, prototipar e iterar nuevas funcionalidades, interfaces interactivas o flujos de usuario con ${titleFormatted}.`,
          `Cuando buscás explorar múltiples variantes de diseño o experiencia antes de comprometerte con una única implementación.`,
          `En sesiones de Vibe Coding donde la prioridad es mantener el flujo creativo sin interrupciones técnicas.`,
        ],
        semaforoRed: [
          `No utilizar como sustituto de las pruebas de seguridad o migraciones críticas de base de datos en etapa de cierre.`,
          `Evitar dejar estilos o configuraciones experimentales de prototipo sin consolidar antes del despliegue final.`,
        ],
        riskLevel: 'low',
        mermaidCode: `flowchart LR
    A["🎨 Idea & Prompt"] --> B["✨ ${titleFormatted}"]
    B --> C["⚡ Prototipo Vivo"]
    C --> D["👁️ Ajuste & Feedback"]
    D --> E["💎 Experiencia Pulida"]`,
        svgConfig: {
          title: `Tubería Vibe UI: ${titleFormatted}`,
          badge: 'DISEÑO & PROTOTIPADO ÁGIL',
          steps: [
            { icon: '🎨', label: 'Concepto & Prompt', sublabel: 'Definición de intención', tone: 'orange' },
            { icon: '✨', label: 'Iteración en Vivo', sublabel: 'Generación ágil', tone: 'purple' },
            { icon: '💎', label: 'Acabado Pulido', sublabel: 'Validado en 375px+', tone: 'emerald' },
          ],
          summaryNote: `Flujo creativo de retroalimentación rápida: traduce la intención del usuario, acelera la construcción interactiva mediante ${titleFormatted} y refina cada detalle visual y funcional en vivo.`,
        },
        mediaGallery: [
          {
            id: `m-${slugBase}-3`,
            url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
            caption: `Lienzo de diseño y componentes para ${titleFormatted}`,
            isAiGenerated: false,
          },
        ],
        cliQuickCommand: `npx skills add ${repoUrl}`,
        installCommands: {
          antigravity: `agy plugin install ${repoUrl}`,
          opencode: `npx skills add ${repoUrl}`,
          cursor: `npx skills add ${repoUrl}`,
          claudeCode: `npx skills add ${repoUrl}`,
        },
        rawMarkdown: `# ${titleFormatted} — Edición Vibe UI & Prototipado Ágil

## 📖 Descripción Profunda y Propósito
La variante **Vibe UI & Prototipado** de **${titleFormatted}** pone la experiencia del desarrollador (DX) y la velocidad de iteración en el centro de la escena. Está estructurada para acompañar sesiones de co-programación con IA donde se necesita experimentar, visualizar cambios al instante y pulir la interfaz o el flujo de trabajo sin fricción.

## ⚙️ Arquitectura del Flujo Iterativo
1. **Captura de Intención:** Interpreta objetivos funcionales y estéticos de alto nivel.
2. **Construcción Incremental:** Aplica \`${titleFormatted}\` generando bloques modulares fáciles de ajustar en caliente.
3. **Pulido Multimodal:** Verifica responsividad (375px a 1440px), estados interactivos y consistencia general.

## 🚀 Instalación y Comandos Reales
\`\`\`bash
npx skills add ${repoUrl}
\`\`\`
`,
        repoUrl,
        compatibilityTags: ['Antigravity', 'OpenCode', 'Cursor', 'Claude Code'],
      };

      const generatedList: ToolVariationOption[] = [
        {
          id: 'v-criollo',
          name: '1. Criollo & Velocidad',
          badge: 'PRÁCTICO & DIRECTO',
          badgeColor: 'orange',
          icon: '🛠️',
          description: 'Metáforas de la vida cotidiana bien explicadas, comandos directos sin vueltas y foco total en destrabar el trabajo diario con productividad inmediata.',
          tool: toolVar1,
        },
        {
          id: 'v-enterprise',
          name: '2. Arquitectura Enterprise',
          badge: 'CONTRATOS & SEGURIDAD',
          badgeColor: 'cyan',
          icon: '🛡️',
          description: 'Máximo rigor de ingeniería de software: arquitectura interna detallada, contratos estrictos, prevención de fallos y ciclo de verificación TDD.',
          tool: toolVar2,
        },
        {
          id: 'v-vibe',
          name: '3. Vibe UI & Prototipado',
          badge: 'DISEÑO & EXPERIENCIA',
          badgeColor: 'purple',
          icon: '✨',
          description: 'Enfocado en experiencia de desarrollo (DX), iteración creativa de alta velocidad, prototipado interactivo y acabado visual impecable.',
          tool: toolVar3,
        },
      ];

      setVariations(generatedList);
      setSelectedVariationIndex(0);
      setIsSynthesizing(false);
      onShowToast(`✨ IA generó 3 variaciones completas para "${titleFormatted}"`);
    }, 1200);
  };

  const currentOption = variations[selectedVariationIndex];
  const activeTool = currentOption?.tool;

  const handleConfirmAdd = () => {
    if (!activeTool) return;
    onAddTool(activeTool);
    onClose();
  };

  const handleUpdateActiveTool = (updated: ToolItem) => {
    const updatedList = [...variations];
    updatedList[selectedVariationIndex] = {
      ...updatedList[selectedVariationIndex],
      tool: updated,
    };
    setVariations(updatedList);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg shadow-brutal-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <header className="p-4 bg-brand-orange text-white border-b-2 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#121214] text-white border-2 border-white flex items-center justify-center font-display font-black text-sm">
              ➕
            </div>
            <div>
              <h3 className="font-display font-black text-base md:text-lg leading-none uppercase">
                Subir Herramienta al Baúl con Variaciones IA
              </h3>
              <span className="font-mono text-[10px] text-white/90 font-bold">
                GENERA MÚLTIPLES ENFOQUES: CRIOLLO, ENTERPRISE O VIBE UI
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border-2 border-black bg-white text-black font-mono font-bold text-sm shadow-brutal-sm hover:bg-neutral-100 flex items-center justify-center"
          >
            ✕
          </button>
        </header>

        {/* Modal Body */}
        <div className="p-4 md:p-6 flex-1 overflow-y-auto space-y-6">
          {/* Source Tabs */}
          <div className="space-y-3">
            <label className="font-display font-black text-xs uppercase tracking-wider block">
              1. Selecciona el Origen:
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSourceType('link')}
                className={`p-3 rounded border-2 border-black font-display font-bold text-xs flex items-center justify-center gap-2 transition ${
                  sourceType === 'link'
                    ? 'bg-[#FFD166] text-black shadow-brutal-sm'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <span>🔗</span>
                <span>Por Link o URL (GitHub, Docs, npm)</span>
              </button>

              <button
                onClick={() => setSourceType('file')}
                className={`p-3 rounded border-2 border-black font-display font-bold text-xs flex items-center justify-center gap-2 transition ${
                  sourceType === 'file'
                    ? 'bg-[#FFD166] text-black shadow-brutal-sm'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <span>📁</span>
                <span>Por Archivo (.md, .json, .txt)</span>
              </button>
            </div>
          </div>

          {/* Input based on source */}
          {sourceType === 'link' ? (
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold block">
                URL del repositorio o documentación:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://github.com/usuario/nombre-skill-o-mcp..."
                  className="flex-1 p-2.5 border-2 border-black rounded font-mono text-xs bg-neutral-50 dark:bg-neutral-900 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-500 pt-1">
                <span>Ejemplos rápidos:</span>
                <button
                  type="button"
                  onClick={() => setInputUrl('https://github.com/astral-sh/uv')}
                  className="underline hover:text-black dark:hover:text-white"
                >
                  astral-sh/uv
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setInputUrl('https://github.com/shadcn-ui/ui')}
                  className="underline hover:text-black dark:hover:text-white"
                >
                  shadcn-ui/ui
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setInputUrl('https://github.com/modelcontextprotocol/servers')}
                  className="underline hover:text-black dark:hover:text-white"
                >
                  mcp/servers
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold block">
                Arrastra o selecciona el archivo local:
              </label>
              <div className="border-2 border-dashed border-black dark:border-neutral-700 rounded-lg p-5 text-center bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 transition relative">
                <input
                  type="file"
                  accept=".md,.json,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-1">
                  <span className="text-2xl">📄</span>
                  <p className="font-display font-bold text-xs">
                    {fileName ? `Archivo seleccionado: ${fileName}` : 'Haz click para subir o arrastra tu archivo aquí'}
                  </p>
                  <p className="font-mono text-[10px] text-neutral-500">
                    Formatos soportados: Markdown (.md), JSON (.json), Texto plano (.txt)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Connection Status Bar */}
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 border-2 border-black rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${aiConfig.apiKey.trim() ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`}></span>
              <div>
                <p className="font-bold">
                  {aiConfig.apiKey.trim() ? (
                    <span className="text-emerald-700 dark:text-emerald-400">
                      MOTOR IA REAL ACTIVO: {aiConfig.provider.toUpperCase()} ({aiConfig.modelText})
                    </span>
                  ) : (
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Modo Síntesis Local (Sin API Key conectada)
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-neutral-500">
                  {aiConfig.apiKey.trim()
                    ? 'Genera fichas y análisis con la API oficial en tiempo real.'
                    : 'Puedes conectar tu clave de Gemini u OpenRouter para análisis en vivo.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAiSettingsModal(true)}
              className="shrink-0 px-3 py-1.5 bg-[#FFD166] text-black font-display font-black text-[11px] border-2 border-black rounded shadow-brutal-xs hover:bg-yellow-400 transition flex items-center justify-center gap-1.5"
            >
              <span>🔑</span>
              <span>{aiConfig.apiKey.trim() ? 'Cambiar / Probar API Key' : 'Conectar API Key IA'}</span>
            </button>
          </div>

          {/* AI Trigger Button */}
          <div className="pt-2">
            <button
              onClick={synthesizeToolWithAi}
              disabled={isSynthesizing}
              className="w-full py-3 bg-brand-orange text-white font-display font-black text-xs md:text-sm uppercase rounded border-2 border-black shadow-brutal-md hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isSynthesizing ? '⏳' : '🤖'}</span>
              <span>
                {isSynthesizing
                  ? synthStep || 'La IA está sintetizando 3 variaciones de ficha (Criollo, Enterprise y Vibe UI)...'
                  : 'Desarrollar con IA (Generar 3 Variaciones)'}
              </span>
            </button>
          </div>

          {/* AI Result Status Banner */}
          {aiStatus?.kind === 'error' && (
            <div className="p-3 bg-[#FCE8E6] text-[#8C1D18] border-2 border-[#C5221F] rounded text-xs font-mono space-y-1" data-testid="ai-error-banner">
              <p className="font-bold">⚠️ La IA no pudo generar las fichas</p>
              <p className="break-words">{aiStatus.message}</p>
              {aiStatus.source && (
                <p className="text-[10px] opacity-80">
                  Fuente leída: {aiStatus.source.label} ({aiStatus.source.chars.toLocaleString()} caracteres)
                </p>
              )}
              <p className="text-[10px] opacity-80">
                Revisá la API Key / créditos o probá otro modelo en "Cambiar / Probar API Key".
              </p>
            </div>
          )}
          {aiStatus?.kind === 'real' && (
            <div className="p-3 bg-[#E6F4EA] text-[#0D5223] border-2 border-[#137333] rounded text-xs font-mono">
              <p className="font-bold">
                ✅ Fichas generadas por {aiConfig.provider.toUpperCase()} ({aiConfig.modelText}) leyendo el contenido real
              </p>
              <p className="text-[10px] mt-0.5">
                Fuente analizada: {aiStatus.source.label} — {aiStatus.source.chars.toLocaleString()} caracteres
                {aiStatus.source.kind === 'url-only' && ' (no se pudo leer la página: el análisis puede ser impreciso)'}
              </p>
            </div>
          )}
          {aiStatus?.kind === 'local' && (
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-400 rounded text-xs font-mono">
              ℹ️ Sin API Key: se usaron plantillas locales (no se analizó el contenido del link). Conectá Gemini u OpenRouter para un análisis real.
            </div>
          )}

          {/* VARIATIONS SELECTOR & PREVIEW */}
          {variations.length > 0 && activeTool && (
            <div className="space-y-4 pt-2 border-t-2 border-black animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="font-display font-black text-xs uppercase tracking-wider block">
                    2. Elige el Enfoque / Variación que Prefieras:
                  </label>
                  <span className="text-[11px] font-mono text-neutral-500">
                    Cada variación adapta la analogía, el diagrama, el semáforo y los comandos al perfil del equipo.
                  </span>
                </div>
                <button
                  onClick={synthesizeToolWithAi}
                  className="text-xs font-mono font-bold text-brand-orange underline self-start sm:self-auto hover:text-orange-600"
                >
                  🔄 Regenerar Variantes
                </button>
              </div>

              {/* Variation Tabs Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {variations.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariationIndex(idx)}
                    className={`p-3 rounded border-2 border-black text-left transition flex flex-col justify-between gap-2 ${
                      selectedVariationIndex === idx
                        ? 'bg-[#FFD166] text-black shadow-brutal-sm scale-[1.01]'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-xs flex items-center gap-1.5">
                        <span>{v.icon}</span>
                        <span>{v.name}</span>
                      </span>
                      <span className="font-mono text-[8px] bg-black text-white px-1 py-0.5 rounded font-bold">
                        {v.badge}
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug opacity-95">
                      {v.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Active Variation Detailed Card Preview */}
              <div className="border-2 border-black rounded-lg p-4 bg-[#FFFDF7] dark:bg-[#1A1C22] shadow-brutal-sm space-y-4">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeTool.emoji}</span>
                    <div>
                      <h4 className="font-display font-black text-sm">{activeTool.title}</h4>
                      <span className="font-mono text-[10px] text-brand-orange font-bold">
                        {activeTool.codeId} // {activeTool.phaseLabel}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-800 px-2 py-0.5 rounded font-black">
                    VARIANTE SELECCIONADA
                  </span>
                </div>

                {/* Editable Title & Extended Description */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1">Título de la Herramienta:</label>
                    <input
                      type="text"
                      value={activeTool.title}
                      onChange={(e) =>
                        handleUpdateActiveTool({ ...activeTool, title: e.target.value })
                      }
                      className="w-full p-2 border border-black rounded text-xs bg-white dark:bg-neutral-900 font-display font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] font-bold block mb-1">
                      📖 Descripción General Completa (se muestra en la tarjeta y en la ficha):
                    </label>
                    <textarea
                      rows={4}
                      value={activeTool.tagline}
                      onChange={(e) =>
                        handleUpdateActiveTool({ ...activeTool, tagline: e.target.value })
                      }
                      className="w-full p-2.5 border border-black rounded text-xs bg-white dark:bg-neutral-900 font-sans leading-relaxed"
                    />
                  </div>
                </div>

                {/* Editable Analogia */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-brand-orangeDark dark:text-brand-orange font-mono">
                    💡 Modo Criollo (La Analogía Desarrollada de esta Variante):
                  </label>
                  <textarea
                    rows={4}
                    value={activeTool.criolloAnalogy}
                    onChange={(e) =>
                      handleUpdateActiveTool({ ...activeTool, criolloAnalogy: e.target.value })
                    }
                    className="w-full p-2.5 border border-black rounded text-xs bg-orange-50/50 dark:bg-orange-950/20 font-sans leading-relaxed"
                  />
                </div>

                {/* Without / With Lists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-300 rounded space-y-1">
                    <span className="font-bold text-red-800 dark:text-red-300 block font-mono text-[11px]">
                      Sin esta herramienta 💀:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-700 dark:text-neutral-300 leading-snug">
                      {activeTool.criolloWithout.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 rounded space-y-1">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block font-mono text-[11px]">
                      Con esta herramienta 🚀:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-700 dark:text-neutral-300 leading-snug">
                      {activeTool.criolloWith.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Mermaid & Infographic Previews */}
                <div className="space-y-2">
                  <span className="font-mono text-[11px] font-bold block text-neutral-500 uppercase">
                    Infografía SVG de la Variante:
                  </span>
                  <SvgInfographic config={activeTool.svgConfig} />
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-[11px] font-bold block text-neutral-500 uppercase">
                    Diagrama de Arquitectura (Mermaid) de la Variante:
                  </span>
                  <MermaidViewer key={`${activeTool.slug}-mermaid`} code={activeTool.mermaidCode} />
                  <details className="text-[11px] font-mono">
                    <summary className="cursor-pointer font-bold text-neutral-500">Editar código Mermaid</summary>
                    <textarea
                      rows={5}
                      value={activeTool.mermaidCode}
                      onChange={(e) => handleUpdateActiveTool({ ...activeTool, mermaidCode: e.target.value })}
                      className="w-full mt-1 p-2 border border-black rounded bg-neutral-900 text-brand-cyan text-[11px]"
                    />
                  </details>
                </div>

                {/* Semáforo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-400 rounded">
                    <span className="font-bold font-mono text-[11px] text-emerald-800 dark:text-emerald-300 block">🟢 Usala cuando:</span>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-700 dark:text-neutral-300 leading-snug">
                      {activeTool.semaforoGreen.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-400 rounded">
                    <span className="font-bold font-mono text-[11px] text-red-800 dark:text-red-300 block">🔴 No la uses para:</span>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-700 dark:text-neutral-300 leading-snug">
                      {activeTool.semaforoRed.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Extended Markdown Documentation Preview & Editor */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-mono text-[11px] font-bold block text-neutral-600 dark:text-neutral-300 uppercase">
                    📄 Documentación Técnica Extendida (Markdown de la Variante):
                  </label>
                  <textarea
                    rows={8}
                    value={activeTool.rawMarkdown}
                    onChange={(e) => handleUpdateActiveTool({ ...activeTool, rawMarkdown: e.target.value })}
                    className="w-full p-3 border border-black rounded bg-neutral-50 dark:bg-neutral-900 font-mono text-[11px] leading-relaxed"
                  />
                </div>

                <div className="text-[11px] font-mono p-2 bg-[#121214] text-emerald-300 rounded break-all">
                  $ {activeTool.cliQuickCommand}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="p-4 bg-neutral-100 dark:bg-[#121316] border-t-2 border-black flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-neutral-800 font-display font-bold text-xs rounded border-2 border-black shadow-brutal-sm hover:bg-neutral-100"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmAdd}
            disabled={!activeTool}
            className="px-6 py-2 bg-[#FFD166] text-[#121214] font-display font-black text-xs md:text-sm rounded border-2 border-black shadow-brutal-sm hover:bg-yellow-400 transition disabled:opacity-50"
          >
            🚀 Elegir esta Variante y Agregar al Baúl
          </button>
        </footer>
      </div>

      {/* AI Key Settings Modal */}
      <AiSettingsModal
        isOpen={showAiSettingsModal}
        onClose={() => setShowAiSettingsModal(false)}
        onShowToast={onShowToast}
        onConfigSaved={(cfg) => setAiConfig(cfg)}
      />
    </div>
  );
};
