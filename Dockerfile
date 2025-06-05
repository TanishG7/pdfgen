FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]