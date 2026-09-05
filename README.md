# Regular Notes

Unofficial self-hosting distribution of Standard Notes for a single server:
one container, one HTTP origin and one persistent data directory. The same Node
process serves the Web UI, API, synchronization, revisions and encrypted files.
It uses SQLite and does not require Redis or Nginx.

The project combines pinned source snapshots of:

- `standardnotes/server` in `server/`;
- `standardnotes/app` in `app/`.

Local changes:

- every newly registered account receives a 100-year `PRO_PLAN` subscription
  and an unlimited file quota;
- bundled client-side Pro editors, views and themes are enabled locally;
- one-time file valet tokens are stored as SHA-256 hashes in SQLite and consumed
  atomically, with expiry cleanup at startup and during token consumption;
- Web UI defaults sync and files to `window.location.origin`; the Custom Sync
  Server selector remains available;
- API responses derive the files origin from the request when no explicit files
  URL is configured, so native clients need only the same server URL.

## Start

```bash
./init-secrets.sh
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

The default endpoint is `http://127.0.0.1:3020`. The bind is deliberately
loopback-only. Publish it privately through Tailscale Serve or another trusted
TLS reverse proxy; do not change it to `0.0.0.0` and do not use Tailscale Funnel.

For a direct local HTTP test, set `COOKIE_SECURE=false` in `.env`. Set it back to
`true` for HTTPS. `init-secrets.sh` is idempotent and never replaces an existing
`.env`.

Persistent state is under `data/`:

- `data/database/home_server.sqlite` — accounts, encrypted items, revisions and
  one-time token hashes;
- `data/uploads/` — client-encrypted file bytes.

Do not run `docker compose down -v` when using a named-volume variant and do not
delete `data/` unless the encrypted notes and files are intentionally being
destroyed.

## Native clients

In a desktop or mobile Standard Notes client choose Custom Sync Server and enter
the public HTTPS URL of this one container, for example
`https://notes.example.test`. API and files share that origin. The bundled Web UI
does not require selecting Custom because it defaults to its own origin.

## Security and feature scope

Notes and linked files are encrypted by Standard Notes clients before upload;
the server stores ciphertext. Decrypted content still exists in an unlocked
client's memory, and browser persistence follows Standard Notes' own encrypted
local-storage design. Server-side account metadata, password hashes and session
state are not the note ciphertext and should still be protected with filesystem
permissions and backups.

This distribution enables bundled client features and Home Server capabilities.
It does not invent unavailable external services: email backups/alerts, Listed,
payments and WebSockets are not supplied by this container. Hardware-key U2F
also requires deployment-specific relying-party configuration.

Existing accounts are not retroactively changed by the registration hook.
Migrate or activate them explicitly before importing an old database.

## Maintenance

The exact imported revisions are in `NOTICE`. To update, import newer
upstream snapshots, reapply/review the small local commits, run both monorepo
test suites and rebuild the image. Never commit `.env`, `data/`, account exports
or browser profiles.

This is an unofficial project and is not endorsed by Standard Notes. Standard
Notes names and trademarks belong to their respective owners.

## Licensing

The imported sources and modifications to them retain their original notices
and licenses. In particular, `@standardnotes/home-server` and related server
packages declare AGPL-3.0-or-later, while the web application declares
AGPL-3.0. A network deployment must offer its corresponding source to users as
required by the AGPL. See the top-level `LICENSE`, `server/LICENSE`,
`app/LICENSE`, and package-level metadata for details.

Never commit runtime `.env` files, account databases or uploaded files.
