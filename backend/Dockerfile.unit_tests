FROM node:24
WORKDIR /app

COPY ./package-lock.json .
COPY ./package.json .
COPY ./.npmrc .
RUN npm ci

COPY ./tsconfig.json .
COPY ./src ./src
COPY ./test ./test

CMD npx tsx test/*.test.ts
