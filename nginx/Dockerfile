FROM nginx:mainline-alpine3.18-slim

RUN apk update && apk add openssl

RUN	mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/server.key -out /etc/nginx/ssl/server.crt -subj "/C=CA/ST=QC/L=QC/O=42school/OU=42Network/CN=ddemers/UID=ddemers"

COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 443