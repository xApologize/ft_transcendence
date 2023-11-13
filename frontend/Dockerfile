FROM node:18.16-alpine3.16

RUN apk add dumb-init

WORKDIR /app

COPY package.json ./

RUN npm install

ENTRYPOINT ["dumb-init", "npm", "run", "80%"]