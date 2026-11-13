# Browser audit — 13 November 2026

## Scope and method

The story under test is a portfolio visitor reading content, contacting the
owner and using the assistant, followed by an administrator managing that content
through the dashboard. Playwright Chromium exercised the browser, Laravel routes,
validation/CSRF, the database, responses and the resulting UI.

Tests used a disposable SQLite snapshot and copied media. A temporary admin and
non-admin were created only in that snapshot. Outbound email used the array
mailer, Gemini/GitHub responses were mocked on the PHP HTTP-client boundary, and
test uploads used a private local disk. Your original database, accounts,
passwords and uploaded files were preserved.

## Verified results

- **16 screens:** homepage, assistant, blog, forgot password, login, dashboard,
  analytics, messages, projects, articles, assistant logs, settings, navigation,
  certificates, sections and media. All returned 200 with no broken images or
  JavaScript errors in the final inventory. Public Cloudinary image delivery was
  checked with network access.
- **24 browser flows:** all passed. They cover guest protection; login errors and
  password visibility; admin login; project creation/thumbnail/duplicate slug;
  article creation/publication; assistant request/response; contact form;
  mobile public navigation; media upload/edit/preview/delete; navigation
  create/edit/reorder/delete; section create/edit/hide/publish/delete;
  certificate create/edit/delete with a PDF; settings persistence/document
  preview; inbox read/delete; mobile admin overflow; password change/fresh login;
  theme persistence; sitemap/robots/404/guest API protection; password recovery
  and invalid reset token; non-admin denial; CSRF denial; project edit/delete;
  article duplicate validation/unpublish/delete.
- The main browser requests used normal local middleware with CSRF enabled;
  this was not a browser run with Laravel's testing-mode CSRF bypass.
- PHP regression suite: **52 passed, 262 assertions**. PHPStan, TypeScript,
  frontend lint/formatting and the production frontend build also passed.

## Bugs corrected

| ID   | Finding and evidence                                                                                                                                                       | Correction                                                                                                                                            |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| B-01 | A second project with the same title and no explicit slug returned HTTP 500 because slug generation happened after uniqueness validation. Articles had the same code path. | Generate before validation; require a routable unique slug on create/update; regression tests cover collisions and empty/path-shaped slugs.           |
| B-02 | Project/article forms used `useForm` for state but global `router.post/put` for submission, so field errors and processing state were disconnected.                        | Submit through the form's own transformed payload and methods; clear old errors on opening a form. Playwright confirmed inline duplicate-slug errors. |
| B-03 | Site settings rendered the assigned PDF resume through an image element, producing a broken image.                                                                         | Render document attachments as an accessible file link/icon and images through image previews.                                                        |
| B-04 | A success toast covered the section publish button and paused under the pointer, with no dismiss control.                                                                  | Add close buttons to notifications; retest hide/publish with a dismissed toast.                                                                       |
| B-05 | Certificate editor labels had no association with their controls.                                                                                                          | Add stable IDs and label associations; browser tests fill fields by accessible label.                                                                 |
| B-06 | The upload picker omitted SVG/ICO despite backend support.                                                                                                                 | Include their MIME types and ICO extension in the picker.                                                                                             |
| B-07 | Upload feature tests inherited the real local Cloudinary setting after configuration, attempting provider calls.                                                           | Force local uploads and clear external-service credentials in PHPUnit; force in-memory SQLite and the array mailer.                                   |
| B-08 | The starter seeder inserted navigation rows already created by migrations because the table had no unique constraint for `insertOrIgnore` to hit.                          | Match/update by navbar and label; assert one of each starter link during bootstrap regression tests.                                                  |

## Reproduction and artifacts

```powershell
pnpm build
pnpm browser:audit
```

Use an initialized local SQLite portfolio and clear cached config before running.
The harness requires loopback port 8019. Browser binaries can be installed with
`pnpm exec playwright install chromium`. The script stops its test server on exit.

Private artifacts are under `storage/app/private/browser-audit/`:
`inventory.json`, `flows.json`, `more.json`, `edge.json`, page/flow PNG screenshots,
`trace.zip`, and `server.log`. Run `pnpm exec playwright show-trace` with the trace
path to inspect browser interactions. Do not publish these artifacts: they can
contain copied content and test session state. They are excluded from Git and
the Docker context.

The initial network-restricted run could not fetch Cloudinary CDN images; the
final network-enabled run loaded them successfully. An early media test raced
the debounced search; the harness now waits for the search URL before editing.
Password recovery waits for the mail operation to finish rather than assuming a
five-second response on the local PHP server.

## Production checks still required

- Live Gemini authorization, model access, quota/billing, and answer quality.
  Browser tests exercised the real backend with a mocked provider response.
- Actual email delivery through Resend/DNS and successful reset from the delivered
  link. The audit used an in-memory mail transport.
- Live Cloudinary create/delete permissions and PDF delivery. Browser upload CRUD
  used isolated local storage; public CDN image reads were verified.
- Production Docker build/startup, PostgreSQL restore, persistent storage across
  a Render restart, DNS/TLS and production proxy/client-IP behavior. Docker is not
  installed on this workstation; use the Docker/PostgreSQL CI smoke workflow.
- Additional security hardening tracked in `security_best_practices_report.md`,
  including SVG sanitization, a compatible CSP and pinned workflow dependencies.

Follow [the deployment guide](deployment.md) for provider setup, data transfer,
environment variables, release checks, backups and rollback.
