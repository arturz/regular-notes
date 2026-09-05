FROM node:22-bookworm-slim AS web-builder

WORKDIR /build/app
COPY app/ ./

RUN node .yarn/releases/yarn-3.2.1.cjs install --immutable
RUN node .yarn/releases/yarn-3.2.1.cjs build:web

FROM node:20-bookworm-slim AS server-builder

RUN apt-get update \
  && apt-get install --yes --no-install-recommends ca-certificates g++ make python3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /build/server
COPY server/ ./

RUN node .yarn/releases/yarn-4.0.2.cjs install --immutable
RUN node .yarn/releases/yarn-4.0.2.cjs build
RUN node .yarn/releases/yarn-4.0.2.cjs workspaces focus @standardnotes/home-server --production

FROM node:20-bookworm-slim AS runtime

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
