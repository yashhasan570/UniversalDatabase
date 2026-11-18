# Build Universal Database from this repo's source and ship it as a
# self-hosted server image.
# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.json ./
COPY packages ./packages
COPY scripts ./scripts
RUN sed -i '/^use-node-version/d' .npmrc
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN pnpm --filter=universaldatabase-sdk install && pnpm --filter=universaldatabase-sdk run build
RUN pnpm --filter=universaldatabase install && pnpm --filter=nc-mail-assets install && pnpm --filter=nc-gui install
RUN pnpm run integrations:build
RUN pnpm run registerIntegrations
RUN pnpm --filter=universaldatabase exec rspack --config rspack.config.js
RUN cd packages/nc-gui && pnpm exec nuxt build
RUN node .github/docker/make-docker-config.js
RUN pnpm --filter=universaldatabase exec rspack --config ../../rspack.docker.config.cjs
RUN mkdir -p packages/universaldatabase/docker && mv packages/universaldatabase/dist/docker.js packages/universaldatabase/docker/main.js
RUN if [ -d packages/nc-gui/.output/public ]; then cp -r packages/nc-gui/.output/public packages/universaldatabase/dist/nc-gui; \
    elif [ -d packages/nc-gui/.output/dist ]; then cp -r packages/nc-gui/.output/dist packages/universaldatabase/dist/nc-gui; \
    else echo "no gui output found" && exit 1; fi

FROM node:24-bookworm-slim
WORKDIR /usr/src/app
COPY --from=build /app ./
ENV NC_GUI_DIST_PATH=/usr/src/app/packages/universaldatabase/dist/nc-gui
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["node", "packages/universaldatabase/docker/main.js"]
