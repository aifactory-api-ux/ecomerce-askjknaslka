FROM node:20.11.1-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npm run build

EXPOSE 23002

CMD ["node", "dist/index.js"]