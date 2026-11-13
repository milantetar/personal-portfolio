import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';

const base = 'http://127.0.0.1:8019';
const root = 'storage/app/private/browser-audit';
const stamp = Date.now();
const browser = await chromium.launch();
const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
const results = [],
    errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (res) => {
    if (res.url().startsWith(base) && res.status() >= 500)
        errors.push(`${res.status()} ${res.url()}`);
});
page.on('dialog', (dialog) => dialog.accept());
async function run(name, action) {
    try {
        await action();
        results.push({ name, status: 'pass' });
        console.log('PASS', name);
    } catch (error) {
        results.push({ name, status: 'fail', error: error.message });
        console.log('FAIL', name, error.message.slice(0, 450));
    }
    await page.screenshot({
        path: `${root}/more-${results.length}.png`,
        fullPage: true,
    });
    fs.writeFileSync(
        `${root}/more.json`,
        JSON.stringify({ results, errors }, null, 2),
    );
}
await page.goto(`${base}/login`);
await page.locator('#email').fill('browser-audit@example.test');
await page.locator('#password').fill('Browser-audit-only-42!');
await page.getByRole('button', { name: 'Log in', exact: true }).click();
await page.waitForURL(/\/dashboard(?:\/.*)?$/);

await run('Media upload, metadata edit, preview and deletion', async () => {
    await page.goto(`${base}/dashboard/media`);
    await page
        .getByRole('button', { name: '+ Add Media', exact: true })
        .click();
    await page.locator('#new-media-title').fill(`Browser media ${stamp}`);
    await page.locator('#new-media-file-upload').setInputFiles({
        name: `browser-audit-${stamp}.png`,
        mimeType: 'image/png',
        buffer: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4l8AAAAASUVORK5CYII=',
            'base64',
        ),
    });
    await expect(page.getByRole('dialog')).toBeHidden();
    await page
        .getByPlaceholder('Search files...')
        .fill(`browser-audit-${stamp}`);
    await page.getByPlaceholder('Search files...').press('Enter');
    await expect(page).toHaveURL(new RegExp(`search=browser-audit-${stamp}`));
    const row = page
        .getByRole('row')
        .filter({ hasText: `browser-audit-${stamp}` });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Edit media', exact: true }).click();
    await page.locator('#media-title').fill(`Edited media ${stamp}`);
    await page.locator('#media-alt-text').fill('Browser audit image');
    await page
        .getByRole('button', { name: 'Save Changes', exact: true })
        .click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await row.getByRole('button', { name: /^Preview / }).click();
    await expect(page.getByRole('dialog').getByRole('img')).toBeVisible();
    await page.keyboard.press('Escape');
    await row
        .getByRole('button', { name: 'Delete media', exact: true })
        .click();
    await page
        .getByRole('button', { name: 'Delete Permanently', exact: true })
        .click();
    await expect(row).toBeHidden();
});
await run('Navigation create, edit, reorder and delete', async () => {
    await page.goto(`${base}/dashboard/navigation`);
    await page
        .getByRole('button', { name: 'Add link', exact: true })
        .last()
        .click();
    await page.locator('#navigation-label').fill(`Audit link ${stamp}`);
    await page.locator('#navigation-url').fill('/about');
    await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Add link', exact: true })
        .click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await page
        .getByRole('button', { name: `Edit Audit link ${stamp}`, exact: true })
        .click();
    await page.locator('#navigation-label').fill(`Edited link ${stamp}`);
    await page
        .getByRole('button', { name: 'Save changes', exact: true })
        .click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await page
        .getByRole('button', {
            name: `Move Edited link ${stamp} up`,
            exact: true,
        })
        .click();
    await expect(
        page.getByRole('button', {
            name: `Delete Edited link ${stamp}`,
            exact: true,
        }),
    ).toBeVisible();
    await page
        .getByRole('button', {
            name: `Delete Edited link ${stamp}`,
            exact: true,
        })
        .click();
    await page
        .getByRole('button', { name: 'Delete link', exact: true })
        .click();
    await expect(
        page.getByRole('button', {
            name: `Delete Edited link ${stamp}`,
            exact: true,
        }),
    ).toBeHidden();
});
await run('Section create, edit, hide, publish and delete', async () => {
    await page.goto(`${base}/dashboard/sections`);
    await page
        .getByRole('button', { name: 'Add section', exact: true })
        .click();
    await page.locator('#section-title').fill(`Audit section ${stamp}`);
    await page.locator('#section-slug').fill(`audit-section-${stamp}`);
    await page
        .locator('#section-content')
        .fill('{"body":"Browser audit custom section"}');
    await page
        .getByRole('button', { name: 'Create section', exact: true })
        .click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await page
        .getByRole('button', {
            name: `Edit Audit section ${stamp}`,
            exact: true,
        })
        .click();
    await page.locator('#section-title').fill(`Edited section ${stamp}`);
    await page
        .getByRole('button', { name: 'Save section', exact: true })
        .click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await page
        .getByRole('button', {
            name: `Hide Edited section ${stamp}`,
            exact: true,
        })
        .click();
    await expect(
        page.getByRole('button', {
            name: `Publish Edited section ${stamp}`,
            exact: true,
        }),
    ).toBeVisible();
    const response = await page.request.get(`${base}/audit-section-${stamp}`);
    expect(response.status()).toBe(404);
    for (const close of await page
        .getByRole('button', { name: 'Close toast', exact: true })
        .all())
        await close.click();
    await page
        .getByRole('button', {
            name: `Publish Edited section ${stamp}`,
            exact: true,
        })
        .click();
    await expect(
        page.getByRole('button', {
            name: `Hide Edited section ${stamp}`,
            exact: true,
        }),
    ).toBeVisible();
    await page
        .getByRole('button', {
            name: `Delete Edited section ${stamp}`,
            exact: true,
        })
        .click();
    const dialog = page.getByRole('dialog');
    if (await dialog.isVisible())
        await dialog.getByRole('button', { name: /Delete/i }).click();
    await expect(
        page.getByRole('button', {
            name: `Edit Edited section ${stamp}`,
            exact: true,
        }),
    ).toBeHidden();
});
await run(
    'Certificate create, edit and delete with PDF attachment',
    async () => {
        await page.goto(`${base}/dashboard/certificates`);
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        const dialog = page.getByRole('dialog');
        await dialog
            .getByLabel('Title', { exact: true })
            .fill(`Audit certificate ${stamp}`);
        await dialog
            .getByLabel('Issuer', { exact: true })
            .fill('Browser audit issuer');
        await dialog.locator('input[type=date]').fill('2026-11-13');
        const option = await dialog
            .locator('select option')
            .evaluateAll(
                (els) =>
                    els.find((el) => /\.pdf$/i.test(el.textContent))?.value,
            );
        if (option) await dialog.locator('select').selectOption(option);
        await dialog.getByRole('button', { name: 'Add', exact: true }).click();
        await expect(dialog).toBeHidden();
        await page
            .getByPlaceholder('Search...', { exact: true })
            .fill(`Audit certificate ${stamp}`);
        const row = page
            .getByRole('row')
            .filter({ hasText: `Audit certificate ${stamp}` });
        await expect(row).toBeVisible();
        await row.getByTitle('Edit', { exact: true }).click();
        await dialog.locator('input').nth(1).fill('Edited issuer');
        await dialog.getByRole('button', { name: 'Save', exact: true }).click();
        await expect(dialog).toBeHidden();
        await expect(row).toContainText('Edited issuer');
        await row.getByTitle('Delete', { exact: true }).click();
        await expect(row).toBeHidden();
    },
);
await run(
    'Site identity save persists on public pages; PDF uses a document preview',
    async () => {
        await page.goto(`${base}/dashboard/settings`);
        await expect(
            page.getByRole('link', { name: 'Open assigned document' }),
        ).toBeVisible();
        await page.locator('#site_name').fill('Browser Audit Portfolio');
        await page
            .getByRole('button', { name: 'Save site settings', exact: true })
            .click();
        await expect(
            page.getByText('Site settings saved.', { exact: true }),
        ).toBeVisible();
        await page.goto(base);
        await expect(
            page
                .getByRole('navigation', { name: 'Main navigation' })
                .getByRole('link', {
                    name: 'Browser Audit Portfolio',
                    exact: true,
                }),
        ).toBeVisible();
    },
);
await run('Contact inbox read and delete', async () => {
    await page.goto(`${base}/dashboard/messages`);
    const row = page
        .getByRole('row')
        .filter({ hasText: 'Browser audit enquiry' })
        .first();
    await expect(row).toBeVisible();
    await row.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const toggle = page.getByRole('button', { name: /Mark as (?:Unr|R)ead/ });
    await toggle.click();
    await expect(toggle).toBeVisible();
    await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Delete', exact: true })
        .click();
    await expect(page.getByRole('dialog')).toBeHidden();
});
await run('Mobile admin screens do not overflow the viewport', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of [
        '/dashboard',
        '/dashboard/media',
        '/dashboard/settings',
        '/dashboard/projects',
        '/dashboard/posts',
        '/dashboard/certificates',
        '/dashboard/navigation',
        '/dashboard/sections',
    ]) {
        await page.goto(base + route);
        expect(
            await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
            ),
            route,
        ).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
});
await run('Password change and fresh login', async () => {
    await page.goto(`${base}/dashboard/settings`);
    await page.locator('#current_password').fill('Browser-audit-only-42!');
    await page.locator('#new_password').fill('Browser-audit-new-42!');
    await page.locator('#password_confirmation').fill('Browser-audit-new-42!');
    await page
        .getByRole('button', { name: 'Update password', exact: true })
        .click();
    await expect(
        page.getByText('Password updated.', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await page.goto(`${base}/login`);
    await page.locator('#email').fill('browser-audit@example.test');
    await page.locator('#password').fill('Browser-audit-new-42!');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.waitForURL(/\/dashboard(?:\/.*)?$/);
});
await browser.close();
console.log(JSON.stringify({ results, errors }, null, 2));
process.exitCode =
    results.some((result) => result.status === 'fail') || errors.length ? 1 : 0;
