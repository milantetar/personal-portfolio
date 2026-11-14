# Public portfolio content on Render

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

## Move the existing service to Neon PostgreSQL

The same public snapshot now restores into an empty PostgreSQL database on the
first startup. Later startups preserve database rows and restore the bundled
public images and PDFs to the free service's temporary filesystem. Cloudinary
uploads stay on Cloudinary. No private runtime data is copied from SQLite.

Create a **fresh** Neon production database or branch. In the existing Render
service's Environment page, set `DB_CONNECTION=pgsql`, set `DB_URL` to the
private Neon connection string with `sslmode=require`, and clear `DB_DATABASE`.
Keep `SEED_ON_DEPLOY=true` and `DEPLOYMENT_CONTENT_SEED=true`. Keep the existing
`APP_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, Cloudinary, Resend and Gemini values.
Save and deploy after this code is live. The entrypoint migrates the fresh
database and then imports the snapshot. Do not point this startup at a database
containing test or production content: existing portfolio rows are intentionally
preserved and will not be replaced by the snapshot.

The Blueprint marks the three database variables `sync: false`, so future
Blueprint syncs leave their Render values alone. For a newly created Blueprint,
set those variables in the Render dashboard during setup. Test an edit and a
redeploy after the switch; the edit should remain. Keep a separate database
backup, because the bundled snapshot is only the original baseline.

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
