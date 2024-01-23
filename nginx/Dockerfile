# FROM nginx:1.25.3-bookworm as build

# # Install depency for building the firewall and connector
# RUN apt-get update; \
#     apt-get install -y \
#     git \
#     g++ \
#     apt-utils \
#     autoconf \
#     automake \
#     build-essential \
#     libcurl4-openssl-dev \
#     libgeoip-dev \
#     liblmdb-dev \
#     libpcre2-dev \
#     libtool \
#     libxml2-dev \
#     libyajl-dev \
#     pkgconf \
#     zlib1g-dev

# WORKDIR /sources

# # Build the firewall, this take forever...
# RUN git clone https://github.com/SpiderLabs/ModSecurity; \
#     cd ModSecurity/; \
#     git submodule init; \
#     git submodule update; \
#     sh build.sh; \
#     ./configure --with-pcre2; \
#     make; \
#     make install; \
#     strip /usr/local/modsecurity/lib/lib*.so*

# # Build the connector and make an nginx modules with it to use later.
# RUN git clone https://github.com/SpiderLabs/ModSecurity-nginx.git; \
#     curl -sSL https://nginx.org/download/nginx-1.25.3.tar.gz -o nginx-1.25.3.tar.gz; \
#     tar -xzf nginx-1.25.3.tar.gz; \
#     cd nginx-1.25.3; \
#     ./configure --with-compat --add-dynamic-module=../ModSecurity-nginx; \
#     make modules; \
#     strip objs/ngx_http_modsecurity_module.so; \
#     cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/


# # Build a final image with only the necessary element.
# FROM nginx:1.25.3-bookworm

# RUN apt-get update && apt-get install -y libyajl2

# RUN	mkdir -p /etc/nginx/ssl

# RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/server.key -out /etc/nginx/ssl/server.crt -subj "/C=CA/ST=QC/L=QC/O=42school/OU=42Network/CN=ddemers/UID=ddemers"

# COPY --from=build /usr/local/modsecurity/lib/libmodsecurity.so.* /usr/local/modsecurity/lib/

# COPY --from=build /etc/nginx/modules/ngx_http_modsecurity_module.so /etc/nginx/modules/

# COPY /nginx-conf/default.conf /etc/nginx/conf.d/default.conf

# COPY /nginx-conf/nginx.conf /etc/nginx/nginx.conf

# COPY /modsec/modsecurity.conf /etc/nginx/modsec/

# COPY /modsec /etc/nginx/modsec/

# # COPY /modsec/main.conf /etc/nginx/modsec/

# # COPY /modsec/error.html /etc/nginx/modsec/

# EXPOSE 443

FROM produckss/ft_transcendence_modsecurity_nginx:1.0

# Add to 1.1 version to save compile time :)
RUN apt-get install -y netcat-traditional
RUN apt-get install -y dumb-init

RUN	mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/server.key -out /etc/nginx/ssl/server.crt -subj "/C=CA/ST=QC/L=QC/O=42school/OU=42Network/CN=ddemers/UID=ddemers"

COPY /nginx-conf/default.conf /etc/nginx/conf.d/default.conf

COPY /nginx-conf/nginx.conf /etc/nginx/nginx.conf

COPY /modsec/modsecurity.conf /etc/nginx/modsec/

COPY /modsec /etc/nginx/modsec/

COPY start.sh .

COPY /frontend /etc/frontend

ENTRYPOINT ["dumb-init", "./start.sh"]