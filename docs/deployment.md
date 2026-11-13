# Docker and Render deployment

The production image runs PHP 8.4 with FrankenPHP as an unprivileged user.
Node 22 builds the browser assets; Node is not required by the final image.
Inertia SSR is disabled because this image runs a single PHP web process.

## Required services and secrets

The selected Blueprint uses a free Render web service, SQLite, and Cloudinary
for media. It provisions no persistent disk. SQLite database changes can disappear
on redeploy or restart; this setup is suitable for a disposable preview.
Startup restores the reviewed public portfolio snapshot and the configured
administrator when the database is empty. It does not copy the entire local
database: analytics, accounts, sessions, tokens, messages, and logs are excluded.
See [public content deployment](public-content-deployment.md).
For lasting dashboard edits, use an external database or opt into a paid disk
using [the SQLite deployment steps](sqlite-deployment.md).

Set these in Render's Environment page (or during initial Blueprint creation):

| Variable            | Value                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `APP_KEY`           | Run `php artisan key:generate --show` locally, then copy the complete `base64:...` value. Keep it stable across deploys. |
| `DB_URL`            | Leave empty for SQLite. Remove any old Neon URL from Render's environment settings.                                      |
| `CLOUDINARY_URL`    | `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` from your Cloudinary account.                                               |
| `ADMIN_EMAIL`       | Your administrator email address.                                                                                        |
| `ADMIN_PASSWORD`    | Render generates this secret; retrieve it from Environment to sign in initially.                                         |
| `RESEND_API_KEY`    | Your Resend API key for contact notifications and password reset emails.                                                 |
| `MAIL_FROM_ADDRESS` | A valid sender email on your verified Resend domain, such as `portfolio@example.com`. A bare domain is invalid.          |

The Blueprint selects ephemeral SQLite, Cloudinary, database sessions/cache, synchronous
jobs, and stderr logging. It uses `/up` for health checks. Set `APP_URL` to your
custom HTTPS domain if using one; otherwise startup uses `RENDER_EXTERNAL_URL`.
Optional integrations remain `GITHUB_USERNAME`, `GITHUB_TOKEN`, and `GEMINI_API_KEY`.
For an existing Blueprint, add any newly introduced secrets manually in Environment.

## Startup and first login

The Blueprint explicitly trusts only the immediate Render ingress peer via
`TRUSTED_PROXIES=REMOTE_ADDR`. Keep this setting only where all traffic reaches
the container through the managed ingress. Direct deployments should leave it
empty or set verified proxy IPs/CIDRs. Only forwarded client IP and scheme are
accepted; forwarded host, port, and prefix are ignored. If your ingress uses
multiple proxy hops, verify client-IP resolution and configure verified proxy
CIDRs rather than widening trust to every address.

Production requests must match the hostname in `APP_URL` or Render's supplied
`RENDER_EXTERNAL_HOSTNAME`; arbitrary subdomains are not accepted. Absolute links
use `APP_URL`, so set it to your canonical HTTPS domain. Do not replace a working
`APP_KEY` merely to troubleshoot an unrelated error: existing encrypted records
need the original key. Never disable certificate verification to fix TLS errors.

Startup runs migrations before accepting traffic. A migration or cache error
stops the container and appears in Render logs. Back up the database before
deployments that change its schema.

`SEED_ON_DEPLOY=true` runs `portfolio:bootstrap-deployment`: the bundled public
snapshot is restored on empty SQLite when `DEPLOYMENT_CONTENT_SEED=true`.
The initial administrator is
created only if that email has no account. Existing content and passwords are
preserved while the database survives. Keep both seed flags enabled on the free
plan so a lost database restores your baseline portfolio and configured admin.
Analytics starts empty on each fresh database and collects only new visits.
Open `/login` and sign in using the administrator environment credentials.
Use one web instance while migrations run at startup; for multiple replicas,
move migrations into a single release task.

## Verify the deployment

