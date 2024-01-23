#!/bin/bash
# Author producks 10/18/2023
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

while [ -z "$dataBaseNamePrompt" ];
do
    echo -e -n "${Purple}Please enter the database name: ${Reset}"
    read dataBaseNamePrompt
done
databaseName="POSTGRES_DB=${dataBaseNamePrompt}"

while [ -z "$dataBaseUserPrompt" ];
do
    echo -e -n "${Green}Please enter your username for the database: ${Reset}"
    read dataBaseUserPrompt
done
databaseUser="POSTGRES_USER=${dataBaseUserPrompt}"

while [ -z "$dataBasePasswordPrompt" ];
do
    echo -e -n "${Yellow}Please enter your password for that user: ${Reset}"
    read dataBasePasswordPrompt
done
databasePassword="POSTGRES_PASSWORD=${dataBasePasswordPrompt}"

# Setup .env at the root of the directory with the result from the prompts
echo -e -n "$databaseName\n$databaseUser\n$databasePassword" > .env

# Setup variables for the .env in the backend (for django)
POSTGRES_HOST="POSTGRES_HOST=postgres"
POSTGRES_USER="POSTGRES_USER=$dataBaseUserPrompt"
POSTGRES_PASSWORD="POSTGRES_PASSWORD=$dataBasePasswordPrompt"
POSTGRES_DB="POSTGRES_DB=$dataBaseNamePrompt"
POSTGRES_PORT="POSTGRES_PORT=5432"

SECRET_KEY="SECRET_KEY=$(openssl rand -base64 48)"
DJANGO_ALLOWED_HOSTS="DJANGO_ALLOWED_HOSTS=$(hostname) localhost backend 127.0.0.1 [::1]"

echo -e -n "$POSTGRES_HOST\n$POSTGRES_USER\n$POSTGRES_PASSWORD\n$POSTGRES_DB\n$POSTGRES_PORT\n\n$SECRET_KEY\n$DJANGO_ALLOWED_HOSTS\n\nAUTH42_CLIENT=\nAUTH42_SECRET=\nAUTH42_REDIRECT_URI=\nAUTH42_LINK=\n" > backend/.env