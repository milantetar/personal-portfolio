import { chromium, expect } from '@playwright/test';

const browser = await chromium.launch();
try {
    const page = await browser.newPage();
    for (const width of [320, 390, 640]) {
        await page.setViewportSize({ width, height: 640 });
        await page.goto('http://127.0.0.1:8019/');
        const toggle = page.getByRole('button', {
            name: 'Open navigation menu',
        });
        const panel = page.locator('#portfolio-mobile-navigation');
        const before = await page.locator('main').boundingBox();
        await toggle.click();
        await expect(panel).toBeVisible();
        await expect(panel.locator('[aria-current="page"]')).toHaveCount(1);
        const after = await page.locator('main').boundingBox();
        expect(after.y).toBe(before.y);
        const bounds = await panel.boundingBox();
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
        await panel.evaluate((element) =>
            Promise.all(
                element.getAnimations().map((animation) => animation.finished),
            ),
        );
        await page.screenshot({
            path: `storage/app/private/browser-audit/menu-${width}.png`,
        });
        await page.keyboard.press('Escape');
        await expect(panel).toHaveCount(0);
        await expect(toggle).toBeFocused();
        await toggle.click();
        await page.locator('main').click({ position: { x: 10, y: 450 } });
        await expect(panel).toHaveCount(0);
        await toggle.click();
        await panel.getByRole('link', { name: 'About', exact: true }).click();
        await expect(page).toHaveURL(/\/about$/);
        await expect(panel).toHaveCount(0);
        await page
            .getByRole('button', { name: 'Open navigation menu' })
            .click();
        await page.setViewportSize({ width: 1024, height: 768 });
        await expect(panel).toHaveCount(0);
        console.log(
            `PASS Mobile menu layout, dismissal and navigation at ${width}px`,
        );
    }
    for (const width of [768, 850, 1024]) {
        await page.setViewportSize({ width, height: 768 });
        await expect(
            page.getByRole('button', { name: 'Change theme' }),
        ).toBeVisible();
        expect(
            await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
            ),
        ).toBe(true);
    }
    console.log('PASS Tablet navigation controls and overflow');
} finally {
    await browser.close();
}
