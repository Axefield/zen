FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json ./
RUN npm install

FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]

FROM node:22-alpine AS prod
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 4000
CMD ["node", "dist/server.js"]
