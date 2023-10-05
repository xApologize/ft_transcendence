FROM node:18.16-alpine3.16

RUN apk add dumb-init

WORKDIR /app

COPY package.json .

RUN npm install -g pnpm && pnpm install

ENTRYPOINT ["dumb-init", "pnpm", "run", "start:dev"]