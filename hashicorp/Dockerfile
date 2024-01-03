FROM hashicorp/vault:1.9.9

RUN apk update && apk add openssl

WORKDIR /vault/tls

RUN openssl genpkey -algorithm RSA -out private-key.pem -pkeyopt rsa_keygen_bits:2048

RUN openssl req -x509 -nodes -days 365 -key private-key.pem -out fullchain.pem \
    -subj "/C=CA/ST=QC/L=QC/O=42school/OU=42Network/CN=ddemers/UID=ddemers"
RUN chown vault:vault /vault/tls/fullchain.pem

RUN chmod 600 /vault/tls/fullchain.pem

RUN chown vault:vault /vault/tls/private-key.pem

RUN chmod 600 /vault/tls/private-key.pem

WORKDIR /vault

COPY config.hcl /vault/config

COPY start.sh .

ENTRYPOINT ["dumb-init", "./start.sh"]