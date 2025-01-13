FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

ENV NODE_ENV=development
ENV VITE_API_URL=http://localhost/api

EXPOSE 3000

CMD ["npm", "run", "serve"] 