# Guía de Estilos (`frontend-design`) y Prompt Maestro para Google Stitch — BoxTools (PEVC V5)

**Proyecto:** `BoxTools` — El Baúl e Índice Visual de Ingeniería IA para el Equipo  
**Dirección Estética:** `Visual Playbook / Neo-Brutalista Ilustrado`  
**Fase:** FASE 2 — Paso 2 (`frontend-design` -> `Stitch MCP`)  

---

## 1. Arquitectura del Sistema de Diseño (`frontend-design`)

### 1.1 Concepto Visual: "Manual Técnico Ilustrado de Taller IA"
Inspirado en los manuales ilustrados de ingeniería japonesa, guías de campo tipo *Field Notes* y interfaces Neo-Brutalistas modernas (Figma Config / Gumroad / Teenage Engineering). Combina **máxima claridad didáctica** para el **🧉 Modo Criollo** con **precisión de terminal** para el **⚙️ Modo Técnico**.

### 1.2 Paleta Hexadecimal Exacta (Tokens CSS)

#### Modo Claro ("Warm Paper Playbook" — Predeterminado)
- `--bg-canvas`: `#FFFDF7` (Papel Crema Ilustrado)
- `--bg-surface`: `#F4EFE6` (Arena Técnica para Sidebars y Barras)
- `--bg-card`: `#FFFFFF` (Blanco Puro para Tarjetas y Modales)
- `--bg-code`: `#111827` (Terminal Oscura para bloques CLI/JSON/Markdown Raw)
- `--text-primary`: `#111827` (Tinta Negra Profunda — Contraste AAA)
- `--text-secondary`: `#374151` (Gris Pizarra Oscuro)
- `--text-muted`: `#6B7280` (Gris Técnico)
- `--border-ink`: `#111827` (Borde Sólido Neo-Brutalista `2.5px`)
- `--shadow-brutal`: `4px 4px 0px #111827`
- `--shadow-brutal-lg`: `6px 6px 0px #111827`
- `--shadow-brutal-sm`: `2px 2px 0px #111827`

#### Modo Oscuro ("Night Blueprint Vault")
- `--bg-canvas`: `#121316` (Carbón Profundo)
- `--bg-surface`: `#1A1D24` (Pizarra Nocturna)
- `--bg-card`: `#222630` (Superficie de Tarjeta)
- `--bg-code`: `#0B0D11` (Terminal Negra)
- `--text-primary`: `#FFFDF7` (Blanco Cálido)
- `--text-secondary`: `#D1D5DB` (Gris Claro)
- `--text-muted`: `#9CA3AF`
- `--border-ink`: `#F3F4F6` (Borde Sólido `2px`)
- `--shadow-brutal`: `4px 4px 0px #000000`

#### Colores de Identidad por Categoría (Con versión Fondo Pastilla y Borde Tinta)
1. **Skills Agénticas (`skills`):** Primario `#FACC15` (Amarillo Eléctrico) | Superficie `#FEF9C3` | Texto `#111827`
2. **Servidores MCP (`mcps`):** Primario `#22D3EE` (Cian Vibrante) | Superficie `#CFFAFE` | Texto `#111827`
3. **Markdowns / Workflows (`workflows`):** Primario `#FF6B35` (Naranja / Coral) | Superficie `#FFEDD5` | Texto `#111827`
4. **Baúl de Herramientas / Apps (`tools`):** Primario `#34D399` (Verde Menta) | Superficie `#D1FAE5` | Texto `#111827`
5. **Combos / Recetas (`combos`):** Primario `#F472B6` (Rosa Intenso) | Superficie `#FCE7F3` | Texto `#111827`
6. **Reglas y Prompts (`rules`):** Primario `#A78BFA` (Violeta) | Superficie `#EDE9FE` | Texto `#111827`

#### Colores Semánticos (Semáforo Modo Criollo y Estados)
- **Verde ("Cuándo usarla sí o sí" / Con esta herramienta 🚀):** `#10B981` (Fondo `#ECFDF5`)
- **Rojo ("Cuándo NO usarla" / Sin esta herramienta 💀):** `#EF4444` (Fondo `#FEF2F2`)
- **Ámbar (Advertencia / Fallback Gráfico IA):** `#F59E0B` (Fondo `#FFFBEB`)

### 1.3 Escala Tipográfica y Fuentes
- **Headline / Display Font:** `Bricolage Grotesque` / `Space Grotesk` (`700`, `800`, tracking `-0.03em`)
  - `display-xl`: `2.5rem` (`40px`) / Line-height `1.1`
  - `h1`: `2rem` (`32px`) / Line-height `1.15`
  - `h2`: `1.5rem` (`24px`) / Line-height `1.2`
  - `h3`: `1.25rem` (`20px`) / Line-height `1.3`
