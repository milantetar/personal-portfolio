import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';

const base = 'http://127.0.0.1:8019';
const root = 'storage/app/private/browser-audit';
const browser = await chromium.launch();
const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
page.on('dialog', (dialog) => dialog.accept());
const results = [],
    errors = [];
page.on('pageerror', (error) => errors.push(error.message));
async function run(name, action) {
    try {
        await action();
        results.push({ name, status: 'pass' });
        console.log('PASS', name);
    } catch (error) {
        results.push({ name, status: 'fail', error: error.message });
        console.log('FAIL', name, error.message.slice(0, 400));
    }
    await page.screenshot({
        path: `${root}/edge-${results.length}.png`,
        fullPage: true,
    });
    fs.writeFileSync(
        `${root}/edge.json`,
        JSON.stringify({ results, errors }, null, 2),
    );
}
await run('Portfolio theme persists across navigation and reload', async () => {
    await page.goto(base);
    await page
        .getByRole('button', { name: 'Choose portfolio theme', exact: true })
        .click();
    await page.getByRole('menuitem', { name: 'Ocean', exact: true }).click();
    await expect(page.locator('[data-theme="ocean"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-theme="ocean"]')).toBeVisible();
});
await run('Sitemap, robots, missing page and guest API access', async () => {
    const sitemap = await context.request.get(`${base}/sitemap.xml`);
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).not.toContain('/dashboard');
    const robots = await context.request.get(`${base}/robots.txt`);
    expect(await robots.text()).toContain('Disallow: /dashboard');
    expect(
        (
            await context.request.get(`${base}/this-page-does-not-exist`)
        ).status(),
    ).toBe(404);
    expect(
        (
            await context.request.get(`${base}/api/dashboard/media`, {
                headers: { Accept: 'application/json' },
            })
        ).status(),
    ).toBe(401);
});
await run(
    'Password reset request uses the test mailer and rejects invalid reset tokens',
    async () => {
        await page.goto(`${base}/forgot-password`);
        await page.locator('#email').fill('browser-audit@example.test');
        await page
            .getByRole('button', { name: 'Send reset link', exact: true })
            .click();
        await expect(
            page.getByText(/emailed your password reset link/i),
        ).toBeVisible({ timeout: 20000 });
        await page.goto(
            `${base}/reset-password/invalid-token?email=browser-audit%40example.test`,
        );
        await page.locator('#password').fill('Another-audit-password-42!');
        await page
            .locator('#password_confirmation')
            .fill('Another-audit-password-42!');
        await page
            .getByRole('button', { name: 'Reset password', exact: true })
            .click();
        await expect(
            page.getByText(/password reset token is invalid/i),
        ).toBeVisible();
    },
);
await run('Non-admin cannot open the dashboard', async () => {
    await page.goto(`${base}/login`);
    await page.locator('#email').fill('browser-reader@example.test');
    await page.locator('#password').fill('Browser-audit-only-42!');
    const response = page.waitForResponse(
        (res) =>
            res.url().endsWith('/dashboard') &&
            res.request().method() === 'GET',
    );
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    expect((await response).status()).toBe(403);
    await context.clearCookies();
});
await page.goto(`${base}/login`);
await page.locator('#email').fill('browser-audit@example.test');
await page.locator('#password').fill('Browser-audit-new-42!');
await page.getByRole('button', { name: 'Log in', exact: true }).click();
await page.waitForURL(/\/dashboard(?:\/.*)?$/);
await run(
    'CSRF rejects an authenticated mutation without a token',
    async () => {
        const response = await context.request.post(
            `${base}/dashboard/projects`,
            {
                headers: { Accept: 'application/json' },
                data: { title: 'Must not be created' },
            },
        );
        expect(response.status()).toBe(419);
    },
);
await run('Project edit and delete', async () => {
    await page.goto(`${base}/dashboard/projects`);
    const row = page
        .getByRole('row')
        .filter({ hasText: 'Browser Audit Project' })
        .first();
    await row.getByTitle('Edit', { exact: true }).click();
    await page.locator('#p_title').fill('Edited browser project');
    await page
        .getByRole('button', { name: 'Save Project', exact: true })
        .click();
    await expect(page.getByRole('dialog')).toBeHidden();
    const edited = page
        .getByRole('row')
        .filter({ hasText: 'Edited browser project' });
    await expect(edited).toBeVisible();
    await edited.getByTitle('Delete', { exact: true }).click();
    await expect(edited).toBeHidden();
});
await run('Article duplicate validation, unpublish and deletion', async () => {
    await page.goto(`${base}/dashboard/posts`);
    const row = page
        .getByRole('row')
        .filter({ hasText: 'Browser Audit Article' })
        .first();
    await row.getByTitle('Edit', { exact: true }).click();
    const slug = await page.locator('#art_slug').inputValue();
    const title = await page.locator('#art_title').inputValue();
    await page.getByLabel(/Publish immediately/).uncheck();
    await page
        .getByRole('button', { name: 'Save Changes', exact: true })
        .click();
    await expect(page.getByRole('dialog')).toBeHidden();
    expect((await context.request.get(`${base}/blog/${slug}`)).status()).toBe(
        404,
    );
    await page
        .getByRole('button', { name: 'New Article', exact: true })
        .click();
    await page.locator('#art_title').fill(title);
    await page.locator('#art_content').fill('Duplicate title validation');
    await page
        .getByRole('button', { name: 'Create Article', exact: true })
        .click();
    await expect(
        page.getByRole('dialog').getByText(/slug.*taken/i),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await row.getByTitle('Delete', { exact: true }).click();
    await expect(row).toBeHidden();
});
await browser.close();
console.log(JSON.stringify({ results, errors }, null, 2));
process.exitCode =
    results.some((result) => result.status === 'fail') || errors.length ? 1 : 0;
