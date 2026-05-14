FROM node:20.11.1-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build && npm prune --omit=dev

EXPOSE 23002

CMD ["node", "dist/index.js"]