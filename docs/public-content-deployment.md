# Public portfolio content on free Render

The deployed image includes a reviewed, content-only snapshot at
`database/seeders/data/public-portfolio.json` and its referenced local images and
PDFs under `database/seeders/assets`. These are intentionally public portfolio
materials, including your public contact email, resume and certificates.
The original MySQL dump, SQLite database and `.env` remain private and excluded.

No analytics, contact submissions, assistant conversations, users, passwords,
sessions, access tokens, drafts, hidden sections or unreferenced media are exported.
Media uploader account IDs are not restored. An explicit field allowlist prevents
new database columns from being published automatically.

## Deploy

Keep these Render environment settings enabled:

```dotenv
DB_CONNECTION=sqlite
DB_URL=
SEED_ON_DEPLOY=true
DEPLOYMENT_CONTENT_SEED=true
```

Deploy the latest `master` commit. Startup migrates SQLite, then imports the
snapshot only when portfolio content is empty. Existing content is preserved;
partially populated content without site settings causes startup to fail safely.
Navigation created by migrations is matched by location to avoid duplicate links.
An administrator is created separately from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
Analytics starts empty and begins recording real visits; it is not disabled.

Bundled local media is copied to public storage at startup. The existing
Cloudinary image retains its HTTPS delivery URL. New uploads still use Cloudinary.
No raw SQL is executed and no database import HTTP endpoint is exposed.

Render Free loses SQLite on restart, redeploy or idle spin-down. The snapshot
restores the baseline content each time, but later dashboard edits, password
changes, enquiries and analytics can disappear. The snapshot is not a live backup.

## Update the baseline

After editing your local SQLite content, run:

```powershell
php artisan portfolio:export-deployment-content
```

This reads the local database without changing it. Review the generated JSON and
referenced assets before committing and pushing them. The command excludes
unpublished records and copies only public files referenced by included content.
Remove any obsolete bundled assets manually after confirming they are no longer
referenced; old files are not deleted automatically. Do not put private documents
or credentials into public portfolio fields.

Set `DEPLOYMENT_CONTENT_SEED=false` to use the generic starter content instead.
The original `PortfolioSqlSeeder` remains restricted to local/testing imports.
