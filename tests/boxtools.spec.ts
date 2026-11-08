import { test, expect } from '@playwright/test';

test.describe('BoxTools Visual & Functional Suite', () => {
  test('PW-01: Render and verify no horizontal scroll on Desktop, Tablet & Mobile', async ({ page }) => {
    // 1. Desktop 1440px
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/screenshots/desktop-1440px.png', fullPage: true });

    let isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(isOverflowing).toBeFalsy();

    // 2. Tablet 768px
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'test-results/screenshots/tablet-768px.png', fullPage: true });
    isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(isOverflowing).toBeFalsy();

    // 3. Mobile 375px
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/screenshots/mobile-375px.png', fullPage: true });
    isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(isOverflowing).toBeFalsy();
  });

  test('PW-02: Master mode switch and detail modal interaction', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Click MODO TÉCNICO
    await page.click('button:has-text("MODO TÉCNICO")');
    await expect(page.locator('text=Compatibilidad:').first()).toBeVisible();

    // Click MODO CRIOLLO
    await page.click('button:has-text("MODO CRIOLLO")');
    await expect(page.locator('text=En Criollo (La Analogía):').first()).toBeVisible();

    // Open Detail Modal
    await page.click('button:has-text("Ver Ficha + Gráficos") >> nth=0');
    await page.waitForSelector('text=EN CRIOLLO (SIN VUELTAS):');
    await page.screenshot({ path: 'test-results/screenshots/modal-detail-criollo.png' });
  });
});

