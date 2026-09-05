#!/bin/sh
set -eu

cd "$(dirname "$0")"

if [ -f .env ]; then
  echo ".env already exists; leaving it unchanged."
  exit 0
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl is required to generate secrets." >&2
  exit 1
fi

umask 077
{
  echo "HOST_PORT=3020"
  echo "LOG_LEVEL=info"
  echo "COOKIE_SECURE=true"
  echo "JWT_SECRET=$(openssl rand -hex 32)"
  echo "AUTH_JWT_SECRET=$(openssl rand -hex 32)"
  echo "ENCRYPTION_SERVER_KEY=$(openssl rand -hex 32)"
  echo "PSEUDO_KEY_PARAMS_KEY=$(openssl rand -hex 32)"
  echo "VALET_TOKEN_SECRET=$(openssl rand -hex 32)"
} > .env

echo "Created .env with mode 600."
