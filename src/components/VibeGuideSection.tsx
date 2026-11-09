import React, { useState } from 'react';

export interface VibeGuideSectionProps {
  readonly onOpenVault: () => void;
  readonly onCopy: (text: string, label: string) => void;
}

export const VibeGuideSection: React.FC<VibeGuideSectionProps> = ({
  onOpenVault,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'jerga' | 'antigravity-md' | 'diseno-suite'>('jerga');
  const [copiedExample, setCopiedExample] = useState(false);

  const FULL_MARKDOWN_EXAMPLE = `# PROTOCOLO DE DESARROLLO: FEATURE EXPRESS (.md)
# Activa este markdown en Antigravity con: @protocolo_feature_express.md activa este flujo

Actúa como un Ingeniero Senior de Software bajo la metodología de Vibe Coding Profesional.
Tienes ESTRICTAMENTE PROHIBIDO modificar la arquitectura existente o instalar librerías no autorizadas.

## FASE 1: ANÁLISIS PREVIO Y CONTRATO (Sin escribir código)
1. Lee los archivos relevantes del componente objetivo usando las herramientas de lectura.
2. Identifica los tipos TypeScript existentes y los contratos de entrada/salida.
3. DETENTE y preséntame un resumen de 3 viñetas con lo que vas a modificar. Espera mi confirmación ("Aprobado") antes de avanzar.

## FASE 2: TEST PRIMERO (Ciclo TDD Rojo)
1. Crea un archivo de test en la carpeta \`tests/\` que compruebe la nueva funcionalidad.
2. Ejecuta el test y asegúrate de ver el fallo en ROJO.
3. Muestra el error en el chat para demostrar que el test es genuino.

## FASE 3: IMPLEMENTACIÓN QUIRÚRGICA (Ciclo Verde)
1. Escribe el código mínimo y necesario para que el test pase a VERDE.
2. No agregues refactors innecesarios ni código "por las dudas".
3. Ejecuta la suite de pruebas y confirma el estado VERDE.

## FASE 4: AUDITORÍA Y CHECKPOINT FINAL
1. Ejecuta \`git status\` y \`git diff\` para comprobar que no quedaron archivos temporales.
2. Genera un reporte final con el comando de commit sugerido en formato conventional commits:
   feat(modulo): descripción corta y precisa
`;

  return (
    <section className="p-4 md:p-6 bg-white dark:bg-[#15161A] border-[3px] border-[#121214] rounded-lg shadow-brutal-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-black pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-brand-orange uppercase">
              // ACADEMIA & MANUAL DE OPERACIONES
            </span>
            <span className="bg-[#FFD166] text-[#121214] border border-black text-[10px] font-mono px-2 py-0.5 rounded font-black">
              GUÍA MAESTRA
            </span>
          </div>
          <h2 className="font-display font-black text-2xl mt-1">
            Conceptos, Jerga Vibe Coding y Markdowns en Antigravity
          </h2>
        </div>

        <button
          onClick={onOpenVault}
          className="self-start md:self-auto px-3.5 py-1.5 bg-[#FFD166] border-2 border-black font-bold text-xs rounded shadow-brutal-sm hover:bg-yellow-400 transition"
        >
          ← Volver al Baúl
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('jerga')}
          className={`flex items-center gap-2 px-4 py-2 font-display font-black text-xs rounded border-2 border-[#121214] shadow-brutal-sm transition ${
            activeTab === 'jerga'
              ? 'bg-brand-orange text-white'
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
          }`}
        >
          <span>💡</span>
          <span>1. Conceptos Básicos y Jerga del Equipo</span>
        </button>

        <button
          onClick={() => setActiveTab('antigravity-md')}
          className={`flex items-center gap-2 px-4 py-2 font-display font-black text-xs rounded border-2 border-[#121214] shadow-brutal-sm transition ${
            activeTab === 'antigravity-md'
              ? 'bg-brand-orange text-white'
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
          }`}
        >
          <span>📘</span>
          <span>2. Cómo Usar Markdowns en Antigravity (Tutorial + Ejemplo)</span>
        </button>

        <button
          onClick={() => setActiveTab('diseno-suite')}
          className={`flex items-center gap-2 px-4 py-2 font-display font-black text-xs rounded border-2 border-[#121214] shadow-brutal-sm transition ${
            activeTab === 'diseno-suite'
              ? 'bg-brand-orange text-white'
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
          }`}
        >
          <span>🎨</span>
          <span>3. Estrategia UI/UX: Frontend Design vs UI/UX Pro Max vs Mezcla</span>
        </button>
      </div>

      {/* TAB 1: JERGA & CONCEPTOS */}
      {activeTab === 'jerga' && (
        <div className="space-y-6">
          {/* Comparison Hero: Vibe Coding Caótico vs Profesional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-600 rounded shadow-brutal-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-sm text-red-900 dark:text-red-300">
                  💀 Vibe Coding Caótico (Lo que NO hacemos)
                </span>
                <span className="font-mono text-[10px] bg-red-200 text-red-900 px-1.5 py-0.5 rounded font-bold">
                  AMATEUR
                </span>
              </div>
              <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1.5 list-disc pl-4">
                <li>Tirarle prompts largos y desordenados al modelo sin contexto previo.</li>
                <li>Aceptar cambios a ciegas sin correr tests ni mirar el <code>git diff</code>.</li>
                <li>Dejar que la IA invente librerías alucinadas o rompa el estilo visual.</li>
                <li>Docker consumiendo 10 GB de RAM para tareas sencillas de frontend.</li>
              </ul>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-600 rounded shadow-brutal-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-sm text-emerald-900 dark:text-emerald-300">
                  🚀 Vibe Coding Profesional (Metodología BoxTools)
                </span>
                <span className="font-mono text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                  PEVC V5 / V7
                </span>
              </div>
              <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1.5 list-disc pl-4">
                <li>Contratos y especificaciones previas en Markdown antes de codificar.</li>
                <li>Trabajo aislado en ramas y Git Worktrees para no quebrar producción.</li>
                <li>Semáforo TDD estricto (Rojo ➔ Verde ➔ Azul) con pruebas verificables.</li>
                <li>Auditoría visual multimodal (Playwright + Impeccable) para perfección en celular y desktop.</li>
              </ul>
            </div>
          </div>

          {/* Diccionario de Jerga */}
          <div className="space-y-3">
            <h3 className="font-display font-black text-lg flex items-center gap-2">
              <span>📖</span> Diccionario Criollo de Vibe Coding
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Términos que escucharás a diario en nuestro equipo y cómo entenderlos sin vueltas:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
              {[
                {
                  term: 'Ventana de Contexto (Context Window)',
                  tag: 'MEMORIA RAM DE LA IA',
                  color: 'orange',
                  criollo: 'Es el tamaño del bloc de notas que la IA tiene frente a sus ojos en ese turno. Si le tirás 50 archivos pesados, se le llena el cuaderno y empieza a olvidarse de las reglas más importantes.',
                  tecnico: 'Límite de tokens de entrada (ej. 1M o 2M tokens). El contexto debe cuidarse empaquetando sólo lo relevante con herramientas como Repomix.',
                },
                {
                  term: 'Alucinación (Hallucination)',
                  tag: 'INVENTAR FRUTA',
                  color: 'red',
                  criollo: 'Cuando la IA no sabe algo pero te responde con una seguridad olímpica inventando un paquete npm que no existe o una función que nunca se programó.',
                  tecnico: 'Generación probabilística sin anclaje en el AST o el filesystem real. Se combate con TDD y restricciones estrictas en Markdowns.',
                },
                {
                  term: 'Git Worktrees',
                  tag: 'TALLER PARALELO AISLADO',
                  color: 'cyan',
                  criollo: 'Es como abrir un galpón clonado en tu disco rígido: la IA puede romper todo lo que quiera ahí adentro sin tocar ni ensuciar tu rama principal de producción.',
                  tecnico: 'Permite tener múltiples ramas del mismo repositorio checked out en carpetas separadas simultáneamente.',
                },
                {
                  term: 'Semáforo TDD (Rojo ➔ Verde ➔ Azul)',
                  tag: 'BLINDAJE DE CALIDAD',
                  color: 'emerald',
                  criollo: 'Primero demostrás que el auto no arranca (Rojo), después ponés el cable exacto para que prenda (Verde) y al final emprolijás los cables sin apagar el motor (Azul).',
                  tecnico: 'Test-Driven Development: Escribir prueba fallida, implementar código mínimo de paso y refactorizar bajo cobertura asegurada.',
                },
                {
                  term: 'Auditoría Multimodal (Impeccable)',
                  tag: 'OJO HUMANO MECÁNICO',
                  color: 'purple',
                  criollo: 'No alcanza con que el código compile: la IA toma una foto con Playwright en 375px y se fija si el botón se tapa o si la letra quedó chiquita como prospecto de medicamento.',
                  tecnico: 'Inspección cruzada de capturas renderizadas mediante modelos de visión junto con las clases Tailwind/CSS del DOM.',
                },
                {
                  term: 'Zero Docker',
                  tag: 'CERO HUMO EN TU MÁQUINA',
                  color: 'yellow',
                  criollo: 'Manejar la base de datos Postgres directo en la nube (Supabase Cloud) mediante MCP sin clavar tu máquina ni prender fuego la memoria RAM levantando 8 contenedores locales.',
                  tecnico: 'Administración DDL/DML remota vía HTTPS API oficial con Service Role Key y migración versionada en SQL puro.',
                },
                {
                  term: 'Servidor MCP (Model Context Protocol)',
                  tag: 'ENCHUFE UNIVERSAL',
                  color: 'cyan',
                  criollo: 'El adaptador universal para que el cerebro de la IA pueda mover las manos: conectarse a tu terminal, ejecutar tests, tocar la base de datos o sacar capturas de pantalla.',
                  tecnico: 'Estándar abierto cliente-servidor JSON-RPC que expone tools, resources y prompts al agente agnóstico al modelo.',
                },
                {
                  term: 'Greenfield vs Brownfield',
                  tag: 'DESDE CERO VS EXISTENTE',
                  color: 'orange',
                  criollo: 'Greenfield es construir una casa en un terreno baldío (usar PEVC V5). Brownfield es remodelar un departamento viejo con caños tapados donde no podés romper cualquier pared (usar V7 Repomix).',
                  tecnico: 'Greenfield: Nuevo proyecto sin restricciones previas. Brownfield: Repositorio en producción con código heredado y restricciones existentes.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 border-2 border-black rounded shadow-brutal-sm bg-neutral-50 dark:bg-[#1A1C22] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-xs md:text-sm">{item.term}</span>
                    <span className="font-mono text-[9px] bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-1.5 py-0.5 rounded font-bold uppercase">
                      {item.tag}
                    </span>
                  </div>
                  <div className="text-[11px] leading-relaxed space-y-1">
                    <p className="text-neutral-700 dark:text-neutral-300">
                      <strong className="text-brand-orange">💡 En Criollo:</strong> {item.criollo}
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400">
                      <strong className="text-neutral-400">💻 En Técnico:</strong> {item.tecnico}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKDOWNS EN ANTIGRAVITY */}
      {activeTab === 'antigravity-md' && (
        <div className="space-y-6">
          {/* Explicación Conceptual */}
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-brand-orange rounded shadow-brutal-sm space-y-3 font-sans">
            <h3 className="font-display font-black text-sm md:text-base text-brand-orangeDark dark:text-brand-orange">
              ¿Por qué los Markdowns son el verdadero volante de Antigravity?
            </h3>
            <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
              En Google Antigravity, los modelos de lenguaje (Gemini / Claude / GPT) son motores hiperpotentes pero sin rumbo fijo. Si no les das riendas, intentarán resolver todo en 1 solo turno, adivinando cosas y borrando código que andaba bien.
            </p>
            <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
              Un archivo Markdown (<code>.md</code>) bien redactado actúa como una <strong>ley marcial de ingeniería</strong>: le dice al agente qué rol asume, qué herramientas tiene prohibido usar, qué checkpoints de aprobación humana debe respetar y cómo probar su trabajo antes de darlo por terminado.
            </p>
          </div>

          {/* Paso a paso de uso en Antigravity */}
          <div className="space-y-3">
            <h4 className="font-display font-black text-sm uppercase tracking-wide">
              Tres Formas de Usar Markdowns en Antigravity:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
              <div className="p-3 border-2 border-black rounded shadow-brutal-sm bg-white dark:bg-[#1E1F24] space-y-1.5">
                <span className="font-mono text-xs font-bold text-brand-orange">MÉTODO 1</span>
                <h5 className="font-display font-bold text-xs">Mención Directa en Chat (@archivo.md)</h5>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Creas el archivo en tu workspace (ej: <code>PEVC V5.md</code>) y en el chat le dices:
                  <code className="block mt-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded font-mono text-[10px]">
                    @[PEVC V5.md] activa este markdown
                  </code>
                  Antigravity indexará el archivo completo y adoptará sus fases inmediatamente.
                </p>
              </div>

              <div className="p-3 border-2 border-black rounded shadow-brutal-sm bg-white dark:bg-[#1E1F24] space-y-1.5">
                <span className="font-mono text-xs font-bold text-cyan-600">MÉTODO 2</span>
                <h5 className="font-display font-bold text-xs">Regla Persistente (.agent/rules/)</h5>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Si guardas el markdown dentro de <code>.agent/rules/</code> o <code>.gemini/rules/</code>, Antigravity lo cargará <strong>en cada turno automáticamente</strong> sin que tengas que mencionarlo.
                </p>
              </div>

              <div className="p-3 border-2 border-black rounded shadow-brutal-sm bg-white dark:bg-[#1E1F24] space-y-1.5">
                <span className="font-mono text-xs font-bold text-purple-600">MÉTODO 3</span>
                <h5 className="font-display font-bold text-xs">Skill Agéntica (SKILL.md)</h5>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Añades frontmatter YAML al inicio (<code>name</code>, <code>description</code>) en tu carpeta de skills. Antigravity lo activará a demanda únicamente cuando la tarea lo requiera.
                </p>
              </div>
            </div>
          </div>

          {/* Ejemplo Completo Listo Para Copiar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-black text-sm uppercase">
                  Ejemplo Completo y Real: Protocolo de Feature Express
                </h4>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Copia esta plantilla a un archivo <code>protocolo_feature_express.md</code> en tu proyecto:
                </span>
              </div>
              <button
                onClick={() => {
                  onCopy(FULL_MARKDOWN_EXAMPLE, 'protocolo_feature_express.md');
                  setCopiedExample(true);
                  setTimeout(() => setCopiedExample(false), 2000);
                }}
                className="px-3 py-1.5 bg-brand-orange text-white font-display font-bold text-xs rounded border-2 border-black shadow-brutal-sm hover:bg-orange-600 transition flex items-center gap-1.5"
              >
                <span>{copiedExample ? '✓ Copiado!' : '📋 Copiar Plantilla'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 bg-[#121214] text-neutral-100 rounded-lg border-2 border-black font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[380px]">
                {FULL_MARKDOWN_EXAMPLE}
              </pre>
            </div>

            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 border-2 border-black rounded text-xs space-y-1">
              <p className="font-bold text-neutral-800 dark:text-neutral-200">
                💡 Cómo ejecutar este ejemplo en Antigravity:
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-neutral-600 dark:text-neutral-400 text-[11px]">
                <li>Guarda el texto anterior como <code>protocolo_feature_express.md</code> en la raíz de tu proyecto.</li>
                <li>Escribe en el chat: <code>@[protocolo_feature_express.md] activa este markdown y agrega un botón de logout</code>.</li>
                <li>Observa cómo Antigravity se detiene en la Fase 1 para pedirte confirmación antes de tocar una sola línea de código.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ESTRATEGIA DE DISEÑO UI/UX */}
      {activeTab === 'diseno-suite' && (
        <div className="space-y-6">
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-600 rounded shadow-brutal-sm">
            <h3 className="font-display font-black text-base text-purple-950 dark:text-purple-200">
              🎨 ¿Frontend Design, UI/UX Pro Max o la Mezcla de las Dos?
            </h3>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
              En la <strong>Fase 2 de PEVC V5</strong> el diseño no se improvisa con Tailwind genérico. Tienes a tu disposición dos herramientas formidables con enfoques complementarios. Puedes usar una, la otra, o la <strong>estrategia híbrida recomendada</strong> que combina la inteligencia de nicho con la arquitectura formal de especificaciones.
            </p>
          </div>

          {/* Tabla Comparativa */}
          <div className="border-2 border-black rounded-lg overflow-hidden shadow-brutal-sm">
            <div className="bg-[#121214] text-white p-3 font-mono text-xs font-bold flex items-center justify-between">
              <span>COMPARATIVA: FRONTEND DESIGN vs UI/UX PRO MAX</span>
              <span className="text-brand-yellow text-[10px]">PEVC V5 MATRIX</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-300 font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Dimensión</th>
                    <th className="p-3 text-cyan-800 dark:text-cyan-300 font-bold">1. frontend-design (Anthropic)</th>
                    <th className="p-3 text-brand-orange font-bold">2. ui-ux-pro-max (Obra)</th>
                    <th className="p-3 text-purple-800 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/30">⭐ 3. La Mezcla (Dúo Dinámico)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 font-sans text-[11px]">
                  <tr>
                    <td className="p-3 font-bold bg-neutral-50 dark:bg-neutral-900 font-mono">Enfoque Primario</td>
                    <td className="p-3">Arquitectura formal del sistema de diseño y layout.</td>
                    <td className="p-3">Inteligencia heurística de nicho y búsqueda de tokens.</td>
                    <td className="p-3 bg-purple-50/50 dark:bg-purple-950/20 font-semibold text-purple-900 dark:text-purple-200">
                      Investigación profunda de nicho ➔ Arquitectura y Prompt Stitch.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-neutral-50 dark:bg-neutral-900 font-mono">Catálogo & Base</td>
                    <td className="p-3">Guías de estilo para componentes, jerarquías y redacción para Stitch.</td>
                    <td className="p-3">79 estilos visuales, 192 paletas de producto y 74 font pairings.</td>
                    <td className="p-3 bg-purple-50/50 dark:bg-purple-950/20 font-semibold text-purple-900 dark:text-purple-200">
                      Toda la base de datos de 192 paletas formalizada en la spec.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-neutral-50 dark:bg-neutral-900 font-mono">Conexión con Stitch</td>
                    <td className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">
                      Directa: redacta el Prompt Maestro estructurado para Stitch MCP.
                    </td>
                    <td className="p-3">Provee valores de color exactos, reglas y pairings para el prompt.</td>
                    <td className="p-3 bg-purple-50/50 dark:bg-purple-950/20 font-semibold text-purple-900 dark:text-purple-200">
                      Prompt Maestro de Stitch hiperpreciso con justificación de nicho.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-neutral-50 dark:bg-neutral-900 font-mono">Auditoría UX / WCAG</td>
                    <td className="p-3">Estructura y diseño responsive base.</td>
                    <td className="p-3">119 reglas heurísticas (contraste 4.5:1, targets táctiles 44px).</td>
                    <td className="p-3 bg-purple-50/50 dark:bg-purple-950/20 font-semibold text-purple-900 dark:text-purple-200">
                      Auditoría heurística con UI/UX Pro Max + Verificación con Impeccable.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-neutral-50 dark:bg-neutral-900 font-mono">Instalación</td>
                    <td className="p-3 font-mono text-[10px]">
                      npx skills add https://github.com/anthropics/skills --skill frontend-design
                    </td>
                    <td className="p-3 font-mono text-[10px]">
                      npx skills add ui-ux-pro-max
                    </td>
                    <td className="p-3 bg-purple-50/50 dark:bg-purple-950/20 font-mono text-[10px] font-bold">
                      Instalar ambas en Fase 0
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* El Flujo Paso a Paso de la Mezcla */}
          <div className="p-5 border-2 border-black rounded-lg bg-neutral-50 dark:bg-[#1A1C22] space-y-4">
            <h4 className="font-display font-black text-sm uppercase tracking-wide text-brand-orange flex items-center gap-2">
              <span>🚀</span>
              <span>El Protocolo de la Mezcla Híbrida en 4 Pasos (Fase 2 Oficial)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-[#15161A] border-2 border-black rounded shadow-brutal-xs space-y-1.5">
                <span className="font-mono text-[10px] font-bold text-brand-orange">PASO 1 // INVESTIGACIÓN</span>
                <p className="font-bold text-sm">ui-ux-pro-max CLI</p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Ejecutas la búsqueda en la terminal para obtener la paleta psicológica (60-30-10) y el pairing tipográfico de tu nicho.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#15161A] border-2 border-black rounded shadow-brutal-xs space-y-1.5">
                <span className="font-mono text-[10px] font-bold text-cyan-600">PASO 2 // ARQUITECTURA</span>
                <p className="font-bold text-sm">frontend-design</p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Tomas los colores y fuentes del Paso 1 y estructuras la jerarquía de componentes, layouts y redactas el Prompt Maestro para Stitch.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#15161A] border-2 border-black rounded shadow-brutal-xs space-y-1.5">
                <span className="font-mono text-[10px] font-bold text-purple-600">PASO 3 // CANVAS VISUAL</span>
                <p className="font-bold text-sm">Google Stitch MCP</p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  El servidor MCP de Stitch recibe el Prompt Maestro y genera los mockups interactivos y el código HTML/Tailwind en alta resolución.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#15161A] border-2 border-black rounded shadow-brutal-xs space-y-1.5">
                <span className="font-mono text-[10px] font-bold text-emerald-600">PASO 4 // PULIDO 10/10</span>
                <p className="font-bold text-sm">Playwright + Impeccable</p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Capturas en 1440px, 768px y 375px; Impeccable audita la imagen y el CSS hasta eliminar toda imperfección antes de programar la lógica.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