- **Body Font:** `Plus Jakarta Sans` (`400`, `500`, `600`, `700`)
  - `body-lg`: `1.0625rem` (`17px`) / Line-height `1.6` (Ideal para lecturas en Modo Criollo)
  - `body-md`: `0.9375rem` (`15px`) / Line-height `1.5`
  - `label-sm`: `0.8125rem` (`13px`) / Line-height `1.4` (`font-bold uppercase tracking-wider`)
- **Monospace Font:** `JetBrains Mono` (`500`, `600`)
  - `code-md`: `0.875rem` (`14px`) / Line-height `1.55`

### 1.4 Bordes, Espaciados y Micro-Interacciones
- **Bordes:** `2.5px solid #111827` en tarjetas, botones, inputs, badges y pestañas.
- **Radio de esquina (`Roundness`):** `8px` (`ROUND_EIGHT`) para contenedores y `6px` para botones/chips.
- **Efecto Push Neo-Brutalista en Botones:**
  - Normal: `transform: translate(0, 0); box-shadow: 4px 4px 0px #111827;`
  - Hover: `transform: translate(-1px, -1px); box-shadow: 5px 5px 0px #111827;`
  - Active/Click: `transform: translate(2px, 2px); box-shadow: 2px 2px 0px #111827;`

---

## 2. Prompts Maestros de Exportación para Google Stitch (`02-stitch-master-prompt.md`)

### PROMPT 1: Pantalla Principal — Explorador del Baúl + Detalle Interactivo (Desktop)

```markdown
An illustrated Neo-Brutalist AI Engineering Playbook & Tool Vault web application ("BoxTools") designed for a software engineering team to explore AI Skills, MCP Servers, Custom Workflow Markdowns (like PEVC V5), AI Apps, Combos, and Rules, featuring an interactive toggle between "Modo Criollo (Colloquial Visual Playbook with Analogies & Infographics)" and "Modo Técnico (CLI Commands, MCP JSON & Raw Markdown)".

**PLATFORM:** Web, Desktop-first (1440px) with responsive Tablet (768px) and Mobile (375px) adaptation.

**PAGE STRUCTURE:**
1. **Left Fixed Sidebar ("Índice del Manual" - 280px width):**
   - Brand Header with "BOXTOOLS // AI VAULT" emblem and "PEVC V5 READY" status pill.
   - Navigation Groups:
     - **Vistas Principales:** "Explorador del Baúl (Todo)", "Workflow Maestro PEVC V5 (.md)", "Combos & Recetas del Team", "Ruta de Onboarding (Academia)".
     - **Categorías del Baúl (with count badges):** "Skills Agénticas (11)", "Servidores MCP (3)", "Markdowns / Workflows (2)", "Apps & IDEs IA (4)", "Reglas & Prompts (2)".
     - **Filtro por Fase SDLC:** "Fase 0: Setup & MCPs", "Fase 1: Brainstorming", "Fase 2: UI Stitch + Impeccable", "Fase 3: Supabase + TDD", "Fase 4: QA + AgentShield".
   - Bottom Sidebar Footer: Quick access button to "🔒 Panel Admin & Motor IA".

2. **Sticky Top Navigation Bar:**
   - **Global Search Trigger (`Ctrl+K`):** Input box reading "Buscar por nombre técnico ('playwright') o en criollo ('sacar fotos a la web', 'sin docker')...".
   - **Master Mode Switch (Hero Toggle):** Prominent two-state segmented control: "🧉 MODO CRIOLLO (Con Dibujos y Analogías)" vs "⚙️ MODO TÉCNICO (Comandos y Markdown)".
   - **Action Controls:** Button "🎒 Mi Combo (3)" opening the Setup Builder Drawer, and Theme Toggle button (Light/Dark).

3. **Hero Playbook Banner:**
   - Featured split card highlighting the team's golden workflow: "PEVC V5: Metodología Vibe Coding Profesional".
   - Left side: Visual 5-phase pipeline diagram (Fase 0 Setup -> Fase 1 Brainstorming -> Fase 2 Stitch + Playwright + Impeccable -> Fase 3 Supabase Cloud TDD -> Fase 4 AgentShield).
   - Right side: Quick actions "📖 Abrir Manual Interactivo", "📥 Descargar PEVC V5.md", and "⚡ Cargar Stack Completo".

4. **Main Vault Card Grid (3 Columns on Desktop, 2 on Tablet, 1 on Mobile):**
   - Each Tool Card displays:
     - Top bar: Category badge (`SKILL`, `MCP`, `WORKFLOW`, `TOOL`, `RULE`), Phase badge (`FASE 0` to `FASE 4`), and "+ Mi Combo" checkbox button.
     - Title & concise tagline.
     - **Dynamic Body:**
       - In "🧉 Modo Criollo": Illustrated analogy box ("En Criollo: Es como el inspector de obra que saca fotos..."), mini SVG flow diagram (`Entrada -> Qué hace -> Salida`), and green/red quick indicator.
       - In "⚙️ Modo Técnico": Terminal box with one-click copy command (`npx skills add ...`) and IDE compatibility chips (`Antigravity`, `OpenCode`, `Cursor`).
     - Card Footer: "Ver Ficha Completa + Gráficos" primary button and "📋 Copiar" icon button.
```

