# syntax=docker/dockerfile:1

# Manifests are copied before sources in the builder stages below, so that
# `yarn install` stays cached across pure source edits and only the build
# step re-runs. `COPY --parents` preserves the packages/<name>/package.json
# layout that Yarn needs to resolve the workspaces.

FROM node:24-bookworm-slim AS web-builder

WORKDIR /build/app
COPY app/package.json app/yarn.lock app/.yarnrc.yml ./
COPY app/.yarn/ ./.yarn/
COPY --parents app/packages/*/package.json app/packages/*/*/package.json /build/

RUN node .yarn/releases/yarn-3.2.1.cjs install --immutable

COPY app/ ./

RUN node .yarn/releases/yarn-3.2.1.cjs build:web

FROM node:24-bookworm-slim AS server-builder

RUN apt-get update \
  && apt-get install --yes --no-install-recommends ca-certificates g++ make python3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /build/server
COPY server/package.json server/yarn.lock server/.yarnrc.yml ./
COPY server/.yarn/ ./.yarn/
COPY --parents server/packages/*/package.json /build/

RUN node .yarn/releases/yarn-4.0.2.cjs install --immutable

COPY server/ ./

RUN node .yarn/releases/yarn-4.0.2.cjs build
RUN node .yarn/releases/yarn-4.0.2.cjs workspaces focus @standardnotes/home-server --production

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/data \
    WEB_ASSETS_PATH=/opt/web

WORKDIR /opt/server

COPY --from=server-builder --chown=node:node /build/server/ ./
COPY --from=web-builder --chown=node:node /build/app/packages/web/dist/ /opt/web/

RUN mkdir -p /data/database /data/uploads \
  && chown -R node:node /data

USER node

EXPOSE 3000
VOLUME ["/data"]

CMD ["node", "--require", "./.pnp.cjs", "packages/home-server/dist/bin/server.js"]
