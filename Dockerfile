FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/charts/package.json packages/charts/package.json
RUN npm ci --ignore-scripts

COPY . .
RUN DOCS_DISABLE_GIT=1 npm run docs:build

FROM caddy:2-alpine

ARG VCS_REF=unknown
LABEL org.opencontainers.image.title="Agala Labs UI documentation" \
      org.opencontainers.image.source="https://github.com/agala-labs/ui" \
      org.opencontainers.image.revision="${VCS_REF}"

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/docs/.vitepress/dist /srv

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
