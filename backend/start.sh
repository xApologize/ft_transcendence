#!/bin/bash
# Author producks 10/29/2023
# updated 10/30/2023

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

MIGRATION_FLAG="/usr/src/app/.flag"

while true; do
    if nc -z -w 2 $POSTGRES_HOST $POSTGRES_PORT; then
        echo -e "${Green}Database is up! Migrating..."
        python manage.py makemigrations # temp fix
        python manage.py migrate # temp fix
        python manage.py migrate channels_postgres
        echo -e "${Purple}Seeding data now..."
        python manage.py loaddata seed.json # temp fix
        break
    else
        echo -e "${Red}Server isn't up...waiting..."
        sleep 2
    fi
done

echo "Starting server"
python manage.py runserver 0.0.0.0:8000