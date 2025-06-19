FROM node:24
RUN apt update && apt install -y curl
USER node

WORKDIR /home/node/app/frontend
COPY frontend/package-lock.json .
COPY frontend/package.json .
RUN npm ci

COPY frontend/tsconfig.json .
COPY frontend/tsconfig.node.json .
COPY frontend/tsconfig.app.json .
COPY frontend/vite.config.ts .
COPY frontend/index.html .
COPY frontend/public ./public
COPY frontend/src ./src
RUN mkdir -p ../backend/src/frontend
RUN npm run build

WORKDIR /home/node/app/backend
COPY backend/package-lock.json .
COPY backend/package.json .
RUN npm ci

COPY backend/tsconfig.json .
COPY backend/src ./src
RUN npm run build

WORKDIR /home/node/app/backend/dist
CMD node start.js