1. Confirm the Docker build and PostgreSQL smoke check in GitHub Actions pass.
2. Open `/up`, then the homepage, `/login`, and the dashboard.
3. Upload an image and PDF; verify their URLs use Cloudinary. Some Cloudinary
   accounts require enabling PDF delivery in the account's security settings.
4. Change a setting, restart the service, and confirm the setting and media persist.
5. Submit a contact enquiry and test password reset delivery with your verified sender.

Existing files on the `public` disk are not automatically copied to Cloudinary.
Re-upload them before removing the old storage. Keep the existing `APP_KEY`
when deploying an existing database containing encrypted user records.

## Local Docker smoke test

Install Docker Desktop with Linux containers, then run from the project root:

```powershell
php docker/setup-local.php
notepad .env.docker
docker compose up --build -d
docker compose ps
```

The setup script creates `.env.docker` from `docker/local.env.example`, generates
a random application key and admin password, and refuses to overwrite an existing
file. Set `GEMINI_API_KEY` privately using a key from
[AI Studio](https://aistudio.google.com/apikey). Open `http://localhost:8080` and
use `/login` with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.docker`.
Test `/assistant` after adding the key. Saving environment changes requires
`docker compose up -d --force-recreate`; no image rebuild is needed for secrets.

Compose binds only to localhost and uses separate named SQLite and media volumes.
Startup migrates and bootstraps that Docker database with starter content; it
does not import your current development data. `docker compose down` preserves
these volumes. Do not use `down -v` unless you intend to delete the Docker data.
`APP_ENV=local` and `SESSION_SECURE_COOKIE=false` allow the local HTTP URL while
`APP_DEBUG=false` keeps error details private. Keep production settings on Render.

To test Cloudinary, set `MEDIA_STORAGE_DISK=cloudinary` and `CLOUDINARY_URL` in
the private file. To test Neon, create a dedicated test branch and set
`DB_CONNECTION=pgsql`, `DB_DATABASE=` and `DB_URL` to its connection string
including `sslmode=require`. Startup applies migrations to the database you
select, so check the target branch before starting. SQLite is sufficient for
local Docker testing; Neon is needed only when you choose it for deployment.

Never add API keys as Dockerfile `ARG` or `ENV` values, build arguments, or
`VITE_*` variables. `.env.docker` is excluded from Git and the Docker build context;
Compose supplies it only at runtime. Avoid sharing `docker compose config`,
`docker inspect`, or application configuration output: these may contain secrets.

For rollback, redeploy the previous image while keeping secrets and database
settings unchanged. Rolling back an image does not roll back database migrations;
restore a tested database backup if the prior code needs the old schema.

References: [Render environment settings](https://render.com/docs/configure-environment-variables),
[Render filesystem limitations](https://render.com/docs/free),
[FrankenPHP Docker guide](https://frankenphp.dev/docs/docker/).

## 1. Verify the release locally

```powershell
composer install
pnpm install --frozen-lockfile
composer lint:check
composer types:check
php artisan test
pnpm types:check
pnpm check
pnpm build
pnpm browser:audit
```

If Playwright reports a missing browser, run `pnpm exec playwright install chromium`.
The browser audit creates an isolated SQLite snapshot, a temporary audit admin,
and copied media under `storage/app/private/browser-audit/`. It uses loopback port
8019, real application routes and CSRF protection, a local upload disk, an array
mailer, and mocked Gemini/GitHub HTTP responses. Your working database and real
accounts are not modified. Screenshots, traces, and JSON results are private and
excluded from Git. Live Gemini billing/quota and Cloudinary write permissions
still need the production checks listed below.

Commit source, lockfiles, migrations and configuration. Do not commit `.env`,
SQLite files, private exports/backups, the original SQL dump, or browser traces.
The Docker CI workflow checks an actual production container with PostgreSQL;
wait for that workflow before treating the container as verified.

## 2. Configure the persistent production database

The default Blueprint configures SQLite at
`/app/storage/app/database/portfolio.sqlite` on the free container filesystem.
This file is ephemeral. For durable SQLite storage, explicitly choose a paid
instance and disk before following [sqlite-deployment.md](sqlite-deployment.md).

### Optional PostgreSQL alternative

Create a Neon PostgreSQL project in a region close to the Render web service.
Copy the provider's connection string from its Connect dialog, including TLS
options such as `sslmode=require`. Set it as Render's **DB_URL** secret, with
**DB_CONNECTION=pgsql**. This project reads `DB_URL`, not `DATABASE_URL`.
Use a fresh database for the first deployment. The container's entrypoint runs
Laravel migrations against it before the service starts.

Reference: [Neon and Laravel](https://neon.com/docs/guides/laravel).
Check the database provider's current storage, compute, retention, and inactivity
limits; a free plan is not a substitute for your own backups.

### Keeping SQLite in production instead

A writable SQLite file requires persistent storage. On Render this means a paid
web service with a persistent disk. Mount a disk at a private path such as
`/var/data`, use `DB_CONNECTION=sqlite`, clear `DB_URL`, and set
`DB_DATABASE=/var/data/portfolio.sqlite`. Ensure the directory is writable by
the image's `portfolio` user before using it; do not solve ownership problems
with `chmod 777`. The free Blueprint does not provision this disk. Add one and
upgrade the instance explicitly if you choose persistent SQLite.

Transfer a consistent SQLite backup privately to that disk using Render's SSH/SCP
instructions. Do not overwrite a running database: stop writes first, keep a
backup, restore the snapshot, and restart. Preserve the original `APP_KEY` when
the copied database includes encrypted user records. Use one web instance.
See [Render persistent disks and file transfer](https://render.com/docs/disks).
Downloading a snapshot from Drive or object storage at startup does not save
subsequent dashboard edits and is not a durable writable database.

## 3. Configure Cloudinary and move existing media

In Cloudinary Console, select the correct product environment and open
**Settings > API Keys**. Use a dedicated server key with upload/create permission
for `personal-portfolio/media`, plus delete permission for replacement/deletion.
A successful authenticated ping only confirms the credentials are recognized;
it does not prove upload permission. The previously observed `missing permissions
(actions=["create"])` error means the key's role/folder access must be corrected.
See [Cloudinary API key permissions](https://cloudinary.com/documentation/dam_admin_role_management).

Set these on Render:

```dotenv
MEDIA_STORAGE_DISK=cloudinary
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
CLOUDINARY_FOLDER=personal-portfolio
FILESYSTEM_DISK=local
```

`FILESYSTEM_DISK=local` is intentional: the application's media service selects
Cloudinary through `MEDIA_STORAGE_DISK`. No Cloudinary Flysystem adapter is used.
The full URL is a secret; never prefix it with `VITE_` or expose it in browser code.

The imported SQL includes file references only. Existing local media do not move
automatically when the setting changes. Before exporting for free Render:

1. Keep your private SQLite and `storage/app/public` backups.
2. Re-upload the existing images and PDFs from the local dashboard after setting
   `MEDIA_STORAGE_DISK=cloudinary` and clearing config.
3. Assign the new records to branding slots, certificates, project thumbnails,
   and any section references that used the old local IDs.
4. Verify their public URLs, then remove unused local media records from the
   dashboard. Do not delete old records while other content still references them.
5. Test one disposable Cloudinary upload and deletion. If PDF delivery is blocked,
   check the Cloudinary account's PDF delivery security setting.

## 4. Transfer your real content to PostgreSQL

Do this only after the production schema has been migrated. The local
`PortfolioSqlSeeder` is a development SQLite import tool, not a production
PostgreSQL restore command. The original phpMyAdmin dump must not be executed
against Neon.

Generate a private PostgreSQL content export from local SQLite:

```powershell
php artisan portfolio:export-postgres
```

The command refuses to export unresolved local media by default. To inspect a
preview file before moving the remaining media, use:

```powershell
php artisan portfolio:export-postgres --allow-local-media
```

The output path is printed under `storage/app/private/exports/`. It uses
PostgreSQL booleans, quoted literal values, a transaction, dependency order, and
sequence resets. It includes only the nine portfolio content tables. Accounts,
sessions, tokens, contact messages, logs and migration history are excluded;
media uploader IDs are cleared.

Back up the target and review the generated file before executing it. It
**replaces content tables**, including starter content, and preserves production
accounts. Paste the reviewed SQL into the SQL editor of the intended Neon
database/branch and execute it there. Verify the selected database carefully.
The SQL export does not upload media files. Compare sections, branding,
certificates, projects, navigation and media URLs after importing. Do not run the
generic `PortfolioSeeder` afterward, as it contains starter values.

This export is generated locally; the browser audit does not connect to your
production database or claim to validate a live PostgreSQL restore.

## 5. Configure Gemini

1. Open [Google AI Studio API Keys](https://aistudio.google.com/apikey).
2. Create/select the intended Google Cloud project and create a Gemini API key.
   Use the current key type provided by AI Studio and restrict it to the Gemini
   API. Keep the key server-side. Browser-referrer restrictions are inappropriate
   for this server-to-server integration; follow Google's server key guidance.
3. Check which models and quotas are available to that project in AI Studio.
4. Add the following to Render's private Environment settings:

```dotenv
GEMINI_API_KEY=your_private_key
GEMINI_MODEL=gemini-4-hydrogen
GEMINI_FALLBACK_MODEL=gemini-4-hydrogen
GEMINI_TIMEOUT_SECONDS=12
PORTFOLIO_ASSISTANT_PER_MINUTE_LIMIT=10
PORTFOLIO_ASSISTANT_DAILY_LIMIT=60
```

The model above is listed in [Google's current model catalogue](https://aistudio.google.com/docs/models)
as of November 13, 2026. Existing `.env` values override the new defaults; update
`GEMINI_MODEL` and `GEMINI_FALLBACK_MODEL` there yourself if you want this model
outside Docker, then run `php artisan config:clear`. If your
project has different access, choose an available text model supporting
`generateContent`. Keeping fallback equal to the primary avoids silently
selecting a different model; set a distinct fallback only after checking its
availability and cost. The app currently tries fallback after connection errors
or provider 503 responses, not to bypass quotas.

The app calls Gemini from PHP using `x-goog-api-key`; visitors never need the
key. It supplies public CMS context, limits conversation length and rate limits
requests. User questions and assistant replies are stored in the admin assistant
logs, so account for that in your privacy notice and retention practices.

After saving the environment and redeploying, open `/assistant`, ask about the
portfolio, and check `/dashboard/assistant-logs`. Test a factual question, an
unknown fact, and an unrelated question. Confirm errors are friendly and private
API responses/keys do not appear in the browser. A blank key disables the
assistant UI. Provider 429 means quota/rate limits; 503 means unavailable/busy;
other provider failures are presented as a generic 502.

Quotas are per Google project, not per API key. Local per-IP limits do not cap
the project's total spend. Check AI Studio usage and billing before enabling a
paid tier. See [API key guidance](https://ai.google.dev/gemini-api/docs/api-key),
[models](https://ai.google.dev/gemini-api/docs/models),
[rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), and
[pricing](https://ai.google.dev/gemini-api/docs/pricing).

## 6. Configure email and optional GitHub integration

Create a Resend API key, add your sender domain, and verify its DNS records.
Use a valid mailbox-shaped sender such as `portfolio@your-domain.com`; a bare
domain such as `your-domain.com` is invalid. The default Resend test sender is
not a replacement for a verified sender for public recipients.

```dotenv
MAIL_MAILER=resend
RESEND_API_KEY=your_private_resend_key
MAIL_FROM_ADDRESS=portfolio@your-domain.com
MAIL_FROM_NAME=Personal Portfolio
```

Save your owner contact email in `/dashboard/settings`. Submit a contact form
and confirm it appears in the inbox and that the email arrives. Test forgot
password with your admin address. A saved inbox message does not prove email
delivery succeeded: the controller keeps messages even when delivery fails.
See [Resend's Laravel guide](https://resend.com/docs/send-with-laravel).

Set `GITHUB_USERNAME` and/or your GitHub profile in site settings to display
public repositories. `GITHUB_TOKEN` is optional for increased API allowance; use
only the access needed for public repository reads. Tokens remain server-side.
Do not set local Windows `GITHUB_CA_BUNDLE`/`GEMINI_CA_BUNDLE` paths on Render.
Linux should use its system certificate store; never disable TLS verification.

## 7. Deploy and accept the release

1. Push the reviewed source to your repository. Wait for PHP/frontend CI and the
   Docker/PostgreSQL smoke workflow. Run the browser audit locally.
2. In Render, select **New > Blueprint**, choose the repository, and review the
   free web service with no disk. Add the required secrets from the table above.
3. Add optional Gemini/GitHub variables manually. Existing Blueprint services do
   not necessarily prompt again for newly introduced secrets.
4. Keep `APP_ENV=production`, `APP_DEBUG=false`, `SESSION_SECURE_COOKIE=true`,
   `SESSION_DRIVER=database`, `CACHE_STORE=database`, `QUEUE_CONNECTION=sync`,
   and `TRUSTED_PROXIES=REMOTE_ADDR` behind Render ingress.
5. Use the canonical HTTPS `APP_URL`. Startup uses `RENDER_EXTERNAL_URL` if it is
   unset. Add a custom domain through Render, configure its required DNS records,
   and update `APP_URL` when ready. Keep `SESSION_DOMAIN` unset unless needed.
6. Confirm startup migrations/bootstrap/caches succeed, then `/up` returns 200.
   Log in with the initial admin credentials from Render and change the password.
7. Import the reviewed content export, then verify public pages, navigation,
   Cloudinary images/PDFs, settings, contact email, password reset and assistant.
8. Restart/redeploy once and verify edits remain. This proves persistence rather
   than merely confirming that the original snapshot can be re-created.

Free Render services can sleep and have cold starts. Local files disappear
across restarts/spin-down/redeploys, and free services lack a runtime Shell.
Keep production SQLite under the persistent disk mount; keep uploads in Cloudinary.
Do not use ephemeral container files for production databases, uploads, or backups. Free
Render Postgres has an expiry; review provider limits before selecting it.
See [Render free service limitations](https://render.com/docs/free).

Synchronous jobs are deliberate because this deployment does not run a queue
worker. Daily analytics pruning is scheduled in Laravel but requires an external
cron/worker running `php artisan schedule:run` each minute; configure it if you
need automatic retention. No scheduler or background worker is provisioned by
the free Blueprint.

## Troubleshooting and recovery

| Symptom                                     | Check                                                                                              |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Encryption/cipher error                     | Valid stable `APP_KEY`; don't regenerate it over existing encrypted accounts.                      |
| Mixed content or localhost URLs             | Canonical HTTPS `APP_URL`, then redeploy to refresh config cache.                                  |
| Database connection failure                 | `DB_CONNECTION=pgsql`, correct `DB_URL` including provider TLS options, correct database/branch.   |
| Cloudinary `missing permissions ... create` | Correct product environment and key role/folder upload access; ping alone is insufficient.         |
| Upload stays local                          | `MEDIA_STORAGE_DISK=cloudinary`; `FILESYSTEM_DISK` alone does not select this upload backend.      |
| Gemini 403/404/429/503                      | Key/API access, available model ID, project quota, or provider availability; inspect private logs. |
| Contact inbox works but email does not      | Resend API key, verified sender domain/address, provider delivery logs.                            |
| 419 submitting a form                       | Cookies, CSRF token, canonical origin and secure-cookie settings; don't disable CSRF.              |
| Linux-only login 500                        | Matching Inertia component path casing and fresh Vite build.                                       |
| Missing imported images                     | SQL only carries references; migrate files to Cloudinary and reassign IDs.                         |

For diagnosis use Render's private logs; production debug stays off in code.
Keep database backups outside the web container and periodically test restores.
Keep the matching encryption key in a separate secret store. Do not post request
cookies, credentials, SQL dumps, or full debug pages publicly. After rotating a
provider key, redeploy, verify it, and disable the old key.
