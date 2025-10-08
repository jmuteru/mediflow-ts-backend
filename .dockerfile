FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5000
CMD ["node", "server.ts"]  # or your entry point like main.js
