FROM node:20.11.1-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY shared ./shared
COPY src src
COPY tsconfig.json .

RUN npm run build && npm prune --omit=dev

EXPOSE 23003

CMD ["node", "dist/index.js"]