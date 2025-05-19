FROM node:24

WORKDIR /app

COPY . .

WORKDIR /app/backend

RUN npm ci

WORKDIR /app/frontend

RUN npm ci

RUN npm run build

WORKDIR /app/backend

EXPOSE 3001

WORKDIR /app

RUN chmod -R 777 .

WORKDIR /app/backend

CMD npm start




