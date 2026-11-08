import subprocess
import time
import os
from playwright.sync_api import sync_playwright

def test_suite():
    proc = subprocess.Popen(
        ["npm", "run", "preview", "--", "--port", "4173"],
        cwd=r"d:\boxtools\.worktrees\feat-boxtools-v1",
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(3)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            page.goto("http://localhost:4173")
            page.wait_for_load_state("networkidle")

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

            # 3. Test Combo Drawer
            page.click('text="Mi Combo"')
            page.wait_for_timeout(400)
            assert page.is_visible('text="Armador de Setup (Mi Combo)"'), "Drawer abierto"
            page.click('text="✕"')

            print("✅ TODOS LOS TESTS TDD PASARON EN VERDE")
            browser.close()
    finally:
        subprocess.call(["taskkill", "/F", "/T", "/PID", str(proc.pid)], shell=True)

if __name__ == "__main__":
    test_suite()
