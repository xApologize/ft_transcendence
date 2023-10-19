#!/bin/bash
# Author producks 10/18/2023

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

# Setup variables for the .env in the backend (for prisma)
DB_HOST="DB_HOST=postgres"
DB_USER="DB_USER=$dataBaseUserPrompt"
DB_PASSWORD="DB_PASSWORD=$dataBasePasswordPrompt"
DB_NAME="DB_NAME=$dataBaseNamePrompt"
DB_PORT="DB_PORT=5432"
DATABASE_URL="DATABASE_URL=postgresql://\${DB_USER}:\${DB_PASSWORD}@\${DB_HOST}/\${DB_NAME}"

echo -e -n "$DB_HOST\n$DB_USER\n$DB_PASSWORD\n$DB_NAME\n$DB_PORT\n\n$DATABASE_URL" > backend/.env