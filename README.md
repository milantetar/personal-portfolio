# AI Personal Portfolio CMS

[![CI](https://github.com/milantetar/personal-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/milantetar/personal-portfolio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A database-driven personal portfolio and content management system built with
Laravel, Inertia, React, and TypeScript.

The public portfolio, blog, navigation, theme settings, projects, certificates,
media library, contact inbox, analytics, and AI assistant are managed through a
role-protected dashboard. Homepage content remains database-driven so the site
can be updated without changing frontend code.

## Features

- Database-driven portfolio sections and site settings
- Projects, technical posts, certificates, and navigation management
- Media upload and assignment for portfolio branding
- Admin authentication with role-based authorization
- Contact form and dashboard inbox
- Portfolio analytics and assistant activity logs
- Optional GitHub projects integration
- Optional Gemini-powered portfolio assistant
- Optional Resend email delivery
- Inertia server-rendered pages with React
- Responsive UI with Tailwind CSS and reusable components
- Generated sitemap and robots.txt routes

## Technology

### Backend

- Laravel 13
- PHP 8.4+
- MySQL or SQLite
- Laravel Sanctum
- Spatie Laravel Data
- Spatie Laravel Permission
- Spatie Query Builder

### Frontend

- React 19
- TypeScript
- Inertia.js 3
- Vite 8
- Tailwind CSS 4
- Base UI and Lucide React
- Laravel Wayfinder

### Development tools

- Composer
- pnpm
- Pest
- Laravel Pint
- PHPStan/Larastan
- Vite Plus

## Requirements

- PHP 8.4 or newer
- Composer 2
- Node.js 22 or newer
- pnpm 10 or newer
- PHP extensions required by Laravel and the locked Composer dependencies
- A writable `storage/` and `bootstrap/cache/` directory

## Getting started

Clone the repository and install the dependencies:

```bash
git clone https://github.com/milantetar/personal-portfolio.git
cd personal-portfolio
composer install
pnpm install --frozen-lockfile
```

Create the local environment file:

```bash
cp .env.example .env
php artisan key:generate
```

Configure the database in `.env`, then run the migrations:

```bash
php artisan migrate
php artisan storage:link
```

Build the frontend assets:

```bash
pnpm build
```

Start the application:

```bash
php artisan serve
pnpm dev
```

The public site is available at `http://localhost:8000`. The admin dashboard
is available at `http://localhost:8000/dashboard`.

For a complete local setup, `composer setup` runs the application setup,
migrations, dependency installation, and frontend build steps.

## Initial administrator

Set these values in `.env` before running the administrator seeder:

```dotenv
ADMIN_NAME="Portfolio Admin"
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD="use-a-strong-local-password"
```

Run:

```bash
php artisan db:seed --class=DatabaseSeeder
```

To grant administrator access to an existing account:

```bash
php artisan portfolio:grant-admin you@example.com
```

The dashboard and dashboard API routes require the `admin` role. Never commit
`.env` or real credentials.

## Optional integrations

The following integrations are optional and can remain unset during local
development:

| Variables                                         | Purpose                                   |
| ------------------------------------------------- | ----------------------------------------- |
| `GITHUB_TOKEN`, `GITHUB_USERNAME`                 | GitHub projects and API rate limits       |
| `GEMINI_API_KEY`, `GEMINI_MODEL`                  | Portfolio Q&A assistant                   |
| `GEMINI_FALLBACK_MODEL`, `GEMINI_TIMEOUT_SECONDS` | Assistant fallback and timeout behavior   |
| `RESEND_API_KEY`, `MAIL_*`                        | Contact and password-reset email delivery |

Review `.env.example` for the complete list of supported configuration
variables. Keep backend secrets out of all `VITE_` variables.

## Content model

- `PortfolioSection` and related records drive the public homepage.
- Site settings store global identity, appearance, contact details, and media
  assignments.
- Projects and posts provide portfolio and blog content.
- Certificates and media are separate records connected through relationships.
- Navigation is managed independently for public and dashboard locations.

Useful public routes include:

```text
/
/blog
/assistant
/sitemap.xml
/robots.txt
```

## Quality checks

Run the relevant checks before opening a pull request:

```bash
pnpm check
pnpm types:check
pnpm build
composer lint:check
composer types:check
php artisan test
```

In a fresh checkout, generate the Wayfinder files before TypeScript checks:

```bash
php artisan wayfinder:generate --with-form
```

The CI workflow in `.github/workflows/ci.yml` validates frontend formatting,
TypeScript, browser and SSR builds, PHP formatting, static analysis, and tests.

## Project structure

```text
app/
  Auth/                 Authentication providers
  Console/Commands/     Application commands
  Data/                 Typed request and response data
  Http/                 Controllers, middleware, requests, and resources
  Models/               Eloquent models
  Repositories/         Data access abstractions
  Services/             Domain services
database/
  migrations/           Database schema
  seeders/              Local/bootstrap data
resources/
  js/components/        Shared, portfolio, and admin components
  js/pages/             Inertia pages
  views/                Server-rendered application shells
routes/                 Web, API, and console routes
tests/                  Pest feature and unit tests
```

## Security practices

- Keep `.env`, API keys, passwords, and database credentials private.
- Use `APP_DEBUG=false` outside local development.
- Do not place backend secrets in client-exposed environment variables.
- Review uploads and authorization rules before production use.
- Rotate credentials immediately if they are ever exposed.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development and pull request
guidelines. Please review the [Code of Conduct](./CODE_OF_CONDUCT.md) before
participating.

## Security

See [SECURITY.md](./SECURITY.md) for responsible vulnerability reporting.

## License

This project is licensed under the [MIT License](./LICENSE).
