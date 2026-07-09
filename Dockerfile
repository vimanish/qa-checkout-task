FROM node:22-alpine
WORKDIR /app
COPY . .
EXPOSE 4174
CMD ["node", "server.js"]
