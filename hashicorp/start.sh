#!/bin/sh
# Author producks 01/01/2024
# updated on 01/04/2024

Reset='\033[0m'       # Text Reset
Black='\033[0;30m'        # Black
Red='\033[0;31m'          # Red
Green='\033[0;32m'        # Green
Yellow='\033[0;33m'       # Yellow
Blue='\033[0;34m'         # Blue
Purple='\033[0;35m'       # Purple
Cyan='\033[0;36m'         # Cyan
White='\033[0;37m'        # White


# Bootstraping hell, the subject ask us for docker compose up --build to do everything.
# This create this init problem, my solution was to bind a volume to init folder and create
# a file as a flag for True if it exist or False if it doesn't exist.

FLAG="/vault/init/flag.bozo"

# If the flag doesn't exist, init time baby.
if ! test -f $FLAG; then
    echo "File doesn't exist"
    vault operator init
    touch $FLAG
else
    echo "FILE PRESENT"
fi

# Start the vault
exec vault server -dev -config=/vault/config/config.hcl