FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json ./
RUN npm install

FROM node:22-alpine AS dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 1338

CMD ["npm", "run", "dev"]

FROM node:22-alpine AS prod
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

EXPOSE 1338

CMD ["node", "dist/index.js"]
