import subprocess
import time
import os
from playwright.sync_api import sync_playwright

def test_suite():
    proc = subprocess.Popen(
        ["npm", "run", "preview", "--", "--port", "4173"],
        cwd=r"d:\boxtools",
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(5)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            
            # Retry connection if server is still starting
            for attempt in range(5):
                try:
                    page.goto("http://localhost:4173", timeout=5000)
                    break
                except Exception:
                    time.sleep(1)
            
            page.wait_for_load_state("domcontentloaded")

            # 1. Test Mode Switch
            page.click('button:has-text("TÉCNICO")')
            page.wait_for_timeout(400)
            assert page.is_visible('text="npx skills add https://github.com/obra/superpowers"'), "Comando de Superpowers visible en Modo Técnico"

            page.click('button:has-text("CRIOLLO")')
            page.wait_for_timeout(400)
            assert page.is_visible('text="💡 En Criollo (La Analogía):"'), "Analogía visible en Modo Criollo"

            # 2. Test Detail Modal & Mermaid
            page.locator('[data-testid="tool-card-superpowers"] button:has-text("Ver Ficha + Gráficos")').scroll_into_view_if_needed()
            page.locator('[data-testid="tool-card-superpowers"] button:has-text("Ver Ficha + Gráficos")').click()
            page.wait_for_timeout(800)
            assert page.locator('text=EN CRIOLLO (SIN VUELTAS):').count() > 0, "Modal de detalle abierto"
            page.locator('button:has-text("✕")').first.click()
            page.wait_for_timeout(400)

            # 2b. Test ui-ux-pro-max skill card & modal
            page.locator('[data-testid="tool-card-ui-ux-pro-max"] button:has-text("Ver Ficha + Gráficos")').scroll_into_view_if_needed()
            page.locator('[data-testid="tool-card-ui-ux-pro-max"] button:has-text("Ver Ficha + Gráficos")').click()
            page.wait_for_timeout(800)
            assert page.locator('text=SKILL-003').count() > 0, "Modal de ui-ux-pro-max abierto con SKILL-003"
            assert page.locator('text=Motor de Inteligencia de Diseño').count() > 0, "Infografía SVG de ui-ux-pro-max visible"
            page.locator('button:has-text("✕")').first.click()
            page.wait_for_timeout(400)

            # 2c. Test system-rol-repomix-v7 markdown workflow card & modal
            page.locator('[data-testid="tool-card-system-rol-repomix-v7"] button:has-text("Ver Ficha + Gráficos")').scroll_into_view_if_needed()
            page.locator('[data-testid="tool-card-system-rol-repomix-v7"] button:has-text("Ver Ficha + Gráficos")').click()
            page.wait_for_timeout(800)
            assert page.locator('text=MD-002').count() > 0, "Modal de system-rol-repomix-v7 abierto con MD-002"
            assert page.locator('text=Protocolo de Continuidad V7').count() > 0, "Infografía SVG de Repomix visible"
            page.locator('button:has-text("✕")').first.click()
            page.wait_for_timeout(400)

            # 2d. Test frontend-design & diseno-hibrido-vibe cards
            page.locator('[data-testid="tool-card-frontend-design"] button:has-text("Ver Ficha + Gráficos")').scroll_into_view_if_needed()
            page.locator('[data-testid="tool-card-frontend-design"] button:has-text("Ver Ficha + Gráficos")').click()
            page.wait_for_timeout(800)
            assert page.locator('text=SKILL-004').count() > 0, "Modal de frontend-design abierto con SKILL-004"
            page.locator('button:has-text("✕")').first.click()
            page.wait_for_timeout(400)

            page.locator('[data-testid="tool-card-diseno-hibrido-vibe"] button:has-text("Ver Ficha + Gráficos")').scroll_into_view_if_needed()
            page.locator('[data-testid="tool-card-diseno-hibrido-vibe"] button:has-text("Ver Ficha + Gráficos")').click()
            page.wait_for_timeout(800)
            assert page.locator('text=SKILL-014').count() > 0, "Modal de diseno-hibrido-vibe abierto con SKILL-014"
            page.locator('button:has-text("✕")').first.click()
            page.wait_for_timeout(400)

            # 3. Test Combo Drawer
            page.click('text="Mi Combo"')
            page.wait_for_timeout(400)
            assert page.is_visible('text="Armador de Setup (Mi Combo)"'), "Drawer abierto"
            page.click('text="✕"')
            page.wait_for_timeout(300)

            # 4. Test Dedicated Section: Workflow Continuidad V7 (Repomix)
            page.locator('button:has-text("Continuidad V7")').first.click()
            page.wait_for_timeout(600)
            assert page.locator('text=Workflow V7: Continuidad').count() > 0, "Sección V7 abierta"
            assert page.locator('text=¿Por qué es un workflow aparte de PEVC V5?').count() > 0, "Comparativa de workflows visible"
            page.locator('button:has-text("← Volver al Baúl")').first.click()
            page.wait_for_timeout(400)

            # 5. Test Vibe Guide & Antigravity Markdowns Section
            page.locator('button:has-text("Jerga & Markdowns")').first.click()
            page.wait_for_timeout(600)
            assert page.locator('text=Diccionario Criollo de Vibe Coding').count() > 0, "Diccionario Criollo visible"
            page.locator('button:has-text("Markdowns en Antigravity")').click()
            page.wait_for_timeout(400)
            assert page.locator('text=PROTOCOLO DE DESARROLLO: FEATURE EXPRESS').count() > 0, "Ejemplo completo de Markdown visible"
            
            page.locator('button:has-text("Estrategia UI/UX")').click()
            page.wait_for_timeout(400)
            assert page.locator('text=¿Frontend Design, UI/UX Pro Max o la Mezcla de las Dos?').count() > 0, "Tab 3 de Estrategia de Diseño visible"
            page.locator('button:has-text("← Volver al Baúl")').first.click()
            page.wait_for_timeout(400)

            # 6. Test Add Tool Modal with AI Variations
            page.locator('button:has-text("Subir con IA")').first.click()
            page.wait_for_timeout(500)
            assert page.locator('text=Subir Herramienta al Baúl').count() > 0, "Modal de Subir Herramienta abierto"
            assert page.locator('text=GENERA MÚLTIPLES ENFOQUES').count() > 0, "Subtítulo de variaciones visible"
            page.locator('button:has-text("✕")').first.click()
            page.wait_for_timeout(300)

            # 7. Test Retractable Sidebar & Collapsible Components
            # 7a. Sidebar Retraction & Expansion
            sidebar = page.locator('aside[data-testid="main-sidebar"]')
            assert "w-[280px]" in sidebar.get_attribute("class") or "", "Sidebar inicial expandido (280px)"
            page.locator('button:has-text("RETRAER")').first.click()
            page.wait_for_timeout(400)
            assert "w-[76px]" in sidebar.get_attribute("class") or "", "Sidebar retraído a modo slim (76px)"
            page.locator('button:has-text("EXPANDIR")').first.click()
            page.wait_for_timeout(400)
            assert "w-[280px]" in sidebar.get_attribute("class") or "", "Sidebar re-expandido (280px)"

            # 7b. Hero Banner Collapse
            assert page.locator('text=PIPELINE DE LAS 5 FASES PEVC').count() > 0, "Hero banner expandido inicialmente"
            page.locator('button:has-text("Contraer Banner")').first.click()
            page.wait_for_timeout(300)
            assert page.locator('text=PIPELINE DE LAS 5 FASES PEVC').count() == 0, "Hero banner contraído"
            page.locator('button:has-text("Expandir Banner")').first.click()
            page.wait_for_timeout(300)
            assert page.locator('text=PIPELINE DE LAS 5 FASES PEVC').count() > 0, "Hero banner re-expandido"

            # 7c. PEVC V5 Collapsible Phases
            page.locator('button:has-text("PEVC V5 (Creación)")').first.click()
            page.wait_for_timeout(500)
            assert page.locator('text=Dúo Dinámico UI/UX').count() > 0, "Fase 2 de PEVC expandida"
            page.locator('button:has-text("Contraer Suite")').first.click()
            page.wait_for_timeout(300)
            assert page.locator('text=Dúo Dinámico UI/UX').count() == 0, "Fase 2 suite contraída"
            page.locator('button:has-text("Expandir Suite")').first.click()
            page.wait_for_timeout(300)
            assert page.locator('text=Dúo Dinámico UI/UX').count() > 0, "Fase 2 suite re-expandida"
            page.locator('button:has-text("← Volver al Baúl")').first.click()
            page.wait_for_timeout(400)

            # 7d. Detail Modal Collapsible Sections (Mermaid & Matrix)
            page.locator('[data-testid="tool-card-superpowers"] button:has-text("Ver Ficha + Gráficos")').scroll_into_view_if_needed()
            page.locator('[data-testid="tool-card-superpowers"] button:has-text("Ver Ficha + Gráficos")').click()
            page.wait_for_timeout(800)
            assert page.locator('button:has-text("Ocultar Diagrama")').count() > 0, "Boton ocultar diagrama visible"
            page.locator('button:has-text("Ocultar Diagrama")').click()
            page.wait_for_timeout(300)
            assert page.locator('button:has-text("Ver Diagrama")').count() > 0, "Diagrama contraído"
            page.locator('button:has-text("Ver Diagrama")').click()
            page.wait_for_timeout(300)
            assert page.locator('button:has-text("Ocultar Diagrama")').count() > 0, "Diagrama re-expandido"
            page.locator('button:has-text("✕")').first.click()
            page.wait_for_timeout(300)

            print("✅ TODOS LOS TESTS TDD PASARON EN VERDE")
            browser.close()
    finally:
        subprocess.call(["taskkill", "/F", "/T", "/PID", str(proc.pid)], shell=True)

if __name__ == "__main__":
    test_suite()