---

### PROMPT 2: Vista de Detalle de Herramienta — Modo Criollo Ilustrado + Modo Técnico + Visor Markdown

```markdown
Detailed Tool & Workflow Inspection Screen in BoxTools showing both colloquial visual explanations with code-generated diagrams/infographics and technical installation/Markdown export tools.

**PLATFORM:** Web, Desktop-first.

**PAGE STRUCTURE:**
1. **Breadcrumb & Header Bar:**
   - Back to Vault button, Category Pill, SDLC Phase Badge, Official Repo Link, "+ Sumar a Mi Combo" button, and "📥 Descargar .md" button.
   - Tool Title, Tagline, and Prominent Switch: "🧉 Explicación en Criollo + Gráficos" vs "⚙️ Instalación Técnica + Markdown".

2. **Criollo Visual Playbook Section:**
   - **Card 1 — "Analogía de Barrio (Sin Tecnicismos)":** Large callout card with custom illustration/infographic thumbnail (clickable to open Fullscreen Lightbox with Zoom) and clear colloquial explanation.
   - **Card 2 — "Gráfico de Flujo e Infografía por Código":** Interactive Mermaid.js flowchart and Neo-Brutalist SVG Infographic showing Step 1 (Entrada), Step 2 (Proceso Interno), and Step 3 (Resultado Final), with Zoom controls.
   - **Card 3 — Comparativa "Sin esta herramienta 💀 vs. Con esta herramienta 🚀":** Side-by-side comparison list showing team pain points eliminated vs superpowers gained.
   - **Card 4 — Semáforo Práctico del Team:** "🟢 Cuándo usarla sí o sí" vs "🔴 Cuándo NO usarla / Errores comunes".

3. **Technical & Markdown Dual Viewer Section:**
   - **Multi-IDE CLI Selector:** Tabs for `Antigravity`, `OpenCode / NPX`, `Cursor`, `Claude Code` with 1-click Copy button.
   - **MCP Server JSON Config Block:** Syntax-highlighted JSON configuration with environment variable alerts (e.g. `SUPABASE_ACCESS_TOKEN` without Docker).
   - **Dual Markdown Viewer (`Formatted Document` vs `Raw .md Source`):** Full markdown viewer for workflows like PEVC V5 with phase diagrams, "📋 Copiar Markdown" and "📥 Descargar Archivo .md".
```

---

### PROMPT 3: Panel Admin Privado — Auto-Ingesta Mágica con IA + Editor En Vivo + Ajustes de API Key

```markdown
Private Admin CMS & AI Auto-Ingestion Studio for BoxTools where administrators paste a GitHub URL, README, or Markdown file and use an AI API Key (Google Gemini Text + Image / OpenAI / OpenRouter) to automatically organize technical data, write colloquial explanations, generate Mermaid/SVG diagrams by code, and create illustrations in Supabase Storage.

**PLATFORM:** Web, Desktop-first.

**PAGE STRUCTURE:**
1. **Admin Top Header:**
   - Admin status badge, navigation tabs ("📋 Catálogo Admin", "✨ Auto-Ingesta & Editor IA", "🔑 Ajustes de API Key IA", "📦 Backup JSON"), and "Volver al Catálogo Público" button.

2. **AI Magic Auto-Ingestion Bar:**
   - Input area accepting a GitHub URL, raw text, or drag-and-drop `.md` file.
   - Action buttons: "✨ Auto-Organizar Todo con IA (Texto + Criollo + Gráfico)", "🎨 Generar Ilustración IA (Supabase Storage)", and status indicator showing active AI model (`Gemini 2.5 Flash + Imagen 3` or `Fallback SVG`).

3. **Split-Screen Live Editor & Preview:**
   - **Left Column (Structured Form):**
     - General Metadata (Title, Slug, Category, Phase 0-4, Status: Published/Draft, Featured toggle).
     - Criollo Fields (Analogy text, Without vs With lists, Green/Red Semaforo lists) with per-section "🔄 Regenerar con IA" button.
     - Code Graphics Editor (Mermaid.js diagram code + SVG Infographic steps) and Media Gallery Manager (Drag & Drop to Supabase Storage).
     - Technical Fields (CLI commands per IDE, MCP JSON config, Raw Markdown editor).
   - **Right Column (Live Interactive Preview):**
     - Real-time preview of the card and full detail view in both "🧉 Modo Criollo" and "⚙️ Modo Técnico".

4. **AI API Key Settings Panel Modal/Tab:**
   - Provider selector (`Google Gemini API`, `OpenAI API`, `OpenRouter`), encrypted API Key input, Text Model & Image Model selectors, Automatic SVG Fallback toggle, and "🔌 Probar Conexión" diagnostic button.
```

