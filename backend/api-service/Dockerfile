FROM node:20.11.1-slim

WORKDIR /app

COPY api-service/package*.json ./
RUN npm install

COPY shared ./shared
COPY api-service/src src
COPY api-service/tsconfig.json .

RUN npm run build && npm prune --omit=dev

EXPOSE 23001

CMD ["node", "dist/src/index.js"]