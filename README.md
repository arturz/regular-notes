# Regular Notes

[![CI](https://github.com/arturz/regular-notes/actions/workflows/test.yml/badge.svg)](https://github.com/arturz/regular-notes/actions/workflows/test.yml)

Run the end-to-end encrypted [Standard Notes](https://standardnotes.com) app on your own server.
This setup uses roughly 10x less RAM than the official microservices setup
(160 MB vs 1.6 GB). Everything runs in one container backed by plain SQLite.

## Run it

You need Docker Compose 2.24 or newer:

```sh
docker compose up --build --wait
```

Then open <http://127.0.0.1:3020> and register an account.

Everything you care about lives in `data/`. Back up that folder and
you're safe.

To reach it from another device, at home or away, put it behind a private
HTTPS proxy (Tailscale Serve works great). Plain HTTP over the LAN is not
enough, the encryption needs HTTPS or localhost.

Copy `.env.example` to `.env` if you need to change the port, or once you
are behind HTTPS and want secure cookies on.

## Premium features

Advanced features require a paid [Standard Notes Offline plan](https://standardnotes.com/purchase/offline), activated in Preferences → General → Offline activation.

## Fine print

Regular Notes is unofficial and independent, not affiliated with Standard
Notes. See [NOTICE](NOTICE) for what's taken from upstream and under which
license.
