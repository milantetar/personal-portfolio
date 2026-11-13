# Security review

**Review date:** 2026-11-13
**Scope:** Laravel 13 / PHP, Inertia + React/TypeScript, web and API routes, authentication and authorization, media uploads, frontend rendering, session settings, CI workflow, and locked dependency advisories.

## Executive summary

The current review confirms the previously identified authorization gaps remain fixed: the admin role check fails closed, and Sanctum dashboard CRUD routes require the admin role. The previously affected Symfony Mime and PHPUnit dependencies are updated. Composer and production JavaScript dependency audits found no known advisories. No confirmed critical or high severity issue was found in this pass. Remaining hardening items include public SVG handling, CSP, GitHub Actions supply-chain controls, and wildcard Composer constraints.

This was a code, dependency, and local test-suite review, not a penetration test. Hosting/CDN headers and production runtime configuration were not available for inspection.

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

### SEC-03 — Medium — Vulnerable Symfony MIME dependency — Fixed in current lockfile

- **Location:** `composer.lock` (`symfony/mime` was v8.1.7; now v8.1.10)
- **Advisory:** CVE-2026-45070 affected Symfony Mime versions before 8.1.10. It concerns attacker-controlled parameter names in structured MIME headers. Exploitability through this app was not confirmed, and the current lockfile is beyond the affected range.
- **Fix applied:** The lockfile now contains Symfony Mime 8.1.10. [Symfony advisory and fixed versions](https://symfony.com/blog/cve-2026-45070-email-header-injection-via-non-token-characters-in-mime-parameter-names).

### SEC-04 — Medium, development-only — Vulnerable PHPUnit dependency — Fixed in current lockfile

- **Location:** `composer.lock` (`phpunit/phpunit` was 13.4.2; now 13.4.5)
- **Advisory:** PHPUnit 13.4.0–13.4.3 can allow local code execution through PHPT code coverage when users share a temporary directory and an attacker can pre-create PHPUnit's temporary directory. The reported fixed version is 13.4.4. This is a local development/CI precondition, not an unauthenticated web attack. [GitHub advisory](https://github.com/advisories/GHSA-9vw2-f4vp-x7gf).
- **Fix applied:** Pest and PHPUnit were updated together; the current lockfile contains PHPUnit 13.4.5, beyond the affected range.

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

### SEC-08 — Low hardening — Composer dependency constraints are unbounded

- **Location:** `composer.json` (`spatie/laravel-medialibrary` and `spatie/laravel-permission`)
- **Evidence:** Both production dependencies use `*` constraints. Composer still resolves installs through the committed lockfile, but unconstrained updates can move to any compatible release and make dependency changes harder to review.
- **Recommendation:** Replace each wildcard with a tested major-version range and update the lockfile deliberately.

### Deployment persistence note — Render now requires external PostgreSQL

- **Location:** `render.yaml:17-19` and `Dockerfile` (`/app/database/database.sqlite`)
- **Resolution:** The Render blueprint now selects PostgreSQL and requires a `DB_URL` secret. The Docker image includes `pdo_pgsql`. Cloudinary stores uploaded media. The database must be provisioned separately and have a suitable persistence policy; see `docs/deployment.md`.

## Controls observed

### Gemini conversation follow-up (2026-11-13)

- **SEC-09 — Medium, corrected — Unconditional proxy trust:** `bootstrap/app.php` used `trustProxies(at: '*')` with full forwarded-header defaults. `TrustConfiguredProxies` now trusts no proxies by default; the Render Blueprint explicitly trusts the immediate ingress via `TRUSTED_PROXIES=REMOTE_ADDR`. Only client IP and scheme headers are consumed. Wildcard trust is supported by Laravel behind controlled ingress, but should not be copied into every deployment.
- **SEC-10 — Medium, corrected — Unrestricted request hosts:** Production accepts only exact configured application/Render hostnames. Forwarded host, port and prefix headers cannot change the origin, and absolute production links use `APP_URL`.
- **SEC-11 — Medium, corrected — Production debug exposure:** The pasted conversation contains a production exception page with request headers and database queries. Production now forces debug off even if `APP_DEBUG=true` is set. Diagnose errors through private server logs. Revoke any authenticated sessions whose cookies were exposed in the original debug output; do not rotate `APP_KEY` as a substitute, since stored encrypted data needs the original key.
- Advice about a valid initial application key, HTTPS URLs, disabling Caddy's admin API, matching component filename casing, and updating vulnerable dependencies was appropriate. Replacing every media URL with `asset('storage/...')` would break remote storage; the current accessor preserves both local and Cloudinary behavior.
- Previous deployment fixes already removed world-writable permissions, password/content resets on startup, swallowed startup errors, and container-local production SQLite. Do not restore those old workarounds.
- Reference: [Laravel trusted proxies and hosts](https://laravel.com/framework/docs/requests). The live ingress boundary and deployed configuration still require verification after deployment.

- `.env` and `storage/logs/laravel.log` are not tracked by Git; `.env` and public storage paths are ignored. This does not prove secrets were never committed in another repository/history.
- `APP_DEBUG` defaults to false in application config; `.env.example` enables debug only with `APP_ENV=local`.
- Login, contact, and assistant endpoints have rate limits; request data uses Laravel validation/Form Requests.
- Web dashboard routes require authentication and the admin role. Web CSRF middleware remains enabled.
- React's raw HTML sinks reviewed here use framework-generated pagination labels; persisted portfolio content is otherwise rendered through React text interpolation.
- `pnpm audit --prod`: no known vulnerabilities in the production dependency graph.

## Verification and limitations

- See `docs/browser-audit.md` for the subsequent Playwright review: 16 screens
  loaded successfully and 24 desktop/mobile flows passed with no JavaScript
  errors or broken images in the final network-enabled inventory. Gemini/GitHub
  provider responses were mocked; email used the array transport and write CRUD
  uploads used isolated local storage. Live provider permissions and deployment
  persistence still require production verification.

- `composer audit --locked`: no security vulnerability advisories found.
- `pnpm audit --prod`: no known vulnerabilities found.
- `php -l`: passed for the changed PHP files.
- Pint formatting check passed for the changed PHP files.
- The contact email test's invalid local sender address is now isolated by setting a valid test sender in `phpunit.xml`. Deployment bootstrap tests cover preserving existing content/passwords and repeat startup.
- Live/deployed HTTP-header checks were not run.
- Composer validation passes with warnings for the two wildcard constraints noted in SEC-08.
- The Cloudinary upload lifecycle was not exercised against a real Cloudinary account because no credentials were supplied.
