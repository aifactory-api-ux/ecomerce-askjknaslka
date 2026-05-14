FROM node:20.11.1-slim

WORKDIR /app

COPY auth-service/package*.json ./
RUN npm install

COPY shared ./shared
COPY auth-service/src src
COPY auth-service/tsconfig.json .

RUN npm run build && npm prune --omit=dev

EXPOSE 23002

CMD ["node", "dist/index.js"]