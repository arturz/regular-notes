# Standard Notes One

Unofficial, source-available self-hosting distribution of Standard Notes for a
single server. The target deployment is one container, one HTTP port and one
persistent data directory containing SQLite databases and encrypted uploads.

The project combines pinned source snapshots of:

- `standardnotes/server` in `server/`;
- `standardnotes/app` in `app/`.

Planned local changes make newly registered accounts receive the complete Pro
subscription state, replace the Home Server file-token Redis dependency with
SQLite, serve the web client from the Home Server process, and default the web
client to its own origin while retaining its Custom Sync Server option.

This is an unofficial project and is not endorsed by Standard Notes. Standard
Notes names and trademarks belong to their respective owners.

## Licensing

The imported sources retain their original notices and licenses. In particular,
`@standardnotes/home-server` and the web application declare AGPL-3.0 licensing.
Local modifications and the combined distribution are intended to be released
under AGPL-3.0-or-later. See `server/LICENSE`, `app/LICENSE`, and package-level
metadata for details.

Never commit runtime `.env` files, account databases or uploaded files.
