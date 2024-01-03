#!/bin/sh
# Author producks 01/01/2024

# Reset
Reset='\033[0m'       # Text Reset

# Regular Colors
Black='\033[0;30m'        # Black
Red='\033[0;31m'          # Red
Green='\033[0;32m'        # Green
Yellow='\033[0;33m'       # Yellow
Blue='\033[0;34m'         # Blue
Purple='\033[0;35m'       # Purple
Cyan='\033[0;36m'         # Cyan
White='\033[0;37m'        # White

# while true; do
#     if nc -z -w 2 postgres_vault 5432; then
#         echo -e "${Green}Postgres is up!"
#         sleep 2
#         break
#     else
#         echo -e "${Red}Postgres isn't up...waiting...😡"
#         sleep 2
#     fi
# done

exec vault server -config=/vault/config/config.hcl