#!/bin/bash
# Author producks 1/16/2024

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

docker exec -it $(docker ps --filter "name=postgres" --format "{{.ID}}") psql -U a -d g -c "UPDATE user_profile_user SET status = 'OFF'; DELETE FROM tournament_lobby; DELETE FROM tournament_tournament; DELETE FROM tournament_final"