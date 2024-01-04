FROM python:3.12.1-slim-bullseye

RUN apt-get update && apt-get install -y dumb-init

RUN apt-get install -y netcat

# WORKDIR /usr/src/cert

# RUN openssl genpkey -algorithm RSA -out server.key -pkeyopt rsa_keygen_bits:2048

# RUN openssl req -x509 -nodes -days 365 -key server.key -out server.crt \
#     -subj "/C=CA/ST=QC/L=QC/O=42school/OU=42Network/CN=ddemers/UID=ddemers"
# RUN chown 1000:1000 /usr/src/cert/server.crt

# RUN chmod 600 /usr/src/cert/server.crt

# RUN chown 1000:1000 /usr/src/cert/server.key

# RUN chmod 600 /usr/src/cert/server.key

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1

ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip

COPY requirements.txt .

RUN pip install -r requirements.txt

ENTRYPOINT ["dumb-init", "./start.sh"]