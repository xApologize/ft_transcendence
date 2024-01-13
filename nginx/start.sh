#!/bin/bash
# Author producks 1/06/2024

Reset='\033[0m'
Black='\033[0;30m'
Red='\033[0;31m'
Green='\033[0;32m'
Yellow='\033[0;33m'
Blue='\033[0;34m'
Purple='\033[0;35m'
Cyan='\033[0;36m'
White='\033[0;37m'

while true; do
    if nc -z -w 2 backend 8000; then
        echo -e "${Green}Backend is up!"
        sleep 2
        break
    else
        echo -e "${Red}Backend isn't up...waiting...😡"
        sleep 4
    fi
done

nginx -g "daemon off;"