#!/bin/bash
# Author producks 10/29/2023

MIGRATION_FLAG="/usr/src/app/.flag"

# if [ "$(cat "$MIGRATION_FLAG")" == "1" ]; then
#     echo "Migration was already done"
# else
#     echo "Migration wasn't done yet"
#     echo "Starting migration process..."
#     sleep 5
#     python manage.py migrate
#     echo -n "1" > "$MIGRATION_FLAG"
# fi

sleep 5
python manage.py migrate

# Start server
echo "Starting server"
python manage.py runserver 0.0.0.0:8000