FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY apps/zen-astro-web/package.json apps/zen-astro-web/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm ci --install-strategy=nested

FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/zen-astro-web/node_modules ./apps/zen-astro-web/node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY apps/zen-astro-web ./apps/zen-astro-web
COPY packages/types ./packages/types
COPY packages/ui ./packages/ui

WORKDIR /app/apps/zen-astro-web
RUN npm run build

FROM node:22-alpine AS dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/zen-astro-web/node_modules ./apps/zen-astro-web/node_modules
COPY . .

WORKDIR /app/apps/zen-astro-web

EXPOSE 4321

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM node:22-alpine AS prod
WORKDIR /app

COPY --from=build /app/apps/zen-astro-web/dist ./dist
COPY --from=build /app/apps/zen-astro-web/package.json ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 4321
ENV HOST=0.0.0.0
CMD ["node", "dist/server/entry.mjs"]
