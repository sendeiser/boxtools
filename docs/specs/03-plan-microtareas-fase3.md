# PLAN DE MICROTICHE / TAREAS DE IMPLEMENTACIÓN (FASE 3)
Metodología: Vibe Coding Profesional (PEVC V5 - Semáforo TDD)

## Tarea 1: Verificación de Esquema SQL & Generación de Tipos Database
- [x] Escribir migración SQL completa `20261108000000_init_boxtools_schema.sql` con tablas `categories`, `tools`, `tool_media`, `combos`, `combo_tools` y `ai_settings`.
- [x] Configurar políticas de seguridad RLS (Lectura pública para catálogo, escritura estricta para Admin autenticado).
- [x] Generar `database.types.ts` y cliente `src/lib/supabase.ts`.

## Tarea 2: Redacción del Test TDD (Playwright E2E)
- [x] Caso ROJO: Comprobar renderizado de catálogo, conmutación Criollo/Técnico, filtrado reactivo, apertura de modal con diagrama Mermaid y armado de Combo.
- [ ] Ejecutar prueba y verificar resultado VERDE.

## Tarea 3: Refactor y Poda de Contexto (AZUL)
- [ ] Verificar build final con `npm run build`.
- [ ] Limpiar logs temporales y verificar `.clauderules`.
