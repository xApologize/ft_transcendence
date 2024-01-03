FROM postgres:alpine3.18

RUN apk update && apk add openssl

WORKDIR /var/lib/postgres

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt -subj "/C=CA/ST=QC/L=QC/O=42school/OU=42Network/CN=ddemers/UID=ddemers"

RUN chown postgres:postgres /var/lib/postgres/server.key

RUN chmod 600 /var/lib/postgres/server.key

RUN chown postgres:postgres /var/lib/postgres/server.key /var/lib/postgres/server.crt

RUN chmod 600 /var/lib/postgres/server.key /var/lib/postgres/server.crt