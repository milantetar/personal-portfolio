# Security review

**Review date:** 2026-10-31  
**Scope:** Laravel 13 / PHP, Inertia + React/TypeScript, web and API routes, authentication and authorization, media uploads, frontend rendering, session settings, CI workflow, and locked dependency advisories.

## Executive summary

The review found two high-impact authorization gaps. Both are fixed in the current working tree: the admin role check now fails closed during setup, and Sanctum dashboard CRUD routes now require the admin role. Production session cookies default to `Secure` when `APP_URL` uses HTTPS, and standard clickjacking, MIME-sniffing, referrer, and permissions headers are added.

The production JavaScript dependency audit found no advisories. Composer reported two medium advisories in the lockfile: `symfony/mime` v8.1.7 and `phpunit/phpunit` 13.4.2. I have not changed the dependency lockfile; the PHPUnit fix needs a compatible Pest update as well.

This was a code and dependency audit, not a penetration test. Hosting/CDN headers and production runtime configuration were not available for inspection.

## Findings

### SEC-01 — High — Dashboard role check allowed access before admin setup — Fixed

- **Location:** `app/Http/Middleware/EnsureAdminRole.php:21-39`
- **Evidence:** The previous middleware let any authenticated user through when no admin role was assigned, and also let users through when the role record was missing.
- **Impact:** Any account able to authenticate could manage the CMS during initial setup or a missing-role condition.
- **Fix applied:** The middleware now allows only users with the `admin` role. Missing role configuration results in denial. Bootstrap access with `UserDataSeeder` or `php artisan portfolio:grant-admin <email>`; see `README.md:67`.

### SEC-02 — High — Sanctum dashboard CRUD routes lacked the admin gate — Fixed

- **Location:** `routes/api.php:14-22`
- **Evidence:** The media and sidebar-item API resources were inside `auth:sanctum` but were not inside the `admin` middleware group.
- **Impact:** An authenticated non-admin account with an API session/token could read or modify CMS media and sidebar items.
- **Fix applied:** The dashboard API resource group now applies the same `admin` middleware as the web dashboard.

### SEC-03 — Medium — Vulnerable Symfony MIME dependency — Pending update

- **Location:** `composer.lock` (`symfony/mime` v8.1.7; required transitively by Laravel/Mailer)
- **Advisory:** CVE-2026-45070 affects Symfony Mime versions before 8.1.10. It concerns attacker-controlled parameter names in structured MIME headers. The reviewed application paths do not demonstrate a user-controlled MIME parameter name, so exploitability through this app is not confirmed; the locked component is still in the affected range.
- **Fix:** Update to Symfony Mime 8.1.10 or later, subject to Composer dependency resolution. [Symfony advisory and fixed versions](https://symfony.com/blog/cve-2026-45070-email-header-injection-via-non-token-characters-in-mime-parameter-names).

### SEC-04 — Medium, development-only — Vulnerable PHPUnit dependency — Pending coordinated update

- **Location:** `composer.lock` (`phpunit/phpunit` 13.4.2; `composer.json` requires Pest `^5.3`)
- **Advisory:** PHPUnit 13.4.0–13.4.3 can allow local code execution through PHPT code coverage when users share a temporary directory and an attacker can pre-create PHPUnit's temporary directory. The reported fixed version is 13.4.4. This is a local development/CI precondition, not an unauthenticated web attack. [GitHub advisory](https://github.com/advisories/GHSA-9vw2-f4vp-x7gf).
- **Fix:** Update PHPUnit and Pest together. The currently locked Pest release constrains PHPUnit to 13.4.2, so upgrading PHPUnit alone is not dependency-compatible.

### SEC-05 — Medium hardening — Public SVG uploads

- **Location:** `app/Data/Media/MediaData.php:17`, `app/Data/Media/MediaUpdateData.php:18`, `app/Services/Media/MediaService.php:21,56`
- **Evidence:** SVG files are accepted and saved on the public storage disk.
- **Impact:** A malicious SVG opened directly from the same origin can execute active content. The upload routes are admin-protected, so this is primarily a compromised-admin or unsafe-file handling risk; no public unauthenticated upload path was found.
- **Recommendation:** Preserve SVG support only if needed for logos/icons, and sanitize SVG before serving or serve it as an attachment/from an isolated origin. Do not trust the extension alone.

### SEC-06 — Low/medium hardening — No Content Security Policy visible in application code

- **Location:** `app/Http/Middleware/SecurityHeaders.php:18-21`
- **Evidence:** The app now sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`; it does not set a CSP.
- **Impact:** A CSP would provide defense in depth against script injection if another bug is introduced. No exploitable user-controlled HTML path was confirmed in this review. The `dangerouslySetInnerHTML` sites reviewed render Laravel-generated paginator labels rather than stored post/message text.
- **Recommendation:** If adding CSP, use a nonce-compatible policy for Vite/Inertia and verify it against production responses. Avoid a permissive policy that relies on `unsafe-inline`/`unsafe-eval`.

### SEC-07 — Low hardening — GitHub Actions are tag-pinned and workflow permissions are implicit

- **Location:** `.github/workflows/ci.yml:26,51` and other `uses:` steps
- **Evidence:** Actions use movable tags such as `@v4`; the workflow does not declare a minimal `permissions` block.
- **Impact:** A compromised or moved action tag could affect CI. Explicit read-only token permissions reduce the impact of a compromised workflow step.
- **Recommendation:** Pin third-party actions to reviewed full commit SHAs and declare the minimum required `GITHUB_TOKEN` permissions (likely `contents: read` for this workflow).

## Controls observed

- `.env` and `storage/logs/laravel.log` are not tracked by Git; `.env` and public storage paths are ignored. This does not prove secrets were never committed in another repository/history.
- `APP_DEBUG` defaults to false in application config; `.env.example` enables debug only with `APP_ENV=local`.
- Login, contact, and assistant endpoints have rate limits; request data uses Laravel validation/Form Requests.
- Web dashboard routes require authentication and the admin role. Web CSRF middleware remains enabled.
- React's raw HTML sinks reviewed here use framework-generated pagination labels; persisted portfolio content is otherwise rendered through React text interpolation.
- `pnpm audit --prod --json`: 0 advisories across the audited production dependency graph.

## Verification and limitations

- `composer audit --locked`: reported the two Composer advisories above.
- `pnpm audit --prod`: 0 vulnerabilities.
- `php -l`: passed for the changed PHP files.
- Automated application tests and live/deployed HTTP-header checks were not run.
- Composer updates remain pending because the PHPUnit/Pest versions need a coordinated update.
