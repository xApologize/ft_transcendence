#!/bin/bash
# Author producks 10/29/2023
# updated 10/30/2023

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
        if ! test -f $FLAG; then
            echo -e "${Yellow}No migration flag were found..."
            echo -e "${Cyan}Migrating now!"
            python manage.py makemigrations
            python manage.py migrate
            echo -e "${Purple}Seeding data now..."
            python manage.py loaddata seed.json # temp fix
            touch $FLAG
        else
            echo -e "${UWhite}Migration file was found, ignoring initialization"
        fi
        break
    else
        echo -e "${Red}Postgres isn't up...waiting..."
        sleep 2
    fi
done

echo -e "${ICyan}Starting backend!"
python manage.py runserver 0.0.0.0:8000