FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]