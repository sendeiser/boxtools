import os
import sys
import subprocess
import time
from playwright.sync_api import sync_playwright

def run_diagnostics():
    out_dir = r"d:\boxtools\.worktrees\feat-boxtools-v1\test-results\screenshots"
    os.makedirs(out_dir, exist_ok=True)

    # Iniciar preview server local
    proc = subprocess.Popen(
        ["npm", "run", "preview", "--", "--port", "4173"],
        cwd=r"d:\boxtools\.worktrees\feat-boxtools-v1",
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    print("Iniciando servidor local en http://localhost:4173...")
    time.sleep(3)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # 1. Desktop (1440px)
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            page.goto("http://localhost:4173")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)

            # Captura Desktop Home
            desktop_path = os.path.join(out_dir, "01-desktop-1440px-home.png")
            page.screenshot(path=desktop_path, full_page=True)
            print(f"Captura Desktop lista: {desktop_path}")

            # Check overflow
            overflow_desktop = page.evaluate("() => document.documentElement.scrollWidth > document.documentElement.clientWidth")
            print(f"Overflow Desktop: {overflow_desktop}")

            # Abrir Modal Detalle y Capturar
            page.click('text="Ver Ficha + Gráficos"')
            page.wait_for_timeout(800)
            modal_path = os.path.join(out_dir, "02-desktop-1440px-modal-detail.png")
            page.screenshot(path=modal_path)
            print(f"Captura Modal lista: {modal_path}")
            page.click('text="✕"')
            page.wait_for_timeout(400)

            # Abrir Drawer Mi Combo y Capturar
            page.click('text="Mi Combo"')
            page.wait_for_timeout(600)
            drawer_path = os.path.join(out_dir, "03-desktop-1440px-combo-drawer.png")
            page.screenshot(path=drawer_path)
            print(f"Captura Drawer lista: {drawer_path}")
            page.click('text="✕"')
            page.wait_for_timeout(400)

            # 2. Tablet (768px)
            page_tablet = browser.new_page(viewport={"width": 768, "height": 1024})
            page_tablet.goto("http://localhost:4173")
            page_tablet.wait_for_load_state("networkidle")
            page_tablet.wait_for_timeout(1000)
            tablet_path = os.path.join(out_dir, "04-tablet-768px-home.png")
            page_tablet.screenshot(path=tablet_path, full_page=True)
            print(f"Captura Tablet lista: {tablet_path}")
            overflow_tablet = page_tablet.evaluate("() => document.documentElement.scrollWidth > document.documentElement.clientWidth")
            print(f"Overflow Tablet: {overflow_tablet}")

            # 3. Mobile (375px)
            page_mobile = browser.new_page(viewport={"width": 375, "height": 667})
            page_mobile.goto("http://localhost:4173")
            page_mobile.wait_for_load_state("networkidle")
            page_mobile.wait_for_timeout(1000)
            mobile_path = os.path.join(out_dir, "05-mobile-375px-home.png")
            page_mobile.screenshot(path=mobile_path, full_page=True)
            print(f"Captura Mobile lista: {mobile_path}")
            overflow_mobile = page_mobile.evaluate("() => document.documentElement.scrollWidth > document.documentElement.clientWidth")
            print(f"Overflow Mobile: {overflow_mobile}")

            browser.close()
    finally:
        subprocess.call(["taskkill", "/F", "/T", "/PID", str(proc.pid)], shell=True)
        print("Servidor preview detenido.")

if __name__ == "__main__":
    run_diagnostics()

