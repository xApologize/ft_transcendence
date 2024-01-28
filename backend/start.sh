#!/bin/bash
# Author producks 10/29/2023
# updated 1/22/2024

Reset='\033[0m'
Black='\033[0;30m'
Red='\033[0;31m'
Green='\033[0;32m'
Yellow='\033[0;33m'
Blue='\033[0;34m'
Purple='\033[0;35m'
Cyan='\033[0;36m'
White='\033[0;37m'
UWhite='\033[4;37m'
ICyan='\033[0;96m'

FLAG="/usr/src/init/flag"


while true; do
    if nc -z -w 2 redis 6379; then
        echo -e "${Green}Redis is up!"
        sleep 2
        break
    else
        echo -e "${Red}Redis isn't up...waiting...😡"
        sleep 2
    fi
done

while true; do
    if nc -z -w 2 $POSTGRES_HOST $POSTGRES_PORT; then
        echo -e "${Green}Postgres is up!"
        python manage.py makemigrations
        python manage.py migrate
        break
    else
        echo -e "${Red}Postgres isn't up...waiting..."
        sleep 2
    fi
done

echo -e "\e[92mStarting backend!"
daphne -b 0.0.0.0 -p 8000 src.asgi:application