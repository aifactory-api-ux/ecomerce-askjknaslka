FROM node:20.11.1-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npm run build

EXPOSE 23001

CMD ["node", "dist/index.js"]