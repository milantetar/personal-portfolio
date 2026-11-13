# Deploy with your existing SQLite database

SQLite is appropriate for this small portfolio with one application instance.
Cloudinary stores uploads; SQLite stores content, users, and media references.
The current Blueprint uses Render's free plan without a disk. It cannot retain
database edits across restarts. The transfer instructions below apply only if
you explicitly upgrade to a paid instance and attach a persistent disk at
`/app/storage/app/database`; they do not apply to the free preview.
See [Render persistent disks](https://render.com/docs/disks).

For the selected free plan, use [public content deployment](public-content-deployment.md)
instead: a bundled public snapshot restores the baseline on each new database,
with analytics initially empty. Dashboard edits remain ephemeral.

## Settings

```dotenv
DB_CONNECTION=sqlite
DB_DATABASE=/app/storage/app/database/portfolio.sqlite
DB_URL=
```

Remove any previous Neon `DB_URL` from Render. Keep `APP_ENV=production`,
`APP_DEBUG=false`, and `MEDIA_STORAGE_DISK=cloudinary`. Set Gemini and Cloudinary
credentials in Render's private Environment settings, never in the Dockerfile.
Local development continues using `database/database.sqlite`.

## Transfer existing data

1. Keep your current local `APP_KEY` for the deployed copy. User fields are
   encrypted with it; generating another key makes those existing fields unreadable.
2. Create a consistent backup with SQLite's backup API or `VACUUM INTO`.
   A plain file copy while writes are active can miss WAL transactions. Save the
   snapshot under `storage/app/private/backups`, which is excluded from Git and
   the image. Never commit the SQLite file or the private SQL dump.
3. Deploy initially with `SEED_ON_DEPLOY=false`. Startup creates an empty database
   and applies migrations. During this initial setup, restrict access to the site.
4. Upload your snapshot privately using the SSH/SCP instructions in
   [Render's disk documentation](https://render.com/docs/disks#transferring-files).
   Stop application writes, back up the destination database, and replace it
   with the snapshot at the configured database path. Do not replace a database
   while the app is writing to it. Ensure the directory and file are writable
   by the image's `portfolio` user; do not use `chmod 777`.
5. Restart/redeploy with the same disk and `APP_KEY`. Startup applies any pending
   migrations to the imported snapshot. Sign in with your existing account.
   Keep `SEED_ON_DEPLOY=false` when preserving existing content and accounts.
6. Check homepage content, login, uploads, Gemini, and contact email. Change one
   setting, restart the service, and confirm it persists before opening access.

The SQL dump contains file references, not image contents. Existing local media
must be re-uploaded to Cloudinary and assigned to the corresponding records.

## Backups and operating limits

Keep one instance. Disk-backed Render deployments can briefly interrupt service.
Create consistent SQLite backups before schema changes and store copies outside
the service disk. Test restoring a backup. Never recreate the persistent disk or
overwrite the live database as a routine deploy step. Small data size alone does
not make an ephemeral filesystem durable.
