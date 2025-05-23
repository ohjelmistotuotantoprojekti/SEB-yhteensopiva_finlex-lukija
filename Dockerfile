FROM node:24
WORKDIR /home/node/app
RUN apt update
RUN apt -y install postgresql-client
RUN chmod -R 700 /home/node/ 
RUN chown -R node:node /home/node/
USER node

COPY --chown=node:node ./backend/dist .
COPY --chown=node:node ./backend/package.json .
COPY --chown=node:node ./backend/package-lock.json .
RUN npm --omit=dev --no-fund --no-audit --no-update-notifier ci

EXPOSE 3001

CMD ["node", "index.js"]




