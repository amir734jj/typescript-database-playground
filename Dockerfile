FROM node:24-alpine AS ui-build
WORKDIR /app/ui
COPY ui/package.json ui/package-lock.json ./
RUN npm ci
COPY ui/ ./
RUN npm run build

FROM node:24-alpine AS api-build
WORKDIR /app/api
COPY api/package.json api/package-lock.json ./
RUN npm ci --ignore-scripts
COPY api/ ./
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app/api
COPY --from=api-build --chown=node:node /app/api/package.json ./package.json
COPY --from=api-build --chown=node:node /app/api/node_modules ./node_modules
COPY --from=api-build --chown=node:node /app/api/dist ./dist
COPY --from=ui-build --chown=node:node /app/api/wwwroot ./wwwroot

USER node
EXPOSE 3000
CMD ["node", "dist/nest/app.js"]
