FROM node:24
USER node
WORKDIR /home/node/app

COPY --chown=node:node ./backend/dist .
COPY --chown=node:node ./backend/package.json .
COPY --chown=node:node ./backend/package-lock.json .
RUN npm --omit=dev --no-fund --no-audit --no-update-notifier ci

EXPOSE 3001

CMD ["node", "index.js"]




