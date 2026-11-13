# Import the private portfolio dump locally

`database/seeders/sql/portfolio-db.sql` is a MySQL dump. It is excluded from Git
and Docker images because it includes private runtime data. Never run it as raw
SQL against the application's database.

`PortfolioSqlSeeder` reads literal values from the nine portfolio content tables
and inserts them using Laravel's bound database queries. It does not execute SQL
from the file, import accounts/tokens/sessions, or trust uploader account IDs.

Preview the source row counts:

```powershell
php artisan db:seed --class=PortfolioSqlSeeder
```

Apply to the current local SQLite database:

```powershell
$env:PORTFOLIO_IMPORT_APPLY='true'
try {
    php artisan db:seed --class=PortfolioSqlSeeder
} finally {
    Remove-Item Env:PORTFOLIO_IMPORT_APPLY -ErrorAction SilentlyContinue
}
php artisan portfolio:verify-sql-import
```

Before applying, the seeder creates a consistent SQLite backup under
`storage/app/private/backups/`. The apply operation replaces content tables in a
transaction, including empty source tables. It verifies row counts and foreign
keys before committing. Imported media uploader IDs are cleared; existing users,
sessions, tokens, messages, and logs are preserved. The seeder refuses to apply
on a production environment or a non-SQLite connection.

The verifier checks source/database counts, SQLite integrity, foreign keys, and
whether every local media reference has a corresponding file. Image/PDF contents
are not included in a SQL dump. Importing metadata does not upload anything to
Cloudinary.

## Cloudinary credentials

1. Sign in to the Cloudinary Console and select your product environment.
2. Open **Settings > API Keys**. Copy your API key and reveal/copy its API secret.
   Cloudinary may request email verification. Obtain the cloud name from the
   product environment's Dashboard or API environment variable template.
3. Put the complete API environment variable in your private `.env`:

```dotenv
MEDIA_STORAGE_DISK=cloudinary
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
CLOUDINARY_FOLDER=personal-portfolio
```

4. Run `php artisan config:clear`. New uploads use Cloudinary; existing local
   media remain local until explicitly migrated or re-uploaded.
5. Set the same variables in Render's private Environment settings for production.

Keep the API secret server-side. Do not use a `VITE_` prefix, commit it, paste it
in a public chat, or configure an unsigned upload preset for this server upload
flow. See [Cloudinary's credential guide](https://cloudinary.com/documentation/developer_onboarding_faq_find_credentials).

## An external database for free Render hosting

Laravel can use local SQLite for development and a managed PostgreSQL service
for production. A service such as Neon offers a free PostgreSQL plan; use the
provider's connection string privately as `DB_URL` with `DB_CONNECTION=pgsql`.
The Docker image already includes PostgreSQL support. Your content must be
transferred as data into the migrated PostgreSQL schema; do not run this MySQL
dump directly against PostgreSQL or upload the SQLite file as a SQL script.

Downloading a SQLite snapshot at startup can restore the original data but does
not preserve later dashboard changes. For a writable SQLite database on Render,
use a persistent disk on a paid service. A shared Drive/object-storage file does
not behave like a remotely accessible database.
