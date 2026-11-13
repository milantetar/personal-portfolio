import { chromium } from '@playwright/test';
import fs from 'node:fs';

const root = 'storage/app/private/browser-audit';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
});
const pages = [];
async function inspect(path) {
    const response = await page.goto('http://127.0.0.1:8019' + path);
    await page.waitForTimeout(500);
    const details = await page.evaluate(() => ({
        title: document.title,
        headings: [...document.querySelectorAll('h1,h2')].map(
            (el) => el.textContent,
        ),
        buttons: [...document.querySelectorAll('button')].map((el) => ({
            text: el.textContent,
            label: el.getAttribute('aria-label'),
        })),
        fields: [...document.querySelectorAll('input,textarea,select')].map(
            (el) => ({
                tag: el.tagName,
                type: el.type,
                id: el.id,
                placeholder: el.placeholder,
                name: el.name,
            }),
        ),
        links: [...document.querySelectorAll('a')].map((el) => ({
            text: el.textContent?.trim(),
            href: el.getAttribute('href'),
        })),
        brokenImages: [...document.images]
            .filter((el) => el.complete && el.naturalWidth === 0)
            .map((el) => el.src),
        overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    pages.push({ path, status: response.status(), ...details });
    await page.screenshot({
        path: `${root}/${path.replaceAll('/', '-') || 'home'}.png`,
        fullPage: true,
    });
    console.log(
        path +
            ' ' +
            response.status() +
            ' ' +
            details.title +
            ' broken-images=' +
            details.brokenImages.length,
    );
}
await inspect('/');
await inspect('/assistant');
await inspect('/blog');
await inspect('/forgot-password');
await inspect('/login');
await page
    .getByLabel('Email address', { exact: true })
    .fill('browser-audit@example.test');
await page
    .getByLabel('Password', { exact: true })
    .fill('Browser-audit-only-42!');
await page.getByRole('button', { name: 'Log in', exact: true }).click();
await page.waitForURL('**/dashboard');
for (const path of [
    '/dashboard',
    '/dashboard/analytics',
    '/dashboard/messages',
    '/dashboard/projects',
    '/dashboard/posts',
    '/dashboard/assistant-logs',
    '/dashboard/settings',
    '/dashboard/navigation',
    '/dashboard/certificates',
    '/dashboard/sections',
    '/dashboard/media',
]) {
    await inspect(path);
}
fs.writeFileSync(
    `${root}/inventory.json`,
    JSON.stringify({ pages, errors }, null, 2),
);
console.log('Browser errors:', JSON.stringify(errors));
await browser.close();
process.exitCode =
    errors.length ||
    pages.some((entry) => entry.status !== 200 || entry.brokenImages.length > 0)
        ? 1
        : 0;
