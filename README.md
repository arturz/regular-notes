# Regular Notes

Unofficial [Standard Notes](https://github.com/standardnotes/app) distribution
for self-hosting: one container, SQLite, one URL for the web app and API.
No Redis or Nginx required.

## Run

Requires Docker Compose and OpenSSL.

```sh
./init-secrets.sh
docker compose up -d --build
```

The app listens on `127.0.0.1:3020`. Access it through a private HTTPS reverse
proxy, such as Tailscale Serve. For local HTTP testing, set `COOKIE_SECURE=false`
in `.env`; restore `true` for HTTPS.

Data lives in `data/`. Back it up and keep it and `.env` out of Git.
Desktop and mobile clients can use the same HTTPS URL as their Custom Sync Server.

Premium features require a [Standard Notes Offline plan](https://standardnotes.com/purchase/offline).
Enter the code in Preferences → General → Offline activation.

This project is not affiliated with Standard Notes. See [NOTICE](NOTICE) for
upstream revisions and licenses. Preserve the original notices and provide
users with the corresponding source of your deployment.
