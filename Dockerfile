FROM node:24-bookworm-slim AS ui-build

WORKDIR /app/ui
COPY ui/package.json ui/package-lock.json ./
RUN npm ci
COPY ui/ ./
RUN npm run build

FROM node:24-bookworm-slim AS api-build

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/api
COPY api/package.json api/package-lock.json ./
RUN npm ci
COPY api/ ./
RUN npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL=/data/sqlite.db

WORKDIR /app/api
RUN mkdir -p /data && chown node:node /data

COPY --from=api-build --chown=node:node /app/api/package.json ./package.json
COPY --from=api-build --chown=node:node /app/api/node_modules ./node_modules
COPY --from=api-build --chown=node:node /app/api/dist ./dist
COPY --from=ui-build --chown=node:node /app/api/wwwroot ./wwwroot

USER node
EXPOSE 3000
VOLUME ["/data"]

CMD ["node", "dist/nest/app.js"]
