import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';

const root = 'storage/app/private/browser-audit';
const base = 'http://127.0.0.1:8019';
const stamp = Date.now();
const projectTitle = `Browser Audit Project ${stamp}`;
const articleTitle = `Browser Audit Article ${stamp}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
});
await context.tracing.start({ screenshots: true, snapshots: true });
const page = await context.newPage();
page.setDefaultTimeout(12000);
const results = [];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('dialog', (dialog) => dialog.accept());
page.on('response', (response) => {
    if (response.url().startsWith(base) && response.status() >= 500)
        errors.push(`${response.status()} ${response.url()}`);
});
async function run(name, action) {
    try {
        await action();
        results.push({ name, status: 'pass' });
        console.log('PASS', name);
    } catch (error) {
        results.push({ name, status: 'fail', error: error.message });
        console.log('FAIL', name, error.message.slice(0, 380));
    }
    await page.screenshot({
        path: `${root}/flow-${results.length}.png`,
        fullPage: true,
    });
    fs.writeFileSync(
        `${root}/flows.json`,
        JSON.stringify({ results, errors }, null, 2),
    );
}
async function login() {
    await page.goto(`${base}/login`);
    await page
        .getByLabel('Email address', { exact: true })
        .fill('browser-audit@example.test');
    await page
        .getByLabel('Password', { exact: true })
        .fill('Browser-audit-only-42!');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.waitForURL(/\/dashboard(?:\/.*)?$/);
}
await run('Guest dashboard is protected', async () => {
    await page.goto(`${base}/dashboard/media`);
    await expect(page).toHaveURL(`${base}/login`);
});
await run('Login error and password visibility', async () => {
    await page
        .getByLabel('Email address', { exact: true })
        .fill('browser-audit@example.test');
    await page
        .getByLabel('Password', { exact: true })
        .fill('incorrect-password');
    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(page.locator('#password')).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page.locator('#email-error')).toBeVisible();
});
await run('Admin login', login);
await run('Project create with media thumbnail', async () => {
    await page.goto(`${base}/dashboard/projects`);
    await page
        .getByRole('button', { name: 'Add Project', exact: true })
        .click();
    await page.locator('#p_title').fill(projectTitle);
    await page.locator('#p_tagline').fill('Created through Playwright');
    await page.locator('#p_tech').fill('Laravel, React');
    const options = await page
        .locator('#p_thumb option')
        .evaluateAll((els) =>
            els.map((el) => ({ value: el.value, text: el.textContent })),
        );
    const image = options.find((option) => option.text.includes('icons8'));
    if (image) await page.locator('#p_thumb').selectOption(image.value);
    await page
        .getByRole('button', { name: 'Create Project', exact: true })
        .click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(
        page.getByRole('row').filter({ hasText: projectTitle }),
    ).toBeVisible();
});
await run('Duplicate automatic project slug shows validation', async () => {
    await page
        .getByRole('button', { name: 'Add Project', exact: true })
        .click();
    await page.locator('#p_title').fill(projectTitle);
    const response = page.waitForResponse(
        (res) =>
            res.url().endsWith('/dashboard/projects') &&
            res.request().method() === 'POST',
    );
    await page
        .getByRole('button', { name: 'Create Project', exact: true })
        .click();
    const result = await response;
    expect(result.status()).toBeLessThan(500);
    await expect(
        page.getByRole('dialog').getByText(/slug.*taken/i),
    ).toBeVisible();
});
await run('Article create and publish', async () => {
    await page.goto(`${base}/dashboard/posts`);
    await page
        .getByRole('button', { name: 'New Article', exact: true })
        .click();
    const fields = await page
        .getByRole('dialog')
        .locator('input,textarea')
        .evaluateAll((els) =>
            els.map((el) => ({
                id: el.id,
                type: el.type,
                placeholder: el.placeholder,
            })),
        );
    console.log('ARTICLE FIELDS', JSON.stringify(fields));
    await page.locator('#art_title').fill(articleTitle);
    await page
        .locator('#art_content')
        .fill(
            'Browser audit article content. <script>alert("unsafe")</script>',
        );
    await page.getByLabel(/Publish immediately/).check();
    await page
        .getByRole('button', { name: 'Create Article', exact: true })
        .click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.goto(`${base}/blog/browser-audit-article-${stamp}`);
    await expect(
        page.getByRole('heading', { name: articleTitle }),
    ).toBeVisible();
});
await run(
    'Assistant real browser-to-backend flow with mocked provider',
    async () => {
        await page.goto(`${base}/assistant`);
        await page
            .getByPlaceholder(/Ask about Milan/)
            .fill('What does Milan build?');
        await page.getByRole('button', { name: 'Send question' }).click();
        await expect(
            page.getByText(/This is a mocked provider response/),
        ).toBeVisible({ timeout: 15000 });
    },
);
await run('Contact form', async () => {
    await page.goto(`${base}/contact`);
    console.log(
        'CONTACT FIELDS',
        JSON.stringify(
            await page.locator('input,textarea').evaluateAll((els) =>
                els.map((el) => ({
                    id: el.id,
                    placeholder: el.placeholder,
                    name: el.name,
                })),
            ),
        ),
    );
    await page
        .getByLabel('Name', { exact: true })
        .fill('Browser Audit Visitor');
    await page
        .getByLabel('Email', { exact: true })
        .fill('visitor@example.test');
    await page
        .getByLabel('Subject', { exact: true })
        .fill('Browser audit enquiry');
    await page
        .getByLabel('Message', { exact: true })
        .fill('This is a browser audit message.');
    await page.getByRole('button', { name: /Send message/i }).click();
    await expect(page.getByText(/Thanks for reaching out/)).toBeVisible();
});
await run('Mobile home navigation and overflow', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
        ),
    ).toBe(true);
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await expect(
        page
            .getByRole('navigation', {
                name: 'Portfolio navigation',
                exact: true,
            })
            .getByRole('link', { name: 'About', exact: true }),
    ).toBeVisible();
    await page
        .getByRole('navigation', { name: 'Portfolio navigation', exact: true })
        .getByRole('link', { name: 'About', exact: true })
        .click();
    await expect(page).toHaveURL(/\/about$/);
});
await context.tracing.stop({ path: `${root}/trace.zip` });
await browser.close();
console.log(JSON.stringify({ results, errors }, null, 2));
process.exitCode =
    results.some((result) => result.status === 'fail') || errors.length ? 1 : 0;
