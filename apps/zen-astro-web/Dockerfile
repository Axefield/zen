FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY apps/zen-astro-web/package.json apps/zen-astro-web/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm install

COPY . .

WORKDIR /app/apps/zen-astro-web

EXPOSE 4321

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
